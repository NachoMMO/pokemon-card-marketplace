# language: en
Feature: View card catalog
  As a user
  I want to browse the available Pokemon cards
  So that I can discover and purchase cards I'm interested in

  Background:
    Given I am logged into the system
    And there are cards available in the catalog

  Scenario: View card catalog with default sorting
    When I navigate to the card catalog page
    Then I should see a list of available cards
    And the cards should be sorted by "newest first" by default
    And each card should display:
      | field       |
      | name        |
      | image       |
      | price       |
      | rarity      |
      | condition   |
      | seller_name |
    And I should see pagination controls
    And I should see 20 cards per page by default

  Scenario: View card catalog with different sorting options
    Given I am on the card catalog page
    When I change the sorting to "price (low to high)"
    Then the cards should be reordered by price ascending
    And the cheapest cards should appear first

  Scenario: View card catalog with empty results
    Given there are no cards available in the catalog
    When I navigate to the card catalog page
    Then I should see the message "No cards available at the moment"
    And I should see a suggestion to "check back later"
    And I should not see pagination controls

  Scenario: View card catalog with pagination
    Given there are 50 cards available in the catalog
    When I navigate to the card catalog page
    Then I should see 20 cards on the first page
    And I should see pagination showing "Page 1 of 3"
    When I click "Next page"
    Then I should see the next 20 cards
    And I should see pagination showing "Page 2 of 3"

  Scenario: Filter cards by price range
    Given I am on the card catalog page
    When I set the price filter to:
      | min_price | 10  |
      | max_price | 50  |
    And I click "Apply filters"
    Then I should only see cards priced between $10 and $50
    And the filter should be reflected in the URL
    And I should see the active filter indicator

  Scenario: Filter cards by rarity
    Given I am on the card catalog page
    When I select the rarity filter "Ultra Rare"
    And I click "Apply filters"
    Then I should only see cards with "Ultra Rare" rarity
    And the card count should update accordingly
    And I should see "Ultra Rare" in the active filters

  Scenario: Filter cards by type
    Given I am on the card catalog page
    When I select the type filter "Fire"
    And I click "Apply filters"
    Then I should only see Fire-type Pokemon cards
    And each displayed card should have the Fire type indicator

  Scenario: Clear all filters
    Given I have applied multiple filters to the catalog
    And I am seeing filtered results
    When I click "Clear all filters"
    Then all filters should be removed
    And I should see all available cards again
    And the URL should reset to the default catalog view

  Scenario: View card catalog as guest user
    Given I am not logged into the system
    When I navigate to the card catalog page
    Then I should see all available cards
    But I should not see "Add to cart" buttons
    And I should see "Login to purchase" messages
    And I should see a prominent "Sign up" call-to-action
