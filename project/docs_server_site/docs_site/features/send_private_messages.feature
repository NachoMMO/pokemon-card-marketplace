# language: en
Feature: Send private messages
  As a user
  I want to send private messages to other users
  So that I can communicate about trades, purchases, and general discussion

  Background:
    Given I am logged in
    And there are other users in the system

  Scenario: Send message to another user from their profile
    Given I am viewing another user's profile "pokemon_master"
    When I click "Send Message"
    Then I should see a message composition form
    When I enter the following message details:
      | field   | value                              |
      | subject | Interested in your Charizard      |
      | message | Hi! I saw your Charizard listing and I'm very interested. Is it still available? |
    And I click "Send Message"
    Then I should see "Message sent successfully"
    And the message should appear in my "Sent Messages"
    And "pokemon_master" should receive the message in their inbox

  Scenario: Send message about a specific card listing
    Given I am viewing a card listing by "card_seller"
    When I click "Message Seller"
    Then the message form should pre-populate with:
      | field   | value                                    |
      | subject | Question about [Card Name]               |
      | context | Card listing link and basic details     |
    When I add my message "Is this card still in mint condition?"
    And I click "Send Message"
    Then the message should be sent with card context
    And the seller should see which card the message is about

  Scenario: Send message with attachment
    When I am composing a message
    And I click "Attach Image"
    And I upload an image file (max 5MB)
    Then the image should be attached to the message
    And I should see a preview thumbnail
    When I send the message
    Then the recipient should receive the message with the attachment
    And they should be able to view the full-size image

  Scenario: Reply to received message
    Given I have received a message from "trader_joe"
    When I view the message in my inbox
    And I click "Reply"
    Then the reply form should pre-populate with:
      | field   | value                                |
      | to      | trader_joe                          |
      | subject | Re: [Original Subject]              |
    When I enter my reply message
    And I click "Send Reply"
    Then the reply should be sent
    And it should be threaded with the original conversation

  Scenario: Send message to multiple recipients
    When I click "New Message"
    And I enter multiple usernames "user1, user2, user3" in the "To" field
    And I enter a subject and message
    And I click "Send Message"
    Then each recipient should receive the message individually
    And I should see confirmation "Message sent to 3 recipients"
    And separate conversation threads should be created

  Scenario: Message validation and limits
    When I try to send a message with empty content
    Then I should see "Message content is required"
    And the message should not be sent
    When I try to send a message with 3000 characters
    Then I should see "Message too long (max 2000 characters)"
    When I try to send more than 10 messages per hour
    Then I should see "Rate limit exceeded. Please wait before sending more messages"

  Scenario: Send message with inappropriate content
    When I try to send a message with offensive language
    Then the system should detect inappropriate content
    And I should see "Message contains inappropriate content"
    And I should be able to edit and resend
    And repeated violations should result in messaging restrictions

  Scenario: Send message to user who blocked me
    Given user "blocked_user" has blocked me
    When I try to send a message to "blocked_user"
    Then I should see "Unable to send message to this user"
    And the message should not be delivered
    And I should not see their profile or listings

  Scenario: Send urgent message about transaction
    Given I have an active transaction with "seller_bob"
    When I send a message about the transaction
    And I mark it as "Transaction Related"
    Then the message should be prioritized
    And "seller_bob" should receive immediate notification
    And it should appear at the top of their inbox

  Scenario: Schedule message for later
    When I am composing a message
    And I click "Schedule Send"
    And I select a future date and time
    And I click "Schedule Message"
    Then the message should be saved as scheduled
    And it should be sent at the specified time
    And I should see it in "Scheduled Messages"

  Scenario: Message draft functionality
    When I start composing a message
    And I partially fill the form
    And I navigate away without sending
    Then the message should be auto-saved as a draft
    When I return to compose messages
    Then I should see "Continue Draft" option
    And my draft content should be restored

  Scenario: Send message with trade proposal
    When I send a message about trading cards
    And I click "Attach Trade Proposal"
    Then I should be able to select cards from my collection
    And specify cards I want in return
    When I send the message with trade proposal
    Then the recipient should see a structured trade offer
    And they should be able to accept, decline, or counter-propose

  Scenario: Message delivery confirmation
    When I send a message
    Then I should see delivery status indicators:
      | status    | meaning                    |
      | Sent      | Message delivered          |
      | Read      | Recipient opened message   |
      | Replied   | Recipient has responded    |
    And I should receive notifications when status changes
