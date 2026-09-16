/**
 * commonStep.js
 * Step definitions shared across ALL dictionary/CRUD feature files
 * (department, messageTemplate, and any future module that follows the
 * same Add/Submit/Reset form pattern).
 *
 * ── WHY THIS FILE EXISTS ─────────────────────────────────────────────────────
 * "the user clicks the Submit button" and "the user clicks the Reset button"
 * used to be defined once (in departmentStep.js) and silently reused by
 * messageTemplateStep.js via Cucumber's global step registry. That worked,
 * but it meant messageTemplate.feature secretly depended on department's
 * step file existing. Renaming or deleting departmentStep.js would have
 * broken messageTemplate tests with no obvious reason why.
 *
 * Now these steps live in one neutral place, and every module's Given/When
 * "navigate" step tells pageContext.js which Page Object is currently
 * active (see pageContext.js). No file depends on another file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { When } from '@badeball/cypress-cucumber-preprocessor';
import { getCurrentPage } from '../utils/pageContext';

When('the user clicks the Submit button', () => {
  getCurrentPage().clickSubmit();
});

When('the user clicks the Reset button', () => {
  getCurrentPage().clickReset();
});
