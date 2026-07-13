/// <reference types="cypress" />
import escher from "../pages/EscherPage";

// Valid vs invalid input, and edge cases.

describe("Escher — input validation and edge cases", () => {
  beforeEach(() => {
    escher.open();
  });

  it("accepts a valid map file", () => {
    escher.loadMap("qa_escher_map.json");
    escher.shouldHaveReaction("PGI");
  });

  it("rejects an invalid map file without crashing", () => {
    // invalid_map.json is well-formed JSON but not a valid Escher map.
    escher.loadMap("invalid_map.json");
    escher.shouldNotHaveReaction("PGI");
    cy.get("body").should("be.visible"); // app still usable, no crash
  });

  it("handles empty reaction data without breaking the map", () => {
    escher.loadMap("qa_escher_map.json");
    escher.shouldHaveReaction("PGI");

    escher.loadData("empty_data.json"); // {}
    escher.shouldHaveReaction("PGI");
    escher.shouldHaveCanvas();
  });
});
