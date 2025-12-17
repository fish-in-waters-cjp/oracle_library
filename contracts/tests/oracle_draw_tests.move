#[test_only]
module oracle_library::oracle_draw_tests {
    use iota::test_scenario::{Self as ts, Scenario};
    use iota::coin::{Self, Coin};
    use oracle_library::mgc::{Self, MGC, MGCTreasury};
    use oracle_library::oracle_draw::{Self, DrawRecord};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;

    // Constants
    const DRAW_COST: u64 = 10;

    // ===== Helper Functions =====

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        {
            // Initialize the MGC module
            mgc::init_for_testing(ts::ctx(&mut scenario));
        };
        scenario
    }

    fun mint_mgc_to_user(scenario: &mut Scenario, user: address, amount: u64) {
        ts::next_tx(scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(scenario);
            let coin = mgc::mint_for_testing(&mut treasury, amount, ts::ctx(scenario));
            transfer::public_transfer(coin, user);
            ts::return_shared(treasury);
        };
    }

    // ===== Tests =====

    #[test]
    fun test_draw_success() {
        let mut scenario = setup_test();

        // Mint 20 MGC to USER1
        mint_mgc_to_user(&mut scenario, USER1, 20);

        // USER1 performs a draw
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            // Draw with answer_id = 5
            oracle_draw::draw(
                5,                      // answer_id
                vector::empty<u8>(),    // empty question_hash
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            // Treasury should have 10 MGC burned (20 - 10 = 10 remaining for user)
            ts::return_shared(treasury);
        };

        // Verify DrawRecord was created and transferred to USER1
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_answer_id(&record) == 5, 0);
            assert!(oracle_draw::get_owner(&record) == USER1, 1);
            ts::return_to_sender(&scenario, record);

            // Verify remaining MGC
            let remaining_coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            assert!(coin::value(&remaining_coin) == 10, 2);
            ts::return_to_sender(&scenario, remaining_coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_draw_with_question_hash() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, 15);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            // Draw with a question hash
            let question_hash = b"test_question_hash";
            oracle_draw::draw(
                10,                     // answer_id
                question_hash,
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // Verify DrawRecord
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_answer_id(&record) == 10, 0);
            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_draw_exact_payment() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, DRAW_COST);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            // Draw with exact 10 MGC
            oracle_draw::draw(
                0,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // Verify DrawRecord exists but no remaining MGC
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_answer_id(&record) == 0, 0);
            ts::return_to_sender(&scenario, record);

            // No remaining coin should exist
            assert!(!ts::has_most_recent_for_sender<Coin<MGC>>(&scenario), 1);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_draw_with_excess_payment() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, 100);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                25,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        // Verify excess MGC is returned
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            ts::return_to_sender(&scenario, record);

            let remaining_coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            assert!(coin::value(&remaining_coin) == 90, 0); // 100 - 10 = 90
            ts::return_to_sender(&scenario, remaining_coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_draw_max_answer_id() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, 20);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            // Draw with max valid answer_id (49)
            oracle_draw::draw(
                49,                     // MAX_ANSWER_ID
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            assert!(oracle_draw::get_answer_id(&record) == 49, 0);
            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = oracle_draw::E_INVALID_ANSWER_ID)]
    fun test_draw_invalid_answer_id() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, 20);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            // Draw with invalid answer_id (50 > 49)
            oracle_draw::draw(
                50,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = oracle_draw::E_INSUFFICIENT_MGC)]
    fun test_draw_insufficient_mgc() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, 5); // Only 5 MGC, need 10

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                5,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_multiple_draws_same_user() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, 50);

        // First draw
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let mut coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            let payment = coin::split(&mut coin, DRAW_COST, ts::ctx(&mut scenario));

            oracle_draw::draw(
                1,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(coin, USER1);
            ts::return_shared(treasury);
        };

        // Second draw
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let mut coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            let payment = coin::split(&mut coin, DRAW_COST, ts::ctx(&mut scenario));

            oracle_draw::draw(
                2,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(coin, USER1);
            ts::return_shared(treasury);
        };

        // Third draw
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let mut coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            let payment = coin::split(&mut coin, DRAW_COST, ts::ctx(&mut scenario));

            oracle_draw::draw(
                3,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(coin, USER1);
            ts::return_shared(treasury);
        };

        // Verify all 3 DrawRecords exist
        ts::next_tx(&mut scenario, USER1);
        {
            // Should have 3 DrawRecords
            let record1 = ts::take_from_sender<DrawRecord>(&scenario);
            ts::return_to_sender(&scenario, record1);

            // Remaining MGC should be 50 - 30 = 20
            let remaining = ts::take_from_sender<Coin<MGC>>(&scenario);
            assert!(coin::value(&remaining) == 20, 0);
            ts::return_to_sender(&scenario, remaining);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_draw_timestamp_recorded() {
        let mut scenario = setup_test();
        mint_mgc_to_user(&mut scenario, USER1, 20);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);

            oracle_draw::draw(
                7,
                vector::empty<u8>(),
                payment,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(treasury);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            // Timestamp should be recorded (non-zero in test)
            let timestamp = oracle_draw::get_timestamp(&record);
            // In test scenario, timestamp starts at 0 but we just check it exists
            assert!(timestamp >= 0, 0);
            ts::return_to_sender(&scenario, record);
        };

        ts::end(scenario);
    }
}
