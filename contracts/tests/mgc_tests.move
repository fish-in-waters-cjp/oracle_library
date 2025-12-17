#[test_only]
module oracle_library::mgc_tests {
    use iota::test_scenario::{Self as ts, Scenario};
    use iota::coin::{Self, Coin};
    use oracle_library::mgc::{Self, MGC, MGCTreasury, AdminCap};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

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
}
