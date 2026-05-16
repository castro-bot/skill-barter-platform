// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
Cypress.Commands.add("login", (email, password) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/auth/login`,
    body: { email, password },
  }).then((resp) => {
    window.localStorage.setItem("sb_auth_token", resp.body.accessToken);
  });
});
Cypress.Commands.add("register", (name, email, password) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/auth/register`,
    body: { name, email, password },
  }).then((resp) => {
    window.localStorage.setItem("sb_auth_token", resp.body.accessToken);
  });
});
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

