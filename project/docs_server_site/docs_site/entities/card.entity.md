# Card Entity Definition
entity: Card
description: Represents a Pokemon card available for trading
table: cards

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the card
    
  - name: name
    type: String
    max_length: 100
    min_length: 1
    required: true
    validation:
      - not_empty
    description: Pokemon card name
    
  - name: type
    type: Enum
    values: [Fire, Water, Grass, Electric, Psychic, Fighting, Darkness, Steel, Fairy, Dragon, Colorless, Trainer, Energy]
    required: true
    description: Pokemon card type
    
  - name: rarity
    type: Enum
    values: [Common, Uncommon, Rare, Rare_Holo, Ultra_Rare, Secret_Rare, Promo]
    required: true
    description: Card rarity level
    
  - name: expansion
    type: String
    max_length: 100
    required: true
    description: Card expansion set name
    
  - name: price
    type: Decimal
    precision: 10
    scale: 2
    minimum: 0
    required: true
    description: Card price in system currency
    
  - name: stock
    type: Integer
    minimum: 0
    default: 0
    description: Available quantity in stock
    
  - name: imageUrl
    type: String
    max_length: 500
    format: url
    description: URL to card image
    
  - name: description
    type: Text
    max_length: 1000
    description: Card description and details
    
  - name: sellerId
    type: UUID
    foreign_key: users.id
    description: ID of the user selling this card
    
  - name: condition
    type: Enum
    values: [Mint, Near_Mint, Excellent, Good, Light_Played, Played, Poor]
    default: Near_Mint
    description: Physical condition of the card
    
  - name: cardNumber
    type: String
    max_length: 20
    description: Card number within the expansion
    
  - name: artist
    type: String
    max_length: 100
    description: Card artist name
    
  - name: isForSale
    type: Boolean
    default: true
    description: Whether the card is currently for sale
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the card was added to the system
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the card was last updated

relationships:
  - name: seller
    type: belongs_to
    target: User
    foreign_key: seller_id
    description: User who owns/sells this card
    
  - name: cartItems
    type: one_to_many
    target: CartItem
    foreign_key: card_id
    description: Cart items containing this card
    
  - name: purchases
    type: one_to_many
    target: Purchase
    foreign_key: card_id
    description: Purchase records for this card
    
  - name: sales
    type: one_to_many
    target: Sale
    foreign_key: card_id
    description: Sale records for this card
    
  - name: collections
    type: many_to_many
    target: User
    through: user_collections
    description: Users who have this card in their collection

indexes:
  - fields: [name]
  - fields: [type]
  - fields: [rarity]
  - fields: [expansion]
  - fields: [price]
  - fields: [seller_id]
  - fields: [is_for_sale]
  - fields: [created_at]
  - fields: [name, expansion]
    name: card_name_expansion_idx

business_rules:
  - name: positive_price
    description: Card price must be greater than 0
    
  - name: valid_seller
    description: Seller must be an active user with seller role
    
  - name: stock_availability
    description: Cannot sell more cards than available in stock
    
  - name: condition_pricing
    description: Card condition may affect pricing guidelines
    
  - name: unique_card_per_seller
    description: Each seller can only have one listing per card variant
