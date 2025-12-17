module oracle_library::mgc {
    use iota::coin::{Self, TreasuryCap, Coin};
    use iota::url;
    use iota::clock::{Self, Clock};

    // ============ Constants ============

    /// 緊急恢復冷卻期：30 天（毫秒）
    const RECOVERY_COOLDOWN_MS: u64 = 2592000000;

    // ============ Error Codes ============

    /// 冷卻期尚未結束
    const E_COOLDOWN_NOT_PASSED: u64 = 100;
    /// 呼叫者不是恢復地址
    const E_NOT_RECOVERY_ADDRESS: u64 = 101;

    // ============ Structs ============

    /// One-Time Witness for MGC token
    public struct MGC has drop {}

    /// Treasury that wraps the TreasuryCap for controlled minting/burning
    public struct MGCTreasury has key {
        id: UID,
        treasury_cap: TreasuryCap<MGC>,
    }

    /// 管理員權限憑證 - 只有持有者可以直接 mint MGC
    /// 在合約部署時創建並轉移給部署者
    public struct AdminCap has key, store {
        id: UID,
    }

    /// 緊急恢復配置（共享物件）
    /// 用於在 AdminCap 遺失時恢復管理權限
    public struct EmergencyRecovery has key {
        id: UID,
        /// 備份恢復地址，只有此地址可以創建新的 AdminCap
        recovery_address: address,
        /// 下次可恢復的時間戳（毫秒），用於防止濫用
        cooldown: u64,
    }

    // ============ Init Function ============

    /// Initialize the MGC token on module deployment
    fun init(witness: MGC, ctx: &mut TxContext) {
        // Create the MGC currency
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            0,  // decimals - MGC is indivisible
            b"MGC",
            b"Wisdom Shards",
            b"Magical currency earned through daily check-ins and oracle draws in the Eternal Library",
            option::some(url::new_unsafe_from_bytes(b"https://ipfs.io/ipfs/QmMGCIcon")),
            ctx
        );

        // Freeze the metadata to prevent modifications
        transfer::public_freeze_object(metadata);

        // Wrap TreasuryCap in a shared object for controlled access
        let treasury = MGCTreasury {
            id: object::new(ctx),
            treasury_cap,
        };
        transfer::share_object(treasury);

        // 創建 AdminCap 並轉移給部署者
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));

        // 創建緊急恢復配置並共享
        // 初始 recovery_address 為部署者，cooldown 為 0（可立即使用）
        let recovery = EmergencyRecovery {
            id: object::new(ctx),
            recovery_address: tx_context::sender(ctx),
            cooldown: 0,
        };
        transfer::share_object(recovery);
    }

    // ============ Friend Functions ============

    /// Mint new MGC tokens (only callable by friend modules)
    public(package) fun mint(
        treasury: &mut MGCTreasury,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<MGC> {
        coin::mint(&mut treasury.treasury_cap, amount, ctx)
    }

    /// Burn MGC tokens (only callable by friend modules)
    /// Returns the amount burned
    public(package) fun burn(
        treasury: &mut MGCTreasury,
        coin: Coin<MGC>
    ): u64 {
        coin::burn(&mut treasury.treasury_cap, coin)
    }

    // ============ Public Functions ============

    /// Get the total supply of MGC tokens
    public fun total_supply(treasury: &MGCTreasury): u64 {
        coin::total_supply(&treasury.treasury_cap)
    }

    // ============ Admin Functions ============

    /// 管理員直接發幣
    ///
    /// 只有持有 AdminCap 的地址才能調用此函數
    /// 用於 Demo 或空投等場景
    ///
    /// # 參數
    /// - `_admin_cap`: 管理員權限憑證（驗證身份用）
    /// - `treasury`: MGC Treasury
    /// - `recipient`: 接收者地址
    /// - `amount`: 發放數量
    /// - `ctx`: 交易上下文
    public entry fun admin_mint(
        _admin_cap: &AdminCap,
        treasury: &mut MGCTreasury,
        recipient: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(&mut treasury.treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// 轉移管理員權限給其他地址
    ///
    /// # 參數
    /// - `admin_cap`: 管理員權限憑證
    /// - `new_admin`: 新管理員地址
    public entry fun transfer_admin_cap(
        admin_cap: AdminCap,
        new_admin: address,
    ) {
        transfer::transfer(admin_cap, new_admin);
    }

    // ============ Recovery Functions ============

    /// 設定緊急恢復地址
    ///
    /// 只有持有 AdminCap 的管理員才能更改恢復地址
    /// 建議設定為不同於主要管理地址的備份地址
    ///
    /// # 參數
    /// - `_admin_cap`: 管理員權限憑證（驗證身份用）
    /// - `recovery`: 緊急恢復配置
    /// - `new_recovery_address`: 新的恢復地址
    public entry fun set_recovery_address(
        _admin_cap: &AdminCap,
        recovery: &mut EmergencyRecovery,
        new_recovery_address: address,
    ) {
        recovery.recovery_address = new_recovery_address;
    }

    /// 緊急創建新的 AdminCap
    ///
    /// 當 AdminCap 遺失時，recovery_address 可以調用此函數創建新的 AdminCap
    /// 為防止濫用，每次恢復後需等待 30 天冷卻期才能再次恢復
    ///
    /// # 參數
    /// - `recovery`: 緊急恢復配置
    /// - `recipient`: 新 AdminCap 的接收者地址
    /// - `clock`: 系統時鐘
    /// - `ctx`: 交易上下文
    ///
    /// # 錯誤
    /// - `E_NOT_RECOVERY_ADDRESS`: 呼叫者不是恢復地址
    /// - `E_COOLDOWN_NOT_PASSED`: 冷卻期尚未結束
    public entry fun emergency_create_admin(
        recovery: &mut EmergencyRecovery,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 驗證呼叫者是恢復地址
        assert!(
            tx_context::sender(ctx) == recovery.recovery_address,
            E_NOT_RECOVERY_ADDRESS
        );

        // 檢查冷卻期是否已過
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= recovery.cooldown, E_COOLDOWN_NOT_PASSED);

        // 更新冷卻期（30 天後才能再次恢復）
        recovery.cooldown = current_time + RECOVERY_COOLDOWN_MS;

        // 創建新的 AdminCap 並轉移給指定接收者
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, recipient);
    }

    /// 查詢當前恢復地址
    public fun get_recovery_address(recovery: &EmergencyRecovery): address {
        recovery.recovery_address
    }

    /// 查詢下次可恢復的時間戳
    public fun get_recovery_cooldown(recovery: &EmergencyRecovery): u64 {
        recovery.cooldown
    }

    // ============ Test-Only Functions ============

    #[test_only]
    /// Initialize for testing
    public fun init_for_testing(ctx: &mut TxContext) {
        init(MGC {}, ctx);
    }

    #[test_only]
    /// Mint for testing
    public fun mint_for_testing(
        treasury: &mut MGCTreasury,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<MGC> {
        mint(treasury, amount, ctx)
    }

    #[test_only]
    /// Burn for testing
    public fun burn_for_testing(
        treasury: &mut MGCTreasury,
        coin: Coin<MGC>
    ): u64 {
        burn(treasury, coin)
    }

    #[test_only]
    /// Create AdminCap for testing
    public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
        AdminCap {
            id: object::new(ctx),
        }
    }

    #[test_only]
    /// Create EmergencyRecovery for testing
    public fun create_recovery_for_testing(
        recovery_address: address,
        cooldown: u64,
        ctx: &mut TxContext
    ): EmergencyRecovery {
        EmergencyRecovery {
            id: object::new(ctx),
            recovery_address,
            cooldown,
        }
    }
}
