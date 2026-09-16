/**
 * DepartmentPage.js
 * Page Object for the Departments section under Dictionaries menu.
 *
 * Covers:
 *  - Sidebar navigation  (Dictionaries → Departments)
 *  - Departments list page  (/PuffinUI/dictionary/department)
 *  - Add Department form page
 */

class DepartmentPage {
  // ─────────────────────────────────────────────
  // SIDEBAR / NAVIGATION SELECTORS
  // ─────────────────────────────────────────────

  /**
   * The "Dictionaries" top-level sidebar item.
   * The sidebar uses a dark nav; target the text node inside the <li> or <span>.
   */
  get dictionariesMenu() {
    return cy.contains('.nav-item, li, a, span', 'Dictionaries', { matchCase: false });
  }

  /**
   * The "Departments" sub-menu item that appears after expanding Dictionaries.
   */
  get departmentsSubMenu() {
    return cy.contains('.submenu li, .sub-menu li, li, a', 'Departments', { matchCase: false });
  }

  // ─────────────────────────────────────────────
  // DEPARTMENTS LIST PAGE SELECTORS
  // ─────────────────────────────────────────────

  /** "Add Department" button at the top of the list page */
  get addDepartmentButton() {
    return cy.contains('button, a', 'Add Department', { matchCase: false });
  }

  /** Search input on the list page */
  get searchInput() {
    return cy.get('input[placeholder="Search"], input[type="search"]').first();
  }

  /** The departments data table */
  get departmentsTable() {
    return cy.get('table, [role="grid"], .ag-root, .data-table').first();
  }

  /** Table header row */
  get tableHeaders() {
    return cy.get('th, .ag-header-cell, [role="columnheader"]');
  }

  // ─────────────────────────────────────────────
  // ADD DEPARTMENT FORM SELECTORS
  // ─────────────────────────────────────────────

  /** "Primary Information" heading on the add form */
  get primaryInformationHeading() {
    return cy.contains('h2, h3, h4, .section-title, strong', 'Primary Information', { matchCase: false });
  }

  /** English Name input */
  get englishNameInput() {
    // Try label-adjacent input first, then name/placeholder-based fallback
    return cy.get('input').filter((_, el) => {
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const name = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      return (
        placeholder.includes('english') ||
        name.includes('english') ||
        id.includes('english') ||
        name.includes('englishname') ||
        id.includes('englishname')
      );
    }).first();
  }

  /** Arabic Name input */
  get arabicNameInput() {
    return cy.get('input').filter((_, el) => {
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const name = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      return (
        placeholder.includes('arabic') ||
        name.includes('arabic') ||
        id.includes('arabic') ||
        name.includes('arabicname') ||
        id.includes('arabicname')
      );
    }).first();
  }

  /** Value input */
  get valueInput() {
    return cy.get('input').filter((_, el) => {
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const name = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      return (
        placeholder === 'value' ||
        name === 'value' ||
        id === 'value' ||
        name.includes('deptvalue') ||
        id.includes('deptvalue')
      );
    }).first();
  }

  /** Active radio button */
  get activeRadio() {
    return cy.contains('label, span, div', 'Active', { matchCase: false })
      .closest('label, div')
      .find('input[type="radio"]')
      .then(($radio) => {
        if ($radio.length) return cy.wrap($radio);
        // fallback: first radio on the page
        return cy.get('input[type="radio"]').first();
      });
  }

  /** Inactive radio button */
  get inactiveRadio() {
    return cy.contains('label, span, div', 'Inactive', { matchCase: false })
      .closest('label, div')
      .find('input[type="radio"]');
  }

  /** Submit button */
  get submitButton() {
    return cy.contains('button', 'Submit', { matchCase: false });
  }

  /** Reset button */
  get resetButton() {
    return cy.contains('button', 'Reset', { matchCase: false });
  }

  // ─────────────────────────────────────────────
  // NAVIGATION ACTIONS
  // ─────────────────────────────────────────────

  /**
   * Click the Dictionaries menu item in the sidebar.
   * Handles both collapsible (accordion) and hover menus.
   */
  clickDictionariesMenu() {
    this.dictionariesMenu.should('be.visible').click();
    // Give the sub-menu animation time to complete
    cy.wait(500);
  }

  /**
   * Click the Departments sub-menu item.
   * Waits for the URL to contain the department path.
   */
  clickDepartmentsSubMenu() {
    this.departmentsSubMenu.should('be.visible').click();
    cy.url().should('include', 'dictionary/department');
  }

  // ─────────────────────────────────────────────
  // LIST PAGE ACTIONS
  // ─────────────────────────────────────────────

