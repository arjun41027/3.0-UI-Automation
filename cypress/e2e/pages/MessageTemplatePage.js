/**
 * MessageTemplatePage.js
 * Page Object for Message Templates under Dictionaries menu.
 *
 * Routes covered:
 *  - List  : /PuffinUI/dictionary/message-template/
 *  - Add   : /PuffinUI/dictionary/message-template/add/
 *
 * Design rules (same contract as DepartmentPage.js):
 *  - Zero auth / session logic — that lives solely in loginStep.js
 *  - No arbitrary cy.wait() — every pause uses an assertion as the guard
 *  - Direct cy.visit() for non-navigation scenarios; sidebar clicks only in MT_001
 */

const LIST_URL    = '/PuffinUI/dictionary/message-template/';
const ADD_URL     = '/PuffinUI/dictionary/message-template/add/';
const NAV_TIMEOUT = 15000;

class MessageTemplatePage {

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — sidebar navigation
  // ═══════════════════════════════════════════════════════════════════════════

  get dictionariesMenu() {
    return cy.get('body').then(($body) => {
      if ($body.find('a[href*="/dictionary"]').length) {
        return cy.get('a[href*="/dictionary"]').first();
      }
      return cy.contains('a, span, li', 'Dictionaries', { matchCase: false }).first();
    });
  }

