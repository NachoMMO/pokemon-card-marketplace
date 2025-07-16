# Collection Entity Definition
entity: Collection
description: Represents a user's card collection (many-to-many relationship table)
table: collections

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the collection entry
    
  - name: userId
    type: UUID
    foreign_key: users.id
    required: true
    description: ID of the user who owns the collection
    
  - name: cardId
    type: UUID
    foreign_key: cards.id
    required: true
    description: ID of the card in the collection
    
  - name: quantity
    type: Integer
    minimum: 1
    default: 1
    required: true
    description: Number of this card in the collection
    
  - name: condition
    type: Enum
    values: [Mint, Near_Mint, Excellent, Good, Light_Played, Played, Poor]
    default: Near_Mint
    description: Condition of the card in collection
    
  - name: acquiredDate
    type: Date
    description: When the card was acquired
    
  - name: acquiredPrice
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    description: Price paid when card was acquired
    
  - name: currentValue
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    description: Current estimated value of the card
    
  - name: isForTrade
    type: Boolean
    default: false
    description: Whether the card is available for trading
    
  - name: notes
    type: Text
    max_length: 500
    description: Personal notes about the card
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the card was added to collection
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the collection entry was last updated

relationships:
  - name: user
    type: belongs_to
    target: User
    foreign_key: user_id
    description: User who owns this collection entry
    
  - name: card
    type: belongs_to
    target: Card
    foreign_key: card_id
    description: Card in the collection

indexes:
  - fields: [user_id]
  - fields: [card_id]
  - fields: [user_id, card_id]
    unique: true
    name: user_card_collection_idx
  - fields: [is_for_trade]
  - fields: [acquired_date]

business_rules:
  - name: unique_user_card
    description: Each user can have only one collection entry per card
    
  - name: positive_quantity
    description: Quantity must be at least 1
    
  - name: valid_condition
    description: Card condition must be from predefined list
    
  - name: value_tracking
    description: Current value should be updated periodically
    
  - name: trade_availability
    description: Cards marked for trade should be visible to other users
