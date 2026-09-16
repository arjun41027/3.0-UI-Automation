// Generic helper utilities shared across step definitions / page objects.

/**
 * Generates a unique survey/test name suffix to avoid collisions
 * when running tests repeatedly against the same environment.
 */
export function uniqueSuffix() {
  return `${Date.now()}`;
}

/**
 * Wraps cy.url() comparisons so the active path can be asserted
 * without needing the full baseUrl prefix.
 */
export function currentPath() {
  return cy.location('pathname');
}
