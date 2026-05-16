describe("Dashboard / Services", () => {
  const TEST_EMAIL = "test@example.com";
  const TEST_PASSWORD = "Test123456";

  beforeEach(() => {
    cy.login(TEST_EMAIL, TEST_PASSWORD);
    cy.visit("/services");
  });

  it("shows dashboard with greeting", () => {
    cy.contains("Hola", { timeout: 10000 }).should("be.visible");
    cy.contains("Explorar Mercado").should("be.visible");
  });

  it("shows stats cards", () => {
    cy.contains("Trueques Completados").should("be.visible");
    cy.contains("Intercambios Activos").should("be.visible");
    cy.contains("Reputación").should("be.visible");
  });

  it("opens create service modal", () => {
    cy.contains("Publicar Servicio").click();
    cy.get('[role="dialog"]', { timeout: 5000 }).should("be.visible");
  });
});
