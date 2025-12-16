module oracle_library::mgc {
    use iota::coin::{Self, TreasuryCap, Coin};
    use iota::url;

    // ============ Structs ============

    /// One-Time Witness for MGC token
    public struct MGC has drop {}

    /// Treasury that wraps the TreasuryCap for controlled minting/burning
    public struct MGCTreasury has key {
        id: UID,
        treasury_cap: TreasuryCap<MGC>,
    }

    // ============ Init Function ============

    /// Initialize the MGC token on module deployment
    fun init(witness: MGC, ctx: &mut TxContext) {
        // Create the MGC currency
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            0,  // decimals - MGC is indivisible
            b"MGC",
            b"Wisdom Shards",
            b"Magical currency earned through daily check-ins and oracle draws in the Eternal Library",
            option::some(url::new_unsafe_from_bytes(b"https://ipfs.io/ipfs/QmMGCIcon")),
            ctx
        );

        // Freeze the metadata to prevent modifications
        transfer::public_freeze_object(metadata);

        // Wrap TreasuryCap in a shared object for controlled access
        let treasury = MGCTreasury {
            id: object::new(ctx),
            treasury_cap,
        };
        transfer::share_object(treasury);
    }

    // ============ Friend Functions ============

    /// Mint new MGC tokens (only callable by friend modules)
    public(package) fun mint(
        treasury: &mut MGCTreasury,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<MGC> {
        coin::mint(&mut treasury.treasury_cap, amount, ctx)
    }

    /// Burn MGC tokens (only callable by friend modules)
    /// Returns the amount burned
    public(package) fun burn(
        treasury: &mut MGCTreasury,
        coin: Coin<MGC>
    ): u64 {
        coin::burn(&mut treasury.treasury_cap, coin)
    }

    // ============ Public Functions ============

    /// Get the total supply of MGC tokens
    public fun total_supply(treasury: &MGCTreasury): u64 {
        coin::total_supply(&treasury.treasury_cap)
    }

    // ============ Test-Only Functions ============

    #[test_only]
    /// Initialize for testing
    public fun init_for_testing(ctx: &mut TxContext) {
        init(MGC {}, ctx);
    }

    #[test_only]
    /// Mint for testing
    public fun mint_for_testing(
        treasury: &mut MGCTreasury,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<MGC> {
        mint(treasury, amount, ctx)
    }

    #[test_only]
    /// Burn for testing
    public fun burn_for_testing(
        treasury: &mut MGCTreasury,
        coin: Coin<MGC>
    ): u64 {
        burn(treasury, coin)
    }
}
