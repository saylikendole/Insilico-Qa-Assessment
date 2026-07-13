const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // The app under test is the hosted Escher application.
    baseUrl: "https://escher.github.io",
    // Escher loads a fair amount of JS and renders an SVG canvas, so give
    // commands a generous timeout rather than the 4s default.
    defaultCommandTimeout: 15000,
    // Where downloaded files (the "save map" test) land.
    downloadsFolder: "cypress/downloads",
    video: false,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
