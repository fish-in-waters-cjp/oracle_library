/// Oracle NFT Module
/// 將抽取的答案鑄造成永久 NFT
module oracle_library::oracle_nft {
    use std::string::{Self, String};
    use std::ascii;
    use iota::coin::{Self, Coin};
    use iota::event;
    use iota::package;
    use iota::display;
    use iota::url::{Self, Url};
    use oracle_library::mgc::{MGC, MGCTreasury, AdminCap};
    use oracle_library::oracle_draw::DrawRecord;

    // ====== 錯誤碼 ======

    /// 非 DrawRecord 擁有者
    const E_NOT_OWNER: u64 = 1;

    /// 稀有度無效（必須 0-3）
    const E_INVALID_RARITY: u64 = 2;

    /// MGC 不足（需要 5 MGC）
    const E_INSUFFICIENT_MGC: u64 = 3;

    // ====== 常數 ======

    /// 鑄造 NFT 的成本（5 MGC）
    const MINT_COST: u64 = 5;

    /// 最大稀有度
    const MAX_RARITY: u8 = 3;

    // ====== 資料結構 ======

    /// One-Time Witness for Publisher
    public struct ORACLE_NFT has drop {}

    /// Oracle NFT
    /// 永久保存抽取的答案
    public struct OracleNFT has key, store {
        id: UID,
        /// NFT 名稱
        name: String,
        /// 答案編號 (0-49)
        answer_id: u8,
        /// 稀有度 (0-3: Common, Rare, Epic, Legendary)
        rarity: u8,
        /// 圖片 URL
        image_url: Url,
        /// 抽取時間戳記
        drawn_at: u64,
        /// 鑄造時間戳記
        minted_at: u64,
    }

    /// NFT 設定（共享物件）
    public struct NFTConfig has key {
        id: UID,
        /// 基礎 URL（用於生成 NFT 圖片）
        base_url: String,
    }

    // ====== 事件 ======

    /// NFT 鑄造事件
    public struct NFTMintedEvent has copy, drop {
        /// NFT ID
        nft_id: ID,
        /// 擁有者
        owner: address,
        /// 答案 ID
        answer_id: u8,
        /// 稀有度
        rarity: u8,
        /// 鑄造時間
        minted_at: u64,
    }

    // ====== 初始化 ======

    /// 模組初始化
    /// 建立 Publisher、Display 和 NFTConfig
    fun init(otw: ORACLE_NFT, ctx: &mut TxContext) {
        // 建立 Publisher
        let publisher = package::claim(otw, ctx);

        // 建立 Display 模板
        let mut display = display::new<OracleNFT>(&publisher, ctx);

        display.add(
            string::utf8(b"name"),
            string::utf8(b"{name}")
        );
        display.add(
            string::utf8(b"description"),
            string::utf8(b"永恆圖書館的解答之書 NFT")
        );
        display.add(
            string::utf8(b"image_url"),
            string::utf8(b"{image_url}")
        );
        display.add(
            string::utf8(b"rarity"),
            string::utf8(b"{rarity}")
        );

        display.update_version();

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());

        // 建立 NFTConfig 共享物件
        let config = NFTConfig {
            id: object::new(ctx),
            base_url: string::utf8(b"ipfs://"),
        };

