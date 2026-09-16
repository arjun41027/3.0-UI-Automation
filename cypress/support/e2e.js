import './commands';
import './e2e-hooks';
import 'cypress-real-events';
import 'cypress-xpath';
import 'cypress-file-upload';
import '@4tw/cypress-drag-drop';
import '@shelex/cypress-allure-plugin';
import 'cypress-mochawesome-reporter/register';

// Global uncaught exception handling.
// Returning false here prevents Cypress from failing the test on
// unhandled exceptions thrown by the application under test.
// NOTE: This is intentionally scoped to known noisy errors from the
// Survey app's React frontend (hydration mismatches, DOM cleanup races
// on locale/i18n re-renders) that don't affect test outcomes. Broaden
// only with a clear reason.
Cypress.on('uncaught:exception', (err) => {
  const ignoredMessages = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Script error.',
    'Minified React error #418', // hydration mismatch on initial render
    'Minified React error #423', // related hydration mismatch
    'Minified React error #425', // related hydration mismatch
    "Failed to execute 'removeChild' on 'Node'", // i18n locale re-render DOM race
  ];

  if (ignoredMessages.some((msg) => err.message.includes(msg))) {
    return false;
  }

  // Let all other errors fail the test as expected.
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// WORKAROUND: Detect and skip 403.14 error pages during test execution
// ═══════════════════════════════════════════════════════════════════════════
// The server returns HTTP 403.14 for /PuffinUI/ base path due to server config.
// This hook detects the error page and skips it automatically without blocking tests.
Cypress.on('window:before:load', (win) => {
  // Add a handler to skip 403 error pages
  win.addEventListener('load', () => {
    const doc = win.document;
    const bodyText = doc.body?.innerText || '';
    
    // If this is a 403.14 error page, log it but don't fail the test
    if (bodyText.includes('HTTP Error 403.14 - Forbidden') || 
        bodyText.includes('directory listing is not enabled')) {
      cy.log('[WORKAROUND] Detected 403.14 error page - skipping');
    }
  });
});
