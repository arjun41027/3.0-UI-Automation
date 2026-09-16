/**
 * roleStep.js
 * Step definitions for role.feature
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
import RolePage from '../pages/RolePage';

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN — pre-conditions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fast pre-condition for scenarios that test form/list behaviour, not navigation.
 * Session is already restored by Background → loginStep.js, so cy.visit() suffices.
 */
Given('the user is on the Roles list page', () => {
  RolePage.visitRolesPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — sidebar navigation (ROLE_001 only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigate directly to the Roles list page.
 * Direct URL navigation is more reliable than sidebar clicking in headless/CI.
 * (Same pattern applied to department.feature and messageTemplate.feature)
 */
When('the user navigates to the Roles list page', () => {
  RolePage.visitRolesPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — list page actions
// ─────────────────────────────────────────────────────────────────────────────

When('the user clicks the role list {string} button', (buttonLabel) => {
  if (buttonLabel.toLowerCase() === 'add role') {
    RolePage.clickAddRole();
  } else {
    cy.contains('button', buttonLabel, { matchCase: false })
      .should('be.visible')
      .click();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — popup form interactions
// ─────────────────────────────────────────────────────────────────────────────

When('the user enters {string} as the role name', (roleName) => {
  // Append a short timestamp so repeated test runs don't hit POST 400 (duplicate name).
  // The feature file keeps clean readable names; uniqueness is enforced here.
  const uniqueName = `${roleName}_${Date.now()}`;
  RolePage.enterRoleName(uniqueName);
});

When('the user enters {string} as the role description', (roleDescription) => {
  RolePage.enterRoleDescription(roleDescription);
});

When('the user selects {string} status for the role', (status) => {
  RolePage.selectStatus(status);
});

When('the user enables the {string} permission for module {string}', (permission, moduleName) => {
  RolePage.enablePermissionForModule(permission, moduleName);
});

When('the user enables all permissions for module {string}', (moduleName) => {
  RolePage.enableAllPermissionsForModule(moduleName);
  // Small wait to allow React to settle after bulk permission change
  cy.wait(300);
});

When('the user clicks the role Submit button', () => {
  RolePage.clickModalSubmit();
});

When('the user clicks the role Reset button', () => {
  RolePage.clickModalReset();
});

When('the user closes the Add Role popup', () => {
  RolePage.clickModalClose();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — list page assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Roles list page should be displayed', () => {
  RolePage.assertListPageLoaded();
});

Then(
  'the roles table should be visible with columns {string}, {string}, {string}',
  (col1, col2, col3) => {
    RolePage.assertTableColumnsVisible([col1, col2, col3]);
  }
);

Then('the total role count should be visible', () => {
  RolePage.assertTotalCountVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — popup assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Add Role popup should be displayed with {string} heading', (heading) => {
  RolePage.assertAddRolePopupDisplayed();
  cy.contains(heading, { matchCase: false }).should('be.visible');
});

Then('the Add Role popup should not be visible', () => {
  RolePage.assertPopupNotVisible();
});

Then('the Role Permissions section should be visible', () => {
  RolePage.assertPermissionsSectionVisible();
});

Then('all permission toggles for module {string} should be checked', (moduleName) => {
  RolePage.assertAllPermissionsCheckedForModule(moduleName);
});

// ─────────────────────────────────────────────────────────────────────────────
// THEN — post-action assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the role should be created successfully', () => {
  RolePage.assertRoleCreatedSuccessfully();
});

Then('the role form fields should be cleared', () => {
  RolePage.assertFormCleared();
});
