# Survey Automation

Cypress + BDD (Cucumber) automation framework for the Survey application (Future Club / Puffin environment).

## 1. Project Structure

```
survey-automation/
├── cypress/
│   ├── e2e/
│   │   ├── features/              # Gherkin feature files
│   │   │   ├── login.feature
│   │   │   └── dashboard.feature  # placeholder, add real steps later
│   │   ├── step_definitions/      # Step bindings
│   │   │   └── loginStep.js
│   │   ├── pages/                 # Page Object Model classes
│   │   │   └── LoginPage.js
│   │   └── utils/                 # Shared helpers
│   │       └── helpers.js
│   ├── support/
│   │   ├── e2e.js                 # Global setup, exception handlers
│   │   ├── commands.js            # Custom Cypress commands
│   │   └── usercreds.js           # Credential helper (reads from env)
│   ├── reports/                   # Mochawesome output (generated)
│   └── screenshots/               # Failure screenshots (generated)
├── allure-results/                 # Raw Allure results (generated)
├── allure-report/                  # Generated Allure HTML report
├── cypress.config.js
├── cypress.env.json                # Local secrets - DO NOT COMMIT real values
├── cucumber.json
├── package.json
└── .gitignore
```

## 2. Prerequisites
- Node.js 18+ and npm installed
- Internet access to `twowayserver.future-club.com`

## 3. Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure credentials
# Edit cypress.env.json and set USERNAME / PASSWORD / TENANT to real values.
# Do NOT commit real secrets - use CI env vars in shared pipelines instead.
```

`cypress.env.json` (already created as a template):
```json
{
  "USERNAME": "ENDCheckerUser",
  "PASSWORD": "REPLACE_WITH_ACTUAL_PASSWORD",
  "TENANT": "KFH",
  "API_KEY": "REPLACE_WITH_API_KEY"
}
```

## 4. Running Tests

```bash
# Open Cypress UI (interactive)
npm run cypress:open

# Run all tests headlessly
npm run cypress:run
# or
npm test

# Run only the login spec
npm run cypress:run -- --spec "cypress/e2e/features/login.feature"

# Run by tag
npx cypress open --env TAGS="@AS_001"
npx cypress run --env TAGS="@AS_001"
```

## 5. Reports

```bash
# Clean previous reports
npm run clean:reports

# Run tests and collect Allure raw results
npm run test:with:allure

# Generate Allure HTML report
npm run report:allure:generate

# Open Allure report in browser
npm run report:allure:open

# Generate a single-file Allure HTML report
npm run allure:report
```

Outputs:
- Allure raw results: `allure-results/`
- Allure HTML report: `allure-report/index.html`
- Mochawesome JSON: `cypress/reports/.jsons/`
- Failure screenshots: `cypress/screenshots/`

## 6. Login Flow (implemented)

Matches the manual flow:
1. Visit `/PuffinUI/login`
2. Click **Sign in with SSO**
3. Username/Password form appears (TestAuroraServer Account/Login)
4. Enter credentials and click **Sign In**
5. **Select Tenant** page appears -> choose tenant (e.g. `KFH`)
6. Click **Continue** -> redirected to home/dashboard

Implementation:
- `cypress/e2e/pages/LoginPage.js` - element getters + actions + full `login()` flow
- `cypress/e2e/step_definitions/loginStep.js` - Gherkin step bindings
- `cypress/e2e/features/login.feature` - scenario `@AS_001`
- `cypress/support/usercreds.js` - reads credentials from `cypress.env.json`

> NOTE: Selectors in `LoginPage.js` are generic (button text, `input[name]`,
> first `select`/`[role="combobox"]`). Once you can inspect the live DOM,
> replace with stable `data-testid` / `id` selectors for reliability.

## 7. Adding New Modules

To add a new feature module (e.g. Survey List, Survey Schedule):

1. Create `cypress/e2e/features/<module>.feature` with Gherkin scenarios.
2. Create `cypress/e2e/pages/<Module>Page.js` with element getters + actions.
3. Create `cypress/e2e/step_definitions/<module>Step.js` binding the Gherkin
   steps to the page object methods.
4. Reuse `LoginPage.login(...)` (or `cy.loginViaUI(...)` custom command) in a
   `Given` step / hook to get into a logged-in state before module-specific steps.
5. Add shared helpers to `cypress/e2e/utils/helpers.js` as needed.
6. Tag scenarios (e.g. `@AS_002`) for targeted runs.

A placeholder `dashboard.feature` (`@AS_002`) is included as a starting template -
add its step definitions and page object the same way before filling in real steps.

## 8. Known Issues / Notes
- `Then the Username/Password login page should be displayed` previously had a
  step-text mismatch - the step text in `login.feature` and `loginStep.js`
  must match exactly (this scaffold keeps them in sync).
- Allure `ENOENT ... rename ... result.json` errors are usually caused by
  `allure-results/` being deleted mid-run or by parallel runs writing to the
  same directory - run `npm run clean:reports` before each full run.
- `defaultCommandTimeout` / `pageLoadTimeout` are set to 300s (5 min) per the
  original config; lower these once SSO redirect timing is well understood,
  to avoid long hangs on real failures.
- Global `uncaught:exception` handler in `cypress/support/e2e.js` only
  suppresses a narrow, named list of errors - broaden carefully.
