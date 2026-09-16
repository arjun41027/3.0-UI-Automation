/**
 * pageContext.js
 *
 * Problem this solves:
 * Both "the user clicks the Submit button" and "the user clicks the Reset
 * button" need to work no matter which module the scenario is testing
 * (Department, Message Template, Role, User, ...). Without this file, each
 * step file either redefines its own copy of these steps (duplication) or
 * "borrows" someone else's definition (hidden coupling — see old
 * departmentStep.js / messageTemplateStep.js).
 *
 * The fix: every module's Given/When "navigate" step registers itself here
 * as the current page. The shared Submit/Reset steps in commonStep.js just
 * ask "who's active right now?" and call clickSubmit()/clickReset() on it.
 *
 * Every Page Object used with this module must implement:
 *   - clickSubmit()
 *   - clickReset()
 */

let currentPage = null;

export function setCurrentPage(pageObject) {
  currentPage = pageObject;
}

export function getCurrentPage() {
  if (!currentPage) {
    throw new Error(
      'No current page has been set. Make sure a "Given the user is on the ... page" ' +
      'or "When the user navigates to the ... page" step runs before this one.'
    );
  }
  return currentPage;
}
