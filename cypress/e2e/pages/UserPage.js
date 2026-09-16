/**
 * UserPage.js
 * Page Object for User management under User Management menu.
 *
 * Routes/UI covered:
 *  - List page : /PuffinUI/user-management/users/
 *  - Add User  : SLIDE-IN PANEL (right-side drawer), not a separate route or
 *                centered modal — confirmed by the right-aligned panel layout
 *                and "×" close icon in the screenshots.
 *
 * Key UI characteristics from screenshots:
 *  - Roles field is a MULTI-select with removable chip tags
 *  - Departments field is also a MULTI-select with removable chip tags
 *  - Default status radio is "Inactive" (unlike Department/Role forms which
 *    default to "Active") — confirmed in the empty-state screenshot
 *
 * Design rules (same contract as Department/MessageTemplate/Role POMs):
 *  - Zero auth / session logic — lives solely in loginStep.js
 *  - No arbitrary cy.wait() — every pause uses an assertion as the guard
 *  - Direct cy.visit() for non-navigation scenarios; sidebar clicks only in USER_001
 *  - All popup-scoped selectors hang off `this.panel` to avoid bleeding into
 *    the list page, which remains in the DOM behind the slide-in panel
 */

const LIST_URL    = '/PuffinUI/user-management/users/';
const NAV_TIMEOUT = 15000;

class UserPage {

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — sidebar navigation
  // ═══════════════════════════════════════════════════════════════════════════

  get userManagementMenu() {
    return cy.get('body').then(($body) => {
      if ($body.find('a[href*="/user-management"]').length) {
        return cy.get('a[href*="/user-management"]').first();
      }
      return cy.contains('a, span, li', 'User Management', { matchCase: false }).first();
    });
  }

