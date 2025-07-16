# language: en
Feature: View purchase and sales history
  As a user
  I want to view my complete transaction history
  So that I can track my purchases and sales activity

  Background:
    Given I am logged in
    And I have completed various purchases and sales

  Scenario: View complete purchase history
    When I navigate to "Purchase History"
    Then I should see a list of all my purchases with:
      | field            |
      | card_name        |
      | seller_name      |
      | purchase_date    |
      | quantity         |
      | unit_price       |
      | total_paid       |
      | order_status     |
      | tracking_info    |
    And purchases should be sorted by date (newest first)
    And I should see pagination for older purchases

  Scenario: View complete sales history
    When I navigate to "Sales History"
    Then I should see a list of all my sales with:
      | field            |
      | card_name        |
      | buyer_name       |
      | sale_date        |
      | quantity         |
      | unit_price       |
      | total_earned     |
      | commission_paid  |
      | net_received     |
      | order_status     |
    And sales should be sorted by date (newest first)
    And I should see total earnings summary

  Scenario: Filter purchase history by date range
    Given I have purchases spanning multiple months
    When I set the date filter to "Last 30 days"
    Then I should only see purchases from the last 30 days
    And the total spent should update for the filtered period
    When I select custom date range "2024-01-01 to 2024-01-31"
    Then I should see only January 2024 purchases

  Scenario: Search transaction history
    When I enter "Charizard" in the transaction search
    Then I should see only transactions involving Charizard cards
    And the search should work across both purchases and sales
    And I should see "X transactions found for 'Charizard'"

  Scenario: View detailed transaction information
    Given I have a completed purchase
    When I click "View Details" on a transaction
    Then I should see complete transaction details:
      | field               |
      | order_number        |
      | transaction_date    |
      | card_details        |
      | seller_information  |
      | payment_method      |
      | shipping_address    |
      | tracking_number     |
      | transaction_fees    |
      | refund_status       |
    And I should be able to download receipt
    And I should see seller contact options

  Scenario: Track order status
    Given I have a recent purchase with shipping
    When I view the purchase details
    Then I should see current order status:
      | status      | description                    |
      | Confirmed   | Payment processed, order confirmed |
      | Shipped     | Item shipped, tracking available  |
      | In Transit  | Package in transit             |
      | Delivered   | Package delivered              |
    And I should see estimated delivery date
    And I should receive status update notifications

  Scenario: View sales analytics
    When I go to "Sales Analytics" in my sales history
    Then I should see performance metrics:
      | metric                  |
      | total_sales_count       |
      | total_revenue           |
      | average_sale_price      |
      | best_selling_cards      |
      | monthly_sales_trend     |
      | buyer_satisfaction      |
    And I should see visual charts for trends
    And I should see performance compared to previous periods

  Scenario: Export transaction history
    When I click "Export History"
    Then I should see export options:
      | option            |
      | Purchases only    |
      | Sales only        |
      | All transactions  |
      | Date range        |
    When I select "All transactions" and "CSV format"
    And I click "Export"
    Then I should receive a downloadable file with:
      | field               |
      | transaction_type    |
      | date               |
      | card_name          |
      | other_party        |
      | amount             |
      | status             |

  Scenario: Leave feedback for completed purchases
    Given I have received a purchased card
    When I view the purchase details
    And I click "Leave Feedback"
    Then I should see a feedback form:
      | field               |
      | rating_1_to_5       |
      | card_condition_match |
      | shipping_speed      |
      | seller_communication |
      | written_review      |
    When I submit positive feedback
    Then the seller should receive the feedback
    And it should appear on their seller profile

  Scenario: Request refund for purchase
    Given I received a card in worse condition than advertised
    When I go to purchase details and click "Request Refund"
    Then I should see a refund request form
    When I select reason "Item not as described"
    And I upload evidence photos
    And I submit the request
    Then a refund case should be opened
    And both parties should be notified
    And I should see "Refund request submitted"

  Scenario: View transaction disputes
    Given I have ongoing transaction disputes
    When I go to "Transaction Disputes"
    Then I should see all open dispute cases with:
      | field            |
      | case_number      |
      | transaction_id   |
      | dispute_reason   |
      | status           |
      | last_update      |
    And I should be able to add comments to disputes
    And I should see resolution options

  Scenario: Reorder previously purchased cards
    Given I want to buy the same card again
    When I view my purchase history
    And I click "Buy Again" on a previous purchase
    Then I should be taken to that card's current listing (if available)
    Or I should see "This card is no longer available"
    And I should see "Similar cards" as alternatives

  Scenario: Tax reporting for sales
    When I go to "Tax Reports" in my sales history
    Then I should see annual sales summaries:
      | field              |
      | total_gross_sales  |
      | total_fees_paid    |
      | net_income         |
      | tax_year           |
    And I should be able to download tax documents
    And I should see disclaimer about consulting tax professionals
