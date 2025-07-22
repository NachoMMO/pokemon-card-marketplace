# language: en
Feature: Search cards
  As a user
  I want to search for specific Pokemon cards
  So that I can quickly find the cards I'm looking for

  Background:
    Given I am on the card catalog page
    And there are various cards available with different attributes

  Scenario: Search cards by name
    When I enter "Charizard" in the search box
    And I click the search button
    Then I should see only cards with "Charizard" in the name
    And the search term should be highlighted in the results
    And I should see the number of matching results

  Scenario: Search cards with partial name match
    When I enter "Pika" in the search box
    And I click the search button
    Then I should see cards containing "Pika" in the name
    And this should include "Pikachu", "Pikachu EX", etc.
    And the partial match should be highlighted

  Scenario: Search cards by expansion name
    When I enter "Base Set" in the search box
    And I click the search button
    Then I should see only cards from the "Base Set" expansion
    And each card should display "Base Set" as its expansion

  Scenario: Search with no results
    When I enter "NonexistentCard" in the search box
    And I click the search button
    Then I should see the message "No cards found matching 'NonexistentCard'"
    And I should see suggestions like "Check your spelling" or "Try broader terms"
    And I should see a "Clear search" option

  Scenario: Search with multiple criteria
    When I enter "Charizard" in the search box
    And I select the type filter "Fire"
    And I select the rarity filter "Rare Holo"
    And I click the search button
    Then I should see only Fire-type Charizard cards with Rare Holo rarity
    And all active filters should be displayed
    And the result count should reflect the combined filters

  Scenario: Search cards by price range with keyword
    When I enter "Pikachu" in the search box
    And I set the price range to $5-$25
    And I click the search button
    Then I should see only Pikachu cards priced between $5 and $25
    And the results should be sorted by relevance by default

  Scenario: Advanced search with card number
    When I enter "#001" in the search box
    And I click the search button
    Then I should see cards with card number "001"
    And the card number should be highlighted in the results

  Scenario: Search autocomplete suggestions
    When I start typing "Char" in the search box
    Then I should see autocomplete suggestions like:
      | suggestion     |
      | Charizard      |
      | Charmeleon     |
      | Charmander     |
    When I click on "Charizard" from the suggestions
    Then the search should be executed for "Charizard"

  Scenario: Save search preferences
    Given I am logged in
    When I perform a search for "Pikachu"
    And I apply filters for type "Electric" and rarity "Common"
    And I click "Save this search"
    Then I should see the option to name my saved search
    And I should be able to access it from "My Saved Searches"

  Scenario: Recent searches
    Given I am logged in
    And I have performed previous searches
    When I click on the search box
    Then I should see my recent search terms
    And I should be able to click on any recent search to repeat it

  Scenario: Search by seller name
    When I enter "seller:john_doe" in the search box
    And I click the search button
    Then I should see only cards sold by user "john_doe"
    And each card should show "john_doe" as the seller

  Scenario: Empty search submission
    When I click the search button with an empty search box
    Then I should see all available cards
    And it should behave the same as viewing the full catalog
    And no search filters should be applied
