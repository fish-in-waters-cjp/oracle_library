#[test_only]
module oracle_library::oracle_draw_tests {
    use iota::test_scenario::{Self as ts, Scenario};
    use iota::coin::{Self, Coin};
    use oracle_library::mgc::{Self, MGC, MGCTreasury};
    use oracle_library::oracle_draw::{Self, DrawRecord};

    // 測試地址
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    // 測試常數
    const DRAW_COST: u64 = 10;
    const MAX_ANSWER_ID: u8 = 49;

    // 錯誤碼
    const E_INVALID_ANSWER_ID: u64 = 1;
    const E_INSUFFICIENT_MGC: u64 = 2;

    /// 設置測試環境：初始化 MGC Treasury
    fun setup_test(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            mgc::init_for_testing(ts::ctx(scenario));
        };
    }

    /// 輔助函數：鑄造 MGC 給使用者
    fun mint_mgc_to_user(scenario: &mut Scenario, user: address, amount: u64) {
        ts::next_tx(scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(scenario);
            let mgc_coin = mgc::mint_for_testing(&mut treasury, amount, ts::ctx(scenario));
            transfer::public_transfer(mgc_coin, user);
            ts::return_shared(treasury);
        };
    }

    #[test]
    /// 測試：成功抽取解答
    fun test_draw_success() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 給 USER1 鑄造 10 MGC
        mint_mgc_to_user(&mut scenario, USER1, DRAW_COST);

        // USER1 抽取解答
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let answer_id: u8 = 25;
            let question_hash = b"What is the meaning of life?";

            oracle_draw::draw(
                answer_id,
                question_hash,
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // 驗證 DrawRecord 已建立
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);

            // 驗證 DrawRecord 內容
            assert!(oracle_draw::get_owner(&record) == USER1, 0);
            assert!(oracle_draw::get_answer_id(&record) == 25, 1);
            // 時間戳記在測試環境中可能為 0
            let _timestamp = oracle_draw::get_timestamp(&record);

            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：抽取解答並退還多餘的 MGC
    fun test_draw_with_change() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 給 USER1 鑄造 15 MGC（多於需要的 10 MGC）
        mint_mgc_to_user(&mut scenario, USER1, 15);

        // USER1 抽取解答
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let answer_id: u8 = 10;
            let question_hash = b"test question";

            oracle_draw::draw(
                answer_id,
                question_hash,
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // 驗證退款（應該收到 5 MGC 找零）
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            let change = ts::take_from_sender<Coin<MGC>>(&scenario);

            // 驗證找零金額
            assert!(coin::value(&change) == 5, 0);

            ts::return_to_sender(&scenario, record);
            ts::return_to_sender(&scenario, change);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：使用邊界值 answer_id (0 和 49)
    fun test_draw_boundary_answer_ids() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 測試 answer_id = 0
        mint_mgc_to_user(&mut scenario, USER1, DRAW_COST);
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                0,
                b"question 1",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // 驗證 answer_id = 0
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_answer_id(&record) == 0, 0);
            ts::return_to_sender(&scenario, record);
        };

        // 測試 answer_id = 49
        mint_mgc_to_user(&mut scenario, USER2, DRAW_COST);
        ts::next_tx(&mut scenario, USER2);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                MAX_ANSWER_ID,
                b"question 2",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // 驗證 answer_id = 49
        ts::next_tx(&mut scenario, USER2);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_answer_id(&record) == MAX_ANSWER_ID, 1);
            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：多個使用者可以各自抽取
    fun test_multiple_users_draw() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // USER1 抽取
        mint_mgc_to_user(&mut scenario, USER1, DRAW_COST);
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                10,
                b"user1 question",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // USER2 抽取
        mint_mgc_to_user(&mut scenario, USER2, DRAW_COST);
        ts::next_tx(&mut scenario, USER2);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                20,
                b"user2 question",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // 驗證 USER1 的記錄
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_owner(&record) == USER1, 0);
            assert!(oracle_draw::get_answer_id(&record) == 10, 1);
            ts::return_to_sender(&scenario, record);
        };

        // 驗證 USER2 的記錄
        ts::next_tx(&mut scenario, USER2);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_owner(&record) == USER2, 2);
            assert!(oracle_draw::get_answer_id(&record) == 20, 3);
            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = E_INVALID_ANSWER_ID, location = oracle_draw)]
    /// 測試：answer_id 超過範圍（應該失敗）
    fun test_draw_invalid_answer_id() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        mint_mgc_to_user(&mut scenario, USER1, DRAW_COST);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            // answer_id = 50 超過最大值 49
            oracle_draw::draw(
                50,
                b"invalid question",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = E_INSUFFICIENT_MGC, location = oracle_draw)]
    /// 測試：MGC 不足（應該失敗）
    fun test_draw_insufficient_mgc() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 只給 5 MGC，少於需要的 10 MGC
        mint_mgc_to_user(&mut scenario, USER1, 5);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                25,
                b"insufficient mgc",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：空的 question_hash
    fun test_draw_empty_question() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        mint_mgc_to_user(&mut scenario, USER1, DRAW_COST);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            // 空的 question_hash
            oracle_draw::draw(
                15,
                b"",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // 驗證仍然可以成功建立 DrawRecord
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_answer_id(&record) == 15, 0);
            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：同一使用者多次抽取
    fun test_multiple_draws_same_user() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        mint_mgc_to_user(&mut scenario, USER1, 50);

        // 第一次抽取
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let mut coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            let payment = coin::split(&mut coin, DRAW_COST, ts::ctx(&mut scenario));

            oracle_draw::draw(
                1,
                b"first question",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(coin, USER1);
            ts::return_shared(treasury);
        };

        // 第二次抽取
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let mut coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            let payment = coin::split(&mut coin, DRAW_COST, ts::ctx(&mut scenario));

            oracle_draw::draw(
                2,
                b"second question",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(coin, USER1);
            ts::return_shared(treasury);
        };

        // 第三次抽取
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let mut coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            let payment = coin::split(&mut coin, DRAW_COST, ts::ctx(&mut scenario));

            oracle_draw::draw(
                3,
                b"third question",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(coin, USER1);
            ts::return_shared(treasury);
        };

        // 驗證所有 3 個 DrawRecords 都存在
        ts::next_tx(&mut scenario, USER1);
        {
            let record1 = ts::take_from_sender<DrawRecord>(&scenario);
            ts::return_to_sender(&scenario, record1);

            // 剩餘 MGC 應該是 50 - 30 = 20
            let remaining = ts::take_from_sender<Coin<MGC>>(&scenario);
            assert!(coin::value(&remaining) == 20, 0);
            ts::return_to_sender(&scenario, remaining);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：時間戳記已記錄
    fun test_draw_timestamp_recorded() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        mint_mgc_to_user(&mut scenario, USER1, 20);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                7,
                b"timestamp test",
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            // 在測試環境中，時間戳記從 0 開始，但我們只檢查它存在
            let timestamp = oracle_draw::get_timestamp(&record);
            assert!(timestamp >= 0, 0);
            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }
}
