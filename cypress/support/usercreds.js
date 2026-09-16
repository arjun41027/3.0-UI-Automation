// Credential helper. Values are sourced from cypress.env.json (or CI env vars
// injected as CYPRESS_USERNAME / CYPRESS_PASSWORD / CYPRESS_TENANT).
// Do NOT hardcode real secrets here.

const usercreds = {
  validUser: {
    username: Cypress.env('USERNAME'),
    password: Cypress.env('PASSWORD'),
  },
  tenant: Cypress.env('TENANT') || 'KFH',
};

export default usercreds;
