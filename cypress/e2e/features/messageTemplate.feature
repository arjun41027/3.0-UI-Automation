@dictionary @messageTemplate
Feature: Message Template Dictionary Management
  As a logged-in user
  I want to manage Message Templates under the Dictionaries menu
  So that I can create and view SMS templates in PuffinUI

  # ── AUTH NOTE ────────────────────────────────────────────────────────────────
  # Background step is defined ONCE in loginStep.js (shared Cucumber registry).
  # cy.session() caches the SSO token — Aurora login runs only on scenario 1.
  # All subsequent scenarios restore the session cheaply via cy.visit().
  # ─────────────────────────────────────────────────────────────────────────────

  Background:
    Given the user is logged in and on the home page

  @smoke @MT_001
  Scenario: Navigate to Message Templates list page via Dictionaries menu
    When the user navigates to the Message Templates list page
    Then the Message Templates list page should be displayed
    And the message templates table should be visible with columns "Template Name", "Template Type", "Created By"
    And the total template count should be visible

  @smoke @MT_002
  Scenario: Add a new SMS message template successfully
    Given the user is on the Message Templates list page
    When the user clicks the Add button
    Then the Add Message Template form should be displayed with "Template Details" heading
    When the user enters "QA Automation Template" as the template name
    And the user selects "Department_1001" from the Department dropdown
    And the user selects "SMS" from the Channel dropdown
    Then the Template Type should be auto-populated as "Text"
    And the template content section should be visible with language toggles
    When the user enables the "English" language toggle
    And the user types "Hello ##CustomerName##, your survey link is ##SurveyLink##" in the English message content
    And the user clicks the Submit button
    Then the message template should be created successfully

  @MT_003
  Scenario: Template content section expands after selecting Channel
    Given the user is on the Message Templates list page
    When the user clicks the Add button
    Then the Add Message Template form should be displayed with "Template Details" heading
    When the user enters "Content Section Test" as the template name
    And the user selects "Department_1001" from the Department dropdown
    And the user selects "SMS" from the Channel dropdown
    Then the template content section should be visible with language toggles
    And the "English" and "Arabic" language tab options should be available

  @MT_004
  Scenario: Reset button clears all entered form data
    Given the user is on the Message Templates list page
    When the user clicks the Add button
    And the user enters "Reset Test Template" as the template name
    And the user selects "Department_1001" from the Department dropdown
    And the user selects "SMS" from the Channel dropdown
    And the user clicks the Reset button
    Then the template form fields should be cleared

  @MT_005
  Scenario Outline: Add multiple SMS templates with different departments
    Given the user is on the Message Templates list page
    When the user clicks the Add button
    And the user enters "<templateName>" as the template name
    And the user selects "<department>" from the Department dropdown
    And the user selects "SMS" from the Channel dropdown
    And the user enables the "English" language toggle
    And the user types "<messageContent>" in the English message content
    And the user clicks the Submit button
    Then the message template should be created successfully

    Examples:
      | templateName          | department      | messageContent                              |
      | HR Welcome Template   | Department_1001 | Welcome to HR. Your ID is ##EmployeeID##    |
      | IT Alert Template     | Department_1001 | System alert: ##AlertMessage##              |

  @smoke @MT_006
  Scenario: Add a new SMS message template with Arabic content
    Given the user is on the Message Templates list page
    When the user clicks the Add button
    Then the Add Message Template form should be displayed with "Template Details" heading
    When the user enters "قالب أتمتة الجودة" as the template name
    And the user selects "Department_1001" from the Department dropdown
    And the user selects "SMS" from the Channel dropdown
    Then the Template Type should be auto-populated as "Text"
    And the template content section should be visible with language toggles
    When the user enables the "Arabic" language toggle
    And the user types "مرحبا ##CustomerName##، رابط الاستبيان الخاص بك هو ##SurveyLink##" in the Arabic message content
    And the user clicks the Submit button
    Then the message template should be created successfully

  @MT_007
  Scenario: Add a new SMS template with both English and Arabic content
    Given the user is on the Message Templates list page
    When the user clicks the Add button
    Then the Add Message Template form should be displayed with "Template Details" heading
    When the user enters "Bilingual SMS Template" as the template name
    And the user selects "Department_1001" from the Department dropdown
    And the user selects "SMS" from the Channel dropdown
    Then the Template Type should be auto-populated as "Text"
    And the template content section should be visible with language toggles
    When the user enables the "English" language toggle
    And the user types "Hello ##CustomerName##, your survey is ##SurveyLink##" in the English message content
    When the user enables the "Arabic" language toggle
    And the user types "مرحبا ##CustomerName##، رابط الاستبيان ##SurveyLink##" in the Arabic message content
    And the user clicks the Submit button
    Then the message template should be created successfully

  @MT_008
  Scenario Outline: Add multiple SMS templates with Arabic content
    Given the user is on the Message Templates list page
    When the user clicks the Add button
    And the user enters "<templateName>" as the template name
    And the user selects "<department>" from the Department dropdown
    And the user selects "SMS" from the Channel dropdown
    And the user enables the "Arabic" language toggle
    And the user types "<arabicContent>" in the Arabic message content
    And the user clicks the Submit button
    Then the message template should be created successfully

    Examples:
      | templateName            | department      | arabicContent                                   |
      | قالب ترحيب الموارد      | Department_1001 | مرحبا بك في الموارد البشرية. رقمك ##EmployeeID## |
      | قالب تنبيه تقنية المعلومات | Department_1001 | تنبيه النظام: ##AlertMessage##                  |