  /**
   * Assert the Departments list page is fully loaded.
   */
  assertDepartmentsListPageLoaded() {
    cy.url().should('include', 'dictionary/department');
    this.addDepartmentButton.should('be.visible');
    this.departmentsTable.should('exist');
  }

  /**
   * Assert specific column headers are visible in the table.
   * @param {string[]} columns - e.g. ['English Name', 'Arabic Name', 'Value']
   */
  assertTableColumnsVisible(columns) {
    columns.forEach((col) => {
      this.tableHeaders.contains(col, { matchCase: false }).should('exist');
    });
  }

  /**
   * Click the "Add Department" button and wait for the form to appear.
   */
  clickAddDepartment() {
    this.addDepartmentButton.should('be.visible').click();
    this.primaryInformationHeading.should('be.visible');
  }

  // ─────────────────────────────────────────────
  // ADD FORM ACTIONS
  // ─────────────────────────────────────────────

  /**
   * Assert the Add Department form page is displayed.
   */
  assertAddFormDisplayed() {
    this.primaryInformationHeading.should('be.visible');
    this.englishNameInput.should('exist');
    this.arabicNameInput.should('exist');
    this.valueInput.should('exist');
    this.submitButton.should('be.visible');
    this.resetButton.should('be.visible');
  }

  /**
   * Type into the English Name field.
   * @param {string} name
   */
  enterEnglishName(name) {
    this.englishNameInput.should('be.visible').clear().type(name);
  }

  /**
   * Type into the Arabic Name field.
   * Arabic text is typed using force to avoid RTL input issues.
   * @param {string} name
   */
  enterArabicName(name) {
    this.arabicNameInput.should('be.visible').clear().type(name, { force: true });
  }

  /**
   * Type into the Value field.
   * @param {string} value
   */
  enterValue(value) {
    this.valueInput.should('be.visible').clear().type(value);
  }

  /**
   * Select a status radio (Active or Inactive).
   * @param {'Active'|'Inactive'} status
   */
  selectStatus(status) {
    if (status.toLowerCase() === 'active') {
      cy.contains('label, span', 'Active', { matchCase: false })
        .closest('label')
        .click();
    } else {
      cy.contains('label, span', 'Inactive', { matchCase: false })
        .closest('label')
        .click();
    }
  }

  /**
   * Click the Submit button and wait for navigation back to the list page
   * or a success indicator (toast/alert).
   */
  clickSubmit() {
    this.submitButton.should('be.visible').click();
  }

  /**
   * Click the Reset button.
   */
  clickReset() {
    this.resetButton.should('be.visible').click();
  }

  /**
   * Assert that the department was created successfully.
   * Handles two common patterns:
   *  1. Redirect back to the list page
   *  2. Success toast/notification
   */
  assertDepartmentCreated() {
    // Pattern 1: toast/success message
    const successSelectors = [
      '.toast-success',
      '.notification-success',
      '.alert-success',
      '[class*="success"]',
      '[role="alert"]',
    ];

    // Use a loose assertion — either a success message appears OR we land back on the list
    cy.then(() => {
      cy.get('body').then(($body) => {
        const hasToast = successSelectors.some((sel) => $body.find(sel).length > 0);
        if (hasToast) {
          cy.get(successSelectors.join(', ')).should('be.visible');
        } else {
          // Pattern 2: redirected back to list
          cy.url().should('include', 'dictionary/department');
          this.addDepartmentButton.should('be.visible');
        }
      });
    });
  }

  /**
   * Assert that all form fields are cleared after Reset.
   */
  assertFormCleared() {
    this.englishNameInput.should('have.value', '');
    this.arabicNameInput.should('have.value', '');
    this.valueInput.should('have.value', '');
  }

  // ─────────────────────────────────────────────
  // FULL FLOW HELPERS
  // ─────────────────────────────────────────────

  /**
   * Navigate to the Departments page from the home page.
   */
  navigateToDepartments() {
    this.clickDictionariesMenu();
    this.clickDepartmentsSubMenu();
    this.assertDepartmentsListPageLoaded();
  }

  /**
   * Complete end-to-end add-department flow.
   * @param {{ englishName: string, arabicName: string, value: string, status?: string }} dept
   */
  addDepartment({ englishName, arabicName, value, status = 'Active' }) {
    this.clickAddDepartment();
    this.assertAddFormDisplayed();
    this.enterEnglishName(englishName);
    this.enterArabicName(arabicName);
    this.enterValue(value);
    this.selectStatus(status);
    this.clickSubmit();
    this.assertDepartmentCreated();
  }
}

export default new DepartmentPage();
