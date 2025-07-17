# Collection Entry Concept Documentation

## 📝 Understanding CollectionEntry vs Collection

### ❌ **Common Misconception**
"Collection" might suggest a container that holds multiple cards.

### ✅ **Actual Design: CollectionEntry**
Each `CollectionEntry` represents **ONE specific card entry** in a user's collection.

## 🎯 **Key Concept**

```typescript
// ❌ NOT this (one collection with many cards)
Collection {
  userId: "user1"
  cards: [
    { cardId: "charizard", quantity: 3 },
    { cardId: "pikachu", quantity: 5 }
  ]
}

// ✅ BUT this (multiple entries, one per card type/condition)
CollectionEntry {
  userId: "user1"
  cardId: "charizard"  
  condition: "Near_Mint"
  quantity: 2
}

CollectionEntry {
  userId: "user1"
  cardId: "charizard"
  condition: "Played"  
  quantity: 1
}

CollectionEntry {
  userId: "user1"
  cardId: "pikachu"
  condition: "Mint"
  quantity: 5
}
```

## 🔍 **Real-World Example**

**User's Physical Collection:**
- 2 Near Mint Charizard cards (bought for $500 each)
- 1 Played condition Charizard card (bought for $300)
- 5 Mint condition Pikachu cards (bought for $10 each)

**Database Representation (3 CollectionEntry records):**

| id | userId | cardId    | condition  | quantity | acquiredPrice | currentValue |
|----|---------|-----------|------------|----------|---------------|--------------|
| 1  | user1   | charizard | Near_Mint  | 2        | 500.00        | 599.99       |
| 2  | user1   | charizard | Played     | 1        | 300.00        | 350.00       |
| 3  | user1   | pikachu   | Mint       | 5        | 10.00         | 15.99        |

## 🎨 **Benefits of This Design**

### 1. **Granular Condition Tracking**
```sql
-- Find all Near Mint cards in user's collection
SELECT * FROM collections 
WHERE user_id = 'user1' AND condition = 'Near_Mint';

-- Calculate total value by condition
SELECT condition, SUM(quantity * current_value) as total_value
FROM collections 
WHERE user_id = 'user1'
GROUP BY condition;
```

### 2. **Individual Card History**
```sql
-- Track acquisition details for each card batch
SELECT card_id, condition, acquired_date, acquired_price
FROM collections 
WHERE user_id = 'user1'
ORDER BY acquired_date;
```

### 3. **Flexible Trading**
```sql
-- User wants to sell only their Played condition Charizard
UPDATE collections 
SET is_for_trade = true 
WHERE user_id = 'user1' 
  AND card_id = 'charizard' 
  AND condition = 'Played';
```

### 4. **Detailed Analytics**
```sql
-- Calculate profit/loss per card entry
SELECT 
  card_id,
  condition,
  quantity,
  acquired_price,
  current_value,
  (current_value - acquired_price) * quantity as profit_loss
FROM collections 
WHERE user_id = 'user1';
```

## 🏗️ **Architecture Impact**

### Domain Layer
```typescript
class CollectionEntry {
  // Represents ONE card entry, not entire collection
  constructor(
    public cardId: string,
    public condition: CardCondition,
    public quantity: number,
    // ... other properties
  ) {}
  
  // Business logic for individual entries
  calculateCurrentValue(): number { ... }
  isTradeEligible(): boolean { ... }
}

// User's complete collection is an array of entries
type UserCollection = CollectionEntry[]
```

### Repository Layer
```typescript
interface CollectionEntryRepository {
  findByUserId(userId: string): Promise<CollectionEntry[]>
  findByUserAndCard(userId: string, cardId: string): Promise<CollectionEntry[]>
  save(entry: CollectionEntry): Promise<void>
  delete(entryId: string): Promise<void>
}
```

### Use Cases
```typescript
class ViewUserCollectionUseCase {
  async execute(userId: string): Promise<UserCollection> {
    // Returns array of collection entries
    return await this.repository.findByUserId(userId)
  }
}

class AddCardToCollectionUseCase {
  async execute(userId: string, cardId: string, details: CardDetails): Promise<void> {
    // Creates a new collection entry
    const entry = new CollectionEntry(userId, cardId, details.condition, details.quantity)
    await this.repository.save(entry)
  }
}
```

## 🎯 **Summary**

- **CollectionEntry** = One row = One specific card in specific condition
- **User's Collection** = Multiple CollectionEntry records
- **Benefits**: Granular tracking, flexible trading, detailed analytics
- **Database**: `collections` table stores individual entries, not aggregated collections

This design provides maximum flexibility for card condition tracking, individual purchase history, and granular trading capabilities while maintaining data integrity and query performance.
