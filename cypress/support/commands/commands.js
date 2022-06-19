const compareVersions = require('compare-versions');

/**
 * Types in an sw-select field
 * @memberOf Cypress.Chainable#
 * @name typeProductNumberToProductSelect
 * @function
 * @param {String} productNumber - Desired number of the product
 * @param {String} selector - selector of the element
 */
Cypress.Commands.add('typeProductNumberToProductSelect', {
    prevSubject: 'element'
}, (subject, productNumber, selector) => {
    const resultPrefix = '.sw-select';
    const inputCssSelector = `.sw-select__selection input`;

    cy.wrap(subject).should('be.visible');
    cy.wrap(subject).click();

    cy.get('.sw-select-result-list').should('exist');
    cy.get(`${selector} ${inputCssSelector}`).clear();
    cy.get(`${selector} ${inputCssSelector}`).type(productNumber);
    cy.get(`${selector} ${inputCssSelector}`).should('have.value', productNumber);

    // Wait the debounce time for the search to begin
    cy.wait(500);

    cy.get(`${selector}.sw-loader__element`).should('not.exist');

    cy.get(`${selector} .is--disabled`).should('not.exist');

    cy.get('.sw-select-result__result-item-text').should('be.visible');

    // Select the first element
    cy.get(`${resultPrefix}-option--0`).click({force: true});

    cy.get(`${selector} .sw-select-result-list`).should('not.exist');
});

/**
 * Types in an sw-select field
 * @memberOf Cypress.Chainable#
 * @name typeSingleSelectAndNotSelect
 * @function
 * @param {String} value - Desired value of the element
 * @param {String} selector - selector of the element
 */
Cypress.Commands.add('typeSingleSelectAndNotSelect', {
    prevSubject: 'element'
}, (subject, value, selector) => {
    const inputCssSelector = `.sw-select__selection input`;

    cy.wrap(subject).should('be.visible');
    cy.wrap(subject).click();

    cy.get('.sw-select-result-list').should('exist');
    cy.get(`${selector} ${inputCssSelector}`).clear();
    cy.get(`${selector} ${inputCssSelector}`).type(value);
    cy.get(`${selector} ${inputCssSelector}`).should('have.value', value);

    // Wait the debounce time for the search to begin
    cy.wait(500);

    cy.get(`${selector}.sw-loader__element`).should('not.exist');

    cy.get(`${selector} .is--disabled`).should('not.exist');

    cy.get('.sw-select-result__result-item-text').should('be.visible');
});

/**
 * Do something only for a given version and higher versions
 * @memberOf Cypress.Chainable#
 * @name onlyFromVersion
 * @function
 * @param {String} minVersion - Do something only for this and higher versions
 * @param {() => void} cb - Optional, run the given callback if the condition passes
 */
Cypress.Commands.add('onlyFromVersion', (minVersion, cb) => {
    let currentVersion = Cypress.config('shopwareVersion');
    let isVersionValid = compareVersions.compare(currentVersion, minVersion, '>=');

    if (!isVersionValid) {
        cy.log(`Skip test because the current version ${currentVersion} is not higher or equal ${minVersion}.`);
    }

    cy.onlyOn(isVersionValid, cb);
});

/**
 * Do something only for a given version and lower versions
 * @memberOf Cypress.Chainable#
 * @name onlyUntilVersion
 * @function
 * @param {String} maxVersion - Do something only for this and lower versions
 * @param {() => void} cb - Optional, run the given callback if the condition passes
 */
Cypress.Commands.add('onlyUntilVersion', (maxVersion, cb) => {
    let currentVersion = Cypress.config('shopwareVersion');
    let isVersionValid = compareVersions.compare(currentVersion, maxVersion, '<=');

    if (!isVersionValid) {
        cy.log(`Skip test because the current version ${currentVersion} is not lower or equal ${maxVersion}.`);
    }

    cy.onlyOn(isVersionValid, cb);
});

/**
 * This is a copy of typeSingleSelect, but with {force: true} in clear function
 *
 * @memberOf Cypress.Chainable#
 * @name typeSingleSelect
 * @function
 * @param {String} value - Desired value of the element
 * @param {String} selector - selector of the element
 */
Cypress.Commands.add(
  'typeSingleSelectForce',
  {
      prevSubject: 'element',
  },
  (subject, value, selector) => {
      const resultPrefix = '.sw-select';
      const inputCssSelector = `.sw-select__selection input`;

      cy.wrap(subject).should('be.visible');
      cy.wrap(subject).click();

      // type in the search term if available
      if (value) {
          cy.get('.sw-select-result-list').should('exist');
          cy.get(`${selector} ${inputCssSelector}`).clear({force: true});
          cy.get(`${selector} ${inputCssSelector}`).type(value);
          cy.get(`${selector} ${inputCssSelector}`).should(
            'have.value',
            value
          );

          // Wait the debounce time for the search to begin
          cy.wait(500);

          cy.get(`${selector}.sw-loader__element`).should('not.exist');

          cy.get(`${selector} .is--disabled`).should('not.exist');

          cy.get('.sw-select-result__result-item-text').should('be.visible');

          cy.get('.sw-select-result__result-item-text')
            .contains(value)
            .click({force: true});
      } else {
          // Select the first element
          cy.get(`${resultPrefix}-option--0`).click({force: true});
      }

      cy.get(`${selector} .sw-select-result-list`).should('not.exist');
  }
);