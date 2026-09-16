// Quick debug script to inspect campaign page
describe('DEBUG - Campaign Page Elements', () => {
  beforeEach(() => {
    cy.visit('/PuffinUI/campaigns/sms/');
  });

  it('should log all buttons on page', () => {
    cy.get('button').each(($btn, index) => {
      cy.wrap($btn).then(($el) => {
        const text = $el.text().trim();
        const classes = $el.attr('class');
        cy.log(`Button ${index}: "${text}" | Classes: ${classes}`);
      });
    });
  });

  it('should log all visible text on page', () => {
    cy.get('body').then(($body) => {
      const text = $body.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      lines.slice(0, 30).forEach((line, i) => {
        cy.log(`Line ${i}: ${line.substring(0, 80)}`);
      });
    });
  });

  it('should check for Add/Create buttons', () => {
    cy.get('button').then(($buttons) => {
      const labels = Array.from($buttons).map(btn => btn.textContent.toLowerCase());
      cy.log('All button labels: ' + labels.join(' | '));
      
      const addLike = labels.filter(l => l.includes('add') || l.includes('create') || l.includes('new'));
      cy.log('Buttons matching add/create/new: ' + addLike.join(' | '));
    });
  });
});
