# language: en
Feature: View card details
  As a user
  I want to see detailed information about a specific card
  So that I can make an informed decision about purchasing it

  Background:
    Given I am on the card catalog page
    And there are cards available for viewing

  Scenario: View card details for available card
    Given there is a card "Charizard Base Set" available for sale
    When I click on the "Charizard Base Set" card
    Then I should be redirected to the card detail page
    And I should see the following information:
      | field         | example_value              |
      | name          | Charizard                  |
      | expansion     | Base Set                   |
      | card_number   | 4/102                      |
      | rarity        | Rare Holo                  |
      | type          | Fire                       |
      | condition     | Near Mint                  |
      | price         | $45.99                     |
      | stock         | 3 available                |
      | seller        | john_pokemon_seller        |
      | description   | Classic Charizard card...  |
    And I should see a high-quality card image
    And I should see an "Add to Cart" button

  Scenario: View card details with multiple images
    Given there is a card with multiple images (front, back, close-ups)
    When I view the card details
    Then I should see the main card image
    And I should see thumbnail images for additional views
    When I click on a thumbnail
    Then the main image should change to show that view
    And I should be able to zoom in on the image

  Scenario: View card details with seller information
    Given I am viewing a card detail page
    Then I should see the seller's information:
      | field          |
      | username       |
      | rating         |
      | total_sales    |
      | member_since   |
    And I should see a "View seller profile" link
    And I should see a "Message seller" button

  Scenario: View card details with similar cards
    Given I am viewing a card detail page for "Charizard"
    Then I should see a "Similar cards" section
    And I should see other Charizard variants or related cards
    And each similar card should show basic info (name, price, image)
    And I should be able to click on similar cards to view their details

  Scenario: View card details with price history
    Given I am viewing a card that has been sold before
    Then I should see a "Price History" section
    And I should see a chart showing price trends over time
    And I should see the average sale price
    And I should see the price range (lowest to highest)

  Scenario: Add card to cart from details page
    Given I am logged in as a buyer
    And I am viewing a card detail page
    And the card is in stock
    When I select quantity "2"
    And I click "Add to Cart"
    Then I should see a confirmation message "Added to cart"
    And the cart icon should update to show the new item count
    And I should see options to "View Cart" or "Continue Shopping"

  Scenario: View out of stock card details
    Given there is a card that is out of stock
    When I view its detail page
    Then I should see "Out of Stock" instead of quantity selector
    And the "Add to Cart" button should be disabled
    And I should see "Notify me when available" option
    And I should see when it was last in stock

  Scenario: View card details as guest user
    Given I am not logged in
    When I view a card detail page
    Then I should see all card information
    But I should see "Login to purchase" instead of "Add to Cart"
    And I should see "Create account to message seller"
    And I should see prominent login/signup buttons

  Scenario: View card details for card I'm selling
    Given I am logged in as the seller of a card
    When I view my card's detail page
    Then I should see "You are selling this card"
    And I should see an "Edit listing" button
    And I should not see "Add to Cart" or "Message seller" options
    And I should see sales statistics for this card

  Scenario: Report inappropriate card listing
    Given I am viewing a card detail page
    When I click "Report this listing"
    Then I should see a report form with options:
      | reason                    |
      | Inappropriate content     |
      | Misleading description    |
      | Wrong category           |
      | Suspected fake card      |
      | Other                    |
    And I should be able to add additional comments
    And I should be able to submit the report
