# UserProfile Entity Definition
entity: UserProfile
description: Extended profile information for users
table: user_profiles

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the profile
    
  - name: userId
    type: UUID
    foreign_key: users.id
    unique: true
    required: true
    description: ID of the user this profile belongs to
    
  - name: avatarUrl
    type: String
    max_length: 500
    format: url
    description: URL to user's avatar image
    
  - name: bio
    type: Text
    max_length: 1000
    description: User's biography or description
    
  - name: location
    type: String
    max_length: 100
    description: User's general location
    
  - name: favoriteCardType
    type: Enum
    values: [Fire, Water, Grass, Electric, Psychic, Fighting, Darkness, Steel, Fairy, Dragon, Colorless]
    description: User's favorite Pokemon card type
    
  - name: tradingPreferences
    type: JSON
    description: User's trading preferences and settings
    
  - name: isPublic
    type: Boolean
    default: true
    description: Whether the profile is publicly visible
    
  - name: allowMessages
    type: Boolean
    default: true
    description: Whether user accepts private messages
    
  - name: showCollection
    type: Boolean
    default: true
    description: Whether to show collection to other users
    
  - name: showTradeList
    type: Boolean
    default: true
    description: Whether to show cards available for trade
    
  - name: totalTrades
    type: Integer
    default: 0
    minimum: 0
    description: Total number of completed trades
    
  - name: rating
    type: Decimal
    precision: 3
    scale: 2
    minimum: 0
    maximum: 5
    description: User's average rating from other users
    
  - name: ratingCount
    type: Integer
    default: 0
    minimum: 0
    description: Number of ratings received
    
  - name: joinedDate
    type: Date
    auto_generate: true
    description: When the user joined the platform
    
  - name: lastActiveAt
    type: DateTime
    description: When the user was last active
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the profile was created
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the profile was last updated

relationships:
  - name: user
    type: belongs_to
    target: User
    foreign_key: user_id
    description: User this profile belongs to

indexes:
  - fields: [user_id]
    unique: true
  - fields: [is_public]
  - fields: [rating]
  - fields: [total_trades]
  - fields: [last_active_at]

business_rules:
  - name: one_profile_per_user
    description: Each user can have only one profile
    
  - name: public_visibility
    description: Non-public profiles are only visible to the owner
    
  - name: rating_validation
    description: Rating must be between 0 and 5 with 2 decimal places
    
  - name: bio_content_filter
    description: Bio content must be appropriate and filtered
    
  - name: avatar_size_limit
    description: Avatar images must be under 2MB
    
  - name: location_privacy
    description: Location should be general, not specific address
