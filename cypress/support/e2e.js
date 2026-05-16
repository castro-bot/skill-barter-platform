// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Screenshot every test (pass or fail) for evidence
afterEach(function () {
  const testTitle = this.currentTest.title.replace(/[^a-zA-Z0-9]/g, '_')
  const specName = Cypress.spec.name.replace('.cy.js', '')
  cy.screenshot(`${specName}/${testTitle}`, { capture: 'runner' })
})