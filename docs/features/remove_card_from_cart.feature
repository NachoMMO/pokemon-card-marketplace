# language: en
Feature: Remove card from shopping cart
  As a buyer with items in my cart
  I want to remove unwanted cards from my shopping cart
  So that I can adjust my order before purchasing

  Background:
    Given I am logged in as a buyer
    And I have multiple cards in my shopping cart

  Scenario: Remove single card from cart
    Given my cart contains:
      | card_name        | quantity | price  |
      | Pikachu Base Set | 2        | $15.99 |
      | Charizard        | 1        | $45.99 |
      | Energy Fire      | 3        | $2.50  |
    When I view my shopping cart
    And I click "Remove" on the "Charizard" item
    Then I should see "Charizard removed from cart"
    And "Charizard" should no longer appear in my cart
    And the cart total should be updated to exclude Charizard
    And the card should be returned to available stock
    And my cart should show 2 remaining items

  Scenario: Remove multiple cards using bulk selection
    Given my cart contains 5 different cards
    When I select 3 cards using checkboxes
    And I click "Remove Selected Items"
    Then I should see "Are you sure you want to remove 3 items?"
    When I confirm the removal
    Then all 3 selected cards should be removed from my cart
    And I should see "3 items removed from cart"
    And the cart total should update accordingly
    And my cart should show 2 remaining items

  Scenario: Reduce quantity instead of complete removal
    Given my cart contains "Energy Fire" with quantity 5
    When I change the quantity from 5 to 2
    And I click "Update"
    Then the quantity should be updated to 2
    And I should see "Quantity updated"
    And 3 units should be returned to available stock
    And the cart total should reflect the new quantity

  Scenario: Remove card by setting quantity to zero
    Given my cart contains "Blastoise" with quantity 3
    When I change the quantity to 0
    And I click "Update"
    Then "Blastoise" should be completely removed from my cart
    And I should see "Blastoise removed from cart"
    And all 3 units should be returned to available stock

  Scenario: Clear entire shopping cart
    Given my cart contains multiple items
    When I click "Clear Cart"
    Then I should see "Are you sure you want to remove all items from your cart?"
    When I confirm clearing the cart
    Then my cart should be empty
    And I should see "Shopping cart cleared"
    And all reserved items should be returned to available stock
    And I should see "Your cart is empty" message
    And I should see suggestions to "Continue Shopping"

  Scenario: Remove expired cart item
    Given my cart contains an item that was added 35 minutes ago and has expired
    When I view my cart
    Then I should see the expired item highlighted
    And I should see "This item has expired" message
    When I click "Remove Expired Items"
    Then all expired items should be removed automatically
    And I should see "Expired items removed from cart"
    And only valid items should remain

  Scenario: Undo cart item removal
    Given I accidentally remove "Rare Charizard" from my cart
    When I see the removal confirmation message
    Then I should see an "Undo" button for 10 seconds
    When I click "Undo" within the time limit
    Then "Rare Charizard" should be added back to my cart
    And it should be reserved again if still available
    And I should see "Item restored to cart"

  Scenario: Attempt to remove item when another user purchases it
    Given my cart contains "Popular Card"
    And another user purchases the last available "Popular Card"
    When I try to remove it from my cart
    Then the item should be removed normally
    And I should see "Item removed from cart"
    And no stock should be returned (since it's already sold)

  Scenario: Remove item that seller has delisted
    Given my cart contains a card that the seller has removed from sale
    When I view my cart
    Then I should see "No longer available" status for that item
    And I should see "Remove unavailable item" option
    When I remove the unavailable item
    Then it should be removed from my cart
    And I should see "Unavailable item removed"

  Scenario: Remove item and see updated shipping costs
    Given my cart qualifies for free shipping with current total
    And removing an item would drop below the free shipping threshold
    When I remove the item
    Then I should see updated shipping costs
    And I should see "Shipping charges now apply" notification
    And the new total should include shipping fees

  Scenario: Save item to wishlist before removing
    Given I want to remove "Expensive Card" but might buy it later
    When I click "Remove" on the item
    Then I should see options:
      | option                        |
      | Remove from cart              |
      | Save to wishlist and remove   |
      | Cancel                        |
    When I select "Save to wishlist and remove"
    Then the item should be removed from cart
    And it should be added to my wishlist
    And I should see "Item moved to wishlist"

  Scenario: Remove item with applied discount
    Given my cart has a "Buy 3 get 10% off" promotion applied
    And I have 3 qualifying items
    When I remove 1 of the qualifying items
    Then the promotion should be automatically removed
    And I should see "Promotion no longer applies"
    And the cart total should update to remove the discount
    And I should see the new pricing for remaining items

  Scenario: Remove item as guest user with temporary cart
    Given I am not logged in
    And I have items in a temporary cart session
    When I remove an item from the cart
    Then the item should be removed normally
    And the cart should persist until browser session ends
    And I should see updated totals
    But I should see "Login to save your cart" reminder
