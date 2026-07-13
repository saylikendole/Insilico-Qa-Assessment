/// <reference types="cypress" />
import escher from "../pages/EscherPage";

// Map operations: load, clear and save. The spec now reads as plain actions
// and assertions — all the selector detail lives in the page object.

describe("Escher — map operations", () => {
  beforeEach(() => {
    escher.open();
  });

  it("loads a map from a JSON file", () => {
    escher.loadMap("qa_escher_map.json");
    escher.shouldHaveReaction("PGI");
    escher.shouldHaveReaction("PFK");
    escher.shouldHaveReaction("GLCpts");
  });

  it("clears a loaded map", () => {
    escher.loadMap("qa_escher_map.json");
    escher.shouldHaveReaction("PGI");

    escher.clearMap();
    escher.shouldNotHaveReaction("PGI");
  });

  it("saves a map to a JSON file", () => {
    escher.loadMap("qa_escher_map.json");
    escher.shouldHaveReaction("PGI");

    escher.saveMap();
    escher.shouldHaveSavedFile();
  });
});
