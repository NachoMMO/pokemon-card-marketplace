# language: en
Feature: Manage account balance
  As a user
  I want to view and manage my account balance
  So that I can make purchases and receive payments from sales

  Background:
    Given I am logged in
    And I have an account with current balance

  Scenario: View current account balance
    Given my account balance is $125.50
    When I navigate to "Account Balance" page
    Then I should see my current balance "$125.50"
    And I should see recent balance activities
    And I should see available actions:
      | action           |
      | Add Funds        |
      | Withdraw Funds   |
      | Transaction History |
      | Auto-reload Settings |

  Scenario: Add funds to account via credit card
    Given my current balance is $50.00
    When I click "Add Funds"
    And I select "Credit Card" as payment method
    And I enter the amount "$25.00"
    And I enter valid credit card information:
      | field      | value                |
      | card_number| 4111111111111111     |
      | expiry     | 12/25                |
      | cvv        | 123                  |
      | name       | John Doe             |
    And I click "Add Funds"
    Then I should see "Funds added successfully"
    And my balance should be updated to "$75.00"
    And I should receive an email confirmation
    And the transaction should appear in my history

  Scenario: Add funds with different amounts
    When I click "Add Funds"
    Then I should see preset amount options:
      | amount |
      | $10    |
      | $25    |
      | $50    |
      | $100   |
      | Custom |
    When I select "$50"
    And I complete the payment process
    Then $50 should be added to my account
    And I should see the updated balance immediately

  Scenario: Add funds with invalid payment method
    When I try to add funds with an expired credit card
    Then I should see "Payment method declined"
    And my balance should remain unchanged
    And I should see "Please try a different payment method"
    And I should be able to retry with different card details

  Scenario: Withdraw funds to bank account
    Given my balance is $200.00
    And I have a verified bank account linked
    When I click "Withdraw Funds"
    And I enter withdrawal amount "$75.00"
    And I select my linked bank account
    And I click "Request Withdrawal"
    Then I should see "Withdrawal request submitted"
    And I should see "Funds will arrive in 3-5 business days"
    And my available balance should be reduced to "$125.00"
    And the withdrawal should show as "Pending" in history

  Scenario: Attempt withdrawal without sufficient balance
    Given my balance is $30.00
    When I try to withdraw "$50.00"
    Then I should see "Insufficient balance for withdrawal"
    And the withdrawal should not be processed
    And I should see my current available balance

  Scenario: Set up automatic balance reload
    When I go to "Auto-reload Settings"
    And I set reload trigger to "When balance drops below $20"
    And I set reload amount to "$50"
    And I select my preferred payment method
    And I enable auto-reload
    Then auto-reload should be activated
    When my balance drops to $15 due to a purchase
    Then the system should automatically add $50
    And I should receive a notification about the auto-reload

  Scenario: View detailed transaction history
    When I click "Transaction History"
    Then I should see a list of all balance transactions:
      | type         | amount  | date       | description           |
      | Credit       | +$25.00 | 2024-01-15 | Funds added via card  |
      | Debit        | -$15.99 | 2024-01-14 | Purchase: Pikachu card|
      | Credit       | +$30.00 | 2024-01-13 | Sale: Charizard card  |
      | Debit        | -$2.99  | 2024-01-13 | Platform commission   |
    And I should be able to filter by:
      | filter_type |
      | Date Range  |
      | Transaction Type |
      | Amount Range |
    And I should be able to export transaction history as CSV

  Scenario: Receive payment from card sale
    Given I have sold a card for $45.99
    When the sale is completed
    Then my balance should increase by the net amount (after commission)
    And I should see a transaction record:
      | field       | value                    |
      | type        | Credit                   |
      | amount      | +$41.39                  |
      | description | Sale: [Card Name]        |
      | commission  | -$4.60 (10%)            |
    And I should receive a notification about the payment

  Scenario: Handle pending transactions
    Given I have a pending withdrawal of $100.00
    When I view my balance page
    Then I should see:
      | field              | value    |
      | total_balance      | $150.00  |
      | available_balance  | $50.00   |
      | pending_withdrawal | $100.00  |
    And I should not be able to spend the pending amount
    And I should see "Pending transactions" section with details

  Scenario: Balance holds for large purchases
    Given I am purchasing cards totaling $500.00
    When I complete the purchase
    Then the funds should be held temporarily
    And I should see:
      | status              | amount   |
      | available_balance   | $X       |
      | held_for_purchase   | $500.00  |
    When the seller confirms shipment
    Then the held funds should be released to the seller
    And the hold should be removed from my account

  Scenario: Minimum balance requirements
    When my balance drops below $5.00
    Then I should see a notification "Low balance warning"
    And I should see a prominent "Add Funds" button
    And I should receive an email reminder if enabled in preferences
    When my balance reaches $0.00
    Then I should not be able to make new purchases
    And I should see "Insufficient funds" on checkout attempts
