/// 每日簽到模組
///
/// 使用者透過簽到獲得 MGC 獎勵：
/// - 首次簽到：創建 UserCheckInRecord 並獲得 100 MGC（新用戶禮包）
/// - 每日簽到：更新記錄並獲得 20 MGC（一天只能簽到一次）
///
/// 時區：所有日期計算基於 UTC+8
module oracle_library::check_in {
    use iota::clock::{Self, Clock};
    use iota::event;
    use oracle_library::mgc::{Self, MGCTreasury};

    // ============ 錯誤碼 ============

    /// 今天（UTC+8）已經簽到過了
    const E_ALREADY_CHECKED_IN_TODAY: u64 = 0;

    // ============ 常數 ============

    /// 首次簽到的 MGC 獎勵（新用戶禮包）
    const FIRST_CHECK_IN_REWARD: u64 = 100;

    /// 每日簽到的 MGC 獎勵
    const DAILY_CHECK_IN_REWARD: u64 = 20;

    /// UTC+8 時區偏移（毫秒）
    const UTC8_OFFSET_MS: u64 = 28800000; // 8 * 3600 * 1000

    /// 一天的毫秒數
    const DAY_MS: u64 = 86400000; // 24 * 3600 * 1000

    // ============ 結構定義 ============

    /// 使用者簽到記錄
    ///
    /// 每個使用者擁有自己的簽到記錄（Owned Object）
    /// - key: 可作為物件存儲在鏈上
    /// - store: 可跨模組轉移（使用 public_transfer）
    public struct UserCheckInRecord has key, store {
        id: UID,
        /// 記錄擁有者
        owner: address,
        /// 最後一次簽到的 UTC+8 日期編號
        last_check_in_day: u64,
        /// 累積簽到次數
        total_check_ins: u64,
    }

    /// 簽到事件
    ///
    /// 發出事件讓前端可以追蹤使用者簽到歷史
    public struct CheckInEvent has copy, drop {
        /// 簽到使用者地址
        user: address,
        /// 簽到的 UTC+8 日期編號
        day_number: u64,
        /// 累積簽到次數
        total_check_ins: u64,
        /// 獲得的 MGC 獎勵數量
        reward_amount: u64,
    }

    // ============ Entry Functions ============

    /// 首次簽到
    ///
    /// 創建使用者的簽到記錄並給予首次獎勵
    ///
    /// # 參數
    /// - `treasury`: MGC Treasury，用於鑄造獎勵
    /// - `clock`: 系統 Clock（地址 0x6），用於取得當前時間
    /// - `ctx`: 交易上下文
    ///
    /// # 後置條件
    /// - 使用者獲得一個 UserCheckInRecord 物件
    /// - 使用者獲得 100 MGC 獎勵（新用戶禮包）
    /// - 發出 CheckInEvent
    ///
    /// # 範例
    /// ```
    /// // 前端呼叫
    /// await signAndExecuteTransaction({
    ///   transaction: {
    ///     kind: 'moveCall',
    ///     target: `${PACKAGE_ID}::check_in::first_check_in`,
    ///     arguments: [MGC_TREASURY_ID, CLOCK_ID],
    ///   },
    /// });
    /// ```
    public entry fun first_check_in(
        treasury: &mut MGCTreasury,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_day = get_utc8_day_number(clock::timestamp_ms(clock));

        // 創建簽到記錄
        let record = UserCheckInRecord {
            id: object::new(ctx),
            owner: sender,
            last_check_in_day: current_day,
            total_check_ins: 1,
        };

        // 鑄造 MGC 獎勵（首次簽到獎勵）
        let reward = mgc::mint(treasury, FIRST_CHECK_IN_REWARD, ctx);

        // 發出簽到事件
        event::emit(CheckInEvent {
            user: sender,
            day_number: current_day,
            total_check_ins: 1,
            reward_amount: FIRST_CHECK_IN_REWARD,
        });

        // 轉移記錄和獎勵給使用者
        transfer::public_transfer(record, sender);
        transfer::public_transfer(reward, sender);
    }

    /// 每日簽到
    ///
    /// 更新簽到記錄並給予每日獎勵
    ///
    /// # 參數
    /// - `record`: 使用者的簽到記錄（必須是擁有者才能傳入）
    /// - `treasury`: MGC Treasury，用於鑄造獎勵
    /// - `clock`: 系統 Clock（地址 0x6），用於取得當前時間
    /// - `ctx`: 交易上下文
    ///
    /// # 前置條件
    /// - 今天（UTC+8）尚未簽到
    ///
    /// # 後置條件
    /// - 更新 last_check_in_day 為今天
    /// - 增加 total_check_ins
    /// - 使用者獲得 20 MGC 獎勵
    /// - 發出 CheckInEvent
    ///
    /// # 錯誤
    /// - `E_ALREADY_CHECKED_IN_TODAY`: 今天已經簽到過了
    ///
    /// # 範例
    /// ```
    /// // 前端呼叫
    /// await signAndExecuteTransaction({
    ///   transaction: {
    ///     kind: 'moveCall',
    ///     target: `${PACKAGE_ID}::check_in::check_in`,
    ///     arguments: [USER_RECORD_ID, MGC_TREASURY_ID, CLOCK_ID],
    ///   },
    /// });
    /// ```
    public entry fun check_in(
        record: &mut UserCheckInRecord,
        treasury: &mut MGCTreasury,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_day = get_utc8_day_number(clock::timestamp_ms(clock));

        // 檢查今天是否已經簽到（last_check_in_day 必須小於今天）
        assert!(record.last_check_in_day < current_day, E_ALREADY_CHECKED_IN_TODAY);

        // 更新簽到記錄
        record.last_check_in_day = current_day;
        record.total_check_ins = record.total_check_ins + 1;

        // 鑄造 MGC 獎勵（每日簽到獎勵）
        let reward = mgc::mint(treasury, DAILY_CHECK_IN_REWARD, ctx);

        // 發出簽到事件
        event::emit(CheckInEvent {
            user: sender,
            day_number: current_day,
            total_check_ins: record.total_check_ins,
            reward_amount: DAILY_CHECK_IN_REWARD,
        });

        // 轉移獎勵給使用者
        transfer::public_transfer(reward, sender);
    }

    // ============ View Functions ============

    /// 取得最後簽到的 UTC+8 日期編號
    public fun get_last_check_in_day(record: &UserCheckInRecord): u64 {
        record.last_check_in_day
    }

    /// 取得累積簽到次數
    public fun get_total_check_ins(record: &UserCheckInRecord): u64 {
        record.total_check_ins
    }

    // ============ Internal Functions ============

    /// 計算 UTC+8 日期編號
    ///
    /// 將毫秒時間戳轉換為 UTC+8 的日期編號
    /// 日期編號 = (timestamp_ms + UTC8_OFFSET_MS) / DAY_MS
    ///
    /// # 參數
    /// - `timestamp_ms`: 毫秒時間戳（從 Clock 取得）
    ///
    /// # 回傳
    /// - UTC+8 日期編號（從 Unix Epoch 開始的天數）
    fun get_utc8_day_number(timestamp_ms: u64): u64 {
        (timestamp_ms + UTC8_OFFSET_MS) / DAY_MS
    }

    // ============ Test-Only Functions ============

    #[test_only]
    /// 測試用：取得記錄擁有者
    public fun get_owner(record: &UserCheckInRecord): address {
        record.owner
    }
}
