/**
 * cypress/e2e/debug/inspect-campaign-page.cy.js
 * Debug script to inspect the actual campaign SMS page structure
 */

describe('Campaign Page Structure Debug', () => {
  it('should inspect the campaign page DOM structure', () => {
    // Login and navigate to campaigns/sms
    cy.visit('/PuffinUI/login/');
    cy.contains('button', 'Sign in with SSO').click();
    
    cy.url({ timeout: 30000 }).should('include', 'TestAuroraServer/Account/Login');
    cy.get('#username').should('exist').type(Cypress.env('USERNAME'));
    cy.get('#password').should('exist').type(Cypress.env('PASSWORD'));
    cy.contains('button', 'Sign In').click();
    
    cy.url({ timeout: 30000 }).should('not.include', 'TestAuroraServer/Account/Login');
    cy.url({ timeout: 30000 }).should('include', '/PuffinUI/select-tenant');
    cy.get('select, [role="combobox"], [data-testid*="tenant" i]').first().click();
    cy.contains('li, option, [role="option"]', Cypress.env('TENANT')).click();
    cy.contains('button', 'Continue').click();
    
    // Now navigate to campaigns SMS page
    cy.visit('/PuffinUI/campaigns/sms/', { failOnStatusCode: false });
    cy.url({ timeout: 10000 }).should('include', '/campaigns/sms');

    // Debug: Print page structure
    cy.window().then((win) => {
      const html = win.document.documentElement.innerHTML;
      console.log('===== FULL PAGE HTML (FIRST 5000 CHARS) =====');
      console.log(html.substring(0, 5000));
      
      // Get body content
      const body = win.document.body;
      console.log('\n===== BODY TEXT CONTENT =====');
      console.log(body.innerText?.substring(0, 2000));
    });

    // Debug: Check for specific elements
    cy.get('body').then(($body) => {
      console.log('\n===== ELEMENT CHECKS =====');
      console.log('Has dialog:', $body.find('dialog').length > 0);
      console.log('Has buttons:', $body.find('button').length);
      console.log('Has tables:', $body.find('table').length);
      console.log('All button texts:', Array.from($body.find('button')).map(b => b.textContent).join(' | '));
      console.log('All visible links:', Array.from($body.find('a:visible')).map(a => a.textContent).join(' | '));
    });

    // Take a screenshot
    cy.screenshot('campaign-page-debug');

    // Try to find Add Broadcast button
    cy.contains('button', /Add.*Broadcast/i).then(($btn) => {
      console.log('Found Add Broadcast button:', $btn.text());
    }).catch(() => {
      console.log('Add Broadcast button NOT found');
      // Try all buttons
      cy.get('button').each(($btn) => {
        console.log('Button found:', $btn.text());
      });
    });
  });
});
