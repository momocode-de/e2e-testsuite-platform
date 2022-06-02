const FixtureManager = require('../service/fixture-manager.service');
const compareVersions = require('compare-versions');

cy.fixtureManager = new FixtureManager();

function getApiPath() {
    const shopwareVersion = Cypress.config('shopwareVersion');
    let apiPath = '/api';
    if (compareVersions.compare(shopwareVersion, '6.4.0.0', '<')) {
        apiPath += '/v2'
    }

    return apiPath;
}

/**
 * Sets Shopware back to its initial state
 * @memberOf Cypress.Chainable#
 * @name setToInitialState
 * @function
 */
Cypress.Commands.overwrite('setToInitialState', (original) => {
    cy.fixtureManager.reset();
    return original();
});

/**
 * Create fixtures by a given type
 * @memberOf Cypress.Chainable#
 * @name createFixturesByType
 * @function
 * @param {String} [type] - Fixture type
 * @param {Object} [overwrites] - Overwrites for fixtures
 */
Cypress.Commands.add('createFixturesByType', (type, overwrites = {}) => {
    return cy.fixtureManager.createFixture(type, overwrites);
});

/**
 * Clone a cms page via requests
 * @memberOf Cypress.Chainable#
 * @name cloneCmsPage
 * @function
 * @param {Object} [originalName={}] - Name of the original cms page
 * @param {Object} [clonedName={}] - Name the cloned cms page should be renamed to
 */
Cypress.Commands.add('cloneCmsPage', (originalName, clonedName) => {
    // Search cms page by name to get the ID later
    return cy.searchViaAdminApi({
        endpoint: 'cms-page',
        data: {
            field: 'name',
            value: originalName
        }
    }).then((cmsPage) => {
        // Clone the cms page
        return cy.authenticate().then((result) => {
            const requestConfig = {
                headers: {
                    Authorization: `Bearer ${result.access}`
                },
                method: 'POST',
                url: `${getApiPath()}/_action/clone/cms-page/${cmsPage.id}`
            };
            return cy.request(requestConfig);
        });
    }).then((result) => {
        // Rename cloned cms page
        cy.authenticate().then((authResult) => {
            const requestConfig = {
                headers: {
                    Authorization: `Bearer ${authResult.access}`
                },
                method: 'PATCH',
                url: `${getApiPath()}/cms-page/${result.body.id}`,
                body: {
                    name: clonedName
                }
            };
            return cy.request(requestConfig);
        });

        // Return previous result
        return cy.wrap(result);
    });
});

/**
 * Clone a cms page via requests
 * @memberOf Cypress.Chainable#
 * @name setCategoryCmsPage
 * @function
 * @param {String} [categoryName={}] - Name of the category
 * @param {String} [cmsPageId={}] - Id of the cms page
 */
Cypress.Commands.add('setCategoryCmsPage', (categoryName, cmsPageId) => {
    // Search cms page by name to get the ID later
    return cy.searchViaAdminApi({
        endpoint: 'category',
        data: {
            field: 'name',
            value: categoryName
        }
    }).then((result) => {
        if (result.id) {
            // Update category
            return cy.authenticate().then((authResult) => {
                const requestConfig = {
                    headers: {
                        Authorization: `Bearer ${authResult.access}`
                    },
                    method: 'PATCH',
                    url: `${getApiPath()}/category/${result.id}`,
                    body: {
                        cmsPageId: cmsPageId
                    }
                };
                return cy.request(requestConfig);
            });
        }
    });
});

/**
 * Add a domain to a sales channel
 * @memberOf Cypress.Chainable#
 * @name addDomainToSalesChannel
 * @function
 * @param {String} [salesChannelName] - Name of the sales channel
 * @param {String} [languageName] - Name of the domains language
 * @param {String} [currencyName] - Name of the domains currency
 * @param {String} [snippetSetName] - Name of the domains snippet set
 * @param {String} [url] - URL for the new domain
 */
Cypress.Commands.add('addDomainToSalesChannel', (salesChannelName, languageName, currencyName, snippetSetName, url) => {
    let salesChannelId = null;
    let languageId = null;
    let currencyId = null;
    let snippetSetId = null;

    // Search sales channel by name to get the ID later
    return cy.searchViaAdminApi({
        endpoint: 'sales-channel',
        data: {
            field: 'name',
            value: salesChannelName
        }
    }).then((salesChannel) => {
        salesChannelId = salesChannel.id;

        return cy.searchViaAdminApi({
            endpoint: 'language',
            data: {
                field: 'name',
                value: languageName
            }
        });
    }).then((language) => {
        languageId = language.id;

        return cy.searchViaAdminApi({
            endpoint: 'currency',
            data: {
                field: 'name',
                value: currencyName
            }
        });
    }).then((currency) => {
        currencyId = currency.id;

        return cy.searchViaAdminApi({
            endpoint: 'snippet-set',
            data: {
                field: 'name',
                value: snippetSetName
            }
        });
    }).then((snippetSet) => {
        snippetSetId = snippetSet.id;

        // Add domain to the sales channel and save
        return cy.authenticate().then((result) => {
            const requestConfig = {
                headers: {
                    Authorization: `Bearer ${result.access}`
                },
                method: 'PATCH',
                url: `${getApiPath()}/sales-channel/${salesChannelId}`,
                body: {
                    domains: [
                        {
                            currencyId: currencyId,
                            hreflangUseOnlyLocale: false,
                            languageId: languageId,
                            snippetSetId: snippetSetId,
                            url: url
                        }
                    ]
                }
            };
            return cy.request(requestConfig);
        });
    });
});


/**
 * Set a system config via api
 * @memberOf Cypress.Chainable#
 * @name setSystemConfig
 * @function
 * @param {String} [key={}] - Name of the configuration
 * @param {String|Boolean|Number} [value={}] - Value of the configuration
 */
Cypress.Commands.add('setSystemConfig', (key, value) => {
    const configurations = {};
    configurations[key] = value;
    return cy.authenticate().then((authResult) => {
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${authResult.access}`
            },
            method: 'POST',
            url: `${getApiPath()}/_action/system-config/batch`,
            body: {
                null: configurations
            }
        };
        return cy.request(requestConfig);
    });
});
