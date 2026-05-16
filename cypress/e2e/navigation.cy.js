describe("Navigation", () => {
  const TEST_EMAIL = "test@example.com";
  const TEST_PASSWORD = "Test123456";

  beforeEach(() => {
    cy.login(TEST_EMAIL, TEST_PASSWORD);
  });

  it("navigates to trades page", () => {
    cy.visit("/trades");
    cy.url().should("include", "/trades");
  });

  it("navigates to profile settings", () => {
    cy.visit("/profile/settings");
    cy.url().should("include", "/profile/settings");
  });

  it("root redirects to /services", () => {
    cy.visit("/");
    cy.url().should("include", "/services");
  });

  it("unknown route redirects to /login", () => {
    cy.clearLocalStorage();
    cy.visit("/nonexistent-page");
    cy.url().should("include", "/login");
  });
});
