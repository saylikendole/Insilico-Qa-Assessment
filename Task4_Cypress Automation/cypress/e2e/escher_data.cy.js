/// <reference types="cypress" />
import escher from "../pages/EscherPage";

// Reaction-data operations: load data onto a map and clear it.

describe("Escher — reaction data", () => {
  beforeEach(() => {
    escher.open();
    escher.loadMap("qa_escher_map.json"); // data attaches to a loaded map
    escher.shouldHaveReaction("PGI");
  });

  it("loads reaction data onto the map", () => {
    escher.loadData("qa_escher_data.json");
    escher.shouldHaveCanvas();
    escher.shouldHaveReaction("PGI");
  });

  it("clears reaction data", () => {
    escher.loadData("qa_escher_data.json");

    escher.clearData();
    escher.shouldHaveReaction("PGI");
    escher.shouldHaveCanvas();
  });
});
