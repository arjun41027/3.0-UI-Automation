Feature: Login

  # Background uses cy.session(cacheAcrossSpecs: true) so the Aurora SSO login
  # runs exactly ONCE. All subsequent specs (department, role, user, messageTemplate)
  # restore the same cached session — no re-login, no 401.
  Background:
    Given the user is logged in and on the home page

  @AS_001 @login @smoke
  Scenario: Successful login with SSO and tenant selection
    Then the home page should be displayed
