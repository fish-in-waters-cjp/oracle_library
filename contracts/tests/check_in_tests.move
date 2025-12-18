#[test_only]
module oracle_library::check_in_tests {
    use iota::test_scenario::{Self as ts, Scenario};
    use iota::clock::{Self, Clock};
    use iota::coin::{Self};
    use oracle_library::mgc::{Self, MGC, MGCTreasury};
    use oracle_library::check_in::{Self, UserCheckInRecord};

    // 測試常數
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    const FIRST_CHECK_IN_REWARD: u64 = 100;  // 首次簽到獎勵（新用戶禮包）
    const DAILY_CHECK_IN_REWARD: u64 = 20;   // 每日簽到獎勵
    const UTC8_OFFSET_MS: u64 = 28800000; // 8 * 3600 * 1000
    const DAY_MS: u64 = 86400000; // 24 * 3600 * 1000

    // 輔助函數：取得 UTC+8 日期編號
    fun get_utc8_day_number(timestamp_ms: u64): u64 {
        (timestamp_ms + UTC8_OFFSET_MS) / DAY_MS
    }

    // 輔助函數：初始化測試場景
    fun setup_test(scenario: &mut Scenario) {
        // 初始化 MGC Token 模組
        ts::next_tx(scenario, ADMIN);
        {
            mgc::init_for_testing(ts::ctx(scenario));
        };
    }

    #[test]
    /// 測試：首次簽到成功
    fun test_first_check_in_success() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建 Clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock);
        };

        // USER1 首次簽到
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // 驗證：使用者獲得 UserCheckInRecord
        ts::next_tx(&mut scenario, USER1);
        {
            assert!(ts::has_most_recent_for_sender<UserCheckInRecord>(&scenario), 0);

            let record = ts::take_from_sender<UserCheckInRecord>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            let current_day = get_utc8_day_number(clock::timestamp_ms(&clock));

            // 驗證記錄
            assert!(check_in::get_last_check_in_day(&record) == current_day, 1);
            assert!(check_in::get_total_check_ins(&record) == 1, 2);

            ts::return_to_sender(&scenario, record);
            ts::return_shared(clock);
        };

        // 驗證：使用者獲得 100 MGC（首次簽到獎勵）
        ts::next_tx(&mut scenario, USER1);
        {
            let mgc_coin = ts::take_from_sender<coin::Coin<MGC>>(&scenario);
            assert!(coin::value(&mgc_coin) == FIRST_CHECK_IN_REWARD, 3);
            ts::return_to_sender(&scenario, mgc_coin);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：重複首次簽到失敗（注意：check_in 模組沒有 E_ALREADY_HAS_RECORD 錯誤碼，首次簽到可重複執行）
    fun test_first_check_in_twice_success() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建 Clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock);
        };

        // USER1 首次簽到
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // USER1 再次首次簽到（會成功並創建第二個記錄）
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：每日簽到成功
    fun test_daily_check_in_success() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建 Clock（模擬第一天）
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, 0); // 設定為 Unix epoch 開始
            clock::share_for_testing(clock);
        };

        // USER1 首次簽到
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // 模擬隔天（增加 25 小時）
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut clock = ts::take_shared<Clock>(&scenario);
            clock::increment_for_testing(&mut clock, 90000000); // 25 * 3600 * 1000
            ts::return_shared(clock);
        };

        // USER1 第二天簽到
        ts::next_tx(&mut scenario, USER1);
        {
            let mut record = ts::take_from_sender<UserCheckInRecord>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::check_in(&mut record, &mut treasury, &clock, ts::ctx(&mut scenario));

            let current_day = get_utc8_day_number(clock::timestamp_ms(&clock));

            // 驗證記錄更新
            assert!(check_in::get_last_check_in_day(&record) == current_day, 1);
            assert!(check_in::get_total_check_ins(&record) == 2, 2);

            ts::return_to_sender(&scenario, record);
            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // 驗證：使用者再獲得 20 MGC（總共 100 + 20 = 120 MGC）
        ts::next_tx(&mut scenario, USER1);
        {
            // 取得所有 MGC coin 並合併
            let mut total_value = 0u64;
            while (ts::has_most_recent_for_sender<coin::Coin<MGC>>(&scenario)) {
                let mgc_coin = ts::take_from_sender<coin::Coin<MGC>>(&scenario);
                total_value = total_value + coin::value(&mgc_coin);
                ts::return_to_sender(&scenario, mgc_coin);
            };
            assert!(total_value == FIRST_CHECK_IN_REWARD + DAILY_CHECK_IN_REWARD, 3);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = check_in::E_ALREADY_CHECKED_IN_TODAY)]
    /// 測試：同一天重複簽到失敗
    fun test_check_in_same_day_fails() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建並共享 Clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock_obj = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock_obj);
        };

        // USER1 首次簽到
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // USER1 同一天再次簽到（應該失敗）
        ts::next_tx(&mut scenario, USER1);
        {
            let mut record = ts::take_from_sender<UserCheckInRecord>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::check_in(&mut record, &mut treasury, &clock, ts::ctx(&mut scenario)); // 預期失敗

            ts::return_to_sender(&scenario, record);
            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：多個使用者可以各自簽到
    fun test_multiple_users_check_in() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建並共享 Clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock_obj = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock_obj);
        };

        // USER1 首次簽到
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // USER2 首次簽到
        ts::next_tx(&mut scenario, USER2);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // 驗證兩個使用者都有記錄
        ts::next_tx(&mut scenario, USER1);
        {
            assert!(ts::has_most_recent_for_sender<UserCheckInRecord>(&scenario), 0);
        };

        ts::next_tx(&mut scenario, USER2);
        {
            assert!(ts::has_most_recent_for_sender<UserCheckInRecord>(&scenario), 1);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：連續多天簽到
    fun test_consecutive_check_ins() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 創建 Clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, 0);
            clock::share_for_testing(clock);
        };

        // USER1 首次簽到（第1天）
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            check_in::first_check_in(&mut treasury, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(treasury);
        };

        // 連續簽到 3 天
        let mut day = 2;
        while (day <= 4) {
            // 模擬隔天
            ts::next_tx(&mut scenario, ADMIN);
            {
                let mut clock = ts::take_shared<Clock>(&scenario);
                clock::increment_for_testing(&mut clock, 90000000); // 25 小時
                ts::return_shared(clock);
            };

            // USER1 簽到
            ts::next_tx(&mut scenario, USER1);
            {
                let mut record = ts::take_from_sender<UserCheckInRecord>(&scenario);
                let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
                let clock = ts::take_shared<Clock>(&scenario);

                check_in::check_in(&mut record, &mut treasury, &clock, ts::ctx(&mut scenario));

                // 驗證次數
                assert!(check_in::get_total_check_ins(&record) == day, day);

                ts::return_to_sender(&scenario, record);
                ts::return_shared(clock);
                ts::return_shared(treasury);
            };

            day = day + 1;
        };

        ts::end(scenario);
    }
}
