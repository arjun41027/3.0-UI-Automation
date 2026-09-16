// Custom Cypress commands shared across step definitions / page objects.

/**
 * Waits for the page to fully settle after an SSO redirect by polling the URL.
 * Useful where defaultCommandTimeout (300s) is too coarse for a specific wait.
 */
Cypress.Commands.add('waitForUrlChange', (notIncluding, timeout = 30000) => {
  cy.url({ timeout }).should('not.include', notIncluding);
});

// NOTE: There used to be a `loginViaUI` command here that called
// `cy.get('@LoginPage')`. That alias was never set anywhere in the project,
// so calling it would have thrown "no such alias" — it was dead code.
// LoginPage is imported directly in loginStep.js and called as
// `LoginPage.login(username, password, tenant)`, which is simpler and
// already works. Removed rather than fixed, to avoid two ways of doing
// the same thing.
