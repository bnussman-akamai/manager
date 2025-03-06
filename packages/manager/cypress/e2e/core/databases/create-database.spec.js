"use strict";
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
var databases_1 = require("support/constants/databases");
var account_1 = require("support/intercepts/account");
var databases_2 = require("support/intercepts/databases");
var events_1 = require("support/intercepts/events");
var ui_1 = require("support/ui");
var regions_1 = require("support/util/regions");
var factories_1 = require("src/factories");
describe('create a database cluster, mocked data', function () {
    databases_1.databaseConfigurations.forEach(function (configuration) {
        // @TODO Add assertions for DBaaS pricing.
        it("creates a ".concat(configuration.linodeType, " ").concat(configuration.engine, " v").concat(configuration.version, ".x ").concat(configuration.clusterSize, "-node cluster"), function () {
            // Database mock immediately after instance has been created.
            var databaseMock = factories_1.databaseFactory.build({
                cluster_size: configuration.clusterSize,
                engine: configuration.dbType,
                hosts: {
                    primary: undefined,
                    secondary: undefined,
                },
                label: configuration.label,
                region: configuration.region.id,
                status: 'provisioning',
                type: configuration.linodeType,
                version: configuration.version,
            });
            // Database mock once instance has been provisioned.
            var databaseMockActive = __assign(__assign({}, databaseMock), { status: 'active' });
            var databaseRegionLabel = (0, regions_1.getRegionById)(databaseMock.region).label;
            // Event mock which will trigger Cloud to re-fetch DBaaS instance.
            var eventMock = factories_1.eventFactory.build({
                action: 'database_create',
                entity: {
                    id: databaseMock.id,
                    label: databaseMock.label,
                    type: 'database',
                    url: "/v4/databases/".concat(configuration.dbType, "/instances/").concat(databaseMock.id),
                },
                percent_complete: 100,
                secondary_entity: undefined,
                status: 'finished',
            });
            var clusterSizeSelection = configuration.clusterSize > 1 ? '3 Nodes' : '1 Node';
            var clusterCpuType = configuration.linodeType.indexOf('-dedicated-') !== -1
                ? 'Dedicated CPU'
                : 'Shared CPU';
            // Mock account to ensure 'Managed Databases' capability.
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build()).as('getAccount');
            (0, databases_2.mockGetDatabaseEngines)(databases_1.mockDatabaseEngineTypes).as('getDatabaseEngines');
            (0, databases_2.mockCreateDatabase)(databaseMock).as('createDatabase');
            (0, databases_2.mockGetDatabases)([databaseMock]).as('getDatabases');
            (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
            cy.visitWithLogin('/databases/create');
            cy.wait(['@getAccount', '@getDatabaseEngines', '@getDatabaseTypes']);
            ui_1.ui.entityHeader
                .find()
                .should('be.visible')
                .within(function () {
                cy.findByText('Create').should('be.visible');
            });
            cy.findByText('Cluster Label').should('be.visible').click();
            cy.focused().type(configuration.label);
            cy.findByText('Database Engine').should('be.visible').click();
            cy.focused().type("".concat(configuration.engine, " v").concat(configuration.version, "{enter}"));
            ui_1.ui.regionSelect.find().click();
            cy.focused().type("".concat(databaseRegionLabel, "{enter}"));
            // Click either the "Dedicated CPU" or "Shared CPU" tab, according
            // to the type of cluster being created.
            cy.findByText(clusterCpuType).should('be.visible').click();
            cy.get("[id=\"".concat(configuration.linodeType, "\"]")).click();
            // Database cluster size selection.
            cy.contains(clusterSizeSelection).should('be.visible').click();
            // Create database, confirm redirect, and that new instance is listed.
            cy.findByText('Create Database Cluster').should('be.visible').click();
            cy.wait('@createDatabase');
            // TODO Update assertions upon completion of M3-7030.
            cy.url().should('endWith', "/databases/".concat(databaseMock.engine, "/").concat(databaseMock.id));
            cy.findByText(databaseMock.label).should('be.visible');
            cy.findByText(databaseRegionLabel).should('be.visible');
            // Navigate back to landing page.
            ui_1.ui.entityHeader.find().within(function () {
                cy.findByText('Database Clusters').should('be.visible').click();
            });
            cy.url().should('endWith', '/databases');
            cy.wait('@getDatabases');
            cy.findByText(databaseMock.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText("".concat(configuration.engine, " v").concat(configuration.version), {
                    exact: false,
                }).should('be.visible');
                cy.findByText(configuration.region.label, {
                    exact: false,
                }).should('be.visible');
            });
            // Mock next request to fetch databases so that instance appears active.
            // Mock next event request to trigger Cloud to re-fetch DBaaS instances.
            (0, databases_2.mockGetDatabases)([databaseMockActive]).as('getDatabases');
            (0, events_1.mockGetEvents)([eventMock]).as('getEvents');
            cy.wait(['@getEvents', '@getDatabases']);
            cy.findByText(databaseMock.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('Active').should('be.visible');
            });
        });
    });
});
