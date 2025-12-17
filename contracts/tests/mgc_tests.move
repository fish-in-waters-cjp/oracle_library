#[test_only]
module oracle_library::mgc_tests {
    use iota::test_scenario::{Self as ts, Scenario};
    use iota::coin::{Self, Coin};
    use iota::clock::{Self, Clock};
    use oracle_library::mgc::{Self, MGC, MGCTreasury, AdminCap, EmergencyRecovery};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    const RECOVERY: address = @0xBACE;

    // Constants (must match mgc.move)
    const RECOVERY_COOLDOWN_MS: u64 = 2592000000;  // 30 天

    // ===== Helper Functions =====

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        {
            // Initialize the MGC module
            mgc::init_for_testing(ts::ctx(&mut scenario));
        };
        scenario
    }

    // ===== Tests =====

    #[test]
    fun test_init_creates_treasury() {
        let mut scenario = setup_test();

        // Check that MGCTreasury was created and shared
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_shared<MGCTreasury>(), 0);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_mint_increases_supply() {
        let mut scenario = setup_test();

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            // Initial supply should be 0
            assert!(mgc::total_supply(&treasury) == 0, 0);

            // Mint 100 MGC
            let coin = mgc::mint_for_testing(&mut treasury, 100, ts::ctx(&mut scenario));

            // Supply should increase to 100
            assert!(mgc::total_supply(&treasury) == 100, 1);
            assert!(coin::value(&coin) == 100, 2);

            // Clean up
            transfer::public_transfer(coin, ADMIN);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_burn_decreases_supply() {
        let mut scenario = setup_test();

        // First mint some coins
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let coin = mgc::mint_for_testing(&mut treasury, 100, ts::ctx(&mut scenario));
            transfer::public_transfer(coin, ADMIN);
            ts::return_shared(treasury);
        };

        // Then burn them
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let mut coin = ts::take_from_sender<Coin<MGC>>(&scenario);

            assert!(mgc::total_supply(&treasury) == 100, 0);

            // Burn 50 MGC
            let burned = mgc::burn_for_testing(&mut treasury, coin::split(&mut coin, 50, ts::ctx(&mut scenario)));
            assert!(burned == 50, 1);

            // Supply should decrease to 50
            assert!(mgc::total_supply(&treasury) == 50, 2);

            // Clean up
            transfer::public_transfer(coin, ADMIN);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_mint_and_burn_cycle() {
        let mut scenario = setup_test();

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            // Mint 1000 MGC
            let coin = mgc::mint_for_testing(&mut treasury, 1000, ts::ctx(&mut scenario));
            assert!(mgc::total_supply(&treasury) == 1000, 0);

            // Burn all
            let burned = mgc::burn_for_testing(&mut treasury, coin);
            assert!(burned == 1000, 1);
            assert!(mgc::total_supply(&treasury) == 0, 2);

            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_multiple_mints() {
        let mut scenario = setup_test();

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            // Mint multiple times
            let coin1 = mgc::mint_for_testing(&mut treasury, 100, ts::ctx(&mut scenario));
            let coin2 = mgc::mint_for_testing(&mut treasury, 200, ts::ctx(&mut scenario));
            let coin3 = mgc::mint_for_testing(&mut treasury, 300, ts::ctx(&mut scenario));

            // Total supply should be sum of all mints
            assert!(mgc::total_supply(&treasury) == 600, 0);

            // Clean up
            transfer::public_transfer(coin1, ADMIN);
            transfer::public_transfer(coin2, USER1);
            transfer::public_transfer(coin3, ADMIN);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_total_supply_query() {
        let mut scenario = setup_test();

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            // Initial supply is 0
            assert!(mgc::total_supply(&treasury) == 0, 0);

            // Mint and check
            let coin1 = mgc::mint_for_testing(&mut treasury, 500, ts::ctx(&mut scenario));
            assert!(mgc::total_supply(&treasury) == 500, 1);

            let coin2 = mgc::mint_for_testing(&mut treasury, 300, ts::ctx(&mut scenario));
            assert!(mgc::total_supply(&treasury) == 800, 2);

            // Burn and check
            mgc::burn_for_testing(&mut treasury, coin1);
            assert!(mgc::total_supply(&treasury) == 300, 3);

            // Clean up
            transfer::public_transfer(coin2, ADMIN);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_admin_mint_to_recipient() {
        let mut scenario = setup_test();

        // Admin mints MGC to USER1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // Initial supply should be 0
            assert!(mgc::total_supply(&treasury) == 0, 0);

            // Admin mints 100 MGC to USER1
            mgc::admin_mint(&admin_cap, &mut treasury, USER1, 100, ts::ctx(&mut scenario));

            // Supply should increase to 100
            assert!(mgc::total_supply(&treasury) == 100, 1);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        // Verify USER1 received the coins
        ts::next_tx(&mut scenario, USER1);
        {
            let coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            assert!(coin::value(&coin) == 100, 2);
            transfer::public_transfer(coin, USER1);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_admin_mint_multiple_recipients() {
        let mut scenario = setup_test();

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // Admin mints to multiple recipients
            mgc::admin_mint(&admin_cap, &mut treasury, USER1, 50, ts::ctx(&mut scenario));
            mgc::admin_mint(&admin_cap, &mut treasury, USER2, 150, ts::ctx(&mut scenario));
            mgc::admin_mint(&admin_cap, &mut treasury, ADMIN, 200, ts::ctx(&mut scenario));

            // Total supply should be 400
            assert!(mgc::total_supply(&treasury) == 400, 0);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        // Verify USER1 received 50
        ts::next_tx(&mut scenario, USER1);
        {
            let coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            assert!(coin::value(&coin) == 50, 1);
            transfer::public_transfer(coin, USER1);
        };

        // Verify USER2 received 150
        ts::next_tx(&mut scenario, USER2);
        {
            let coin = ts::take_from_sender<Coin<MGC>>(&scenario);
            assert!(coin::value(&coin) == 150, 2);
            transfer::public_transfer(coin, USER2);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_transfer_admin_cap() {
        let mut scenario = setup_test();

        // ADMIN transfers AdminCap to USER1
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            mgc::transfer_admin_cap(admin_cap, USER1);
        };

        // USER1 should now be able to use admin_mint
        ts::next_tx(&mut scenario, USER1);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);

            // USER1 mints 100 MGC to themselves
            mgc::admin_mint(&admin_cap, &mut treasury, USER1, 100, ts::ctx(&mut scenario));
            assert!(mgc::total_supply(&treasury) == 100, 0);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    // ===== Emergency Recovery Tests =====

    #[test]
    fun test_init_creates_emergency_recovery() {
        let mut scenario = setup_test();

        // Check that EmergencyRecovery was created and shared
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_shared<EmergencyRecovery>(), 0);

            let recovery = ts::take_shared<EmergencyRecovery>(&scenario);
            // Initial recovery_address should be ADMIN (the deployer)
            assert!(mgc::get_recovery_address(&recovery) == ADMIN, 1);
            // Initial cooldown should be 0
            assert!(mgc::get_recovery_cooldown(&recovery) == 0, 2);

            ts::return_shared(recovery);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_set_recovery_address_success() {
        let mut scenario = setup_test();

        // ADMIN sets recovery address to RECOVERY
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);

            mgc::set_recovery_address(&admin_cap, &mut recovery, RECOVERY);

            // Verify the change
            assert!(mgc::get_recovery_address(&recovery) == RECOVERY, 0);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(recovery);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_emergency_create_admin_success() {
        let mut scenario = setup_test();

        // Create clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock);
        };

        // ADMIN sets recovery address to RECOVERY
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);

            mgc::set_recovery_address(&admin_cap, &mut recovery, RECOVERY);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(recovery);
        };

        // RECOVERY creates new AdminCap
        ts::next_tx(&mut scenario, RECOVERY);
        {
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            mgc::emergency_create_admin(&mut recovery, USER1, &clock, ts::ctx(&mut scenario));

            // Verify cooldown was updated
            assert!(mgc::get_recovery_cooldown(&recovery) == RECOVERY_COOLDOWN_MS, 0);

            ts::return_shared(clock);
            ts::return_shared(recovery);
        };

        // Verify USER1 received AdminCap
        ts::next_tx(&mut scenario, USER1);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            // USER1 can use the AdminCap
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);
            mgc::admin_mint(&admin_cap, &mut treasury, USER1, 100, ts::ctx(&mut scenario));

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = mgc::E_NOT_RECOVERY_ADDRESS)]
    fun test_emergency_create_admin_wrong_sender_fails() {
        let mut scenario = setup_test();

        // Create clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock);
        };

        // USER1 (not recovery address) tries to create AdminCap
        ts::next_tx(&mut scenario, USER1);
        {
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            // This should fail because USER1 is not the recovery_address
            mgc::emergency_create_admin(&mut recovery, USER1, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(recovery);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = mgc::E_COOLDOWN_NOT_PASSED)]
    fun test_emergency_create_admin_cooldown_fails() {
        let mut scenario = setup_test();

        // Create clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock);
        };

        // First recovery (should succeed)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            mgc::emergency_create_admin(&mut recovery, USER1, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(recovery);
        };

        // Second recovery immediately (should fail due to cooldown)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            // This should fail because cooldown hasn't passed
            mgc::emergency_create_admin(&mut recovery, USER2, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(recovery);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_emergency_create_admin_after_cooldown_success() {
        let mut scenario = setup_test();

        // Create clock
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::share_for_testing(clock);
        };

        // First recovery
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            mgc::emergency_create_admin(&mut recovery, USER1, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(recovery);
        };

        // Advance clock past cooldown period (30 days + 1 second)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut clock = ts::take_shared<Clock>(&scenario);
            clock::increment_for_testing(&mut clock, RECOVERY_COOLDOWN_MS + 1000);
            ts::return_shared(clock);
        };

        // Second recovery after cooldown (should succeed)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut recovery = ts::take_shared<EmergencyRecovery>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);

            mgc::emergency_create_admin(&mut recovery, USER2, &clock, ts::ctx(&mut scenario));

            ts::return_shared(clock);
            ts::return_shared(recovery);
        };

        // Verify USER2 received AdminCap
        ts::next_tx(&mut scenario, USER2);
        {
            assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario), 0);
        };

        ts::end(scenario);
    }
}
