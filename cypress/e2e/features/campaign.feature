@campaign @sms
Feature: Campaign SMS Broadcasts
  As a logged-in user
  I want to manage SMS Broadcasts under the Campaign module
  So that I can schedule and monitor SMS campaigns in PuffinUI

  # ── AUTH NOTE ────────────────────────────────────────────────────────────────
  # Background step is defined ONCE in loginStep.js (shared Cucumber registry).
  # cy.session() caches the SSO token — Aurora login runs only on scenario 1.
  # All subsequent scenarios restore the session cheaply via cy.visit().
  # ─────────────────────────────────────────────────────────────────────────────

  Background:
    Given the user is logged in and on the home page

  @smoke @CAM_001
  Scenario: Navigate to SMS Broadcasts page via Campaign menu
    Given the user is on the SMS Broadcasts page
    Then the SMS Broadcasts list page should be displayed
    And the broadcasts table should be visible with columns "Broadcast Name", "Scheduled Date Time", "Created By"
    And the total broadcast count should be visible

  @smoke @CAM_002
  Scenario: Add Broadcast modal opens with correct default state
    Given the user is on the SMS Broadcasts page
    When the user clicks the Add Broadcast button
    Then the Add Broadcast modal should be displayed
    And the "Regular" broadcast type should be selected by default
    And the "Schedule Now" option should be selected by default

  @smoke @CAM_003
  Scenario: Add a new SMS broadcast with manual recipient entry scheduled now
    Given the user is on the SMS Broadcasts page
    When the user clicks the Add Broadcast button
    And the user enters "QA SMS Broadcast 001" as the broadcast name
    And the user selects "Department_1001" from the broadcast Department dropdown
    And the user selects "KFH" from the broadcast Sender ID dropdown
    And the user enters "96599000001" in the manual recipients field
    And the user selects "TESTING" from the broadcast Template Name dropdown
    And the user clicks the Schedule button
    Then the SMS broadcast should be scheduled successfully

  @CAM_004
  Scenario: Schedule Later option reveals date and time field
    Given the user is on the SMS Broadcasts page
    When the user clicks the Add Broadcast button
    Then the Add Broadcast modal should be displayed
    When the user selects the "Schedule Later" schedule option
    Then the schedule date and time field should be visible

  @CAM_005
  Scenario: Custom broadcast type shows only file upload in recipients section
    Given the user is on the SMS Broadcasts page
    When the user clicks the Add Broadcast button
    Then the Add Broadcast modal should be displayed
    When the user selects the "Custom" broadcast type
    Then the file upload option should be visible in the recipients section
    And the Group dropdown should not be present
    And the Manual Entry field should not be present

  @CAM_006
  Scenario: Close Add Broadcast modal without submitting
    Given the user is on the SMS Broadcasts page
    When the user clicks the Add Broadcast button
    Then the Add Broadcast modal should be displayed
    When the user closes the Add Broadcast modal
    Then the Add Broadcast modal should be closed

  @CAM_007
  Scenario: View broadcast details by clicking on an existing campaign row
    Given the user is on the SMS Broadcasts page
    When the user clicks on the first broadcast in the list
    Then the broadcast detail modal should be displayed
    And the broadcast detail should show the name field
    And the broadcast detail should show the department field
    And the broadcast detail should show the sender ID field
    And the broadcast detail should show the total recipients count

  @CAM_008
  Scenario Outline: Add multiple SMS broadcasts with different names and recipients
    Given the user is on the SMS Broadcasts page
    When the user clicks the Add Broadcast button
    And the user enters "<broadcastName>" as the broadcast name
    And the user selects "Department_1001" from the broadcast Department dropdown
    And the user selects "KFH" from the broadcast Sender ID dropdown
    And the user enters "<recipients>" in the manual recipients field
    And the user selects "TESTING" from the broadcast Template Name dropdown
    And the user clicks the Schedule button
    Then the SMS broadcast should be scheduled successfully

    Examples:
      | broadcastName           | recipients  |
      | QA Broadcast Campaign A | 96599000002 |
      | QA Broadcast Campaign B | 96599000003 |
