/// Oracle Draw Module
/// 使用者提問並抽取解答之書的核心模組
module oracle_library::oracle_draw {
    use iota::coin::{Self, Coin};
    use iota::event;
    use oracle_library::mgc::{MGC, MGCTreasury};

    // ====== 錯誤碼 ======

    /// 答案 ID 無效（必須 0-49）
    const E_INVALID_ANSWER_ID: u64 = 1;

    /// MGC 不足（需要 10 MGC）
    const E_INSUFFICIENT_MGC: u64 = 2;

    // ====== 常數 ======

    /// 抽取答案的成本（10 MGC）
    const DRAW_COST: u64 = 10;

    /// 最大答案 ID
    const MAX_ANSWER_ID: u8 = 49;

    // ====== 資料結構 ======

    /// 抽取記錄
    /// 儲存使用者抽取的答案資訊，可用於鑄造 NFT
    public struct DrawRecord has key, store {
        id: UID,
        /// 記錄擁有者
        owner: address,
        /// 答案編號 (0-49)
        answer_id: u8,
        /// 抽取時間戳記
        timestamp: u64,
        /// 問題 hash（可選）
        question_hash: vector<u8>,
    }

    // ====== 事件 ======

    /// 抽取事件
    public struct DrawEvent has copy, drop {
        /// 抽取記錄 ID
        record_id: ID,
        /// 使用者地址
        user: address,
        /// 答案 ID
        answer_id: u8,
        /// 時間戳記
        timestamp: u64,
    }

    // ====== 公開函數 ======

    /// 抽取解答
    ///
    /// # 參數
    /// - `answer_id`: 答案編號 (0-49)，由前端隨機生成
    /// - `question_hash`: 問題的 hash 值（可選）
    /// - `payment`: 支付的 MGC（至少 10 MGC）
    /// - `mgc_treasury`: MGC Treasury
    /// - `ctx`: 交易上下文
    ///
    /// # 前置條件
    /// - answer_id 必須在 0-49 範圍內
    /// - payment 必須至少 10 MGC
    ///
    /// # 後置條件
    /// - 銷毀 10 MGC
    /// - 建立 DrawRecord 並轉移給使用者
    /// - 多餘的 MGC 退還給使用者
    /// - 發出 DrawEvent
    public entry fun draw(
        answer_id: u8,
        question_hash: vector<u8>,
        payment: Coin<MGC>,
        mgc_treasury: &mut MGCTreasury,
        ctx: &mut TxContext
    ) {
        // 驗證答案 ID
        assert!(answer_id <= MAX_ANSWER_ID, E_INVALID_ANSWER_ID);

        // 驗證支付金額
        let payment_value = coin::value(&payment);
        assert!(payment_value >= DRAW_COST, E_INSUFFICIENT_MGC);

        // 分割支付金額
        let draw_payment = if (payment_value == DRAW_COST) {
            payment
        } else {
            let mut payment_mut = payment;
            let change = coin::split(&mut payment_mut, payment_value - DRAW_COST, ctx);

            // 退還找零給使用者
            transfer::public_transfer(change, ctx.sender());

            payment_mut
        };

        // 銷毀 MGC
        mgc_treasury.burn(draw_payment);

        // 建立抽取記錄
        let record_uid = object::new(ctx);
        let record_id = object::uid_to_inner(&record_uid);
        let timestamp = ctx.epoch_timestamp_ms();
        let user = ctx.sender();

        let record = DrawRecord {
            id: record_uid,
            owner: user,
            answer_id,
            timestamp,
            question_hash,
        };

        // 發出事件
        event::emit(DrawEvent {
            record_id,
            user,
            answer_id,
            timestamp,
        });

        // 轉移記錄給使用者
        transfer::transfer(record, user);
    }

    // ====== 查詢函數 ======

    /// 取得記錄擁有者
    public fun get_owner(record: &DrawRecord): address {
        record.owner
    }

    /// 取得答案 ID
    public fun get_answer_id(record: &DrawRecord): u8 {
        record.answer_id
    }

    /// 取得時間戳記
    public fun get_timestamp(record: &DrawRecord): u64 {
        record.timestamp
    }

    /// 取得問題 hash
    public fun get_question_hash(record: &DrawRecord): &vector<u8> {
        &record.question_hash
    }

    // ====== Friend 函數 ======

    /// 銷毀 DrawRecord 並回傳資料
    /// 僅供 oracle_nft 模組在鑄造 NFT 時調用
    ///
    /// # 回傳
    /// (answer_id, timestamp)
    public(package) fun destroy_for_mint(record: DrawRecord): (u8, u64) {
        let DrawRecord {
            id,
            owner: _,
            answer_id,
            timestamp,
            question_hash: _
        } = record;

        object::delete(id);

        (answer_id, timestamp)
    }

    // ====== 測試函數 ======

    #[test_only]
    /// 測試專用：初始化 MGC
    public fun init_for_testing_mgc(ctx: &mut TxContext) {
        oracle_library::mgc::init_for_testing(ctx);
    }
}
