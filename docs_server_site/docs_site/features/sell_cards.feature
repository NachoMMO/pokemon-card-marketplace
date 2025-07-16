# language: en
Feature: Sell cards
  As a user with seller privileges
  I want to list my cards for sale
  So that I can earn money from my card collection

  Background:
    Given I am logged in as a user with seller role
    And my email is verified
    And I have cards in my collection

  Scenario: Successfully list a card for sale
    Given I have a "Charizard Base Set" card in my collection
    When I navigate to "Sell Cards" page
    And I select "Charizard Base Set" from my collection
    And I enter the following listing details:
      | field       | value                           |
      | price       | 45.99                          |
      | condition   | Near Mint                      |
      | stock       | 1                              |
      | description | Original Base Set Charizard... |
    And I upload clear photos of the card
    And I click "List for Sale"
    Then I should see "Card listed successfully!"
    And the card should appear in the marketplace
    And I should see it in "My Active Listings"
    And the card should be marked as "For Sale" in my collection

  Scenario: List multiple quantities of the same card
    Given I have 5 copies of "Energy Fire" in my collection
    When I create a listing for "Energy Fire"
    And I set the stock quantity to "3"
    And I set the price to "$2.50"
    And I click "List for Sale"
    Then 3 cards should be available for sale
    And 2 cards should remain in my personal collection
    And the listing should show "3 available"

  Scenario: Attempt to sell card without seller verification
    Given my email is not verified
    When I try to access the "Sell Cards" page
    Then I should see "Email verification required to sell cards"
    And I should see "Verify Email" button
    And I should not be able to create listings

  Scenario: Set competitive pricing with market insights
    Given I am listing a "Pikachu Promo" card
    When I enter the card details
    Then I should see market pricing information:
      | metric          | value    |
      | average_price   | $22.50   |
      | lowest_price    | $18.00   |
      | highest_price   | $28.00   |
      | recent_sales    | 15       |
    And I should see "Suggested price: $20.00 - $25.00"
    And I should see "Your price will rank #X among current listings"

  Scenario: Upload and manage card images
    When I am creating a listing
    Then I should be able to upload up to 5 images
    And I should be required to upload at least 1 front image
    When I upload an image
    Then I should see a preview thumbnail
    And I should be able to reorder images by dragging
    And I should be able to delete unwanted images
    And I should see image quality guidelines

  Scenario: Edit existing listing
    Given I have an active listing for "Blastoise"
    When I go to "My Active Listings"
    And I click "Edit" on the Blastoise listing
    And I change the price from $30.00 to $28.00
    And I update the description
    And I click "Update Listing"
    Then the listing should be updated with new information
    And users should see the updated price
    And I should see "Listing updated successfully"

  Scenario: Remove listing from sale
    Given I have an active listing for "Venusaur"
    When I go to "My Active Listings"
    And I click "Remove from Sale" on the Venusaur listing
    Then I should see "Are you sure you want to remove this listing?"
    When I confirm the removal
    Then the listing should be removed from the marketplace
    And the card should return to my personal collection
    And any existing cart reservations should be cancelled

  Scenario: Automatic listing deactivation when sold out
    Given I have a listing for "Common Card" with 2 in stock
    When both cards are purchased by buyers
    Then the listing should automatically be marked as "Sold Out"
    And it should no longer appear in search results
    And I should receive a notification "Your Common Card listing has sold out"

  Scenario: Bulk listing for multiple cards
    Given I have multiple cards I want to sell
    When I select "Bulk List Cards"
    And I select 5 different cards from my collection
    And I set individual prices and conditions for each
    And I click "List All Selected Cards"
    Then all 5 cards should be listed simultaneously
    And I should see "5 cards listed successfully"
    And all listings should appear in "My Active Listings"

  Scenario: Listing with promotional features
    Given I am creating a listing for a high-value card
    When I select "Featured Listing" option for $2.99
    And I complete the listing
    Then my listing should appear in the "Featured Cards" section
    And it should have a "Featured" badge
    And my account should be charged the promotion fee
    And the feature should last for 7 days

  Scenario: Handle listing violations
    Given I create a listing with inappropriate content
    When moderators review the listing
    And they find it violates community guidelines
    Then I should receive a warning notification
    And the listing should be temporarily hidden
    And I should see "Listing under review" status
    And I should be able to edit and resubmit the listing

  Scenario: Seller reputation and feedback
    Given I have completed several sales
    When I view my seller profile
    Then I should see my seller statistics:
      | metric           |
      | total_sales      |
      | average_rating   |
      | response_time    |
      | shipping_speed   |
      | return_rate      |
    And buyers should see these stats when viewing my listings
    And high ratings should boost my listing visibility
