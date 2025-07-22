# CartItem Entity Definition
entity: CartItem
description: Represents items in a user's shopping cart
table: cart_items

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the cart item
    
  - name: userId
    type: UUID
    foreign_key: users.id
    required: true
    description: ID of the user who owns the cart
    
  - name: cardId
    type: UUID
    foreign_key: cards.id
    required: true
    description: ID of the card in the cart
    
  - name: quantity
    type: Integer
    minimum: 1
    maximum: 100
    required: true
    description: Number of cards to purchase
    
  - name: priceAtTime
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    required: true
    description: Card price when added to cart
    
  - name: isActive
    type: Boolean
    default: true
    description: Whether the cart item is still active
    
  - name: reservedUntil
    type: DateTime
    description: Until when the item is reserved in cart
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the item was added to cart
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the cart item was last updated

relationships:
  - name: user
    type: belongs_to
    target: User
    foreign_key: user_id
    description: User who owns this cart item
    
  - name: card
    type: belongs_to
    target: Card
    foreign_key: card_id
    description: Card in the cart

indexes:
  - fields: [user_id]
  - fields: [card_id]
  - fields: [user_id, card_id]
    unique: true
    name: user_card_cart_idx
  - fields: [is_active]
  - fields: [reserved_until]
  - fields: [created_at]

business_rules:
  - name: unique_user_card_cart
    description: Each user can have only one cart item per card
    
  - name: available_stock
    description: Cannot add more items than available in stock
    
  - name: price_freeze
    description: Price is frozen when item is added to cart
    
  - name: cart_expiration
    description: Cart items expire after 24 hours if not purchased
    
  - name: reservation_logic
    description: Items in cart are temporarily reserved
    
  - name: maximum_cart_size
    description: User cannot have more than 50 different cards in cart
