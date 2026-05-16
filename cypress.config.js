const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      apiUrl: "http://localhost:3001/api/v1",
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
