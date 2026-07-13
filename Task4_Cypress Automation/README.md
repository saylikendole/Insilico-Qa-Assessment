# Task 4 — Cypress automation for the Escher map viewer

Automated UI tests for the Escher app (https://escher.github.io/#/app?tool=Viewer),
covering: loading a map, saving a map, clearing a map, loading reaction data, and
clearing reaction data — plus valid/invalid input and edge cases.


## Structure — Page Object Model

This project uses the Page Object Model. All the Escher-specific selectors and actions
live in one place (`cypress/pages/EscherPage.js`), so the test specs read as plain
actions and assertions like `escher.loadMap(...)` and `escher.shouldHaveReaction(...)`.
If Escher's UI changes, only the page object needs updating — the tests themselves don't.

```
cypress.config.js
package.json
cypress/
  e2e/
    escher_map.cy.js          load / save / clear map
    escher_data.cy.js         load / clear reaction data
    escher_validation.cy.js   valid vs invalid input, empty data
  pages/
    EscherPage.js             page object — all selectors and actions in one place
  fixtures/
    qa_escher_map.json        provided map
    qa_escher_data.json       provided reaction data
    invalid_map.json          well-formed JSON but not a valid map (edge case)
    empty_data.json           {} (edge case)
  support/
    commands.js               kept minimal — interaction logic lives in the page object
    e2e.js
```

## How to run

```bash
npm install          # installs Cypress
npm run cy:open      # opens the Cypress UI — pick a spec and watch it run
# or
npm run cy:run       # runs all specs headlessly
```

## Approach

- **Menus are selected by visible text** (`cy.contains('Map')`), which is more robust
  against CSS/class changes than brittle selectors on a third-party app.
- **File loading uses `selectFile` on Escher's hidden file input** with `{ force: true }`.
  Escher parses and renders the file from the input's change event, so this triggers the load without a native OS file dialog (which Cypress can't drive).
  
- **Assertions are based on the provided data**: the map contains reactions PGI, PFK and GLCpts, so their labels appearing confirms a load, and disappearing confirms a clear.



