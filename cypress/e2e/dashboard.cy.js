describe("Dashboard / Services", () => {
  const TEST_EMAIL = "test@example.com";
  const TEST_PASSWORD = "Test123456";

  beforeEach(() => {
    cy.login(TEST_EMAIL, TEST_PASSWORD);
    cy.visit("/services");
  });

  it("shows dashboard with greeting", () => {
    cy.contains("Hola", { timeout: 10000 }).should("be.visible");
    cy.screenshot("step-greeting-visible");
    cy.contains("Explorar Mercado").should("be.visible");
    cy.screenshot("step-dashboard-loaded");
  });

  it("shows stats cards", () => {
    cy.wait(500);
    cy.contains("Trueques Completados", { timeout: 10000 }).should("be.visible");
    cy.contains("Intercambios Activos", { timeout: 10000 }).should("be.visible");
    cy.contains("Reputación", { timeout: 10000 }).should("be.visible");
    cy.screenshot("step-stats-cards-visible");
  });

  it("opens create service modal", () => {
    cy.contains("Publicar Servicio").click();
    cy.screenshot("step-after-publicar-click");
    cy.get(".chakra-modal__content", { timeout: 10000 }).should("be.visible");
    cy.screenshot("step-modal-open");
  });
});
