module oracle_library::mgc {
    use iota::coin::{Self, TreasuryCap, Coin};
    use iota::url;

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
}
