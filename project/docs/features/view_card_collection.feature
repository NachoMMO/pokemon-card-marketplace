# language: en
Feature: View card collection
  As a user
  I want to view and manage my card collection
  So that I can track my owned cards and their value

  Background:
    Given I am logged in
    And I have cards in my collection

  Scenario: View my complete card collection
    When I navigate to "My Collection"
    Then I should see all cards in my collection
    And each card should display:
      | field           |
      | card_image      |
      | card_name       |
      | expansion       |
      | rarity          |
      | condition       |
      | quantity_owned  |
      | estimated_value |
      | date_acquired   |
    And I should see collection summary statistics:
      | statistic        |
      | total_cards      |
      | unique_cards     |
      | total_value      |
      | recent_additions |

  Scenario: Filter collection by expansion
    Given my collection contains cards from multiple expansions
    When I select "Base Set" from the expansion filter
    Then I should only see cards from the Base Set expansion
    And the collection count should update accordingly
    And I should see "Showing X of Y cards" message

  Scenario: Filter collection by rarity
    When I select "Ultra Rare" from the rarity filter
    Then I should only see Ultra Rare cards from my collection
    And I should see the filtered count and total value
    And I should be able to combine with other filters

  Scenario: Sort collection by different criteria
    When I change the sort option to "Value (High to Low)"
    Then my cards should be reordered by estimated value descending
    And the most valuable card should appear first
    When I change sort to "Date Acquired (Newest)"
    Then recently acquired cards should appear first

  Scenario: View collection statistics and insights
    When I click on "Collection Insights"
    Then I should see detailed analytics:
      | insight                    |
      | most_valuable_card         |
      | rarest_card_owned          |
      | completion_by_expansion    |
      | value_growth_over_time     |
      | duplicate_cards            |
      | missing_cards_from_sets    |
    And I should see visual charts and graphs
    And I should see recommendations for completing sets

  Scenario: Search within my collection
    When I enter "Charizard" in the collection search box
    Then I should see only Charizard cards I own
    And the search should work across card names and descriptions
    And I should see "X results found in your collection"

  Scenario: View individual card details in collection
    When I click on a specific card in my collection
    Then I should see detailed information:
      | field              |
      | current_market_value |
      | value_change_trend   |
      | condition_notes      |
      | acquisition_details  |
      | listing_history      |
      | similar_owned_cards  |
    And I should see options to:
      | action           |
      | List for Sale    |
      | Mark for Trade   |
      | Update Condition |
      | Add Notes        |

  Scenario: Mark cards for trading
    Given I want to trade some of my duplicate cards
    When I select multiple cards from my collection
    And I click "Mark for Trading"
    Then those cards should be marked as available for trade
    And they should appear in my public "Cards for Trade" list
    And other users should be able to see them
    And I should be able to unmark them later

  Scenario: Track card value changes
    Given I have cards that have changed in value
    When I view my collection
    Then I should see value change indicators:
      | indicator      | meaning              |
      | ↗ +$5.00      | Value increased      |
      | ↘ -$2.00      | Value decreased      |
      | → $15.00      | Value unchanged      |
    And I should see overall portfolio performance
    And I should receive notifications for significant value changes

  Scenario: Export collection data
    When I click "Export Collection"
    Then I should see export format options:
      | format |
      | CSV    |
      | PDF    |
      | Excel  |
    When I select "CSV" and click "Export"
    Then I should receive a downloadable file with all collection data
    And the file should include all card details and current values

  Scenario: View collection completion status
    When I select a specific expansion like "Base Set"
    Then I should see completion information:
      | field                  | example    |
      | cards_owned            | 85/102     |
      | completion_percentage  | 83%        |
      | missing_cards          | 17 cards   |
      | estimated_cost         | $245.50    |
    And I should see a list of missing cards with current market prices
    And I should see "Add to Wishlist" options for missing cards

  Scenario: Manage duplicate cards
    When I filter my collection to show "Duplicates Only"
    Then I should see cards I own multiple copies of
    And each should show quantity owned
    And I should see suggested actions:
      | action              |
      | List extras for sale |
      | Mark for trading     |
      | Keep as investment   |
    And I should see potential profit from selling duplicates

  Scenario: Set collection privacy
    When I go to collection privacy settings
    Then I should see options:
      | privacy_level    | description                           |
      | Public          | Anyone can view my collection         |
      | Friends Only    | Only friends can see my collection    |
      | Private         | Only I can see my collection          |
    When I change to "Friends Only"
    Then my collection should only be visible to confirmed friends
    And my trade lists should respect this privacy setting
