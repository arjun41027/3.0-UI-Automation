/**
 * DepartmentPage.js
 * Page Object for the Departments section under Dictionaries menu.
 *
 * Responsibilities:
 *  - Sidebar navigation  (Dictionaries → Departments)
 *  - Departments list page  (/PuffinUI/dictionary/department/)
 *  - Add Department form
 *
 * Design principles:
 *  - No auth / session logic here — that lives exclusively in loginStep.js
 *  - Every action navigates deterministically; no arbitrary cy.wait() calls
 *  - All navigation methods accept an optional timeout so callers can tune for CI
 */

const DEPT_LIST_URL = '/PuffinUI/dictionary/department/';
const NAV_TIMEOUT   = 15000; // ms — how long to wait for URL/element after a click

class DepartmentPage {

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — sidebar
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Top-level "Dictionaries" sidebar entry.
   * Targets the narrowest reliable ancestor that contains only this text.
   */
  get dictionariesMenu() {
    // Try multiple selector strategies in order of preference
    return cy.get('body', { timeout: 5000 }).then(($body) => {
      // Strategy 1: Exact href match
      if ($body.find('a[href*="/dictionary"]:visible').length) {
        return cy.get('a[href*="/dictionary"]:visible').first();
      }
      // Strategy 2: Any element containing "Dictionaries" text (case-insensitive)
      if ($body.find('*:contains("Dictionaries"):visible').length) {
        return cy.contains('*', 'Dictionaries', { matchCase: false }).first();
      }
      // Strategy 3: Fallback to nested search in any container
      return cy.get('[role="navigation"], .sidebar, nav, aside')
        .first()
        .contains('Dictionaries', { matchCase: false });
    });
  }

