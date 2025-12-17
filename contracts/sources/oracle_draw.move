module oracle_library::oracle_draw {
    use iota::coin::{Self, Coin};
    use iota::event;
    use oracle_library::mgc::{Self, MGC, MGCTreasury};

    // ============ Error Codes ============

    /// Invalid answer ID (must be 0-49)
    const E_INVALID_ANSWER_ID: u64 = 1;
    /// Insufficient MGC balance (need at least 10)
    const E_INSUFFICIENT_MGC: u64 = 2;

    // ============ Constants ============

    /// Cost to draw an oracle answer
    const DRAW_COST: u64 = 10;
    /// Maximum valid answer ID
    const MAX_ANSWER_ID: u8 = 49;

    // ============ Structs ============

    /// A record of a draw that can be used to mint an NFT
    /// This object is destroyed when the NFT is minted
    public struct DrawRecord has key, store {
        id: UID,
        owner: address,
        answer_id: u8,
        question_hash: vector<u8>,
        timestamp: u64,
    }

    /// Event emitted when a user draws an oracle answer
    public struct DrawEvent has copy, drop {
        user: address,
        draw_record_id: address,
        answer_id: u8,
        timestamp: u64,
    }

    // ============ Entry Functions ============

    /// Draw an oracle answer by paying 10 MGC
    ///
    /// # Arguments
    /// * `answer_id` - The answer ID (0-49), determined by frontend randomness
    /// * `question_hash` - Optional hash of the user's question for privacy
    /// * `payment` - MGC coin to pay (must be >= 10)
    /// * `mgc_treasury` - The MGC treasury for burning tokens
    /// * `ctx` - Transaction context
    ///
    /// # Errors
    /// * `E_INVALID_ANSWER_ID` - If answer_id > 49
    /// * `E_INSUFFICIENT_MGC` - If payment < 10 MGC
    public entry fun draw(
        answer_id: u8,
        question_hash: vector<u8>,
        mut payment: Coin<MGC>,
        mgc_treasury: &mut MGCTreasury,
        ctx: &mut TxContext
    ) {
        // Validate answer_id
        assert!(answer_id <= MAX_ANSWER_ID, E_INVALID_ANSWER_ID);

        // Validate payment
        let payment_value = coin::value(&payment);
        assert!(payment_value >= DRAW_COST, E_INSUFFICIENT_MGC);

        // Extract exact payment and return excess
        let to_burn = coin::split(&mut payment, DRAW_COST, ctx);
        let sender = ctx.sender();

        // Return excess payment if any
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, sender);
        } else {
            coin::destroy_zero(payment);
        };

        // Burn the draw cost
        mgc::burn(mgc_treasury, to_burn);

        // Create draw record
        let timestamp = ctx.epoch_timestamp_ms();
        let record = DrawRecord {
            id: object::new(ctx),
            owner: sender,
            answer_id,
            question_hash,
            timestamp,
        };

        // Emit event
        let record_id = object::uid_to_address(&record.id);
        event::emit(DrawEvent {
            user: sender,
            draw_record_id: record_id,
            answer_id,
            timestamp,
        });

        // Transfer record to user
        transfer::transfer(record, sender);
    }

    // ============ Package Functions ============

    /// Destroy a DrawRecord and return its data for NFT minting
    /// Only callable by oracle_nft module
    ///
    /// # Arguments
    /// * `record` - The DrawRecord to destroy
    ///
    /// # Returns
    /// * `(answer_id, timestamp)` - The data needed for NFT creation
    public(package) fun destroy_for_mint(record: DrawRecord): (u8, u64) {
        let DrawRecord {
            id,
            owner: _,
            answer_id,
            question_hash: _,
            timestamp,
        } = record;

        object::delete(id);
        (answer_id, timestamp)
    }

    // ============ View Functions ============

    /// Get the owner address of a DrawRecord
    public fun get_owner(record: &DrawRecord): address {
        record.owner
    }

    /// Get the answer ID of a DrawRecord
    public fun get_answer_id(record: &DrawRecord): u8 {
        record.answer_id
    }

    /// Get the question hash of a DrawRecord
    public fun get_question_hash(record: &DrawRecord): vector<u8> {
        record.question_hash
    }

    /// Get the timestamp of a DrawRecord
    public fun get_timestamp(record: &DrawRecord): u64 {
        record.timestamp
    }

    /// Get the draw cost constant
    public fun draw_cost(): u64 {
        DRAW_COST
    }

    /// Get the max answer ID constant
    public fun max_answer_id(): u8 {
        MAX_ANSWER_ID
    }

    // ============ Test Functions ============

    #[test_only]
    /// Create a DrawRecord for testing (bypasses payment)
    public fun create_for_testing(
        answer_id: u8,
        question_hash: vector<u8>,
        ctx: &mut TxContext
    ): DrawRecord {
        let sender = ctx.sender();
        let timestamp = ctx.epoch_timestamp_ms();

        DrawRecord {
            id: object::new(ctx),
            owner: sender,
            answer_id,
            question_hash,
            timestamp,
        }
    }

    #[test_only]
    /// Destroy a DrawRecord for testing
    public fun destroy_for_testing(record: DrawRecord) {
        let DrawRecord {
            id,
            owner: _,
            answer_id: _,
            question_hash: _,
            timestamp: _,
        } = record;
        object::delete(id);
    }
}
