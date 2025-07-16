# Sale Entity Definition
entity: Sale
description: Represents a sale transaction made by a seller
table: sales

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the sale
    
  - name: sellerId
    type: UUID
    foreign_key: users.id
    required: true
    description: ID of the user who made the sale
    
  - name: cardId
    type: UUID
    foreign_key: cards.id
    required: true
    description: ID of the card that was sold
    
  - name: buyerId
    type: UUID
    foreign_key: users.id
    required: true
    description: ID of the user who bought the card
    
  - name: quantity
    type: Integer
    minimum: 1
    required: true
    description: Number of cards sold
    
  - name: unitPrice
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    required: true
    description: Price per card at time of sale
    
  - name: totalPrice
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    required: true
    description: Total amount received from the sale
    
  - name: commission
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    default: 0.00
    description: Platform commission taken from the sale
    
  - name: netAmount
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    required: true
    description: Amount received by seller after commission
    
  - name: status
    type: Enum
    values: [pending, confirmed, shipped, delivered, completed, cancelled]
    default: pending
    description: Current status of the sale
    
  - name: purchaseId
    type: UUID
    foreign_key: purchases.id
    description: Related purchase record ID
    
  - name: saleDate
    type: DateTime
    auto_generate: true
    description: When the sale was made
    
  - name: confirmedAt
    type: DateTime
    description: When the sale was confirmed
    
  - name: shippedAt
    type: DateTime
    description: When the sale was shipped
    
  - name: completedAt
    type: DateTime
    description: When the sale was completed
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the sale record was created
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the sale was last updated

relationships:
  - name: seller
    type: belongs_to
    target: User
    foreign_key: seller_id
    description: User who made the sale
    
  - name: buyer
    type: belongs_to
    target: User
    foreign_key: buyer_id
    description: User who bought the card
    
  - name: card
    type: belongs_to
    target: Card
    foreign_key: card_id
    description: Card that was sold
    
  - name: purchase
    type: belongs_to
    target: Purchase
    foreign_key: purchase_id
    description: Related purchase transaction

indexes:
  - fields: [seller_id]
  - fields: [buyer_id]
  - fields: [card_id]
  - fields: [status]
  - fields: [sale_date]
  - fields: [purchase_id]
  - fields: [seller_id, sale_date]
    name: seller_sales_history_idx

business_rules:
  - name: seller_owns_card
    description: Seller must own the card being sold
    
  - name: total_price_calculation
    description: Total price must equal unit price × quantity
    
  - name: commission_calculation
    description: Net amount must equal total price minus commission
    
  - name: status_progression
    description: Sale status must follow logical progression
    
  - name: linked_purchase
    description: Each sale should be linked to a corresponding purchase
    
  - name: stock_reduction
    description: Card stock must be reduced when sale is confirmed
