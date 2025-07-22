# Message Entity Definition
entity: Message
description: Represents private messages between users
table: messages

fields:
  - name: id
    type: UUID
    primary_key: true
    required: true
    description: Unique identifier for the message
    
  - name: senderId
    type: UUID
    foreign_key: users.id
    required: true
    description: ID of the user who sent the message
    
  - name: recipientId
    type: UUID
    foreign_key: users.id
    required: true
    description: ID of the user who receives the message
    
  - name: subject
    type: String
    max_length: 200
    description: Message subject line
    
  - name: content
    type: Text
    max_length: 2000
    required: true
    validation:
      - not_empty
      - min_length: 1
    description: Message content body
    
  - name: isRead
    type: Boolean
    default: false
    description: Whether the message has been read by recipient
    
  - name: readAt
    type: DateTime
    description: When the message was read
    
  - name: createdAt
    type: DateTime
    auto_generate: true
    description: When the message was sent
    
  - name: updatedAt
    type: DateTime
    auto_update: true
    description: When the message was last modified

relationships:
  - name: sender
    type: belongs_to
    target: User
    foreign_key: sender_id
    description: User who sent the message
    
  - name: recipient
    type: belongs_to
    target: User
    foreign_key: recipient_id
    description: User who receives the message

indexes:
  - fields: [sender_id]
  - fields: [recipient_id]
  - fields: [is_read]
  - fields: [created_at]
  - fields: [recipient_id, is_read]
    name: recipient_read_status_idx

business_rules:
  - name: different_users
    description: Sender and recipient must be different users
    
  - name: active_users_only
    description: Both sender and recipient must be active users
    
  - name: read_timestamp
    description: When isRead is true, readAt must be set automatically
    
  - name: content_sanitization
    description: Message content must be sanitized for security
    
  - name: message_retention
    description: Messages older than 2 years may be archived
