/**
 * userStep.js
 * Step definitions for user.feature
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
import UserPage from '../pages/UserPage';

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN — pre-conditions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fast pre-condition for scenarios that test form/list behaviour, not navigation.
 * Session is already restored by Background → loginStep.js, so cy.visit() suffices.
 */
Given('the user is on the Users list page', () => {
  UserPage.visitUsersPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — sidebar navigation (USER_001 only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigate directly to the Users list page.
 * Direct URL navigation is more reliable than sidebar clicking in headless/CI.
 * (Same pattern applied to department.feature, messageTemplate.feature, and role.feature)
 */
When('the user navigates to the Users list page', () => {
  UserPage.visitUsersPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — list page actions
// ─────────────────────────────────────────────────────────────────────────────

When('the user clicks the user list {string} button', (buttonLabel) => {
  if (buttonLabel.toLowerCase() === 'add user') {
    UserPage.clickAddUser();
  } else {
    cy.contains('button', buttonLabel, { matchCase: false })
      .should('be.visible')
      .click();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — panel form interactions
// ─────────────────────────────────────────────────────────────────────────────

When('the user enters {string} as the login name', (loginName) => {
  // Append a short timestamp so repeated test runs don't hit errors for duplicate users.
  // The feature file keeps clean readable names; uniqueness is enforced here.
  const uniqueName = `${loginName}_${Date.now()}`;
  UserPage.enterLoginName(uniqueName);
});

When('the user selects {string} from the Roles dropdown', (roleName) => {
  UserPage.selectRole(roleName);
});

When('the user selects {string} from the Departments dropdown', (departmentName) => {
  UserPage.selectDepartment(departmentName);
});

When('the user selects {string} status for the user', (status) => {
  UserPage.selectStatus(status);
});

When('the user removes the {string} chip from the Roles field', (roleLabel) => {
  UserPage.removeRoleChip(roleLabel);
});

When('the user removes the {string} chip from the Departments field', (departmentLabel) => {
  UserPage.removeDepartmentChip(departmentLabel);
});

When('the user clicks the user Submit button', () => {
  UserPage.clickPanelSubmit();
});

When('the user clicks the user Reset button', () => {
  UserPage.clickPanelReset();
});

When('the user closes the Add User popup', () => {
  UserPage.clickPanelClose();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — list page assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Users list page should be displayed', () => {
  UserPage.assertListPageLoaded();
});

Then(
  'the users table should be visible with columns {string}, {string}, {string}',
  (col1, col2, col3) => {
    UserPage.assertTableColumnsVisible([col1, col2, col3]);
  }
);

Then('the total user count should be visible', () => {
  UserPage.assertTotalCountVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — panel assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Add User popup should be displayed with {string} heading', (heading) => {
  UserPage.assertAddUserPanelDisplayed();
  cy.contains(heading, { matchCase: false }).should('be.visible');
});

Then('the Add User popup should not be visible', () => {
  UserPage.assertPanelNotVisible();
});

Then('{int} role chips should be displayed in the Roles field', (count) => {
  UserPage.assertRoleChipCount(count);
});

Then('{int} department chips should be displayed in the Departments field', (count) => {
  UserPage.assertDepartmentChipCount(count);
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — post-action assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the user should be created successfully', () => {
  UserPage.assertUserCreatedSuccessfully();
});

Then('the user form fields should be cleared', () => {
  UserPage.assertFormCleared();
});
