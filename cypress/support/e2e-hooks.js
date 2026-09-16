/**
 * support/e2e-hooks.js
 * Global Cypress hooks for session/auth cleanup
 */

// Clear all cy.session data before each test run
before(() => {
  // This runs once before all tests in a file
  // Clear all sessions to ensure fresh state
  cy.session.clearAllSavedSessions?.();
  cy.log('[e2e-hooks] Cleared all sessions before test run');
});

// Before each test scenario, ensure clean session state
beforeEach(() => {
  // Note: Don't clear cookies/localStorage for Cypress session tests
  // Let cy.session manage auth state persistence
  cy.log('[e2e-hooks] BeforeEach hook - preparing test environment');
  
  // Check current session state
  cy.window().then((win) => {
    const hasAuthToken = win.localStorage.getItem('authToken') || 
                        win.sessionStorage.getItem('authToken') ||
                        document.cookie.includes('auth') ||
                        document.cookie.includes('session');
    
    if (hasAuthToken) {
      cy.log('[e2e-hooks] ✓ Auth token/session found in storage');
    } else {
      cy.log('[e2e-hooks] ⚠ No auth token/session found - may cause auth failures');
    }
  });
});

// After each scenario, check for errors
afterEach(() => {
  cy.get('body').then(($body) => {
    const pageText = $body.text();
    
    if (pageText.includes('403') || pageText.includes('Forbidden')) {
      cy.log('[e2e-hooks] ⚠ 403 Forbidden error detected - session likely expired');
    }
    
    if (pageText.includes('401') || pageText.includes('Unauthorized')) {
      cy.log('[e2e-hooks] ⚠ 401 Unauthorized error detected - auth failed');
    }
    
    if (pageText.includes('500') || pageText.includes('Internal Server')) {
      cy.log('[e2e-hooks] ⚠ 500 Server error detected - backend issue');
    }
  });
});
