describe("Service Publishing", () => {
  
  const TEST_EMAIL = "test@example.com";
  const TEST_PASSWORD = "Test123456";

  beforeEach(() => {
    cy.login(TEST_EMAIL, TEST_PASSWORD);
    cy.visit("/services");
  });

  it("publishes a new service successfully", () => {

    cy.contains("Publicar Servicio").click();

    cy.get(".chakra-modal__content", { timeout: 10000 }).should("be.visible").within(() => {

      cy.get("input").first().type("Clases de Python");
      cy.get("textarea").type(
        "Enseño Python básico e intermedio, enfocado en proyectos reales."
      );

      cy.contains("Publicar Ahora").click();
    });
    cy.contains("¡Servicio Publicado!", { timeout: 10000 }).should("exist");

  });

  it("shows validation error when title and description are empty", () => {
    cy.contains("Publicar Servicio").click();
    cy.get(".chakra-modal__content", { timeout: 10000 }).should("be.visible").within(() => {

      cy.contains("Publicar Ahora").click();
    });
    cy.contains("Faltan datos", { timeout: 10000 }).should("be.visible");

  });
});
