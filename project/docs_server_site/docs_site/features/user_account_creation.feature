# language: en
Feature: Create user account
  As a website visitor
  I want to be able to create a new user account
  So that I can access the system functionalities

  Background:
    Given I am on the registration page
    And the user system is available

  Scenario: Successful account creation with valid data
    Given I am an unregistered visitor
    When I enter the following data:
      | field            | value                    |
      | name             | Juan Pérez               |
      | email            | juan.perez@example.com   |
      | password         | MiPassword123!           |
      | confirm_password | MiPassword123!           |
    And I accept the terms and conditions
    And I click the "Create account" button
    Then I should see the message "Account created successfully"
    And I should receive a confirmation email at "juan.perez@example.com"
    And I should be redirected to the welcome page
    And my account should be in "pending verification" status

  Scenario: Attempt to create account with existing email
    Given there is a registered user with email "juan.perez@example.com"
    When I enter the following data:
      | field            | value                    |
      | name             | María González           |
      | email            | juan.perez@example.com   |
      | password         | AnotherPassword456!      |
      | confirm_password | AnotherPassword456!      |
    And I accept the terms and conditions
    And I click the "Create account" button
    Then I should see the error message "This email is already registered"
    And a new account should not be created
    And I should remain on the registration page

  Scenario: Attempt to create account with mismatched passwords
    When I enter the following data:
      | field            | value                    |
      | name             | Carlos López             |
      | email            | carlos.lopez@example.com |
      | password         | MiPassword123!           |
      | confirm_password | AnotherPassword456!      |
    And I accept the terms and conditions
    And I click the "Create account" button
    Then I should see the error message "Passwords do not match"
    And a new account should not be created
    And I should remain on the registration page

  Scenario: Attempt to create account with weak password
    When I enter the following data:
      | field            | value            |
      | name             | Ana Martínez     |
      | email            | ana@example.com  |
      | password         | 123              |
      | confirm_password | 123              |
    And I accept the terms and conditions
    And I click the "Create account" button
    Then I should see the error message "Password must be at least 8 characters long and include uppercase, lowercase, numbers and symbols"
    And a new account should not be created
    And I should remain on the registration page

  Scenario: Attempt to create account without accepting terms and conditions
    When I enter the following data:
      | field            | value                    |
      | name             | Luis Rodríguez           |
      | email            | luis@example.com         |
      | password         | MiPassword123!           |
      | confirm_password | MiPassword123!           |
    And I do NOT accept the terms and conditions
    And I click the "Create account" button
    Then I should see the error message "You must accept the terms and conditions"
    And the "Create account" button should be disabled
    And a new account should not be created

  Scenario Outline: Required field validation
    When I leave the "<field>" field empty
    And I complete the other fields with valid data
    And I click the "Create account" button
    Then I should see the error message "<error_message>"
    And a new account should not be created

    Examples:
      | field            | error_message                     |
      | name             | Name is required                  |
      | email            | Email is required                 |
      | password         | Password is required              |
      | confirm_password | You must confirm the password     |

  Scenario: Email format validation
    When I enter the following data:
      | field            | value                    |
      | name             | Pedro Sánchez            |
      | email            | invalid-email            |
      | password         | MiPassword123!           |
      | confirm_password | MiPassword123!           |
    And I accept the terms and conditions
    And I click the "Create account" button
    Then I should see the error message "Please enter a valid email"
    And a new account should not be created
