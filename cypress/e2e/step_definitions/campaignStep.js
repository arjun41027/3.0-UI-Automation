/**
 * campaignStep.js
 * Step definitions for campaign.feature (Campaign SMS Broadcasts module)
 *
 * ── AUTH ARCHITECTURE ────────────────────────────────────────────────────────
 * This file defines ZERO auth steps.
 * "the user is logged in and on the home page" is defined ONCE in loginStep.js
 * and is shared globally by Cucumber's step registry.
 *
 * cy.session() in loginStep.js caches the Aurora SSO token.
 * All scenarios restore that cached session cheaply — Aurora is hit once per run.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import CampaignPage from '../pages/CampaignPage';
import { setCurrentPage } from '../utils/pageContext';

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN — pre-conditions
// ─────────────────────────────────────────────────────────────────────────────

Given('the user is on the SMS Broadcasts page', () => {
  setCurrentPage(CampaignPage);
  CampaignPage.visitSmsBroadcastsPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — sidebar navigation (CAM_001 only)
// ─────────────────────────────────────────────────────────────────────────────

When('the user navigates to the SMS Broadcasts page', () => {
  setCurrentPage(CampaignPage);
  CampaignPage.clickCampaignMenu();
  CampaignPage.clickSmsBroadcastsSubMenu();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — list page actions
// ─────────────────────────────────────────────────────────────────────────────

When('the user clicks the Add Broadcast button', () => {
  CampaignPage.clickAddBroadcastButton();
});

When('the user clicks on the first broadcast in the list', () => {
  CampaignPage.clickFirstBroadcastRow();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — modal type / schedule option selection
// ─────────────────────────────────────────────────────────────────────────────

When('the user selects the {string} broadcast type', (broadcastType) => {
  CampaignPage.selectBroadcastType(broadcastType);
});

When('the user selects the {string} schedule option', (scheduleOption) => {
  CampaignPage.selectScheduleOption(scheduleOption);
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — broadcast details form interactions
// ─────────────────────────────────────────────────────────────────────────────

When('the user enters {string} as the broadcast name', (broadcastName) => {
  CampaignPage.enterBroadcastName(broadcastName);
});

When('the user selects {string} from the broadcast Department dropdown', (departmentName) => {
  CampaignPage.selectDepartment(departmentName);
});

When('the user selects {string} from the broadcast Sender ID dropdown', (senderId) => {
  CampaignPage.selectSenderId(senderId);
});

When('the user enters {string} in the manual recipients field', (recipients) => {
  CampaignPage.enterManualRecipients(recipients);
});

When('the user selects {string} from the broadcast Template Name dropdown', (templateName) => {
  CampaignPage.selectTemplateName(templateName);
});

When('the user clicks the Schedule button', () => {
  CampaignPage.clickScheduleButton();
});

When('the user closes the Add Broadcast modal', () => {
  CampaignPage.closeModal();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — list page assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the SMS Broadcasts list page should be displayed', () => {
  CampaignPage.assertListPageLoaded();
});

Then(
  'the broadcasts table should be visible with columns {string}, {string}, {string}',
  (col1, col2, col3) => {
    CampaignPage.assertTableColumnsVisible([col1, col2, col3]);
  }
);

Then('the total broadcast count should be visible', () => {
  CampaignPage.assertTotalCountVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — Add Broadcast modal assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Add Broadcast modal should be displayed', () => {
  CampaignPage.assertModalDisplayed();
});

Then('the Add Broadcast modal should be closed', () => {
  CampaignPage.assertModalClosed();
});

Then('the {string} broadcast type should be selected by default', (broadcastType) => {
  CampaignPage.assertRegularTypeSelectedByDefault();
});

Then('the {string} option should be selected by default', (scheduleOption) => {
  CampaignPage.assertScheduleNowSelectedByDefault();
});

Then('the schedule date and time field should be visible', () => {
  CampaignPage.assertScheduleDateTimeVisible();
});

Then('the file upload option should be visible in the recipients section', () => {
  CampaignPage.assertFileUploadVisible();
});

Then('the Group dropdown should not be present', () => {
  CampaignPage.assertGroupDropdownNotPresent();
});

Then('the Manual Entry field should not be present', () => {
  CampaignPage.assertManualEntryNotPresent();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — post-action assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the SMS broadcast should be scheduled successfully', () => {
  CampaignPage.assertBroadcastScheduledSuccessfully();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — broadcast detail view assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the broadcast detail modal should be displayed', () => {
  CampaignPage.assertDetailModalDisplayed();
});

Then('the broadcast detail should show the name field', () => {
  CampaignPage.assertDetailNameFieldVisible();
});

Then('the broadcast detail should show the department field', () => {
  CampaignPage.assertDetailDepartmentFieldVisible();
});

Then('the broadcast detail should show the sender ID field', () => {
  CampaignPage.assertDetailSenderIdFieldVisible();
});

Then('the broadcast detail should show the total recipients count', () => {
  CampaignPage.assertDetailTotalRecipientsVisible();
});
