"use strict";
/**
 * @file DBaaS integration tests for resize operations.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var databases_1 = require("support/constants/databases");
var account_1 = require("support/intercepts/account");
var databases_2 = require("support/intercepts/databases");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var databases_3 = require("src/factories/databases");
/**
 * Resizes a current database cluster to a larger plan size.
 *
 * This requires that the 'Resize' tab is currently active. No
 * assertion is made on the result of the access control update attempt.
 *
 * @param initialLabel - Database label to resize.
 */
var resizeDatabase = function (initialLabel) {
    ui_1.ui.button
        .findByTitle('Resize Database Cluster')
        .should('be.visible')
        .should('be.enabled')
        .click();
    ui_1.ui.dialog
        .findByTitle("Resize Database Cluster ".concat(initialLabel, "?"))
        .should('be.visible')
        .within(function () {
        cy.findByLabelText('Cluster Name').click();
        cy.focused().type(initialLabel);
        ui_1.ui.buttonGroup
            .findButtonByTitle('Resize Cluster')
            .should('be.visible')
            .click();
    });
};
describe('Resizing existing clusters', function () {
    databases_1.databaseConfigurationsResize.forEach(function (configuration) {
        describe("Resizes a ".concat(configuration.linodeType, " ").concat(configuration.engine, " v").concat(configuration.version, ".x ").concat(configuration.clusterSize, "-node cluster (legacy DBaaS)"), function () {
            /*
             * - Tests active database resize UI flows using mocked data.
             * - Confirms that users can resize an existing database.
             * - Confirms that users can not downsize and smaller plans are disabled.
             * - Confirms that larger size plans are enabled to select for resizing and summary section displays pricing details for the selected plan.
             */
            it('Can resize active database clusters', function () {
                var initialLabel = configuration.label;
                var allowedIp = (0, random_1.randomIp)();
                var initialPassword = (0, random_1.randomString)(16);
                var database = databases_3.databaseFactory.build({
                    allow_list: [allowedIp],
                    cluster_size: 3,
                    engine: configuration.dbType,
                    id: (0, random_1.randomNumber)(1, 1000),
                    label: initialLabel,
                    platform: 'rdbms-legacy',
                    region: configuration.region.id,
                    status: 'active',
                    type: configuration.linodeType,
                });
                // Mock account to ensure 'Managed Databases' capability.
                var databaseType = databases_1.mockDatabaseNodeTypes.find(function (nodeType) { return nodeType.id === database.type; });
                if (!databaseType) {
                    throw new Error("Unknown database type ".concat(database.type));
                }
                (0, account_1.mockGetAccount)(factories_1.accountFactory.build()).as('getAccount');
                (0, databases_2.mockGetDatabase)(database).as('getDatabase');
                (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
                (0, databases_2.mockGetDatabaseCredentials)(database.id, database.engine, initialPassword).as('getCredentials');
                cy.visitWithLogin("/databases/".concat(database.engine, "/").concat(database.id));
                cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);
                cy.get('[data-reach-tab-list]').within(function () {
                    cy.findByText('Resize').should('be.visible').click();
                });
                ui_1.ui.button
                    .findByTitle('Resize Database Cluster')
                    .should('be.visible')
                    .should('be.disabled');
                var nodeTypeClass = '';
                ['Dedicated CPU', 'Shared CPU'].forEach(function (tabTitle) {
                    // Click on the tab we want.
                    ui_1.ui.button.findByTitle(tabTitle).should('be.visible').click();
                    if (tabTitle == 'Dedicated CPU') {
                        nodeTypeClass = 'dedicated';
                    }
                    else {
                        nodeTypeClass = 'standard';
                    }
                    // Find the smaller plans name using `nodeType` and check radio button is disabled to select
                    databases_1.mockDatabaseNodeTypes
                        .filter(function (nodeType) {
                        return nodeType.class === nodeTypeClass &&
                            nodeType.memory < databaseType.memory;
                    })
                        .forEach(function (nodeType) {
                        cy.get('[aria-label="List of Linode Plans"]')
                            .should('be.visible')
                            .each(function () {
                            cy.contains(nodeType.label).should('be.visible');
                            cy.get("[id=\"".concat(nodeType.id, "\"]")).should('be.disabled');
                        });
                    });
                    // Find the larger plans name using `nodeType` and check radio button is enabled to select
                    databases_1.mockDatabaseNodeTypes
                        .filter(function (nodeType) {
                        return nodeType.class === nodeTypeClass &&
                            nodeType.memory > databaseType.memory;
                    })
                        .forEach(function (nodeType) {
                        var _a;
                        cy.get('[aria-label="List of Linode Plans"]')
                            .should('be.visible')
                            .each(function () {
                            cy.get("[id=\"".concat(nodeType.id, "\"]"))
                                .should('be.enabled')
                                .click();
                        });
                        var desiredPlanPrice = (_a = nodeType.engines[configuration.dbType].find(function (dbClusterSizeObj) {
                            return dbClusterSizeObj.quantity === database.cluster_size;
                        })) === null || _a === void 0 ? void 0 : _a.price;
                        if (!desiredPlanPrice) {
                            throw new Error('Unable to find mock plan type');
                        }
                        cy.get('[data-testid="resizeSummary"]').within(function () {
                            cy.contains("".concat(nodeType.label)).should('be.visible');
                            cy.contains("$".concat(desiredPlanPrice.monthly, "/month")).should('be.visible');
                        });
                    });
                });
                // Find the current plan name using `nodeType` and check if it has current tag displaying in UI and radio button disabled,
                if (configuration.linodeType.includes('dedicated')) {
                    nodeTypeClass = 'dedicated';
                    ui_1.ui.button.findByTitle('Dedicated CPU').should('be.visible').click();
                }
                else {
                    nodeTypeClass = 'standard';
                    ui_1.ui.button.findByTitle('Shared CPU').should('be.visible').click();
                }
                databases_1.mockDatabaseNodeTypes
                    .filter(function (nodeType) {
                    // nodeType.class === nodeTypeClass &&
                    return nodeType.id === database.type;
                })
                    .forEach(function (nodeType) {
                    cy.get('[aria-label="List of Linode Plans"]')
                        .should('be.visible')
                        .each(function () {
                        cy.get("[data-qa-current-plan]")
                            .parent()
                            .should('contain', nodeType.label)
                            .should('contain', 'Current Plan');
                    });
                });
                var largePlan = databases_1.mockDatabaseNodeTypes.filter(function (nodeType) {
                    return nodeType.class === nodeTypeClass &&
                        nodeType.memory > databaseType.memory;
                });
                if (!databaseType) {
                    throw new Error("Unknown database type ".concat(database.type));
                }
                cy.get("[id=\"".concat(largePlan[0].id, "\"]")).click();
                (0, databases_2.mockResize)(database.id, database.engine, __assign(__assign({}, database), { type: 'g6-standard-32' })).as('scaleUpDatabase');
                resizeDatabase(initialLabel);
                cy.wait('@scaleUpDatabase');
            });
            /*
             * - Tests active database resize UI flows using mocked data.
             * - Confirms that users can resize an existing database from dedicated to shared.
             * - Confirms that users can resize an existing database from shared to dedicated.
             */
            it("Can resize active database clusters from ".concat(configuration.linodeType, " type and switch plan type"), function () {
                var initialLabel = configuration.label;
                var allowedIp = (0, random_1.randomIp)();
                var initialPassword = (0, random_1.randomString)(16);
                var database = databases_3.databaseFactory.build({
                    allow_list: [allowedIp],
                    cluster_size: 3,
                    engine: configuration.dbType,
                    id: (0, random_1.randomNumber)(1, 1000),
                    label: initialLabel,
                    region: configuration.region.id,
                    status: 'active',
                    type: configuration.linodeType,
                });
                // Mock account to ensure 'Managed Databases' capability.
                var databaseType = databases_1.mockDatabaseNodeTypes.find(function (nodeType) { return nodeType.id === database.type; });
                if (!databaseType) {
                    throw new Error("Unknown database type ".concat(database.type));
                }
                (0, account_1.mockGetAccount)(factories_1.accountFactory.build()).as('getAccount');
                (0, databases_2.mockGetDatabase)(database).as('getDatabase');
                (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
                (0, databases_2.mockGetDatabaseCredentials)(database.id, database.engine, initialPassword).as('getCredentials');
                cy.visitWithLogin("/databases/".concat(database.engine, "/").concat(database.id));
                cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);
                cy.get('[data-reach-tab-list]').within(function () {
                    cy.findByText('Resize').should('be.visible').click();
                });
                ui_1.ui.button
                    .findByTitle('Resize Database Cluster')
                    .should('be.visible')
                    .should('be.disabled');
                var nodeTypeClass = '';
                // Find the current plan name using `nodeType` and switch to another tab for selecting plan.
                if (configuration.linodeType.includes('dedicated')) {
                    nodeTypeClass = 'dedicated';
                    ui_1.ui.button.findByTitle('Shared CPU').should('be.visible').click();
                }
                else {
                    nodeTypeClass = 'standard';
                    ui_1.ui.button.findByTitle('Dedicated CPU').should('be.visible').click();
                }
                var largePlan = databases_1.mockDatabaseNodeTypes.filter(function (nodeType) {
                    return nodeType.class != nodeTypeClass &&
                        nodeType.memory > databaseType.memory;
                });
                if (!databaseType) {
                    throw new Error("Unknown database type ".concat(database.type));
                }
                cy.get("[id=\"".concat(largePlan[0].id, "\"]")).click();
                (0, databases_2.mockResize)(database.id, database.engine, __assign(__assign({}, database), { type: 'g6-standard-32' })).as('scaleUpDatabase');
                resizeDatabase(initialLabel);
                cy.wait('@scaleUpDatabase');
            });
            /*
             * - Tests resizing database using mocked data.
             * - Confirms that users cannot resize database  for provisioning DBs.
             * - Confirms that users cannot resize database  for restoring DBs.
             * - Confirms that users cannot resize database  for failed DBs.
             * - Confirms that users cannot resize database  for degraded DBs
             */
            it('Cannot resize database clusters while they are not in active state', function () {
                // const databaseStatus = ["provisioning", 'failed', 'restoring'];
                databases_3.possibleStatuses.forEach(function (dbstatus) {
                    if (dbstatus != 'active') {
                        var initialLabel = configuration.label;
                        var allowedIp = (0, random_1.randomIp)();
                        var database_1 = databases_3.databaseFactory.build({
                            allow_list: [allowedIp],
                            cluster_size: 3,
                            engine: configuration.dbType,
                            hosts: {
                                primary: undefined,
                                secondary: undefined,
                            },
                            id: (0, random_1.randomNumber)(1, 1000),
                            label: initialLabel,
                            region: configuration.region.id,
                            status: dbstatus,
                            type: configuration.linodeType,
                        });
                        var errorMessage = "Your database is ".concat(dbstatus, "; please wait until it becomes active to perform this operation.");
                        (0, account_1.mockGetAccount)(factories_1.accountFactory.build()).as('getAccount');
                        (0, databases_2.mockGetDatabase)(database_1).as('getDatabase');
                        (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
                        cy.visitWithLogin("/databases/".concat(database_1.engine, "/").concat(database_1.id));
                        cy.wait(['@getAccount', '@getDatabaseTypes', '@getDatabase']);
                        (0, databases_2.mockResize)(database_1.id, database_1.engine, __assign(__assign({}, database_1), { type: 'g6-standard-32' })).as('resizeDatabase');
                        (0, databases_2.mockResizeProvisioningDatabase)(database_1.id, database_1.engine, errorMessage).as('resizeDatabase');
                        cy.get('[data-reach-tab-list]').within(function () {
                            cy.findByText('Resize').should('be.visible').click();
                        });
                        var databaseType_1 = databases_1.mockDatabaseNodeTypes.find(function (nodeType) { return nodeType.id === database_1.type; });
                        if (!databaseType_1) {
                            throw new Error("Unknown database type ".concat(database_1.type));
                        }
                        var nodeTypeClass_1 = '';
                        if (configuration.linodeType.includes('standard')) {
                            nodeTypeClass_1 = 'standard';
                        }
                        else {
                            nodeTypeClass_1 = 'dedicated';
                        }
                        var largePlan = databases_1.mockDatabaseNodeTypes.filter(function (nodeType) {
                            return nodeType.class === nodeTypeClass_1 &&
                                nodeType.memory > databaseType_1.memory;
                        });
                        if (!databaseType_1) {
                            throw new Error("Unknown database type ".concat(database_1.type));
                        }
                        cy.get("[id=\"".concat(largePlan[0].id, "\"]")).click();
                        resizeDatabase(initialLabel);
                        cy.wait('@resizeDatabase');
                        cy.findByText(errorMessage).should('be.visible');
                        cy.get('[data-qa-cancel="true"]')
                            .should('be.visible')
                            .should('be.enabled')
                            .click();
                    }
                });
            });
        });
    });
});