        transfer::share_object(config);
    }

    // ====== 公開函數 ======

    /// 鑄造 NFT
    ///
    /// # 參數
    /// - `record`: DrawRecord（會被銷毀）
    /// - `rarity`: 稀有度 (0-3)
    /// - `payment`: 支付的 MGC（至少 5 MGC）
    /// - `config`: NFT 設定
    /// - `mgc_treasury`: MGC Treasury
    /// - `ctx`: 交易上下文
    ///
    /// # 前置條件
    /// - 呼叫者是 DrawRecord 的擁有者
    /// - rarity ≤ 3
    /// - payment ≥ 5 MGC
    ///
    /// # 後置條件
    /// - 銷毀 5 MGC
    /// - 銷毀 DrawRecord
    /// - 建立 OracleNFT 並轉移給使用者
    /// - 多餘的 MGC 退還給使用者
    /// - 發出 NFTMintedEvent
    public entry fun mint(
        record: DrawRecord,
        rarity: u8,
        payment: Coin<MGC>,
        config: &NFTConfig,
        mgc_treasury: &mut MGCTreasury,
        ctx: &mut TxContext
    ) {
        // 驗證稀有度
        assert!(rarity <= MAX_RARITY, E_INVALID_RARITY);

        // 驗證支付金額
        let payment_value = coin::value(&payment);
        assert!(payment_value >= MINT_COST, E_INSUFFICIENT_MGC);

        // 分割支付金額
        let mint_payment = if (payment_value == MINT_COST) {
            payment
        } else {
            let mut payment_mut = payment;
            let change = coin::split(&mut payment_mut, payment_value - MINT_COST, ctx);

            // 退還找零給使用者
            transfer::public_transfer(change, ctx.sender());

            payment_mut
        };

        // 銷毀 MGC
        mgc_treasury.burn(mint_payment);

        // 從 DrawRecord 取得資料並銷毀
        let (answer_id, drawn_at) = oracle_library::oracle_draw::destroy_for_mint(record);

        // 建立 NFT
        let nft_uid = object::new(ctx);
        let nft_id = object::uid_to_inner(&nft_uid);
        let minted_at = ctx.epoch_timestamp_ms();
        let owner = ctx.sender();

        // 生成 NFT 名稱
        let name = generate_nft_name(answer_id, rarity);

        // 生成圖片 URL
        let image_url = generate_image_url(config, answer_id, rarity);

        let nft = OracleNFT {
            id: nft_uid,
            name,
            answer_id,
            rarity,
            image_url,
            drawn_at,
            minted_at,
        };

        // 發出事件
        event::emit(NFTMintedEvent {
            nft_id,
            owner,
            answer_id,
            rarity,
            minted_at,
        });

        // 轉移 NFT 給使用者
        transfer::transfer(nft, owner);
    }

    // ====== 管理員函數 ======

    /// 更新 NFT 圖片的 base URL
    ///
    /// # 參數
    /// - `_admin_cap`: 管理員權限憑證（驗證身份用）
    /// - `config`: NFT 設定
    /// - `new_base_url`: 新的 base URL（例如 "https://ipfs.io/ipfs/QmXxx/"）
    ///
    /// # 範例
    /// ```
    /// // 設定為 IPFS gateway URL
    /// update_base_url(admin_cap, config, b"https://ipfs.io/ipfs/QmXxxYourCID/");
    /// ```
    public entry fun update_base_url(
        _admin_cap: &AdminCap,
        config: &mut NFTConfig,
        new_base_url: vector<u8>,
    ) {
        config.base_url = string::utf8(new_base_url);
    }

    /// 查詢當前 base URL
    public fun get_base_url(config: &NFTConfig): &String {
        &config.base_url
    }

    // ====== 查詢函數 ======

    /// 取得 NFT 名稱
    public fun get_name(nft: &OracleNFT): &String {
        &nft.name
    }

    /// 取得答案 ID
    public fun get_answer_id(nft: &OracleNFT): u8 {
        nft.answer_id
    }

    /// 取得稀有度
    public fun get_rarity(nft: &OracleNFT): u8 {
        nft.rarity
    }

    /// 取得圖片 URL
    public fun get_image_url(nft: &OracleNFT): &Url {
        &nft.image_url
    }

    /// 取得抽取時間
    public fun get_drawn_at(nft: &OracleNFT): u64 {
        nft.drawn_at
    }

    /// 取得鑄造時間
    public fun get_minted_at(nft: &OracleNFT): u64 {
        nft.minted_at
    }

    // ====== 內部函數 ======

    /// 生成 NFT 名稱
    fun generate_nft_name(answer_id: u8, rarity: u8): String {
        let rarity_name = if (rarity == 0) {
            string::utf8(b"Common")
        } else if (rarity == 1) {
            string::utf8(b"Rare")
        } else if (rarity == 2) {
            string::utf8(b"Epic")
        } else {
            string::utf8(b"Legendary")
        };

        let mut name = string::utf8(b"Oracle Answer #");
        name.append(u8_to_string(answer_id));
        name.append(string::utf8(b" ("));
        name.append(rarity_name);
        name.append(string::utf8(b")"));

        name
    }

    /// 生成圖片 URL
    fun generate_image_url(config: &NFTConfig, answer_id: u8, rarity: u8): Url {
        let mut url_bytes = vector::empty<u8>();

        // 添加 base URL
        vector::append(&mut url_bytes, *config.base_url.bytes());

        // 添加 "answer-"
        vector::append(&mut url_bytes, b"answer-");

        // 添加 answer_id
        let answer_id_str = u8_to_string(answer_id);
        vector::append(&mut url_bytes, *answer_id_str.bytes());

        // 添加 "-rarity-"
        vector::append(&mut url_bytes, b"-rarity-");

        // 添加 rarity
        let rarity_str = u8_to_string(rarity);
        vector::append(&mut url_bytes, *rarity_str.bytes());

        // 添加 ".png"
        vector::append(&mut url_bytes, b".png");

        // 轉換為 ASCII String 並創建 URL
        let ascii_url = ascii::string(url_bytes);
        url::new_unsafe(ascii_url)
    }

    /// 將 u8 轉換為 String
    fun u8_to_string(value: u8): String {
        if (value == 0) {
            return string::utf8(b"0")
        };

        let mut buffer = vector::empty<u8>();
        let mut n = value;

        while (n > 0) {
            let digit = ((n % 10) as u8) + 48; // 48 = '0'
            buffer.push_back(digit);
            n = n / 10;
        };

        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }

    // ====== 測試函數 ======

    #[test_only]
    /// 測試專用：初始化
    public fun test_init(ctx: &mut TxContext) {
        init(ORACLE_NFT {}, ctx);
    }
}
