#[test_only]
module oracle_library::mgc_tests {
    use iota::test_scenario::{Self as ts, Scenario};
    use iota::coin::{Self, Coin};
    use oracle_library::mgc::{Self, MGC, MGCTreasury};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;

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
}
