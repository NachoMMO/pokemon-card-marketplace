# language: en
Feature: Manage private messages
  As a user
  I want to manage my private messages
  So that I can organize my communications and keep track of important conversations

  Background:
    Given I am logged in
    And I have received and sent various messages

  Scenario: View inbox with message list
    When I navigate to "Messages"
    Then I should see my inbox with message list showing:
      | field        |
      | sender_name  |
      | subject      |
      | preview_text |
      | timestamp    |
      | read_status  |
      | attachment_indicator |
    And unread messages should be highlighted
    And I should see message count "Inbox (5 unread)"

  Scenario: Read a message and mark as read
    Given I have an unread message from "card_trader"
    When I click on the message
    Then the message should open in full view
    And it should be automatically marked as read
    And I should see the complete message content
    And the sender's profile information
    And options to "Reply", "Delete", or "Mark as Important"

  Scenario: Mark multiple messages as read
    Given I have several unread messages
    When I select multiple messages using checkboxes
    And I click "Mark as Read"
    Then all selected messages should be marked as read
    And the unread count should update accordingly
    And I should see "5 messages marked as read"

  Scenario: Delete messages
    Given I have messages I want to remove
    When I select one or more messages
    And I click "Delete"
    Then I should see "Are you sure you want to delete X messages?"
    When I confirm the deletion
    Then the messages should be moved to "Deleted Items"
    And they should be removed from my inbox
    And I should see "Messages deleted successfully"

  Scenario: Search messages
    When I enter "Charizard" in the message search box
    Then I should see only messages containing "Charizard"
    And the search should work across:
      | field           |
      | subject         |
      | message_content |
      | sender_name     |
    And I should see "X results found for 'Charizard'"
    And search terms should be highlighted in results

  Scenario: Filter messages by criteria
    When I apply the filter "Unread Only"
    Then I should only see unread messages
    When I apply the filter "From: Sellers"
    Then I should only see messages from users with seller role
    When I apply date filter "Last 7 days"
    Then I should only see messages from the past week
    And I should be able to combine multiple filters

  Scenario: Organize messages with labels
    When I select a message and click "Add Label"
    Then I should see label options:
      | label        |
      | Important    |
      | Trade Offers |
      | Transactions |
      | Questions    |
      | Custom Label |
    When I select "Trade Offers"
    Then the message should be tagged with that label
    And I should be able to filter by label later

  Scenario: View message conversation thread
    Given I have exchanged multiple messages with "pokemon_collector"
    When I open any message in the conversation
    Then I should see the full conversation thread
    And messages should be ordered chronologically
    And I should see which messages I sent vs received
    And I should be able to reply within the thread view

  Scenario: Archive old messages
    Given I have messages older than 6 months
    When I select them and click "Archive"
    Then they should be moved to "Archived Messages"
    And they should be removed from my main inbox
    But I should still be able to search and access them
    And I should see "X messages archived"

  Scenario: Block user from messages
    Given I receive unwanted messages from "spam_user"
    When I open their message and click "Block User"
    Then I should see "Block user from sending you messages?"
    When I confirm the blocking
    Then "spam_user" should not be able to send me messages
    And their existing messages should be hidden
    And I should see "User blocked successfully"

  Scenario: Report inappropriate message
    Given I receive a message with inappropriate content
    When I click "Report Message"
    Then I should see report options:
      | reason           |
      | Spam            |
      | Harassment      |
      | Inappropriate Content |
      | Scam Attempt    |
      | Other           |
    When I select a reason and add details
    And I click "Submit Report"
    Then the message should be reported to moderators
    And I should see "Message reported. Thank you for helping keep our community safe."

  Scenario: Export message history
    When I go to message settings and click "Export Messages"
    Then I should see export options:
      | option                  |
      | All messages           |
      | Messages from date range |
      | Messages with specific user |
      | Specific conversation   |
    When I select "All messages" and click "Export"
    Then I should receive a downloadable file with my message history
    And personal information should be properly formatted

  Scenario: Message notifications and preferences
    When I go to "Message Notification Settings"
    Then I should see options:
      | notification_type    | email | push | in_app |
      | New message received | ✓     | ✓    | ✓      |
      | Message read receipt | ✗     | ✓    | ✓      |
      | Reply to my message  | ✓     | ✓    | ✓      |
    When I modify these settings
    Then I should receive notifications according to my preferences

  Scenario: Manage deleted messages
    Given I have deleted some messages
    When I go to "Deleted Items"
    Then I should see all my deleted messages
    And I should be able to "Restore" messages back to inbox
    And I should be able to "Permanently Delete" messages
    And I should see "Messages will be permanently deleted after 30 days"

  Scenario: Quick actions from message list
    Given I am viewing my message list
    When I hover over a message
    Then I should see quick action buttons:
      | action     |
      | Mark Read  |
      | Delete     |
      | Reply      |
      | Archive    |
    And I should be able to perform actions without opening the message
    And bulk actions should be available via checkboxes