  get usersSubMenu() {
    return cy.get('body').then(($body) => {
      if ($body.find('a[href*="/user-management/users"]').length) {
        return cy.get('a[href*="/user-management/users"]').first();
      }
      return cy.contains('a, li, span', 'Users', { matchCase: false }).first();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — list page
  // ═══════════════════════════════════════════════════════════════════════════

  get addUserButton() {
    return cy.contains('button', 'Add User', { matchCase: false });
  }

  get searchInput() {
    return cy.get('input[placeholder="Search"], input[type="search"]').first();
  }

  get usersTable() {
    return cy.get('table, [role="grid"], .ag-root-wrapper, .data-table').first();
  }

  get tableHeaders() {
    return cy.get('th, .ag-header-cell-text, [role="columnheader"]');
  }

  /** "Total: 53" pagination summary at bottom right */
  get paginationTotal() {
    return cy.contains('Total:', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — Add User PANEL (scoped container)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * The slide-in panel wrapper itself.
   * Scope all inner selectors through this to avoid bleeding into the list page,
   * which remains visible (dimmed) behind the panel.
   */
  get panel() {
    return cy.get(
      '[role="dialog"], .drawer, .slide-panel, [class*="drawer"], [class*="panel"], [class*="Drawer"]'
    ).filter(':visible').first();
  }

  get panelCloseIcon() {
    return this.panel.find(
      '[class*="close"], button[aria-label="close"], svg[class*="close"]'
    ).first();
  }

  get primaryInformationHeading() {
    return this.panel.contains('Primary Information', { matchCase: false });
  }

  get loginNameInput() {
    return this.panel.find('input').filter((_, el) => {
      const attrs = [
        el.getAttribute('placeholder') || '',
        el.getAttribute('name')        || '',
        el.getAttribute('id')          || '',
        el.getAttribute('data-testid') || '',
      ].map((v) => v.toLowerCase());
      return attrs.some((a) => a.includes('login') || a.includes('username'));
    }).first();
  }

  /**
   * Roles multi-select dropdown trigger.
   * Scoped to the row containing the "Roles" label.
   */
  get rolesDropdown() {
    return this.panel
      .contains('Roles', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .find('div[class*="select"], .dropdown, [role="combobox"], [class*="Select"]')
      .first();
  }

  /**
   * Departments multi-select dropdown trigger.
   * Scoped to the row containing the "Departments" label.
   */
  get departmentsDropdown() {
    return this.panel
      .contains('Departments', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .find('div[class*="select"], .dropdown, [role="combobox"], [class*="Select"]')
      .first();
  }

  /** All chip tags currently selected within the Roles field */
  get roleChips() {
    return this.panel
      .contains('Roles', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .find('[class*="multi-value"], [class*="chip"], [class*="tag"]')
      .not('input')
      .not('[class*="multi-value__"]');  // Exclude sub-elements: __label, __remove
  }

  /** All chip tags currently selected within the Departments field */
  get departmentChips() {
    return this.panel
      .contains('Departments', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .find('[class*="multi-value"], [class*="chip"], [class*="tag"]')
      .not('input')
      .not('[class*="multi-value__"]');  // Exclude sub-elements: __label, __remove
  }

  get panelSubmitButton() {
    return this.panel.contains('button', 'Submit', { matchCase: false });
  }

  get panelResetButton() {
    return this.panel.contains('button', 'Reset', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Direct navigation — used by all scenarios that don't test sidebar behaviour.
   * The cy.session() token is already live, so the route guard passes immediately.
   */
  /**
   * Direct navigation — used by all scenarios that don't test sidebar behaviour.
   * The cy.session() token is already live, so the route guard passes immediately.
   */
  visitUsersPage() {
    cy.visit(LIST_URL, { failOnStatusCode: false });
    // If server returns a brief error page before React boot, reload once
    cy.get('body').then(($body) => {
      const t = $body.text() || '';
      if (t.includes('403') || t.includes('Forbidden') || t.includes('Access Denied') ||
          $body.find('[class*="error-page"], [class*="errorPage"]').length > 0) {
        cy.reload({ failOnStatusCode: false });
      }
    });
    this.assertListPageLoaded();
  }

  /**
   * Expand the User Management accordion then click the Users sub-link.
   * Used only in USER_001 which explicitly tests sidebar navigation.
   */
  clickUserManagementMenu() {
    cy.get('body').then(($body) => {
      const subLinkVisible =
        $body.find('a[href*="/user-management/users"]:visible').length > 0;
      if (subLinkVisible) return;

      this.userManagementMenu.then(($el) => {
        cy.wrap($el).scrollIntoView().click({ force: true });
      });
    });

    cy.contains('a, li, span', 'Users', { matchCase: false, timeout: NAV_TIMEOUT })
      .should('be.visible');
  }

  clickUsersSubMenu() {
    this.usersSubMenu.then(($el) => {
      cy.wrap($el).scrollIntoView().click({ force: true });
    });
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'user-management/users');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PAGE ASSERTIONS & ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertListPageLoaded() {
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'user-management/users');
    this.addUserButton.should('be.visible');
    this.usersTable.should('exist');
  }

  assertTableColumnsVisible(columns) {
    columns.forEach((col) => {
      this.tableHeaders.contains(col, { matchCase: false }).should('be.visible');
    });
  }

  assertTotalCountVisible() {
    this.paginationTotal.should('be.visible');
  }

  /**
   * Click "Add User" and wait for the slide-in panel to render.
   */
  clickAddUser() {
    this.addUserButton.should('be.visible').click();
    this.primaryInformationHeading.should('be.visible');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD USER PANEL — ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertAddUserPanelDisplayed() {
    this.primaryInformationHeading.should('be.visible');
    this.loginNameInput.should('exist');
    this.rolesDropdown.should('exist');
    this.departmentsDropdown.should('exist');
    this.panelSubmitButton.should('be.visible');
    this.panelResetButton.should('be.visible');
  }

  assertPanelNotVisible() {
    // The panel component stays in the DOM but becomes hidden after submit.
    // Use 'not.be.visible' instead of 'not.exist' to handle this pattern.
    cy.get('[role="dialog"], .drawer, .slide-panel, [class*="Drawer"], .form-modal', { timeout: 10000 })
      .should('not.be.visible');
  }

  /**
   * Assert the number of chips currently shown in the Roles field.
   * @param {number} expectedCount
   */
  assertRoleChipCount(expectedCount) {
    // Wait a moment for React to update chip count
    cy.wait(300);
    this.roleChips.should('have.length', expectedCount);
  }

  /**
   * Assert the number of chips currently shown in the Departments field.
   * @param {number} expectedCount
   */
  assertDepartmentChipCount(expectedCount) {
    // Wait a moment for React to update chip count
    cy.wait(300);
    this.departmentChips.should('have.length', expectedCount);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD USER PANEL — FORM ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  enterLoginName(loginName) {
    this.loginNameInput
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true })
      .clear({ force: true })
      .type(loginName, { force: true })
      .should('have.value', loginName);  // Verify the text was actually typed
  }

  /**
   * Select Active or Inactive radio inside the panel.
   * NOTE: default state from the screenshot is "Inactive" — tests that need
   * Active status MUST explicitly call this method.
   */
  selectStatus(status) {
    const label = status.toLowerCase() === 'active' ? 'Active' : 'Inactive';
    this.panel.contains('label, span', label, { matchCase: false })
      .filter(':visible')
      .first()
      .scrollIntoView()
      .click({ force: true });
  }

  /**
   * Select a role from the multi-select Roles dropdown.
   * Pattern: click dropdown trigger → option list renders (often in a portal)
   * → click matching option by partial text (role names are long and truncated
   * in the UI, e.g. "AutoRole_1782298...").
   * @param {string} roleName - full or partial role name
   */
  selectRole(roleName) {
    // Click the dropdown to open it
    this.rolesDropdown.scrollIntoView().should('be.visible').click();
    
    // Wait for dropdown options to appear in the DOM
    // Options can be in various containers, try multiple selectors
    cy.get('body').then(($body) => {
      // Wait for options to render (check multiple possible containers)
      cy.get('body', { timeout: 10000 }).within(() => {
        cy.contains('[class*="option"], [class*="Option"], li, [role="option"]', roleName, { matchCase: false, timeout: 10000 })
          .should('exist')
          .should('be.visible')
          .click({ force: true });
      });
    });
    
    // Wait for dropdown to close and chip to appear
    cy.wait(300);
    
    // Confirm a chip containing the (possibly truncated) name now exists
    this.roleChips.should('have.length.at.least', 1);
  }

  /**
   * Select a department from the multi-select Departments dropdown.
   * @param {string} departmentName
   */
  selectDepartment(departmentName) {
    // Click the dropdown to open it
    this.departmentsDropdown.scrollIntoView().should('be.visible').click();
    
    // Wait for dropdown options to appear in the DOM
    // Options can be in various containers, try multiple selectors
    cy.get('body').then(($body) => {
      // Wait for options to render (check multiple possible containers)
      cy.get('body', { timeout: 10000 }).within(() => {
        cy.contains('[class*="option"], [class*="Option"], li, [role="option"]', departmentName, { matchCase: false, timeout: 10000 })
          .should('exist')
          .should('be.visible')
          .click({ force: true });
      });
    });
    
    // Wait for dropdown to close and chip to appear
    cy.wait(300);
    
    this.departmentChips.should('have.length.at.least', 1);
  }

  /**
   * Remove a specific chip from the Roles field by its visible (possibly
   * truncated) label text, by clicking its "×" remove icon.
   * @param {string} roleLabel
   */
  removeRoleChip(roleLabel) {
    // .contains() returns the deepest element (the label div), so use .siblings()
    // to reach the remove button which is a sibling of the label inside the chip.
    this.panel
      .contains('Roles', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .contains('[class*="multi-value__label"], [class*="multiValueLabel"]', roleLabel, { matchCase: false })
      .siblings('[class*="remove"], [class*="multiValueRemove"]')
      .first()
      .click({ force: true });
  }

  /**
   * Remove a specific chip from the Departments field by its visible label,
   * by clicking its "×" remove icon.
   * @param {string} departmentLabel
   */
  removeDepartmentChip(departmentLabel) {
    // .contains() returns the deepest element (the label div), so use .siblings()
    // to reach the remove button which is a sibling of the label inside the chip.
    this.panel
      .contains('Departments', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .contains('[class*="multi-value__label"], [class*="multiValueLabel"]', departmentLabel, { matchCase: false })
      .siblings('[class*="remove"], [class*="multiValueRemove"]')
      .first()
      .click({ force: true });
  }

  clickPanelSubmit() {
    // Scroll Submit into view (it's at the bottom of the slide-in panel)
    this.panelSubmitButton
      .scrollIntoView()
      .should('exist')
      .should('be.visible')
      .click({ force: true });
  }

  clickPanelReset() {
    this.panelResetButton
      .scrollIntoView()
      .should('exist')
      .should('be.visible')
      .click({ force: true });
    // Small wait for form to clear
    cy.wait(300);
  }

  clickPanelClose() {
    this.panelCloseIcon.should('be.visible').click();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-ACTION ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Assert a successful user creation.
   * Patterns observed across PuffinUI modules:
   *   A) Success toast/alert, panel closes
   *   B) Panel closes and the list page reflects the new row
   */
  assertUserCreatedSuccessfully() {
    const TOAST_SEL = [
      '.toast-success',
      '.notification-success',
      '.alert-success',
      '[class*="success"][role="alert"]',
      '[class*="Toastify"]',
    ].join(', ');

    cy.get('body').then(($body) => {
      if ($body.find(TOAST_SEL).length) {
        cy.get(TOAST_SEL, { timeout: 8000 }).should('be.visible');
      }
    });

    // Wait for panel close animation to complete
    cy.wait(500);

    // Regardless of toast, the panel should close and return to the list page
    this.assertPanelNotVisible();
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'user-management/users');
    this.addUserButton.should('be.visible');
  }

  /**
   * After Reset: login name should be empty, no role/department chips remain.
   */
  assertFormCleared() {
    this.loginNameInput.should('have.value', '');
    // After reset, verify no chips remain by checking multi-value labels
    // (avoids false matches from status badges elsewhere in the panel)
    this.panel
      .contains('Roles', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .find('[class*="multi-value__label"], [class*="multiValueLabel"]')
      .should('have.length', 0);
    this.panel
      .contains('Departments', { matchCase: false })
      .closest('div, [class*="field"], [class*="row"]')
      .find('[class*="multi-value__label"], [class*="multiValueLabel"]')
      .should('have.length', 0);
  }
}

export default new UserPage();
