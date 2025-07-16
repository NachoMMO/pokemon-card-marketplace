# language: en
Feature: User login
  As a registered user
  I want to be able to log into my account
  So that I can access the platform features

  Background:
    Given I am on the login page
    And the authentication system is available

  Scenario: Successful login with valid credentials
    Given I have a registered account with email "user@example.com" and password "ValidPass123!"
    And my account is active and verified
    When I enter the following credentials:
      | field    | value              |
      | email    | user@example.com   |
      | password | ValidPass123!      |
    And I click the "Log in" button
    Then I should see the message "Welcome back!"
    And I should be redirected to the dashboard
    And I should see my user menu
    And my session should be active

  Scenario: Failed login with invalid email
    When I enter the following credentials:
      | field    | value                    |
      | email    | nonexistent@example.com  |
      | password | ValidPass123!            |
    And I click the "Log in" button
    Then I should see the error message "Invalid email or password"
    And I should remain on the login page
    And no session should be created

  Scenario: Failed login with invalid password
    Given I have a registered account with email "user@example.com"
    When I enter the following credentials:
      | field    | value              |
      | email    | user@example.com   |
      | password | WrongPassword      |
    And I click the "Log in" button
    Then I should see the error message "Invalid email or password"
    And I should remain on the login page
    And no session should be created

  Scenario: Login attempt with unverified account
    Given I have a registered but unverified account with email "unverified@example.com"
    When I enter valid credentials for the unverified account
    And I click the "Log in" button
    Then I should see the message "Please verify your email before logging in"
    And I should see a "Resend verification email" link
    And I should remain on the login page

  Scenario: Login attempt with deactivated account
    Given I have a deactivated account with email "deactivated@example.com"
    When I enter valid credentials for the deactivated account
    And I click the "Log in" button
    Then I should see the error message "Your account has been deactivated"
    And I should see contact information for support
    And I should remain on the login page

  Scenario Outline: Login validation for empty fields
    When I leave the "<field>" field empty
    And I fill the other field with valid data
    And I click the "Log in" button
    Then I should see the error message "<error_message>"
    And I should remain on the login page

    Examples:
      | field    | error_message           |
      | email    | Email is required       |
      | password | Password is required    |

  Scenario: Remember me functionality
    Given I have a registered account with email "user@example.com"
    When I enter valid credentials
    And I check the "Remember me" checkbox
    And I click the "Log in" button
    Then I should be logged in successfully
    And my session should persist for 30 days
    And I should remain logged in after closing the browser

  Scenario: Login rate limiting after multiple failed attempts
    Given I have made 4 failed login attempts in the last 15 minutes
    When I attempt to log in again with any credentials
    Then I should see the error message "Too many failed attempts. Please try again in 15 minutes"
    And the login form should be temporarily disabled
    And I should see the remaining lockout time