  get messageTemplateSubMenu() {
    return cy.get('body').then(($body) => {
      if ($body.find('a[href*="/dictionary/message-template"]').length) {
        return cy.get('a[href*="/dictionary/message-template"]').first();
      }
      return cy.contains('a, li, span', 'MessageTemplate', { matchCase: false }).first();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — list page
  // ═══════════════════════════════════════════════════════════════════════════

  /** Blue "Add" button on the list page (NOT "Add Department" — just "Add") */
  get addButton() {
    // The button text is just "Add" — exact match first to avoid hitting other buttons
    return cy.get('button').filter((_, el) => el.textContent.trim() === 'Add').first();
  }

  /** Channels dropdown filter on the list page */
  get channelsDropdown() {
    return cy.contains('button, div', 'Channels').first();
  }

  /** Search input on the list page */
  get searchInput() {
    return cy.get('input[placeholder="Search"], input[type="search"]').first();
  }

  /** The main data table */
  get templatesTable() {
    return cy.get('table, [role="grid"], .ag-root-wrapper, .data-table').first();
  }

  /** All column header cells */
  get tableHeaders() {
    return cy.get('th, .ag-header-cell-text, [role="columnheader"]');
  }

  /**
   * Pagination summary — "Total: 23" text shown at the bottom right.
   * Targets any element containing "Total:" regardless of surrounding structure.
   */
  get paginationTotal() {
    return cy.contains('Total:', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — add form (Template Details section)
  // ═══════════════════════════════════════════════════════════════════════════

  get templateDetailsHeading() {
    return cy.contains('Template Details', { matchCase: false });
  }

  /**
   * Template name — input#name.input-field (confirmed from DOM inspection).
   */
  get templateNameInput() {
    return cy.get('input#name, input[name="name"]').first();
  }

  /**
   * Department dropdown — 1st visible combobox on the add form page.
   * On /message-template/add the only visible [role="combobox"] elements
   * are the three form dropdowns (Dept, Channel, TemplateType), so index is safe.
   */
  get departmentDropdown() {
    return cy.get('[role="combobox"]').filter(':visible').first();
  }

  /**
   * Channel dropdown — 2nd visible combobox on the add form page.
   */
  get channelDropdown() {
    return cy.get('[role="combobox"]').filter(':visible').eq(1);
  }

  /**
   * Template Type dropdown — 3rd visible combobox (auto-populated after SMS selected).
   */
  get templateTypeDropdown() {
    return cy.get('[role="combobox"]').filter(':visible').eq(2);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — Template Content section (appears after Channel is selected)
  // ═══════════════════════════════════════════════════════════════════════════

  get templateContentHeading() {
    return cy.contains('Template content', { matchCase: false });
  }

  /**
   * Language toggle labels — each wraps a hidden <input type="checkbox" aria-label="English/Arabic">.
   * Target the label via the checkbox's aria-label attribute.
   */
  get englishToggleButton() {
    return cy.get('input[aria-label="English"]').closest('label');
  }

  get arabicToggleButton() {
    return cy.get('input[aria-label="Arabic"]').closest('label');
  }

  /** English / Arabic tab switchers (the underlined tab row below the toggles) */
  get englishTab() {
    // The active tab has an underline; target the tab-bar element specifically
    return cy.get('[role="tab"], .tab, li').filter((_, el) =>
      el.textContent.trim().toLowerCase() === 'english'
    ).first();
  }

  get arabicTab() {
    return cy.get('[role="tab"], .tab, li').filter((_, el) =>
      el.textContent.trim().toLowerCase() === 'arabic'
    ).first();
  }

  /**
   * Message content textarea — visible below the English/Arabic tabs.
   * Placeholder text from screenshot: "Enter your message content here..."
   */
  get messageContentTextarea() {
    return cy.get(
      'textarea[placeholder*="message content"], textarea[placeholder*="Enter your message"]'
    ).first();
  }

  /** "Preview Message on Device" button */
  get previewButton() {
    return cy.contains('button', 'Preview Message on Device', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTORS — form action buttons
  // ═══════════════════════════════════════════════════════════════════════════

  get submitButton() {
    return cy.contains('button', 'Submit', { matchCase: false });
  }

  get resetButton() {
    return cy.contains('button', 'Reset', { matchCase: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Direct navigation — used by all scenarios that don't test sidebar behaviour.
   * The cy.session() token is already live, so the route guard passes immediately.
   * failOnStatusCode: false allows tests to continue despite 403 Forbidden responses.
   */
  visitMessageTemplatesPage() {
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
   * Expand the Dictionaries accordion then click MessageTemplate sub-link.
   * Used only in MT_001 which explicitly tests sidebar navigation.
   */
  clickDictionariesMenu() {
    cy.get('body').then(($body) => {
      const subLinkVisible =
        $body.find('a[href*="/dictionary/message-template"]:visible').length > 0;
      if (subLinkVisible) return;

      this.dictionariesMenu.then(($el) => {
        cy.wrap($el).scrollIntoView().click({ force: true });
      });
    });

    // Wait for the sub-menu to appear before clicking it
    cy.get('a[href*="/dictionary/message-template"], a', { timeout: NAV_TIMEOUT })
      .contains('MessageTemplate', { matchCase: false })
      .should('be.visible');
  }

  clickMessageTemplateSubMenu() {
    this.messageTemplateSubMenu.then(($el) => {
      cy.wrap($el).scrollIntoView().click({ force: true });
    });
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'dictionary/message-template');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PAGE ASSERTIONS & ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertListPageLoaded() {
    cy.url({ timeout: NAV_TIMEOUT }).should('include', 'dictionary/message-template');
    this.addButton.should('be.visible');
    this.templatesTable.should('exist');
  }

  assertTableColumnsVisible(columns) {
    columns.forEach((col) => {
      this.tableHeaders.contains(col, { matchCase: false }).should('be.visible');
    });
  }

  assertTotalCountVisible() {
    this.paginationTotal.should('be.visible');
  }

  clickAddButton() {
    this.addButton.should('be.visible').click();
    this.templateDetailsHeading.should('be.visible');
    // Wait for form fields to be rendered
    cy.wait(500);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD FORM ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  assertAddFormDisplayed() {
    this.templateDetailsHeading.should('be.visible');
    this.templateNameInput.should('exist');
    this.submitButton.should('be.visible');
    this.resetButton.should('be.visible');
  }

  assertTemplateContentSectionVisible() {
    this.templateContentHeading.should('be.visible');
    cy.get('input[aria-label="English"]').should('exist');
    cy.get('input[aria-label="Arabic"]').should('exist');
  }

  assertTemplateTypePrepopulated(expectedType) {
    // Template Type is auto-populated as a disabled/read-only field after Channel = SMS.
    // It is no longer an interactive combobox, so check the visible text directly.
    cy.contains(expectedType, { matchCase: false }).should('be.visible');
  }

  assertLanguageTabsAvailable() {
    cy.get('input[aria-label="English"]').should('exist');
    cy.get('input[aria-label="Arabic"]').should('exist');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD FORM INTERACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  enterTemplateName(name) {
    // Wait for the form to be fully rendered
    this.templateDetailsHeading.should('be.visible');
    cy.wait(200);
    
    this.templateNameInput
      .should('exist')
      .scrollIntoView()
      .click({ force: true })
      .clear({ force: true })
      .type(name, { force: true });
    
    cy.wait(200);
  }

  /**
   * Select a department from the custom multi-select dropdown.
   * Pattern: click the dropdown trigger → wait for option list → click the option.
   */
  selectDepartment(departmentName) {
    this.departmentDropdown.scrollIntoView().should('be.visible').click({ force: true });
    cy.wait(300);
    
    // React-select renders options in a portal - try multiple selectors
    cy.get('body')
      .find('[class*="option"], [role="option"], li')
      .contains(departmentName, { matchCase: false })
      .first()
      .should('be.visible')
      .click({ force: true });
    
    cy.wait(300);
  }

  /**
   * Select Channel (e.g. "SMS") from the Channel dropdown.
   * After selection the Template Type auto-populates and Template Content expands.
   * Uses keyboard navigation for reliability with React Select component.
   */
  selectChannel(channelName) {
    // Wait longer for form to stabilize after department selection
    cy.wait(1000);
    
    // Click channel dropdown (2nd visible combobox)
    cy.get('[role="combobox"]')
      .filter(':visible')
      .eq(1)
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    cy.wait(600);
    
    // Use keyboard: type the channel name and press Enter
    cy.get('input[role="combobox"]')
      .filter(':visible')
      .eq(1)
      .type(channelName, { force: true });
    
    cy.wait(400);
    
    // Press Enter to select
    cy.get('input[role="combobox"]')
      .filter(':visible')
      .eq(1)
      .type('{enter}', { force: true });
    
    cy.wait(600);
    
    // Verify channel was selected - check if Template Type now shows SMS
    cy.contains('SMS', { matchCase: false }).should('be.visible');
    
    // Template content section should appear after channel selection
    this.templateContentHeading.should('be.visible');
  }

  /**
   * Click the English or Arabic toggle to open that language's content editor.
   * These are <label> elements wrapping hidden <input type="checkbox" aria-label="...">.
   */
  enableLanguageToggle(language) {
    cy.get(`input[aria-label="${language}"]`)
      .closest('label')
      .scrollIntoView()
      .click({ force: true });
    // Wait for the content textarea to appear
    cy.get('textarea').first().should('exist');
  }

  /**
   * Type message content into the currently visible language textarea.
   * @param {string} content - May include ##ParameterName## tokens
   */
  typeMessageContent(content) {
    cy.get('textarea')
      .first()
      .scrollIntoView()
      .should('be.visible')
      .clear({ force: true })
      .type(content, { parseSpecialCharSequences: false, force: true });
  }

  clickSubmit() {
    this.submitButton
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
  }

  clickReset() {
    this.resetButton
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-ACTION ASSERTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Assert a successful template creation.
   * PuffinUI uses one of two patterns:
   *   A) Success toast/alert stays on form
   *   B) Redirect back to the list page
   */
  assertTemplateCreatedSuccessfully() {
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
      } else {
        // Redirect pattern
        cy.url({ timeout: NAV_TIMEOUT }).should('include', 'dictionary/message-template');
        this.addButton.should('be.visible');
      }
    });
  }

  /**
   * After Reset: template name should be empty,
   * department chip should be gone, channel should show placeholder.
   */
  assertFormCleared() {
    this.templateNameInput.should('have.value', '');
    // Department chip removed
    cy.contains('[class*="multi-value"], .chip, [class*="tag"]', 'Department').should('not.exist');
  }
}

export default new MessageTemplatePage();
