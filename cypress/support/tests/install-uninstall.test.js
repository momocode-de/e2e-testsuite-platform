import Route from "../components/route";

export default class InstallUninstallTest {
    describe(
        pluginName,
        prepareUninstallTest,
        validateThatDataStillExistsAfterUninstall,
        validateThatDataStillExistsAfterReinstall,
        validateThatDataNotExistsAnymoreAfterUninstall,
        validateThatDataNotExistsAnymoreAfterReinstall
    ) {
        describe('Plugin: Test plugin installation process', () => {
            beforeEach(() => {
                cy.setToInitialState()
                    .then(() => {
                        cy.loginViaApi();
                    })
                    .then(() => {
                        cy.openInitialPage(`${Cypress.env('admin')}#/sw/extension/my-extensions/listing/app`);
                    });
            });

            it('should show the plugin as installed and activated', () => {
                cy.get('.sw-extension-my-extensions-listing')
                    .contains(pluginName)
                    .then(($cellContent) => {
                        const row = $cellContent.parent().parent().parent();

                        cy.get(row).within(() => {
                            cy.get('input[type="checkbox"]').should('be.checked');
                        });
                    });
            });

            it('should uninstall the plugin without removing data', () => {
                // The uninstall modal exists since 6.3.0.0. Before the plugin data was always deleted, so we can't continue the test.
                prepareUninstallTest().then(() => {
                    cy.onlyFromVersion('6.3.0.0', () => {
                        const entitySchemaRoute = new Route(`${Cypress.env('apiPath')}/_info/entity-schema.json`, 'entitySchemaRoute', 'get');
                        const uninstallRoute = new Route(`${Cypress.env('apiPath')}/_action/extension/uninstall/plugin/*`, 'uninstallRoute', 'post');
                        const installRoute = new Route(`${Cypress.env('apiPath')}/_action/extension/install/plugin/*`, 'installRoute', 'post');
                        const activateRoute = new Route(`${Cypress.env('apiPath')}/_action/extension/activate/plugin/*`, 'activateRoute', 'put');

                        cy.server();
                        entitySchemaRoute.register();
                        uninstallRoute.register();
                        installRoute.register();
                        activateRoute.register();

                        cy.get('.sw-extension-my-extensions-listing')
                            .contains(pluginName)
                            .then(($cellContent) => {
                                const row = $cellContent.parent().parent().parent();

                                // Open context menu for that row
                                cy.get(row).within(() => {
                                    cy.get('.sw-context-button__button').click();
                                });

                                // Click uninstall
                                cy.get('.sw-context-menu .sw-context-menu-item--danger')
                                    .click();

                                // Uncheck remove data checkbox
                                cy.get('input[name="sw-field--removePluginData"]').uncheck();

                                // Apply uninstall
                                cy.get('.sw-modal__footer .sw-button--danger')
                                    .click();

                                // Wait for the uninstall request
                                uninstallRoute.wait(204);

                                // Wait for entity-schema request, because that indicates that the page was reloaded
                                entitySchemaRoute.wait(200);
                            });

                        cy.get('.sw-extension-my-extensions-listing')
                            .contains(pluginName)
                            .then(($cellContent) => {
                                const row = $cellContent.parent().parent().parent();

                                // Confirm that the plugin is deactivated
                                cy.get(row).within(() => {
                                    cy.get('input[type="checkbox"]').should('not.be.checked');
                                });

                                validateThatDataStillExistsAfterUninstall();
                            });

                        cy.get('.sw-extension-my-extensions-listing')
                            .contains(pluginName)
                            .then(($cellContent) => {
                                const row = $cellContent.parent().parent().parent();

                                // Install the plugin again

                                // Click install
                                cy.get(row).within(() => {
                                    cy.get('.sw-extension-card-base__main-action .sw-extension-card-base__open-extension')
                                        .click();
                                });

                                // Wait for the install request (page is not reloaded)
                                installRoute.wait(204);

                                // Wait for entity-schema request, because that indicates that the page was reloaded
                                entitySchemaRoute.wait(200);
                            });

                        cy.get('.sw-extension-my-extensions-listing')
                            .contains(pluginName)
                            .then(($cellContent) => {
                                const row = $cellContent.parent().parent().parent();

                                // Activate plugin
                                cy.get(row).within(() => {
                                    cy.get('input[type="checkbox"]').check();
                                });

                                // Wait for the activate
                                activateRoute.wait(204);

                                // Wait for entity-schema request, because that indicates that the page was reloaded
                                entitySchemaRoute.wait(200);
                            });

                        cy.get('.sw-extension-my-extensions-listing')
                            .contains(pluginName)
                            .then(($cellContent) => {
                                const row = $cellContent.parent().parent().parent();

                                // Confirm that plugin is activated
                                cy.get(row).within(() => {
                                    cy.get('input[type="checkbox"]').should('be.checked');
                                });

                                validateThatDataStillExistsAfterReinstall();
                            });
                    });
                });
            });

            it('should uninstall the plugin with removing data', () => {
                prepareUninstallTest().then(() => {
                    const entitySchemaRoute = new Route(`${Cypress.env('apiPath')}/_info/entity-schema.json`, 'entitySchemaRoute', 'get');
                    const uninstallRoute = new Route(`${Cypress.env('apiPath')}/_action/extension/uninstall/plugin/*`, 'uninstallRoute', 'post');
                    const installRoute = new Route(`${Cypress.env('apiPath')}/_action/extension/install/plugin/*`, 'installRoute', 'post');
                    const activateRoute = new Route(`${Cypress.env('apiPath')}/_action/extension/activate/plugin/*`, 'activateRoute', 'put');

                    cy.server();
                    entitySchemaRoute.register();
                    uninstallRoute.register();
                    installRoute.register();
                    activateRoute.register();

                    cy.get('.sw-extension-my-extensions-listing')
                        .contains(pluginName)
                        .then(($cellContent) => {
                            const row = $cellContent.parent().parent().parent();

                            // Open context menu for that row
                            cy.get(row).within(() => {
                                cy.get('.sw-context-button__button').click();
                            });

                            // Click uninstall
                            cy.get('.sw-context-menu .sw-context-menu-item--danger')
                                .click();

                            // Check remove data checkbox
                            cy.get('input[name="sw-field--removePluginData"]').check();

                            // Apply uninstall
                            cy.get('.sw-modal__footer .sw-button--danger')
                                .click();

                            // Wait for the uninstall request
                            uninstallRoute.wait(204);

                            // Wait for entity-schema request, because that indicates that the page was reloaded
                            entitySchemaRoute.wait(200);
                        });

                    cy.get('.sw-extension-my-extensions-listing')
                        .contains(pluginName)
                        .then(($cellContent) => {
                            const row = $cellContent.parent().parent().parent();

                            // Confirm that the plugin is deactivated
                            cy.get(row).within(() => {
                                cy.get('input[type="checkbox"]').should('not.be.checked');
                            });

                            validateThatDataNotExistsAnymoreAfterUninstall();
                        });

                    cy.get('.sw-extension-my-extensions-listing')
                        .contains(pluginName)
                        .then(($cellContent) => {
                            const row = $cellContent.parent().parent().parent();

                            // Install the plugin again

                            // Click install
                            cy.get(row).within(() => {
                                cy.get('.sw-extension-card-base__main-action .sw-extension-card-base__open-extension')
                                    .click();
                            });

                            // Wait for the install request (page is not reloaded)
                            installRoute.wait(204);

                            // Wait for entity-schema request, because that indicates that the page was reloaded
                            entitySchemaRoute.wait(200);
                        });

                    cy.get('.sw-extension-my-extensions-listing')
                        .contains(pluginName)
                        .then(($cellContent) => {
                            const row = $cellContent.parent().parent().parent();

                            // Activate plugin
                            cy.get(row).within(() => {
                                cy.get('input[type="checkbox"]').check();
                            });

                            // Wait for the activate
                            activateRoute.wait(204);

                            // Wait for entity-schema request, because that indicates that the page was reloaded
                            entitySchemaRoute.wait(200);
                        });

                    cy.get('.sw-extension-my-extensions-listing')
                        .contains(pluginName)
                        .then(($cellContent) => {
                            const row = $cellContent.parent().parent().parent();

                            // Confirm that plugin is activated
                            cy.get(row).within(() => {
                                cy.get('input[type="checkbox"]').should('be.checked');
                            });

                            validateThatDataNotExistsAnymoreAfterReinstall();
                        });
                });
            });
        });
    }
}
