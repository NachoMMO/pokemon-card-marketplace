# Purchase Entity Definition
entity: Purchase
description: Represents a purchase transaction made by a buyer
table: purchases

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the purchase
    
  - name: buyerId
    type: UUID
    foreign_key: users.id
    required: true
    description: ID of the user who made the purchase
    
  - name: cardId
    type: UUID
    foreign_key: cards.id
    required: true
    description: ID of the card that was purchased
    
  - name: quantity
    type: Integer
    minimum: 1
    required: true
    description: Number of cards purchased
    
  - name: unitPrice
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    required: true
    description: Price per card at time of purchase
    
  - name: totalPrice
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    required: true
    description: Total amount paid for the purchase
    
  - name: status
    type: Enum
    values: [pending, confirmed, shipped, delivered, cancelled, refunded]
    default: pending
    description: Current status of the purchase
    
  - name: transactionId
    type: String
    max_length: 100
    unique: true
    description: External payment transaction identifier
    
  - name: purchaseDate
    type: DateTime
    auto_generate: true
    description: When the purchase was made
    
  - name: confirmedAt
    type: DateTime
    description: When the purchase was confirmed
    
  - name: shippedAt
    type: DateTime
    description: When the purchase was shipped
    
  - name: deliveredAt
    type: DateTime
    description: When the purchase was delivered
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the purchase record was created
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the purchase was last updated

relationships:
  - name: buyer
    type: belongs_to
    target: User
    foreign_key: buyer_id
    description: User who made the purchase
    
  - name: card
    type: belongs_to
    target: Card
    foreign_key: card_id
    description: Card that was purchased

indexes:
  - fields: [buyer_id]
  - fields: [card_id]
  - fields: [status]
  - fields: [purchase_date]
  - fields: [transaction_id]
    unique: true
  - fields: [buyer_id, purchase_date]
    name: buyer_purchase_history_idx

business_rules:
  - name: sufficient_stock
    description: Cannot purchase more cards than available in stock
    
  - name: sufficient_balance
    description: Buyer must have sufficient balance for the purchase
    
  - name: active_card
    description: Can only purchase cards that are actively for sale
    
  - name: total_price_calculation
    description: Total price must equal unit price × quantity
    
  - name: status_progression
    description: Purchase status must follow logical progression
    
  - name: payment_confirmation
    description: Purchase must be paid before confirmation
