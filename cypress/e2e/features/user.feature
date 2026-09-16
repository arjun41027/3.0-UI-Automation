@userManagement @user
Feature: User Management
  As a logged-in user
  I want to manage Users under the User Management menu
  So that I can create users with assigned roles and departments in PuffinUI

  # ── AUTH NOTE ────────────────────────────────────────────────────────────────
  # Background step is defined ONCE in loginStep.js (shared Cucumber registry).
  # cy.session() caches the SSO token — Aurora login runs only on scenario 1.
  # All subsequent scenarios restore the session cheaply via cy.visit().
  # ─────────────────────────────────────────────────────────────────────────────

  Background:
    Given the user is logged in and on the home page

  @smoke @USER_001
  Scenario: Navigate to Users list page via User Management menu
    When the user navigates to the Users list page
    Then the Users list page should be displayed
    And the users table should be visible with columns "Login Name", "Department", "Role"
    And the total user count should be visible

  @smoke @USER_002
  Scenario: Add a new user with a role and department successfully
    Given the user is on the Users list page
    When the user clicks the user list "Add User" button
    Then the Add User popup should be displayed with "Primary Information" heading
    When the user enters "qa.automation.user002" as the login name
    And the user selects "AutoRole_1782298" from the Roles dropdown
    And the user selects "Department_1001" from the Departments dropdown
    And the user selects "Active" status for the user
    And the user clicks the user Submit button
    Then the user should be created successfully

  @USER_003
  Scenario: Add a user with multiple roles and multiple departments
    Given the user is on the Users list page
    When the user clicks the user list "Add User" button
    And the user enters "multi.role.user003" as the login name
    And the user selects "AutoRole_1782298" from the Roles dropdown
    And the user selects "AutoRole_1782299" from the Roles dropdown
    And the user selects "Department_1001" from the Departments dropdown
    And the user selects "QA Department" from the Departments dropdown
    Then 2 role chips should be displayed in the Roles field
    And 2 department chips should be displayed in the Departments field
    When the user clicks the user Submit button
    Then the user should be created successfully

  @USER_004
  Scenario: Remove a selected role chip before submitting
    Given the user is on the Users list page
    When the user clicks the user list "Add User" button
    And the user enters "remove.chip.user004" as the login name
    And the user selects "AutoRole_1782298" from the Roles dropdown
    And the user selects "AutoRole_1782299" from the Roles dropdown
    Then 2 role chips should be displayed in the Roles field
    When the user removes the "AutoRole_1782298" chip from the Roles field
    Then 1 role chips should be displayed in the Roles field

  @USER_005
  Scenario: Reset button clears all entered user form data
    Given the user is on the Users list page
    When the user clicks the user list "Add User" button
    And the user enters "reset.test.user005" as the login name
    And the user selects "Department_1001" from the Departments dropdown
    And the user clicks the user Reset button
    Then the user form fields should be cleared

  @USER_006
  Scenario: Close the Add User popup without submitting
    Given the user is on the Users list page
    When the user clicks the user list "Add User" button
    Then the Add User popup should be displayed with "Primary Information" heading
    When the user closes the Add User popup
    Then the Add User popup should not be visible

  @USER_007
  Scenario Outline: Add users with different role and department combinations
    Given the user is on the Users list page
    When the user clicks the user list "Add User" button
    And the user enters "<loginName>" as the login name
    And the user selects "<role>" from the Roles dropdown
    And the user selects "<department>" from the Departments dropdown
    And the user clicks the user Submit button
    Then the user should be created successfully

    Examples:
      | loginName        | role                | department       |
      | hr.qa.user007   | AutoRole_1782298     | Department_1001   |
      | it.qa.user008   | AutoRole_1782299     | QA Department     |
