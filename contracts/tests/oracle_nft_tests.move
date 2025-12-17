#[test_only]
module oracle_library::oracle_nft_tests {
    use iota::test_scenario::{Self as ts, Scenario};
    use iota::coin::{Self, Coin};
    use std::string;
    use oracle_library::mgc::{Self, MGC, MGCTreasury};
    use oracle_library::oracle_draw::{Self, DrawRecord};
    use oracle_library::oracle_nft::{Self, OracleNFT, NFTConfig};

    // 測試地址
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    // 測試常數
    const MINT_COST: u64 = 5;
    const DRAW_COST: u64 = 10;

    // 錯誤碼
    const E_NOT_OWNER: u64 = 1;
    const E_INVALID_RARITY: u64 = 2;
    const E_INSUFFICIENT_MGC: u64 = 3;

    /// 設置測試環境
    fun setup_test(scenario: &mut Scenario) {
        // 初始化 MGC
        ts::next_tx(scenario, ADMIN);
        {
            mgc::init_for_testing(ts::ctx(scenario));
        };

        // 初始化 oracle_nft
        ts::next_tx(scenario, ADMIN);
        {
            oracle_nft::test_init(ts::ctx(scenario));
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

    /// 輔助函數：為使用者建立 DrawRecord
    fun create_draw_record(scenario: &mut Scenario, user: address, answer_id: u8) {
        // 給使用者 MGC 進行抽取
        mint_mgc_to_user(scenario, user, DRAW_COST);

        ts::next_tx(scenario, user);
        {
            let mut treasury = ts::take_shared<MGCTreasury>(scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(scenario);
            let question_hash = b"Test question";

            oracle_draw::draw(
                answer_id,
                question_hash,
                payment,
                &mut treasury,
                ts::ctx(scenario)
            );

            ts::return_shared(treasury);
        };
    }

    #[test]
    /// 測試：成功鑄造 NFT
    fun test_mint_success() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // 建立 DrawRecord
        create_draw_record(&mut scenario, USER1, 25);

        // 鑄造 NFT
        mint_mgc_to_user(&mut scenario, USER1, MINT_COST);
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let config = ts::take_shared<NFTConfig>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            oracle_nft::mint(
                record,
                0, // Common rarity
                payment,
                &config,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // 驗證 NFT 已建立
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<OracleNFT>(&scenario);

            // 驗證 NFT 屬性
            assert!(oracle_nft::get_answer_id(&nft) == 25, 0);
            assert!(oracle_nft::get_rarity(&nft) == 0, 1);

            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：鑄造 NFT 並退還多餘的 MGC
    fun test_mint_with_change() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        create_draw_record(&mut scenario, USER1, 10);

        // 給 10 MGC（多於需要的 5 MGC）
        mint_mgc_to_user(&mut scenario, USER1, 10);
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let config = ts::take_shared<NFTConfig>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            oracle_nft::mint(
                record,
                1, // Rare
                payment,
                &config,
                &mut treasury,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // 驗證退款（應該收到 5 MGC 找零）
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<OracleNFT>(&scenario);
            let change = ts::take_from_sender<Coin<MGC>>(&scenario);

            assert!(coin::value(&change) == 5, 0);

            ts::return_to_sender(&scenario, nft);
            ts::return_to_sender(&scenario, change);
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：鑄造不同稀有度的 NFT
    fun test_mint_different_rarities() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        let rarities = vector[0u8, 1u8, 2u8, 3u8]; // Common, Rare, Epic, Legendary
        let mut i = 0;

        while (i < rarities.length()) {
            let rarity = *rarities.borrow(i);

            // 建立 DrawRecord
            create_draw_record(&mut scenario, USER1, (i as u8));

            // 鑄造 NFT
            mint_mgc_to_user(&mut scenario, USER1, MINT_COST);
            ts::next_tx(&mut scenario, USER1);
            {
                let record = ts::take_from_sender<DrawRecord>(&scenario);
                let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
                let config = ts::take_shared<NFTConfig>(&scenario);
                let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

                oracle_nft::mint(
                    record,
                    rarity,
                    payment,
                    &config,
                    &mut treasury,
                    ts::ctx(&mut scenario)
                );

                ts::return_shared(config);
                ts::return_shared(treasury);
            };

            // 驗證稀有度
            ts::next_tx(&mut scenario, USER1);
            {
                let nft = ts::take_from_sender<OracleNFT>(&scenario);
                assert!(oracle_nft::get_rarity(&nft) == rarity, i);
                ts::return_to_sender(&scenario, nft);
            };

            i = i + 1;
        };

        ts::end(scenario);
    }

    #[test]
    /// 測試：多個使用者可以各自鑄造 NFT
    fun test_multiple_users_mint() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        // USER1 鑄造
        create_draw_record(&mut scenario, USER1, 10);
        mint_mgc_to_user(&mut scenario, USER1, MINT_COST);
        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let config = ts::take_shared<NFTConfig>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            oracle_nft::mint(record, 0, payment, &config, &mut treasury, ts::ctx(&mut scenario));

            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // USER2 鑄造
        create_draw_record(&mut scenario, USER2, 20);
        mint_mgc_to_user(&mut scenario, USER2, MINT_COST);
        ts::next_tx(&mut scenario, USER2);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let config = ts::take_shared<NFTConfig>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            oracle_nft::mint(record, 1, payment, &config, &mut treasury, ts::ctx(&mut scenario));

            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        // 驗證各自的 NFT
        ts::next_tx(&mut scenario, USER1);
        {
            let nft = ts::take_from_sender<OracleNFT>(&scenario);
            assert!(oracle_nft::get_answer_id(&nft) == 10, 0);
            ts::return_to_sender(&scenario, nft);
        };

        ts::next_tx(&mut scenario, USER2);
        {
            let nft = ts::take_from_sender<OracleNFT>(&scenario);
            assert!(oracle_nft::get_answer_id(&nft) == 20, 1);
            ts::return_to_sender(&scenario, nft);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = E_INVALID_RARITY, location = oracle_nft)]
    /// 測試：稀有度超過範圍（應該失敗）
    fun test_mint_invalid_rarity() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        create_draw_record(&mut scenario, USER1, 25);
        mint_mgc_to_user(&mut scenario, USER1, MINT_COST);

        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let config = ts::take_shared<NFTConfig>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            // rarity = 4 超過最大值 3
            oracle_nft::mint(record, 4, payment, &config, &mut treasury, ts::ctx(&mut scenario));

            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = E_INSUFFICIENT_MGC, location = oracle_nft)]
    /// 測試：MGC 不足（應該失敗）
    fun test_mint_insufficient_mgc() {
        let mut scenario = ts::begin(ADMIN);
        setup_test(&mut scenario);

        create_draw_record(&mut scenario, USER1, 25);

        // 只給 3 MGC，少於需要的 5 MGC
        mint_mgc_to_user(&mut scenario, USER1, 3);

        ts::next_tx(&mut scenario, USER1);
        {
            let record = ts::take_from_sender<DrawRecord>(&scenario);
            let payment = ts::take_from_sender<Coin<MGC>>(&scenario);
            let config = ts::take_shared<NFTConfig>(&scenario);
            let mut treasury = ts::take_shared<MGCTreasury>(&scenario);

            oracle_nft::mint(record, 0, payment, &config, &mut treasury, ts::ctx(&mut scenario));

            ts::return_shared(config);
            ts::return_shared(treasury);
        };

        ts::end(scenario);
    }
}
