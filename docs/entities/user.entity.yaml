# User Entity Definition
entity: User
description: Represents a user in the Pokemon card trading system
table: users

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the user
    
  - name: firstName
    type: String
    max_length: 50
    min_length: 2
    required: true
    validation:
      - not_empty
      - alpha_spaces_only
    description: User's first name
    
  - name: lastName
    type: String
    max_length: 50
    min_length: 2
    required: true
    validation:
      - not_empty
      - alpha_spaces_only
    description: User's last name
    
  - name: email
    type: String
    format: email
    unique: true
    required: true
    validation:
      - email_format
    description: User's email address
    
  - name: password
    type: String
    min_length: 8
    required: true
    encrypted: true
    validation:
      - strong_password
    description: User's encrypted password
    
  - name: dateOfBirth
    type: Date
    validation:
      - minimum_age: 13
    description: User's date of birth
    
  - name: address
    type: String
    max_length: 200
    description: User's street address
    
  - name: city
    type: String
    max_length: 100
    description: User's city
    
  - name: postalCode
    type: String
    max_length: 20
    validation:
      - postal_code_format
    description: User's postal code
    
  - name: country
    type: String
    max_length: 100
    validation:
      - country_name
    description: User's country
    
  - name: balance
    type: Decimal
    precision: 10
    scale: 2
    default: 0.00
    minimum: 0
    description: User's account balance
    
  - name: role
    type: Enum
    values: [buyer, seller, admin]
    default: buyer
    description: User's role in the system
    
  - name: isActive
    type: Boolean
    default: true
    description: Whether the user account is active
    
  - name: emailVerified
    type: Boolean
    default: false
    description: Whether the user's email is verified
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the user was created
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the user was last updated

relationships:
  - name: ownedCards
    type: one_to_many
    target: Card
    foreign_key: seller_id
    description: Cards that the user is selling
    
  - name: collection
    type: many_to_many
    target: Card
    through: user_collections
    description: User's card collection
    
  - name: cartItems
    type: one_to_many
    target: CartItem
    foreign_key: user_id
    description: Items in user's shopping cart
    
  - name: purchases
    type: one_to_many
    target: Purchase
    foreign_key: buyer_id
    description: User's purchase history
    
  - name: sales
    type: one_to_many
    target: Sale
    foreign_key: seller_id
    description: User's sales history
    
  - name: sentMessages
    type: one_to_many
    target: Message
    foreign_key: sender_id
    description: Messages sent by user
    
  - name: receivedMessages
    type: one_to_many
    target: Message
    foreign_key: recipient_id
    description: Messages received by user

indexes:
  - fields: [email]
    unique: true
  - fields: [role]
  - fields: [createdAt]
  - fields: [isActive]
  - fields: [balance]

business_rules:
  - name: unique_email
    description: Email must be unique across all users
    
  - name: minimum_age
    description: User must be at least 13 years old
    
  - name: positive_balance
    description: User balance cannot be negative
    
  - name: role_permissions
    description: Role determines what actions user can perform
    
  - name: verified_email_for_selling
    description: Users must verify email before selling cards