  /**
   * "Departments" sub-menu link — only visible after the Dictionaries
   * accordion has been expanded.
   */
  get departmentsSubMenu() {
    return cy.get('body', { timeout: 5000 }).then(($body) => {
      // Strategy 1: Direct href match
      if ($body.find('a[href*="/dictionary/department"]:visible').length) {
        return cy.get('a[href*="/dictionary/department"]:visible').first();
      }
      // Strategy 2: Text match in any visible element
      if ($body.find('*:contains("Departments"):visible').length) {
        return cy.contains('*', 'Departments', { matchCase: false }).first();
      }
      // Strategy 3: Fallback to nested search
      return cy.get('[role="navigation"], .sidebar, nav, aside')
        .first()
        .contains('Departments', { matchCase: false });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — list page
  // ═══════════════════════════════════════════════════════════════════════════

  get addDepartmentButton() {
    return cy.contains('button', 'Add Department', { matchCase: false });
  }

  get searchInput() {
    return cy.get('input[placeholder="Search"], input[type="search"]').first();
  }

  get departmentsTable() {
    // Support both classic <table> and virtualised grid libraries used in PuffinUI
    return cy.get('table, [role="grid"], .ag-root-wrapper, .data-table').first();
  }

  get tableHeaders() {
    return cy.get('th, .ag-header-cell-text, [role="columnheader"]');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — add form
  // ═══════════════════════════════════════════════════════════════════════════

  get primaryInformationHeading() {
    return cy.contains('Primary Information', { matchCase: false });
  }

  /**
   * English Name input.
   * Tries common attribute patterns; update the winning selector once
   * you confirm the real DOM attribute from DevTools.
   */
  get englishNameInput() {
    return cy.get('input').filter((_, el) => {
      const attrs = [
        el.getAttribute('placeholder') || '',
        el.getAttribute('name')        || '',
        el.getAttribute('id')          || '',
        el.getAttribute('data-testid') || '',
      ].map((v) => v.toLowerCase());
      return attrs.some((a) => a.includes('english'));
    }).first();
  }

  /** Arabic Name input — same multi-attribute strategy. */
  get arabicNameInput() {
    return cy.get('input').filter((_, el) => {
      const attrs = [
        el.getAttribute('placeholder') || '',
        el.getAttribute('name')        || '',
        el.getAttribute('id')          || '',
        el.getAttribute('data-testid') || '',
      ].map((v) => v.toLowerCase());
      return attrs.some((a) => a.includes('arabic'));
    }).first();
  }

  /** Value input. */
  get valueInput() {
    return cy.get('input').filter((_, el) => {
      const attrs = [
        el.getAttribute('placeholder') || '',
        el.getAttribute('name')        || '',
        el.getAttribute('id')          || '',
        el.getAttribute('data-testid') || '',
      ].map((v) => v.toLowerCase());
      // Match "value" exactly to avoid matching "englishvalue" etc.
      return attrs.some((a) => a === 'value' || a.endsWith('value'));
    }).first();
  }

  get submitButton() {
    return cy.contains('button', 'Submit', { matchCase: false });
  }

  get resetButton() {
    return cy.contains('button', 'Reset', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Navigate directly to the Departments list using cy.visit().
   *
   * This is the preferred approach inside Background/Given steps because:
   *  - It is deterministic — no dependency on sidebar state.
   *  - It is fast — no click chains to animate.
   *  - It still exercises the full authenticated route guard.
   *
   * Use clickDictionariesMenu() + clickDepartmentsSubMenu() ONLY in scenarios
   * that explicitly test the sidebar navigation itself (DEPT_001).
   */
  visitDepartmentsPage() {
    cy.visit(DEPT_LIST_URL, { failOnStatusCode: false });
    // If server returns a brief error page before React boot, reload once
    cy.get('body').then(($body) => {
      const t = $body.text() || '';
      if (t.includes('403') || t.includes('Forbidden') || t.includes('Access Denied') ||
          $body.find('[class*="error-page"], [class*="errorPage"]').length > 0) {
        cy.reload({ failOnStatusCode: false });
      }
    });
    this.assertDepartmentsListPageLoaded();
  }

  /**
   * Click the "Dictionaries" accordion item in the sidebar.
   * Skips the click if the sub-menu link is already visible.
   */
  clickDictionariesMenu() {
    // First ensure sidebar is visible or accessible
    cy.get('body').should('exist');
    
    cy.get('body').then(($body) => {
      const subLinkAlreadyVisible =
        $body.find('a[href*="/dictionary/department"]:visible').length > 0;

      if (subLinkAlreadyVisible) {
        // Already expanded — nothing to do.
        return;
      }

      // Try to find and click the Dictionaries menu
      this.dictionariesMenu.should('exist').then(($el) => {
        cy.wrap($el).scrollIntoView({ force: true }).click({ force: true });
      });
    });

    // Wait for sub-menu to appear with extended timeout
    cy.get('body', { timeout: NAV_TIMEOUT }).should('exist');
    cy.get('a[href*="/dictionary/department"], *:contains("Departments")', { timeout: NAV_TIMEOUT })
      .first()
      .should('exist');
  }

  /**
   * Click the "Departments" sub-menu link.
   * Always asserts the URL changed to avoid false positives.
   */
  clickDepartmentsSubMenu() {
    this.departmentsSubMenu.then(($el) => {
      cy.wrap($el).scrollIntoView().click({ force: true });
    });
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'dictionary/department');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PAGE ASSERTIONS & ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertDepartmentsListPageLoaded() {
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'dictionary/department');
    this.addDepartmentButton.should('be.visible');
    this.departmentsTable.should('exist');
  }

  /**
   * Assert that the specified column headers exist in the table.
   * @param {string[]} columns
   */
  assertTableColumnsVisible(columns) {
    columns.forEach((col) => {
      this.tableHeaders.contains(col, { matchCase: false }).should('be.visible');
    });
  }

  /**
   * Click "Add Department" and wait for the form heading to appear.
   */
  clickAddDepartment() {
    this.addDepartmentButton.should('be.visible').click();
    this.primaryInformationHeading.should('be.visible');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD FORM ASSERTIONS & ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertAddFormDisplayed() {
    this.primaryInformationHeading.should('be.visible');
    this.englishNameInput.should('exist');
    this.arabicNameInput.should('exist');
    this.valueInput.should('exist');
    this.submitButton.should('be.visible');
    this.resetButton.should('be.visible');
  }

  enterEnglishName(name) {
    this.englishNameInput.should('be.visible').clear().type(name);
  }

  /**
   * RTL inputs sometimes need `force: true` to receive synthetic keystrokes.
   */
  enterArabicName(name) {
    this.arabicNameInput.should('be.visible').clear().type(name, { force: true });
  }

  enterValue(value) {
    this.valueInput.should('be.visible').clear().type(value);
  }

  /**
   * Select Active or Inactive radio.
   * Clicks the <label> so the hidden radio underneath receives the change event.
   */
  selectStatus(status) {
    const label = status.toLowerCase() === 'active' ? 'Active' : 'Inactive';
    cy.contains('label', label, { matchCase: false }).click();
  }

  clickSubmit() {
    this.submitButton.should('be.visible').click();
  }

  clickReset() {
    this.resetButton.should('be.visible').click();
  }

  /**
   * Assert a successful department creation.
   *
   * PuffinUI uses one of two patterns after submit:
   *   A) Shows a success toast/alert and stays on the form.
   *   B) Redirects back to the list page.
   *
   * We check for (A) first with a short timeout; fall through to (B) if absent.
   */
  assertDepartmentCreated() {
    const TOAST_TIMEOUT = 5000;
    const TOAST_SEL     = '.toast-success, .notification-success, .alert-success, [class*="success"][role="alert"]';

    cy.get('body').then(($body) => {
      if ($body.find(TOAST_SEL).length) {
        cy.get(TOAST_SEL, { timeout: TOAST_TIMEOUT }).should('be.visible');
      } else {
        // Redirect pattern — confirm we are back on the list
        cy.url({ timeout: NAV_TIMEOUT }).should('include', 'dictionary/department');
        this.addDepartmentButton.should('be.visible');
      }
    });
  }

  assertFormCleared() {
    this.englishNameInput.should('have.value', '');
    this.arabicNameInput.should('have.value', '');
    this.valueInput.should('have.value', '');
  }
}

export default new DepartmentPage();
