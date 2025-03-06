"use strict";
/**
 * @file DBaaS integration tests for delete operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var databases_1 = require("support/constants/databases");
var account_1 = require("support/intercepts/account");
var databases_2 = require("support/intercepts/databases");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
describe('Delete database clusters', function () {
    databases_1.databaseConfigurations.forEach(function (configuration) {
        describe("Deletes a ".concat(configuration.linodeType, " ").concat(configuration.engine, " v").concat(configuration.version, ".x ").concat(configuration.clusterSize, "-node cluster"), function () {
            /*
             * - Tests database deletion UI flow using mocked data.
             * - Confirms that database deletion flow can be completed.
             * - Confirms that user is redirected to database landing page upon completion.
             */
            it('Can delete active database clusters', function () {
                var allowedIp = (0, random_1.randomIp)();
                var database = factories_1.databaseFactory.build({
                    allow_list: [allowedIp],
                    engine: configuration.dbType,
                    id: (0, random_1.randomNumber)(1, 1000),
                    label: configuration.label,
                    region: configuration.region.id,
                    status: 'active',
                    type: configuration.linodeType,
                });
                // Mock account to ensure 'Managed Databases' capability.
                (0, account_1.mockGetAccount)(factories_1.accountFactory.build()).as('getAccount');
                (0, databases_2.mockGetDatabase)(database).as('getDatabase');
                (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
                (0, databases_2.mockDeleteDatabase)(database.id, database.engine).as('deleteDatabase');
                cy.visitWithLogin("/databases/".concat(database.engine, "/").concat(database.id, "/settings"));
                cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);
                // Click "Delete Cluster" button.
                ui_1.ui.button
                    .findByAttribute('data-qa-settings-button', 'Delete Cluster')
                    .should('be.visible')
                    .click();
                // Fill out type-to-confirm, click "Delete Cluster" button, confirm error.
                ui_1.ui.dialog
                    .findByTitle("Delete Database Cluster ".concat(database.label))
                    .should('be.visible')
                    .within(function () {
                    cy.findByLabelText('Cluster Name').click();
                    cy.focused().type(database.label);
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('Delete Cluster')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                    cy.wait('@deleteDatabase');
                });
                cy.url().should('endWith', '/databases');
                ui_1.ui.toast.assertMessage('Database Cluster deleted successfully.');
            });
            /*
             * - Tests provisioning database deletion UI flow using mocked data.
             * - Confirms that error is shown to user upon deletion attempt.
             */
            it('Cannot delete provisioning database clusters', function () {
                var database = factories_1.databaseFactory.build({
                    allow_list: [],
                    engine: configuration.dbType,
                    hosts: {
                        primary: undefined,
                        secondary: undefined,
                    },
                    id: (0, random_1.randomNumber)(1, 1000),
                    label: configuration.label,
                    region: configuration.region.id,
                    status: 'provisioning',
                    type: configuration.linodeType,
                });
                var errorMessage = 'Your database is provisioning; please wait until provisioning is complete to perform this operation.';
                (0, account_1.mockGetAccount)(factories_1.accountFactory.build()).as('getAccount');
                (0, databases_2.mockGetDatabase)(database).as('getDatabase');
                (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
                (0, databases_2.mockDeleteProvisioningDatabase)(database.id, database.engine, errorMessage).as('deleteDatabase');
                cy.visitWithLogin("/databases/".concat(database.engine, "/").concat(database.id, "/settings"));
                cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);
                // Click "Delete Cluster" button.
                ui_1.ui.button
                    .findByAttribute('data-qa-settings-button', 'Delete Cluster')
                    .should('be.visible')
                    .click();
                // Fill out type-to-confirm, click "Delete Cluster" button, confirm error.
                ui_1.ui.dialog
                    .findByTitle("Delete Database Cluster ".concat(database.label))
                    .should('be.visible')
                    .within(function () {
                    cy.findByLabelText('Cluster Name').click();
                    cy.focused().type(database.label);
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('Delete Cluster')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                    cy.wait('@deleteDatabase');
                    cy.findByText(errorMessage).should('be.visible');
                });
            });
        });
    });
});
