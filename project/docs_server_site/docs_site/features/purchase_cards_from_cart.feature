# language: en
Feature: Purchase cards from cart
  As a buyer with items in my cart
  I want to complete the purchase transaction
  So that I can own the cards I've selected

  Background:
    Given I am logged in as a buyer
    And I have cards in my shopping cart
    And my account balance is sufficient

  Scenario: Successful purchase with sufficient balance
    Given my cart contains:
      | card_name        | quantity | price  |
      | Pikachu Base Set | 2        | $15.99 |
      | Energy Fire      | 3        | $2.50  |
    And my account balance is $50.00
    When I proceed to checkout
    And I review the order summary showing total $39.48
    And I click "Complete Purchase"
    Then I should see "Purchase completed successfully!"
    And my account balance should be reduced by $39.48
    And the cards should be removed from my cart
    And I should receive a purchase confirmation email
    And the purchased cards should appear in my purchase history

  Scenario: Purchase with insufficient balance
    Given my cart total is $45.00
    And my account balance is only $30.00
    When I proceed to checkout
    Then I should see "Insufficient balance. Current balance: $30.00"
    And I should see "Add funds to complete purchase"
    And the "Complete Purchase" button should be disabled
    And I should see options to:
      | option                    |
      | Add funds to account      |
      | Remove items from cart    |
      | Save cart for later       |

  Scenario: Purchase when cart items become unavailable
    Given my cart contains a card "Rare Charizard"
    And another user purchases the last available "Rare Charizard"
    When I proceed to checkout
    Then I should see "Some items are no longer available"
    And "Rare Charizard" should be highlighted as unavailable
    And I should see updated total without the unavailable item
    And I should see options to:
      | option                           |
      | Continue with remaining items    |
      | Remove unavailable items         |
      | Add to wishlist for restock      |

  Scenario: Purchase with price changes during checkout
    Given my cart contains a card originally priced at $20.00
    And the seller changes the price to $25.00 while I'm in checkout
    When I try to complete the purchase
    Then I should see "Price has changed for some items"
    And I should see the old price ($20.00) crossed out
    And I should see the new price ($25.00) highlighted
    And I should see "Accept new prices and continue"
    And I should see "Cancel purchase"

  Scenario: Purchase creates corresponding sale records
    Given I purchase cards from seller "pokemon_master"
    When the purchase is completed successfully
    Then a sale record should be created for "pokemon_master"
    And the seller's account should be credited with the sale amount
    And the platform commission should be deducted
    And the seller should receive a sale notification

  Scenario: Purchase with cart expiration during checkout
    Given I have items in my cart that are about to expire
    When I'm on the checkout page for more than 5 minutes
    And some cart items expire
    Then I should see a warning "Some items have expired"
    And expired items should be highlighted
    And I should see updated total without expired items
    And I should be able to re-add expired items if still available

  Scenario: Purchase confirmation and receipt
    Given I have completed a purchase
    Then I should see a detailed receipt showing:
      | field               |
      | order_number        |
      | purchase_date       |
      | items_purchased     |
      | individual_prices   |
      | total_amount        |
      | seller_information  |
      | estimated_delivery  |
    And I should be able to download the receipt as PDF
    And I should see "Track your order" if shipping is involved

  Scenario: Bulk purchase discount application
    Given there is a "Buy 5+ cards get 15% off" promotion
    And my cart contains 6 cards totaling $100.00
    When I proceed to checkout
    Then I should see "Bulk discount applied: 15% off"
    And the total should be reduced to $85.00
    And the discount should be itemized in the receipt

  Scenario: Purchase with mixed seller items
    Given my cart contains cards from 3 different sellers
    When I complete the purchase
    Then separate transactions should be created for each seller
    And each seller should receive their portion of the payment
    And I should see the breakdown by seller in my receipt
    And shipping should be calculated per seller if applicable

  Scenario: Failed purchase due to payment processing error
    Given my cart is ready for checkout
    When I click "Complete Purchase"
    And there is a payment processing error
    Then I should see "Payment could not be processed. Please try again."
    And my cart should remain unchanged
    And my account balance should not be affected
    And I should see "Contact support if problem persists"

  Scenario: Purchase cancellation within grace period
    Given I have completed a purchase within the last 5 minutes
    When I go to my recent purchases
    And I click "Cancel order" on the recent purchase
    Then I should see "Are you sure you want to cancel this order?"
    When I confirm the cancellation
    Then the purchase should be reversed
    And my account should be refunded
    And the cards should be returned to available stock
    And both buyer and seller should be notified
