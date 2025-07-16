# language: en
Feature: Add card to shopping cart
  As a logged-in user
  I want to add cards to my shopping cart
  So that I can purchase multiple cards in a single transaction

  Background:
    Given I am logged in as a buyer
    And there are cards available for purchase

  Scenario: Add single card to empty cart
    Given my shopping cart is empty
    And there is a card "Pikachu Base Set" priced at $15.99 with 5 in stock
    When I view the card details for "Pikachu Base Set"
    And I click "Add to Cart"
    Then I should see the confirmation message "Pikachu Base Set added to cart"
    And my cart should contain 1 item
    And the cart icon should show "1" item
    And the card should be temporarily reserved for 30 minutes

  Scenario: Add multiple quantities of same card
    Given there is a card "Energy Fire" with 10 in stock
    When I view the card details
    And I set quantity to "3"
    And I click "Add to Cart"
    Then I should see "3x Energy Fire added to cart"
    And my cart should show 3 of that card
    And 3 units should be reserved from the stock

  Scenario: Add card that's already in cart
    Given I have "Pikachu Base Set" in my cart with quantity 1
    When I try to add the same card again with quantity 2
    Then the quantity in my cart should be updated to 3
    And I should see "Pikachu Base Set quantity updated to 3"
    And the total reservation should be 3 units

  Scenario: Attempt to add more cards than available stock
    Given there is a card "Rare Charizard" with only 2 in stock
    When I try to add 5 of this card to my cart
    Then I should see the error "Only 2 available in stock"
    And I should see an option to "Add 2 to cart instead"
    And no items should be added to my cart

  Scenario: Add card when another user has items in their cart
    Given there is a card "Popular Card" with 3 in stock
    And another user has 2 of these cards in their cart (reserved)
    When I try to add 2 of this card to my cart
    Then I should see the error "Only 1 available (2 reserved by other users)"
    And I should see an option to "Add 1 to cart"
    And I should see an option to "Notify me when more become available"

  Scenario: Add card to cart with pricing changes
    Given there is a card "Dynamic Price Card" priced at $20.00
    And I start viewing the card details
    When the seller changes the price to $25.00
    And I try to add it to my cart
    Then I should see "Price has changed to $25.00"
    And I should see "Add to cart at new price?" confirmation
    When I confirm the new price
    Then the card should be added at $25.00

  Scenario: Cart item expiration
    Given I have a card in my cart that was added 35 minutes ago
    When I try to proceed to checkout
    Then I should see "Some items in your cart have expired"
    And the expired items should be highlighted
    And I should see "Remove expired items" option
    And I should see "Re-add to cart" option for each expired item

  Scenario: Add card when cart is at maximum capacity
    Given my cart already contains 50 different cards (maximum allowed)
    When I try to add another different card
    Then I should see the error "Cart is full (50 items maximum)"
    And I should see "Remove some items to add new ones"
    And the card should not be added

  Scenario: Add card as guest user
    Given I am not logged in
    When I try to add a card to cart
    Then I should see "Please log in to add items to cart"
    And I should be redirected to the login page
    And after logging in, I should return to the card details page

  Scenario: Add card from search results
    Given I am viewing search results for "Pikachu"
    When I click "Quick add to cart" on a Pikachu card
    Then the card should be added with quantity 1
    And I should see a mini cart popup showing the addition
    And I should remain on the search results page

  Scenario: Add card with special offers
    Given there is a card with a "Buy 2 get 10% off" promotion
    When I add 1 of this card to my cart
    Then I should see the regular price
    When I add a second one
    Then I should see "Promotion applied: 10% off total"
    And the cart should show the discounted price

  Scenario: Add card from seller who blocks me
    Given there is a seller who has blocked me
    When I try to add their card to my cart
    Then I should see "Unable to purchase from this seller"
    And the card should not be added to my cart
    And I should not see the seller's other cards in recommendations
