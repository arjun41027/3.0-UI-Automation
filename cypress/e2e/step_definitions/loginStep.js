import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LoginPage from '../pages/LoginPage';
import usercreds from '../../support/usercreds';

let authBootstrapFailed = false;
let authBootstrapError = '';
let sessionAlreadyCreated = false;

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND: User already logged in with cached session
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Background step: runs before every scenario that references it.
 * Uses cy.session() with validation to cache Aurora SSO session across scenarios.
 * 
 * Smart session management:
 * 1. If session is cached and valid (from validateSession), use it without logout
 * 2. If session is invalid or missing, execute login which includes logout API call
 * 3. This avoids unnecessary database logout calls when valid cached session exists
 */
Given('the user is logged in and on the home page', () => {
  if (authBootstrapFailed) {
    throw new Error(
      `Auth bootstrap already failed earlier in this run: ${authBootstrapError}`
    );
  }

  const username = usercreds.validUser.username;
  const password = usercreds.validUser.password;
  const tenant = usercreds.tenant;

  /**
   * Validate cached session by:
   * 1. Checking URL - not on login/select-tenant page
   * 2. Checking if auth token/cookie exists
   * If validation fails, session is cleared and login() will be called again.
   */
  const validateSession = () => {
    cy.url().then((url) => {
      // If we're on login page or select-tenant page, session is invalid
      if (url.includes('/PuffinUI/login') || url.includes('/Account/Login') || url.includes('/select-tenant')) {
        throw new Error('Session validation failed: on login page or select-tenant page');
      }
    });

    // Check if auth token exists in cookies or localStorage
    cy.getCookie('Authorization').then((cookie) => {
      if (!cookie) {
        // Try other common auth cookie names
        cy.getCookie('AuthToken').then((authToken) => {
          if (!authToken) {
            cy.getCookie('access_token').then((accessToken) => {
              if (!accessToken) {
                // Check localStorage for token
                cy.window().then((win) => {
                  const token = win.localStorage.getItem('token') || 
                               win.localStorage.getItem('authToken') ||
                               win.localStorage.getItem('Authorization');
                  if (!token) {
                    cy.log('[validateSession] ⚠ Warning: No auth token found in cookies or localStorage');
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  cy.session(
    ['auth-login-v1', username, tenant],
    () => {
      // Session setup: called only if session doesn't exist or validation fails
      LoginPage.login(username, password, tenant);
    },
    {
      cacheAcrossSpecs: true,
      validate: validateSession, // Only re-login if validation fails
    }
  );

  Cypress.once('fail', (err) => {
    if (err.message.includes('Aurora login API returned 401')) {
      authBootstrapFailed = true;
      authBootstrapError = 'Aurora login API returned 401 (Unauthorized).';
    }

    throw err;
  });

  // Navigate to a valid page instead of /PuffinUI/ (base path causes 403.14)
  // Using campaigns/sms as default landing page works around server 403.14 error
  cy.visit('/PuffinUI/campaigns/sms/', { failOnStatusCode: false });

  // Wait for the React app to initialize and load auth context
  // Check for main app container to be visible (not error page)
  cy.get('body', { timeout: 15000 }).should('exist');
  
  // Additional wait to ensure auth cookies are set and sent with subsequent API requests
  cy.wait(500);

  // After session restore, the server may briefly return a 403/error page before
  // the React app initialises with the restored auth cookies. If an error page
  // is detected, reload once so the app can boot with the correct session state.
  cy.get('body', { timeout: 10000 }).then(($body) => {
    const bodyText = $body.text() || '';
    const hasErrorPage =
      $body.find('[class*="error-page"], [class*="errorPage"], .error-container').length > 0 ||
      bodyText.includes('403') ||
      bodyText.includes('Forbidden') ||
      bodyText.includes('Unauthorized') ||
      bodyText.includes('Access Denied');

    if (hasErrorPage) {
      cy.log('[loginStep] Detected error page, reloading to reinitialize auth...');
      cy.reload({ failOnStatusCode: false });
      cy.wait(500); // Wait for reload and auth reinitialization
    }
  });

  LoginPage.verifyLoginSuccess();
});

Given('the user is on the login page', () => {
  LoginPage.visitLoginPage();
});

When('the user clicks "Sign in with SSO"', () => {
  LoginPage.clickSsoButton();
});

Then(/^the Username\/Password login page should be displayed$/, () => {
  LoginPage.verifyUsernamePasswordFormVisible();
});

When('the user enters valid username and password', () => {
  LoginPage.typeUsername(usercreds.validUser.username);
  LoginPage.typePassword(usercreds.validUser.password);
});

When('the user clicks the Sign In button', () => {
  LoginPage.clickSignIn();
});

Then('the Select Tenant page should be displayed', () => {
  cy.url().should('include', '/PuffinUI/select-tenant');
});

When('the user selects tenant {string}', (tenantName) => {
  LoginPage.selectTenant(tenantName);
});

When('the user clicks the Continue button', () => {
  LoginPage.clickContinue();
});

Then('the home page should be displayed', () => {
  LoginPage.verifyLoginSuccess();
});
