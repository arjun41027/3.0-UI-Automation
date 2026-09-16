@dictionary @department
Feature: Department Dictionary Management
  As a logged-in user
  I want to manage departments under the Dictionaries menu
  So that I can add and view department records in PuffinUI

  # ─── NOTE ────────────────────────────────────────────────────────────────────
  # The Background step is defined ONCE in loginStep.js (shared step registry).
  # cy.session() caches the SSO token across ALL scenarios in this file,
  # so the full Aurora login only happens on the very first scenario.
  # Scenarios 2-N restore the cached session + navigate directly to the dept page.
  # ─────────────────────────────────────────────────────────────────────────────

  Background:
    Given the user is logged in and on the home page

  @smoke @DEPT_001
  Scenario: Navigate to Departments page via Dictionaries menu
    When the user navigates to the Departments list page
    Then the Departments list page should be displayed
    And the departments table should be visible with columns "English Name", "Arabic Name", "Value"

  @smoke @DEPT_002
  Scenario: Add a new department successfully
    Given the user is on the Departments list page
    When the user clicks the "Add Department" button
    Then the Add Department form page should be displayed
    When the user enters "QA Department" in the English Name field
    And the user enters "قسم الجودة" in the Arabic Name field
    And the user enters "qa-dept-01" in the Value field
    And the user selects "Active" status
    And the user clicks the Submit button
    Then the department should be created successfully

  @DEPT_003
  Scenario: Reset form clears all entered data
    Given the user is on the Departments list page
    When the user clicks the "Add Department" button
    Then the Add Department form page should be displayed
    When the user enters "Test Department" in the English Name field
    And the user enters "قسم تجريبي" in the Arabic Name field
    And the user enters "test-001" in the Value field
    And the user clicks the Reset button
    Then all form fields should be cleared

  @DEPT_004
  Scenario Outline: Add multiple departments with different values
    Given the user is on the Departments list page
    When the user clicks the "Add Department" button
    And the user enters "<englishName>" in the English Name field
    And the user enters "<arabicName>" in the Arabic Name field
    And the user enters "<value>" in the Value field
    And the user selects "<status>" status
    And the user clicks the Submit button
    Then the department should be created successfully

    Examples:
      | englishName   | arabicName    | value  | status   |
      | Department_1001 | قسم الاختبار   | dept-01 | Active   |
      | HR Department | قسم الموارد   | hr-01  | Active   |
      | IT Department | قسم تقنية     | it-02  | Active   |
      | Finance Dept  | قسم المالية   | fin-03 | Inactive |
