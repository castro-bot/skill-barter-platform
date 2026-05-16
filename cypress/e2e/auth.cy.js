describe("Authentication", () => {

  const uniqueEmail = `test_${Date.now()}@example.com`;
  const password = "Test123456";
  const name = "Cypress User";

  beforeEach(() => {

    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it("shows login page by default", () => {

    cy.visit("/login");
    cy.contains("SkillBarter").should("be.visible");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.contains("Iniciar Sesión").should("be.visible");
  });

  it("shows validation error on empty submit", () => {

    cy.visit("/login");
    cy.contains("Iniciar Sesión").click();
    cy.contains("Por favor completa todos los campos").should("be.visible");
  });

  it("shows error on invalid credentials", () => {

    cy.visit("/login");
    cy.get('input[type="email"]').type("wrong@wrong.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.contains("Iniciar Sesión").click();
    cy.get('[data-testid="error-message"]', { timeout: 10000 }).should("exist");
  });

  it("registers a new user and redirects to /services", () => {

    cy.visit("/register");
    cy.get('input[placeholder="Ej. Juan Pérez"]').type(name);
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type(password);
    cy.contains("Registrarse").click();
    cy.url({ timeout: 10000 }).should("include", "/services");
  });

  it("logs in with registered user", () => {

    cy.visit("/login");
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type(password);
    cy.contains("Iniciar Sesión").click();
    cy.url({ timeout: 10000 }).should("include", "/services");
    cy.contains("Hola").should("be.visible");
  });

  it("redirects unauthenticated user to /login", () => {

    cy.visit("/services");
    cy.url().should("include", "/login");
  });

  it("navigates between login and register", () => {
    
    cy.visit("/login");
    cy.contains("Regístrate gratis").click();
    cy.url().should("include", "/register");
    cy.contains("Inicia Sesión aquí").click();
    cy.url().should("include", "/login");
  });
});
