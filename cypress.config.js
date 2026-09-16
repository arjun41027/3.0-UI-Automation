const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const allureWriter = require('@shelex/cypress-allure-plugin/writer');

async function setupNodeEvents(on, config) {
  await addCucumberPreprocessorPlugin(on, config);

  on('file:preprocessor', createBundler({
    plugins: [createEsbuildPlugin(config)],
  }));

  allureWriter(on, config);

  require('cypress-mochawesome-reporter/plugin')(on);

  return config;
}

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://twowayserver.future-club.com',
    experimentalModifyObstructiveThirdPartyCode: false,
    experimentalRunAllSpecs: true,
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/features/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    pageLoadTimeout: 300000,
    defaultCommandTimeout: 30000,
    retries: {
      runMode: 0,
      openMode: 0,
    },
    setupNodeEvents,
  },
  env: {
    allure: true,
    allureReuseAfterSpec: true,
    stepDefinitions: 'cypress/e2e/step_definitions/**/*.js',
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true,
  },
});
