describe("Trade Flows", () => {

  const RECEIVER = {
    name: "Receiver User",
    email: "receiver@test.com",
    password: "Test123456",
  };
  const PROPOSER = {
    name: "Proposer User",
    email: "proposer@test.com",
    password: "Test123456",
  };

  let receiverToken, proposerToken, receiverServiceId, proposerServiceId;

  before(() => {
    
    cy.ensureUser(RECEIVER.name, RECEIVER.email, RECEIVER.password)
      .then((token) => {
        receiverToken = token;
        return cy.createService(token, {
          title: "Clases de Guitarra",
          description: "Enseño guitarra para principiantes y nivel básico.",
          category: "Música",
        });
      })
      .then((service) => {
        receiverServiceId = service.id;
      });

    cy.ensureUser(PROPOSER.name, PROPOSER.email, PROPOSER.password)
      .then((token) => {
        proposerToken = token;
        return cy.createService(token, {
          title: "Diseño de Logos",
          description: "Diseño logos profesionales para emprendedores.",
          category: "Diseño Gráfico",
        });
      })
      .then((service) => {
        proposerServiceId = service.id;
      });
  });


  it("proposer can propose a trade via the service detail page", () => {
    cy.login(PROPOSER.email, PROPOSER.password);
    cy.visit(`/services/${receiverServiceId}`);


    cy.contains("Proponer Intercambio", { timeout: 10000 }).click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should("be.visible");


    cy.get('[role="dialog"] select option')
      .not('[value=""]')
      .should("have.length.at.least", 1);

    cy.get('[role="dialog"] select').select(proposerServiceId);

    cy.contains("Enviar Propuesta").click();

    cy.contains("¡Propuesta enviada!", { timeout: 10000 }).should("exist");

  });

  describe("Incoming trade actions (as receiver)", () => {

    beforeEach(() => {
      cy.proposeTrade(proposerToken, {
        proposerServiceId,
        receiverServiceId,
        note: "Propuesta de prueba automatizada",
      });

      cy.login(RECEIVER.email, RECEIVER.password);
      cy.visit("/trades");
    });

    it("accepts a pending incoming trade and provides WhatsApp contact", () => {
      cy.contains("Aceptar Trueque", { timeout: 10000 }).first().click();


      cy.get(".chakra-modal__content", { timeout: 10000 }).should("be.visible").within(() => {
        cy.get("input").type("0994601733");

        cy.contains("Aceptar y Compartir").click();
      });

      cy.contains("¡Trueque Aceptado!", { timeout: 10000 }).should("exist");

    });

    it("rejects a pending incoming trade", () => {
      cy.contains("Rechazar", { timeout: 10000 }).first().click();
      cy.contains("Trueque Rechazado", { timeout: 10000 }).should("be.visible");

    });
  });

  it("an accepted trade can be marked as completed", () => {

    cy.proposeTrade(proposerToken, { proposerServiceId, receiverServiceId })
      .then((trade) =>
        cy.respondTrade(receiverToken, trade.id, "accept", "0994601733")
      );

    cy.login(RECEIVER.email, RECEIVER.password);
    cy.visit("/trades");

    cy.contains("Completar", { timeout: 10000 }).first().click();
    cy.contains("Trueque completado", { timeout: 10000 }).should("exist");

  });
});
