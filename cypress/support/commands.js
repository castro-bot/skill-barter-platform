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

Cypress.Commands.add("ensureUser", (name, email, password) => {

  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/auth/register`,
    body: { name, email, password },
    failOnStatusCode: false,
  }).then((resp) => {
    if (resp.status === 200 || resp.status === 201) return resp.body.accessToken;
    return cy.request({
      method: "POST",
      url: `${Cypress.env("apiUrl")}/auth/login`,
      body: { email, password },
    }).its("body.accessToken");
  });
});

Cypress.Commands.add("createService", (token, data) => {

  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/services`,
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }).its("body");
});

Cypress.Commands.add("proposeTrade", (token, data) => {

  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/trades`,
    headers: { Authorization: `Bearer ${token}` },
    body: data,
    failOnStatusCode: false,
  }).then((resp) => {
    if (resp.status < 300) return resp.body;
    if (resp.status === 409) {
      return cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/trades`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((listResp) => {
        const pending = listResp.body.outgoing.find((t) => t.status === "PENDING");
        if (!pending) throw new Error("409 conflict but no PENDING outgoing trade found");
        return pending;
      });
    }
    throw new Error(`proposeTrade failed with status ${resp.status}`);
  });
});

Cypress.Commands.add("respondTrade", (token, tradeId, action, contactWhatsapp) => {

  const body = action === "accept" ? { action, contactWhatsapp } : { action };
  return cy.request({
    method: "PUT",
    url: `${Cypress.env("apiUrl")}/trades/${tradeId}/respond`,
    headers: { Authorization: `Bearer ${token}` },
    body,
  }).its("body");
});