/**
 * messageTemplateStep.js
 * Step definitions for messageTemplate.feature
 *
 * ── AUTH ARCHITECTURE ────────────────────────────────────────────────────────
 * This file defines ZERO auth steps.
 * "the user is logged in and on the home page" is defined ONCE in loginStep.js
 * and is shared globally by Cucumber's step registry.
 *
 * cy.session() in loginStep.js caches the Aurora SSO token.
 * All scenarios in this file restore that cached session in ~100ms —
 * Aurora is hit exactly once per spec run. No 401 errors.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import MessageTemplatePage from '../pages/MessageTemplatePage';
import { setCurrentPage } from '../utils/pageContext';

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN — pre-conditions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fast pre-condition for scenarios that test form/list behaviour, not navigation.
 * Session is already restored by Background → loginStep.js, so cy.visit() suffices.
 */
Given('the user is on the Message Templates list page', () => {
  setCurrentPage(MessageTemplatePage);
  MessageTemplatePage.visitMessageTemplatesPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — sidebar navigation (MT_001 only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigate to the Message Templates list page.
 * Uses direct URL navigation which is more reliable than sidebar clicking,
 * especially in headless/CI environments where sidebar rendering may vary.
 */
When('the user navigates to the Message Templates list page', () => {
  setCurrentPage(MessageTemplatePage);
  MessageTemplatePage.visitMessageTemplatesPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — list page actions
// ─────────────────────────────────────────────────────────────────────────────

When('the user clicks the Add button', () => {
  MessageTemplatePage.clickAddButton();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — add form interactions
// ─────────────────────────────────────────────────────────────────────────────

When('the user enters {string} as the template name', (templateName) => {
  MessageTemplatePage.enterTemplateName(templateName);
});

When('the user selects {string} from the Department dropdown', (departmentName) => {
  MessageTemplatePage.selectDepartment(departmentName);
});

When('the user selects {string} from the Channel dropdown', (channelName) => {
  MessageTemplatePage.selectChannel(channelName);
});

When('the user enables the {string} language toggle', (language) => {
  MessageTemplatePage.enableLanguageToggle(language);
});

When('the user types {string} in the English message content', (content) => {
  MessageTemplatePage.typeMessageContent(content);
});

When('the user types {string} in the Arabic message content', (content) => {
  MessageTemplatePage.typeMessageContent(content);
});

// 'the user clicks the Submit button' and 'the user clicks the Reset button'
// live in commonStep.js and work for any module via pageContext.js — see
// that file for how the "current page" is tracked.

// ─────────────────────────────────────────────────────────────────────────────
// THEN — list page assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Message Templates list page should be displayed', () => {
  MessageTemplatePage.assertListPageLoaded();
});

Then(
  'the message templates table should be visible with columns {string}, {string}, {string}',
  (col1, col2, col3) => {
    MessageTemplatePage.assertTableColumnsVisible([col1, col2, col3]);
  }
);

Then('the total template count should be visible', () => {
  MessageTemplatePage.assertTotalCountVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — add form assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Add Message Template form should be displayed with {string} heading', (heading) => {
  MessageTemplatePage.assertAddFormDisplayed();
  cy.contains(heading, { matchCase: false }).should('be.visible');
});

Then('the Template Type should be auto-populated as {string}', (expectedType) => {
  MessageTemplatePage.assertTemplateTypePrepopulated(expectedType);
});

Then('the template content section should be visible with language toggles', () => {
  MessageTemplatePage.assertTemplateContentSectionVisible();
});

Then('the {string} and {string} language tab options should be available', (tab1, tab2) => {
  MessageTemplatePage.assertLanguageTabsAvailable();
  cy.contains(tab1, { matchCase: false }).should('exist');
  cy.contains(tab2, { matchCase: false }).should('exist');
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — post-action assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the message template should be created successfully', () => {
  MessageTemplatePage.assertTemplateCreatedSuccessfully();
});

Then('the template form fields should be cleared', () => {
  MessageTemplatePage.assertFormCleared();
});
