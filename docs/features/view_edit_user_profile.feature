# language: en
Feature: View and edit user profile
  As a registered user
  I want to view and edit my profile information
  So that I can keep my account details current and customize my presence

  Background:
    Given I am logged in
    And I have an existing user profile

  Scenario: View my profile information
    When I navigate to "My Profile"
    Then I should see my profile information:
      | field               | example_value           |
      | username            | pokemon_collector_123   |
      | email               | user@example.com        |
      | first_name          | John                    |
      | last_name           | Doe                     |
      | date_of_birth       | 1990-05-15             |
      | location            | New York, USA           |
      | member_since        | January 2024            |
      | account_balance     | $125.50                 |
      | total_purchases     | 15                      |
      | total_sales         | 8                       |
      | rating              | 4.8/5.0                 |
    And I should see an "Edit Profile" button
    And I should see my profile picture or default avatar

  Scenario: Edit basic profile information
    Given I am on my profile page
    When I click "Edit Profile"
    Then I should see an editable form with my current information
    When I update the following fields:
      | field      | new_value        |
      | first_name | Jonathan         |
      | last_name  | Smith            |
      | location   | Boston, USA      |
    And I click "Save Changes"
    Then I should see "Profile updated successfully"
    And the changes should be reflected in my profile
    And other users should see my updated information

  Scenario: Upload profile picture
    Given I am editing my profile
    When I click "Change Profile Picture"
    And I upload a valid image file (JPG, PNG, max 2MB)
    And I click "Save"
    Then my new profile picture should be displayed
    And it should appear in my listings and messages
    And the old picture should be replaced

  Scenario: Change password from profile
    Given I am on my profile page
    When I click "Change Password"
    Then I should see a password change form
    When I enter my current password "OldPass123!"
    And I enter new password "NewPass456!"
    And I confirm new password "NewPass456!"
    And I click "Update Password"
    Then I should see "Password changed successfully"
    And I should be able to log in with the new password
    And I should receive an email confirmation of the password change

  Scenario: Update privacy settings
    Given I am editing my profile
    When I go to "Privacy Settings" section
    Then I should see privacy options:
      | setting                    | current_value |
      | profile_visibility         | Public        |
      | show_collection            | Yes           |
      | show_purchase_history      | No            |
      | allow_messages_from        | Anyone        |
      | show_online_status         | Yes           |
    When I change "profile_visibility" to "Friends Only"
    And I change "allow_messages_from" to "Verified Users Only"
    And I click "Save Privacy Settings"
    Then my profile should only be visible to friends
    And only verified users should be able to message me

  Scenario: Edit trading preferences
    Given I am editing my profile
    When I go to "Trading Preferences" section
    Then I should see preference options:
      | preference              | current_value    |
      | favorite_card_types     | Fire, Electric   |
      | preferred_card_condition| Near Mint        |
      | trading_locations       | USA, Canada      |
      | minimum_trade_value     | $10              |
      | accepts_partial_trades  | Yes              |
    When I update my favorite types to include "Water"
    And I change minimum trade value to "$15"
    And I click "Save Preferences"
    Then my preferences should be updated
    And the system should use these for recommendations

  Scenario: View profile statistics
    Given I am on my profile page
    Then I should see detailed statistics:
      | statistic                  |
      | cards_owned                |
      | total_card_value           |
      | most_valuable_card         |
      | recent_activity            |
      | favorite_expansion         |
      | completion_percentage      |
      | trading_streak             |
    And I should see visual charts for trading activity
    And I should see achievement badges earned

  Scenario: Manage notification preferences
    Given I am editing my profile
    When I go to "Notification Settings"
    Then I should see notification options:
      | notification_type          | email | push | in_app |
      | new_messages               | ✓     | ✓    | ✓      |
      | cards_sold                 | ✓     | ✗    | ✓      |
      | price_drops_on_watchlist   | ✗     | ✓    | ✓      |
      | new_cards_from_sellers     | ✓     | ✗    | ✗      |
      | weekly_summary             | ✓     | ✗    | ✗      |
    When I modify these preferences
    And I click "Save Notification Settings"
    Then I should receive notifications according to my preferences

  Scenario: Deactivate account
    Given I am on my profile page
    When I click "Account Settings"
    And I click "Deactivate Account"
    Then I should see a warning about account deactivation
    And I should see what happens to my data:
      | item                 | action                    |
      | active_listings      | Will be removed           |
      | purchase_history     | Will be preserved         |
      | messages             | Will be preserved         |
      | account_balance      | Will be held for 30 days  |
    When I confirm deactivation by typing "DEACTIVATE"
    And I click "Permanently Deactivate"
    Then my account should be deactivated
    And I should be logged out
    And I should receive a confirmation email

  Scenario: View profile as another user
    Given there is another user "pokemon_master"
    When I visit their profile page
    Then I should see their public information:
      | field              |
      | username           |
      | member_since       |
      | rating             |
      | total_sales        |
      | seller_badges      |
      | recent_listings    |
    But I should not see private information like:
      | field              |
      | email              |
      | account_balance    |
      | purchase_history   |
    And I should see "Message User" and "View Listings" buttons
