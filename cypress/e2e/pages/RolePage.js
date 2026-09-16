/**
 * RolePage.js
 * Page Object for Role management under User Management menu.
 *
 * Routes/UI covered:
 *  - List page : /PuffinUI/user-management/roles/
 *  - Add Role  : MODAL/POPUP (not a separate route) — opens over the list page
 *
 * Key difference from DepartmentPage / MessageTemplatePage:
 *  - "Add Role" opens an in-page POPUP (confirmed by the "×" close icon in the
 *    screenshot), not a new URL. All add-form selectors are scoped to the
 *    modal container so they don't accidentally match list-page elements.
 *
 * Design rules (same contract as the other Page Objects):
 *  - Zero auth / session logic — lives solely in loginStep.js
 *  - No arbitrary cy.wait() — every pause uses an assertion as the guard
 *  - Direct cy.visit() for non-navigation scenarios; sidebar clicks only in ROLE_001
 */

const LIST_URL    = '/PuffinUI/user-management/roles/';
const NAV_TIMEOUT = 15000;

/** Permission columns as seen in the grid header (Add, Edit, Delete, Approve, Assign) */
const PERMISSION_COLUMNS = ['Add', 'Edit', 'Delete', 'Approve', 'Assign'];

class RolePage {

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

  get rolesSubMenu() {
    return cy.get('body').then(($body) => {
      if ($body.find('a[href*="/user-management/roles"]').length) {
        return cy.get('a[href*="/user-management/roles"]').first();
      }
      return cy.contains('a, li, span', 'Roles', { matchCase: false }).first();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — list page
  // ═══════════════════════════════════════════════════════════════════════════

  get addRoleButton() {
    return cy.contains('button', 'Add Role', { matchCase: false });
  }

  get searchInput() {
    return cy.get('input[placeholder="Search"], input[type="search"]').first();
  }

  get rolesTable() {
    return cy.get('table, [role="grid"], .ag-root-wrapper, .data-table').first();
  }

  get tableHeaders() {
    return cy.get('th, .ag-header-cell-text, [role="columnheader"]');
  }

  /** "Total: 45" pagination summary at bottom right */
  get paginationTotal() {
    return cy.contains('Total:', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — Add Role POPUP (scoped container)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * The modal/popup wrapper itself.
   * Scope all inner selectors through this to avoid bleeding into the list page,
   * which remains in the DOM behind the overlay.
   */
  get modal() {
    return cy.get(
      '[role="dialog"], .modal, .MuiDialog-root, [class*="modal"], [class*="Modal"], [class*="popup"]'
    ).filter(':visible').first();
  }

  get modalCloseIcon() {
    return cy.get('[class*="close"], button[aria-label="close"], [aria-label="Close"]')
      .filter(':visible').first();
  }

  get roleInformationHeading() {
    return cy.contains('Role Information', { matchCase: false });
  }

  get roleNameInput() {
    // "Role Name" label only exists inside the modal — safe to scope from it.
    // Use parent() to find the input within the same field container.
    return cy.contains('Role Name', { matchCase: false })
      .parent()
      .find('input')
      .first();
  }

  get roleDescriptionInput() {
    // "Role Description" label only exists inside the modal.
    return cy.contains('Role Description', { matchCase: false })
      .parent()
      .find('input, textarea')
      .first();
  }

  activeRadioWithin($modal) {
    return cy.wrap($modal).contains('label, span', 'Active', { matchCase: false });
  }

  inactiveRadioWithin($modal) {
    return cy.wrap($modal).contains('label, span', 'Inactive', { matchCase: false });
  }

  get rolePermissionsHeading() {
    return cy.contains('Role Permissions', { matchCase: false });
  }

  /** The permissions grid/table inside the modal */
  get permissionsTable() {
    return cy.get('table, [role="grid"], [class*="permission"]').filter(':visible').first();
  }

  /**
   * Header row of the permissions grid — used to confirm Add/Edit/Delete/Approve
   * columns exist.
   */
  get permissionColumnHeaders() {
    return this.permissionsTable.find('th, [role="columnheader"]');
  }

  get modalSubmitButton() {
    return cy.contains('button', 'Submit', { matchCase: false });
  }

  get modalResetButton() {
    return cy.contains('button', 'Reset', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Direct navigation — used by all scenarios that don't test sidebar behaviour.
   * The cy.session() token is already live, so the route guard passes immediately.
   */
  visitRolesPage() {
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
   * Expand the User Management accordion then click the Roles sub-link.
   * Used only in ROLE_001 which explicitly tests sidebar navigation.
   */
  clickUserManagementMenu() {
    cy.get('body').then(($body) => {
      const subLinkVisible =
        $body.find('a[href*="/user-management/roles"]:visible').length > 0;
      if (subLinkVisible) return;

      this.userManagementMenu.then(($el) => {
        cy.wrap($el).scrollIntoView().click({ force: true });
      });
    });

    // Wait for the Roles / Users sub-menu to appear before clicking
    cy.contains('a, li, span', 'Roles', { matchCase: false, timeout: NAV_TIMEOUT })
      .should('be.visible');
  }

  clickRolesSubMenu() {
    this.rolesSubMenu.then(($el) => {
      cy.wrap($el).scrollIntoView().click({ force: true });
    });
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'user-management/roles');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PAGE ASSERTIONS & ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertListPageLoaded() {
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'user-management/roles');
    this.addRoleButton.should('be.visible');
    this.rolesTable.should('exist');
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
   * Click "Add Role" and wait for the popup to render.
   */
  clickAddRole() {
    this.addRoleButton.should('be.visible').click();
    this.roleInformationHeading.should('be.visible');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD ROLE POPUP — ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertAddRolePopupDisplayed() {
    // Only assert the heading — Submit is scrolled off-screen in the modal
    // (the permissions grid is long). Checking heading alone is sufficient.
    this.roleInformationHeading.should('be.visible');
  }

  assertPopupNotVisible() {
    // Do NOT use [class*="modal"] — it also matches button.form-modal__button
    // on the list page which stays visible after the popup is closed.
    // Instead verify the "Role Information" heading (inside the popup only)
    // is no longer visible; that heading disappears as soon as the popup hides.
    cy.contains('Role Information', { matchCase: false, timeout: 8000 })
      .should('not.be.visible');
  }

  assertPermissionsSectionVisible() {
    this.rolePermissionsHeading.should('be.visible');
    this.permissionsTable.should('exist');
    PERMISSION_COLUMNS.forEach((col) => {
      this.permissionColumnHeaders.contains(col, { matchCase: false }).should('exist');
    });
  }

  /**
   * Assert all permission toggles for a module row are checked.
   * Verifies that the master checkbox and all 5 permission checkboxes are checked.
   * @param {string} moduleName e.g. "DBHandler"
   */
  assertAllPermissionsCheckedForModule(moduleName) {
    // Verify the master checkbox (permission-checkbox) is checked
    cy.get('input.permission-checkbox')
      .parent()
      .find('span.permission-title')
      .contains(moduleName, { matchCase: false })
      .closest('label')
      .find('input.permission-checkbox')
      .first()
      .should('be.checked');

    // Verify all 5 permission action checkboxes are checked
    cy.get('input.permission-checkbox')
      .parent()
      .find('span.permission-title')
      .contains(moduleName, { matchCase: false })
      .closest('tr')
      .within(() => {
        // Find all permission-action cells and verify their checkboxes are checked
        cy.get('td.permission-action').each(($actionCell) => {
          cy.wrap($actionCell)
            .find('input[type="checkbox"]')
            .first()
            .should('be.checked');
        });
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD ROLE POPUP — FORM ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  enterRoleName(name) {
    this.roleNameInput
      .should('exist')
      .click({ force: true })
      .clear({ force: true })
      .type(name, { force: true })
      .should('have.value', name);  // Verify the text was actually typed
  }

  enterRoleDescription(description) {
    this.roleDescriptionInput
      .should('exist')
      .click({ force: true })
      .clear({ force: true })
      .type(description, { force: true })
      .should('have.value', description);  // Verify the text was actually typed
  }

  /**
   * Select Active or Inactive radio inside the modal.
   */
  selectStatus(status) {
    const label = status.toLowerCase() === 'active' ? 'Active' : 'Inactive';
    cy.contains('label, span', label, { matchCase: false }).filter(':visible').first().click({ force: true });
  }

  /**
   * Locate the permissions grid row for a given module name.
   * Returns a chainable scoped to that row.
   *
   * Do NOT route through permissionsTable.first() — that getter matches
   * 136+ elements and .first() returns an arbitrary small container, causing
   * within() to cover multiple rows instead of just one.
   * Instead, find the module name text directly and traverse up to its row.
   * @private
   */
  _getModuleRow(moduleName) {
    return cy.contains(moduleName, { matchCase: false })
      .closest('tr, [role="row"]');
  }

  /**
   * Enable a single permission (Add/Edit/Delete/Approve/Assign) for a given module row.
   * DOM structure:
   *   <tr class="even-row">  or <tr class="odd-row">
   *     <td class="permission-name">
   *       <label><input class="permission-checkbox"><span>ModuleName</span></label>
   *     <td class="permission-action">  (for Add, Edit, Delete, Approve, Assign)
   *       <input class="toggle-checkbox" type="checkbox"> (hidden, styled with CSS)
   *
   * @param {string} permission - one of 'Add' | 'Edit' | 'Delete' | 'Approve' | 'Assign'
   * @param {string} moduleName - e.g. 'Departments'
   */
  enablePermissionForModule(permission, moduleName) {
    const columnIndex = PERMISSION_COLUMNS.findIndex(
      (p) => p.toLowerCase() === permission.toLowerCase()
    );
    if (columnIndex === -1) {
      throw new Error(`Unknown permission column: "${permission}"`);
    }

    // Wait for the permissions table to be visible (fully rendered)
    this.permissionsTable.should('be.visible');
    this.rolePermissionsHeading.scrollIntoView();

    // Find the row by locating the permission-checkbox that precedes the module name
    cy.get('input.permission-checkbox')
      .parent()
      .find('span.permission-title')
      .contains(moduleName, { matchCase: false })
      .closest('tr')
      .scrollIntoView()
      .then(($row) => {
        // Within this row, find all td.permission-action cells and click the correct one
        // The checkboxes inside are hidden (styled) so use force:true
        cy.wrap($row)
          .find('td.permission-action')
          .eq(columnIndex)
          .find('input[type="checkbox"]')
          .first()
          .click({ force: true });
      });
  }

  /**
   * Enable ALL permissions for a module using the master row-level checkbox.
   * Clicks the input.permission-checkbox to enable all 5 permissions (Add, Edit, Delete, Approve, Assign).
   * The checkbox is hidden (styled) so force:true is used.
   *
   * @param {string} moduleName - e.g. 'DBHandler'
   */
  enableAllPermissionsForModule(moduleName) {
    // Wait for the permissions table to be visible (fully rendered)
    this.permissionsTable.should('be.visible');
    this.rolePermissionsHeading.scrollIntoView();

    // Find the permission-checkbox for this module and click it
    // The checkbox is hidden so use force:true
    cy.get('input.permission-checkbox')
      .parent()
      .find('span.permission-title')
      .contains(moduleName, { matchCase: false })
      .closest('label')
      .find('input.permission-checkbox')
      .first()
      .click({ force: true });
  }

  clickModalSubmit() {
    // Wait for the Submit button to exist and be stable before clicking
    this.modalSubmitButton
      .should('exist')
      .should('be.visible')
      .click({ force: true });
  }

  clickModalReset() {
    this.modalResetButton.scrollIntoView().click({ force: true });
  }

  clickModalClose() {
    this.modalCloseIcon.should('be.visible').click();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-ACTION ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Assert a successful role creation.
   * Patterns observed across PuffinUI modules:
   *   A) Success toast/alert, popup closes
   *   B) Popup closes and the list page reflects the new row
   */
  assertRoleCreatedSuccessfully() {
    // On success: popup becomes hidden automatically after creation.
    // The modal element (div.form-modal) stays in the DOM but is hidden —
    // use not.be.visible instead of not.exist.
    cy.get(
      '[role="dialog"], .modal, .MuiDialog-root, [class*="modal-open"], [class*="Modal"], .form-modal',
      { timeout: 15000 }
    ).should('not.be.visible');
    cy.url().should('include', 'user-management/roles');
    this.addRoleButton.should('be.visible');
  }

  /**
   * After Reset: role name and description should be empty.
   */
  assertFormCleared() {
    this.roleNameInput.should('have.value', '');
    this.roleDescriptionInput.should('have.value', '');
  }
}

export default new RolePage();
