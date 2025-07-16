# language: en
Feature: Add cards to collection
  As a user
  I want to add cards to my personal collection
  So that I can track my owned cards and their value

  Background:
    Given I am logged in
    And I have access to the card catalog

  Scenario: Add purchased card to collection automatically
    Given I purchase a "Pikachu Base Set" card
    When the purchase is completed
    Then the card should automatically be added to my collection
    And it should show:
      | field            | value              |
      | quantity         | 1                  |
      | condition        | As purchased       |
      | date_acquired    | Purchase date      |
      | acquisition_price| Purchase price     |
      | source          | Purchase           |
    And I should see a notification "Card added to your collection"

  Scenario: Manually add card to collection
    Given I navigate to "My Collection"
    When I click "Add Card Manually"
    And I search for "Charizard Base Set"
    And I select the correct card variant
    And I enter the collection details:
      | field            | value              |
      | quantity         | 2                  |
      | condition        | Near Mint          |
      | acquisition_date | 2024-01-15         |
      | acquisition_price| $45.00             |
      | source          | Trade              |
      | notes           | Traded with friend |
    And I click "Add to Collection"
    Then the card should appear in my collection
    And I should see "Charizard added to collection"

  Scenario: Add card with photos for condition verification
    When I am adding a card to my collection
    And I upload photos of the card condition
    Then the photos should be stored with the collection entry
    And I should be able to view them later for reference
    And they should help with accurate condition tracking

  Scenario: Add multiple copies of the same card
    Given I already have 1 "Energy Fire" card in my collection
    When I add 3 more "Energy Fire" cards
    Then my collection should show quantity "4" for that card
    And each addition should be tracked separately in acquisition history
    And I should see "Collection updated: Energy Fire (4 total)"

  Scenario: Add card with different condition than existing
    Given I have a "Blastoise" in "Near Mint" condition
    When I add another "Blastoise" in "Light Played" condition
    Then I should have 2 separate entries for Blastoise
    And each should show its respective condition
    And the total value should reflect both conditions

  Scenario: Bulk add cards from purchase history
    Given I have purchase history with cards not yet in collection
    When I go to "Add from Purchases"
    Then I should see a list of purchased cards not in collection
    And I should be able to select multiple cards
    When I select 5 cards and click "Add Selected to Collection"
    Then all 5 cards should be added with purchase details pre-filled
    And I should see "5 cards added to collection"

  Scenario: Add card using barcode scanner
    When I click "Scan Card Barcode"
    And I use my device camera to scan a card's barcode
    Then the system should identify the card automatically
    And pre-fill the card information
    And I should only need to add quantity and condition
    And I click "Add to Collection"
    Then the card should be added with scanned details

  Scenario: Add graded card to collection
    When I am adding a graded card
    Then I should see additional fields:
      | field           |
      | grading_company |
      | grade           |
      | certification_number |
      | grading_date    |
    When I enter grading details:
      | field               | value        |
      | grading_company     | PSA          |
      | grade               | 9            |
      | certification_number| 12345678     |
    And I add the card
    Then it should be marked as "Graded: PSA 9" in my collection
    And the value should reflect the graded premium

  Scenario: Add card from wishlist
    Given I have cards in my wishlist
    When I acquire one of the wishlist cards
    And I go to "Add from Wishlist"
    Then I should see my wishlist cards
    When I select a card and mark it as "Acquired"
    Then it should be moved from wishlist to collection
    And the wishlist entry should be removed
    And I should see "Card moved from wishlist to collection"

  Scenario: Add foreign language card
    When I am adding a card in a different language
    Then I should be able to specify:
      | field     |
      | language  |
      | region    |
    When I select "Japanese" as language
    And I add the card
    Then it should be clearly marked as a Japanese variant
    And it should be valued according to foreign market prices

  Scenario: Validate card authenticity during addition
    When I am adding a high-value card
    Then I should see authenticity verification options:
      | option                    |
      | Upload authentication docs |
      | Mark as verified/unverified |
      | Add authenticity notes     |
    And I should see warnings about counterfeit risks
    And I should be able to mark uncertainty about authenticity

  Scenario: Add card with storage location tracking
    When I am adding cards to my collection
    Then I should be able to specify storage details:
      | field          | example_value    |
      | storage_type   | Binder           |
      | location       | Shelf A, Page 5  |
      | protective_case| Top Loader       |
    And I should be able to search my collection by storage location
    And I should be able to generate storage reports
