# language: en
Feature: Password recovery
  As a user who forgot their password
  I want to be able to reset my password
  So that I can regain access to my account

  Background:
    Given I am on the password recovery page
    And the email system is available

  Scenario: Successful password reset request
    Given I have a registered account with email "user@example.com"
    When I enter my email "user@example.com"
    And I click the "Send reset link" button
    Then I should see the message "Password reset link sent to your email"
    And I should receive a password reset email at "user@example.com"
    And the reset link should be valid for 1 hour
    And I should be redirected to the login page

  Scenario: Password reset request for non-existent email
    When I enter a non-existent email "nonexistent@example.com"
    And I click the "Send reset link" button
    Then I should see the message "Password reset link sent to your email"
    And no email should be sent
    And I should be redirected to the login page

  Scenario: Password reset with valid token
    Given I have requested a password reset for "user@example.com"
    And I have a valid reset token
    When I click the reset link in my email
    Then I should be redirected to the password reset form
    And I should see the email "user@example.com" pre-filled
    And the form should be ready for new password entry

  Scenario: Successful password change
    Given I am on the password reset form with a valid token
    When I enter the following passwords:
      | field            | value          |
      | new_password     | NewPass123!    |
      | confirm_password | NewPass123!    |
    And I click the "Reset password" button
    Then I should see the message "Password successfully reset"
    And I should be automatically logged in
    And I should be redirected to the dashboard
    And the reset token should be invalidated

  Scenario: Password reset with mismatched passwords
    Given I am on the password reset form with a valid token
    When I enter the following passwords:
      | field            | value          |
      | new_password     | NewPass123!    |
      | confirm_password | DifferentPass! |
    And I click the "Reset password" button
    Then I should see the error message "Passwords do not match"
    And I should remain on the password reset form
    And the token should remain valid

  Scenario: Password reset with weak password
    Given I am on the password reset form with a valid token
    When I enter the following passwords:
      | field            | value |
      | new_password     | 123   |
      | confirm_password | 123   |
    And I click the "Reset password" button
    Then I should see the error message "Password must be at least 8 characters long and include uppercase, lowercase, numbers and symbols"
    And I should remain on the password reset form

  Scenario: Password reset with expired token
    Given I have a password reset token that expired 2 hours ago
    When I click the reset link
    Then I should see the error message "Reset link has expired"
    And I should see a "Request new reset link" button
    And I should be able to request a new reset

  Scenario: Password reset with invalid token
    When I access the password reset form with an invalid token
    Then I should see the error message "Invalid or tampered reset link"
    And I should be redirected to the password recovery page
    And I should see a message to request a new link

  Scenario: Multiple password reset requests
    Given I have already requested a password reset 1 minute ago
    When I request another password reset for the same email
    Then I should see the message "Password reset link sent to your email"
    And the previous reset token should be invalidated
    And only the new token should be valid
