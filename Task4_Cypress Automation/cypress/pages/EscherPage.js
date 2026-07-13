// Page Object for the Escher map application.
//
// The idea of the Page Object Model is to keep everything about *how* to
// interact with the app (URLs, menus, selectors, file inputs) in one place,
// and let the test files describe *what* they are testing in plain terms.
// If Escher's UI changes, only this file needs updating — the specs don't.

class EscherPage {
  // ---- locators (kept together so a selector only changes in one place) ----
  elements = {
    canvas: () => cy.get("svg", { timeout: 30000 }),
    fileInputs: () => cy.get('input[type="file"]', { timeout: 15000 }),
    reactionLabel: (name) => cy.contains(name),
  };

  // The app path. If the Viewer build doesn't expose every menu action,
  // switch tool=Viewer to tool=Builder here.
  url = "/#/app?tool=Viewer";

  // The filename Escher uses when saving the provided E. coli core map.
  savedMapFile = "E coli core.Core metabolism.json";

  // ---- actions -------------------------------------------------------------

  // Open the app and wait until the map canvas is rendered.
  open() {
    cy.visit(this.url);
    this.elements.canvas().should("exist");
    return this;
  }

  // Navigate a top menu by visible text (robust against CSS changes).
  menu(topLabel, itemLabel) {
    cy.contains(topLabel).click();
    cy.contains(itemLabel).click();
    return this;
  }

  // Load a map by placing the file into Escher's (hidden) file input.
  // This fires the input's change handler and renders the map without a
  // native OS dialog, which Cypress cannot drive.
  loadMap(fixture) {
    this.elements.fileInputs().first().selectFile(`cypress/fixtures/${fixture}`, { force: true });
    return this;
  }

  clearMap() {
    return this.menu("Map", "Clear map");
  }

  saveMap() {
    return this.menu("Map", "Save map JSON");
  }

  // Load reaction data. Adjust which input if the app uses a separate one.
  loadData(fixture) {
    this.elements.fileInputs().last().selectFile(`cypress/fixtures/${fixture}`, { force: true });
    return this;
  }

  clearData() {
    return this.menu("Data", "Clear reaction data");
  }

  // ---- assertions ----------------------------------------------------------

  // A map with these reactions is considered loaded when the labels render.
  shouldHaveReaction(name) {
    this.elements.reactionLabel(name).should("exist");
    return this;
  }

  shouldNotHaveReaction(name) {
    this.elements.reactionLabel(name).should("not.exist");
    return this;
  }

  shouldHaveCanvas() {
    this.elements.canvas().should("exist");
    return this;
  }

  shouldHaveSavedFile() {
    cy.readFile(`cypress/downloads/${this.savedMapFile}`, { timeout: 10000 }).should("not.be.empty");
    return this;
  }
}

export default new EscherPage();
