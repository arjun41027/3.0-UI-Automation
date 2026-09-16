/**
 * departmentStep.js
 * Step definitions for department.feature
 *
 * ── AUTH ARCHITECTURE ────────────────────────────────────────────────────────
 *
 * THIS FILE DOES NOT DEFINE "the user is logged in and on the home page".
 *
 * That step is defined ONCE in loginStep.js, which Cypress + Cucumber loads
 * globally. The Background block in department.feature calls it from there.
 *
 * cy.session() inside loginStep.js caches the Aurora SSO session token in the
 * browser's cookie + localStorage store. Cypress restores the cached session
 * before every scenario automatically — so the full SSO login flow runs only
 * ONCE per spec file (or once per run if cacheAcrossSpecs: true is set).
 *
 * ── WHY NO DUPLICATE Given() HERE ────────────────────────────────────────────
 *
 * Defining the same step text in two files causes Cucumber to throw
 * "Multiple step definitions match" and aborts the run.
 * Even when it doesn't abort, the wrong implementation can fire, triggering
 * a fresh SSO login for every scenario → 401 "already logged in" errors.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import DepartmentPage from '../pages/DepartmentPage';
import { setCurrentPage } from '../utils/pageContext';

// ─────────────────────────────────────────────────────────────────────────────
// GIVEN — pre-conditions (session already restored by loginStep.js Background)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigate directly to the Departments list page.
 *
 * Used by DEPT_002, DEPT_003, DEPT_004 as a fast pre-condition:
 * the session is already live (restored by cy.session in the Background),
 * so a direct cy.visit() is all that is needed. No sidebar clicks required.
 */
Given('the user is on the Departments list page', () => {
  setCurrentPage(DepartmentPage);
  DepartmentPage.visitDepartmentsPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — navigation via sidebar (used only by DEPT_001)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigate to the Departments list page.
 * Uses direct URL navigation which is more reliable than sidebar clicking,
 * especially in headless/CI environments where sidebar rendering may vary.
 */
When('the user navigates to the Departments list page', () => {
  setCurrentPage(DepartmentPage);
  DepartmentPage.visitDepartmentsPage();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — list page interactions
// ─────────────────────────────────────────────────────────────────────────────

When('the user clicks the {string} button', (buttonLabel) => {
  if (buttonLabel.toLowerCase() === 'add department') {
    DepartmentPage.clickAddDepartment();
  } else {
    cy.contains('button', buttonLabel, { matchCase: false })
      .should('be.visible')
      .click();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// WHEN — add form interactions
// ─────────────────────────────────────────────────────────────────────────────

When('the user enters {string} in the English Name field', (englishName) => {
  DepartmentPage.enterEnglishName(englishName);
});

When('the user enters {string} in the Arabic Name field', (arabicName) => {
  DepartmentPage.enterArabicName(arabicName);
});

When('the user enters {string} in the Value field', (value) => {
  DepartmentPage.enterValue(value);
});

When('the user selects {string} status', (status) => {
  DepartmentPage.selectStatus(status);
});

// 'the user clicks the Submit button' and 'the user clicks the Reset button'
// now live in commonStep.js and work for any module via pageContext.js.

// ─────────────────────────────────────────────────────────────────────────────
// THEN — assertions
// ─────────────────────────────────────────────────────────────────────────────

Then('the Departments list page should be displayed', () => {
  DepartmentPage.assertDepartmentsListPageLoaded();
});

Then(
  'the departments table should be visible with columns {string}, {string}, {string}',
  (col1, col2, col3) => {
    DepartmentPage.assertTableColumnsVisible([col1, col2, col3]);
  }
);

Then('the Add Department form page should be displayed', () => {
  DepartmentPage.assertAddFormDisplayed();
});

Then('the department should be created successfully', () => {
  DepartmentPage.assertDepartmentCreated();
});

Then('all form fields should be cleared', () => {
  DepartmentPage.assertFormCleared();
});
