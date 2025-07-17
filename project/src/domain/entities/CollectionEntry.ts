/**
 * CollectionEntry represents a single card entry in a user's collection.
 *
 * Each entry represents:
 * - One specific card type (cardId)
 * - In a specific condition
 * - With a specific quantity
 * - Owned by a specific user
 *
 * A user's complete collection is made up of multiple CollectionEntry records.
 *
 * Example: User has 3 Charizard cards in different conditions:
 * - CollectionEntry 1: cardId=Charizard, condition=Mint, quantity=1
 * - CollectionEntry 2: cardId=Charizard, condition=Near_Mint, quantity=2
 */
export class CollectionEntry {
  constructor(
    public readonly id: string,
    public userId: string,
    public cardId: string,
    public quantity: number,
    public condition: string,
    public acquiredDate: Date,
    public acquiredPrice: number,
    public currentValue: number,
    public isForTrade: boolean,
    public notes: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
