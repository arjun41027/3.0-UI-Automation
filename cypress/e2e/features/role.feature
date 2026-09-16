@userManagement @role
Feature: Role Management
  As a logged-in user
  I want to manage Roles under the User Management menu
  So that I can create roles with specific module permissions in PuffinUI

  # ── AUTH NOTE ────────────────────────────────────────────────────────────────
  # Background step is defined ONCE in loginStep.js (shared Cucumber registry).
  # cy.session() caches the SSO token — Aurora login runs only on scenario 1.
  # All subsequent scenarios restore the session cheaply via cy.visit().
  # ─────────────────────────────────────────────────────────────────────────────

  Background:
    Given the user is logged in and on the home page

  @smoke @ROLE_001
  Scenario: Navigate to Roles list page via User Management menu
    When the user navigates to the Roles list page
    Then the Roles list page should be displayed
    And the roles table should be visible with columns "Role Name", "Created By", "Created On"
    And the total role count should be visible

  @smoke @ROLE_002
  Scenario: Add a new role with selected permissions successfully
    Given the user is on the Roles list page
    When the user clicks the role list "Add Role" button
    Then the Add Role popup should be displayed with "Role Information" heading
    When the user enters "AutoRole_1782298" as the role name
    And the user enters "Role created by Cypress automation" as the role description
    And the user selects "Active" status for the role
    Then the Role Permissions section should be visible
    When the user enables the "Add" permission for module "Departments"
    And the user enables the "Edit" permission for module "Departments"
    And the user clicks the role Submit button
    Then the role should be created successfully

  @ROLE_003
  Scenario: Enable all permissions for a module using the master row checkbox
    Given the user is on the Roles list page
    When the user clicks the role list "Add Role" button
    And the user enters "Full Access Role 003" as the role name
    And the user enters "Role with full DBHandler access" as the role description
    When the user enables all permissions for module "DBHandler"
    Then all permission toggles for module "DBHandler" should be checked
    When the user clicks the role Submit button
    Then the role should be created successfully

  @ROLE_004
  Scenario: Reset button clears role form data
    Given the user is on the Roles list page
    When the user clicks the role list "Add Role" button
    And the user enters "Reset Test Role 004" as the role name
    And the user enters "This will be cleared" as the role description
    And the user enables the "Add" permission for module "Roles"
    And the user clicks the role Reset button
    Then the role form fields should be cleared

  @ROLE_005
  Scenario: Close the Add Role popup without submitting
    Given the user is on the Roles list page
    When the user clicks the role list "Add Role" button
    Then the Add Role popup should be displayed with "Role Information" heading
    When the user closes the Add Role popup
    Then the Add Role popup should not be visible

  @ROLE_006
  Scenario Outline: Add roles with different permission combinations
    Given the user is on the Roles list page
    When the user clicks the role list "Add Role" button
    And the user enters "<roleName>" as the role name
    And the user enters "<roleDescription>" as the role description
    And the user enables the "<permission>" permission for module "<module>"
    And the user clicks the role Submit button
    Then the role should be created successfully

    Examples:
      | roleName          | roleDescription              | module          | permission |
      | AutoRole_1782299   | Read-only survey access      | Survey List      | Edit       |
      | Template Editor     | Manage message templates     | MessageTemplate  | Add        |
