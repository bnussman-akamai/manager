"use strict";
/**
 * @file DBaaS integration tests for update operations.
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
var feature_flags_1 = require("support/intercepts/feature-flags");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var databases_3 = require("src/factories/databases");
/**
 * Updates a database cluster's label.
 *
 * No assertion is made on the result of the update attempt.
 *
 * @param originalLabel - Original database cluster label.
 * @param newLabel - Desired new label for database cluster.
 */
var updateDatabaseLabel = function (originalLabel, newLabel) {
    cy.get('[data-qa-header]')
        .should('be.visible')
        .should('have.text', originalLabel);
    cy.findByLabelText("Edit ".concat(originalLabel)).click();
    cy.get('[data-qa-edit-field="true"]')
        .should('be.visible')
        .within(function () {
        cy.get('[data-testid="textfield-input"]').should('be.visible').click();
        cy.focused().clear();
        cy.focused().type(newLabel);
        cy.get('[data-qa-save-edit="true"]').should('be.visible').click();
    });
};
/**
 * Removes an allowed IP.
 *
 * This requires that the 'Summary' or 'Settings' tab is currently active. No
 * assertion is made on the result of the IP removal attempt.
 *
 * @param allowedIp - Allowed IP to remove.
 */
var removeAllowedIp = function (allowedIp) {
    cy.get('[data-qa-access-controls]').within(function () {
        cy.findByText(allowedIp)
            .should('be.visible')
            .within(function () {
            cy.findByText('Remove').should('be.visible').closest('button').click();
        });
    });
    ui_1.ui.dialog
        .findByTitle("Remove IP Address ".concat(allowedIp))
        .should('be.visible')
        .within(function () {
        ui_1.ui.buttonGroup
            .findButtonByTitle('Remove IP Address')
            .should('be.visible')
            .click();
    });
};
/**
 * Adds allowed IPs for a cluster via the "Manage Access Controls" drawer.
 *
 * This requires that the 'Summary' or 'Settings' tab is currently active. No
 * assertion is made on the result of the access control update attempt.
 *
 * @param allowedIps - New IPs to add.
 * @param existingIps - The number of existing IPs. Optional, default is `0`.
 */
var manageAccessControl = function (allowedIps, existingIps) {
    if (existingIps === void 0) { existingIps = 0; }
    cy.findByTestId('button-access-control').click();
    ui_1.ui.drawer
        .findByTitle('Manage Access')
        .should('be.visible')
        .within(function () {
        allowedIps.forEach(function (allowedIp, index) {
            if (existingIps > 0) {
                ui_1.ui.button.findByTitle('Add Another IP').click();
            }
            else {
                ui_1.ui.button.findByTitle('Add an IP').click();
            }
            cy.findByLabelText("Allowed IP Addresses or Ranges ip-address-".concat(index + existingIps)).click();
            cy.focused().type(allowedIp);
        });
        ui_1.ui.buttonGroup
            .findButtonByTitle('Update Access Controls')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
};
/**
 * Resets root password.
 *
 * This requires that the 'Settings' tab is currently active. No assertion is
 * made on the result of the root password reset attempt.
 */
var resetRootPassword = function () {
    ui_1.ui.button
        .findByAttribute('data-qa-settings-button', 'Reset Root Password')
        .should('be.visible')
        .click();
    ui_1.ui.dialog
        .findByTitle('Reset Root Password')
        .should('be.visible')
        .within(function () {
        ui_1.ui.buttonGroup
            .findButtonByTitle('Reset Root Password')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
};
describe('Update database clusters', function () {
    beforeEach(function () {
        var mockAccount = factories_1.accountFactory.build({
            capabilities: [
                'Akamai Cloud Pulse',
                'Block Storage',
                'Cloud Firewall',
                'Disk Encryption',
                'Kubernetes',
                'Linodes',
                'LKE HA Control Planes',
                'Machine Images',
                'Managed Databases',
                'NodeBalancers',
                'Object Storage Access Key Regions',
                'Object Storage Endpoint Types',
                'Object Storage',
                'Placement Group',
                'Vlans',
            ],
        });
        (0, feature_flags_1.mockAppendFeatureFlags)({
            dbaasV2: { beta: false, enabled: false },
        });
        (0, account_1.mockGetAccount)(mockAccount);
    });
    databases_1.databaseConfigurations.forEach(function (configuration) {
        describe("updates a ".concat(configuration.linodeType, " ").concat(configuration.engine, " v").concat(configuration.version, ".x ").concat(configuration.clusterSize, "-node cluster"), function () {
            /*
             * - Tests active database update UI flows using mocked data.
             * - Confirms that users can change database label.
             * - Confirms that users can change access controls.
             * - Confirms that users can reset root passwords.
             * - Confirms that users can change maintenance schedules.
             */
            it('Can update active database clusters', function () {
                var initialLabel = configuration.label;
                var updatedLabel = (0, random_1.randomLabel)();
                var allowedIp = (0, random_1.randomIp)();
                var newAllowedIp = (0, random_1.randomIp)();
                var initialPassword = (0, random_1.randomString)(16);
                var database = databases_3.databaseFactory.build({
                    allow_list: [allowedIp],
                    engine: configuration.dbType,
                    id: (0, random_1.randomNumber)(1, 1000),
                    label: initialLabel,
                    platform: 'rdbms-legacy',
                    region: configuration.region.id,
                    status: 'active',
                    type: configuration.linodeType,
                });
                (0, databases_2.mockGetDatabase)(database).as('getDatabase');
                (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
                (0, databases_2.mockResetPassword)(database.id, database.engine).as('resetRootPassword');
                (0, databases_2.mockGetDatabaseCredentials)(database.id, database.engine, initialPassword).as('getCredentials');
                cy.visitWithLogin("/databases/".concat(database.engine, "/").concat(database.id));
                cy.wait(['@getDatabase', '@getDatabaseTypes']);
                cy.get('[data-qa-cluster-config]').within(function () {
                    cy.findByText(configuration.region.label).should('be.visible');
                    cy.findByText(database.used_disk_size_gb + ' GB').should('be.visible');
                    cy.findByText(database.total_disk_size_gb + ' GB').should('be.visible');
                });
                cy.get('[data-qa-connection-details]').within(function () {
                    // "Show" button should be enabled to reveal password when DB is active.
                    cy.findByText('Show')
                        .closest('button')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                    cy.wait('@getCredentials');
                    cy.findByText("= ".concat(initialPassword));
                });
                (0, databases_2.mockUpdateDatabase)(database.id, database.engine, __assign(__assign({}, database), { label: updatedLabel })).as('updateDatabaseLabel');
                updateDatabaseLabel(initialLabel, updatedLabel);
                cy.wait('@updateDatabaseLabel');
                cy.get('[data-qa-header]')
                    .should('be.visible')
                    .should('have.text', updatedLabel);
                // Remove allowed IP, manage IP access control.
                (0, databases_2.mockUpdateDatabase)(database.id, database.engine, __assign(__assign({}, database), { allow_list: [] })).as('updateDatabaseAllowedIp');
                removeAllowedIp(allowedIp);
                cy.wait('@updateDatabaseAllowedIp');
                (0, databases_2.mockUpdateDatabase)(database.id, database.engine, __assign(__assign({}, database), { allow_list: [newAllowedIp] })).as('updateAccessControl');
                manageAccessControl([newAllowedIp]);
                cy.wait('@updateAccessControl');
                cy.get('[data-qa-access-controls]').within(function () {
                    cy.findByText(newAllowedIp).should('be.visible');
                });
                // Navigate to "Settings" tab.
                ui_1.ui.tabList.findTabByTitle('Settings').click();
                // Reset root password.
                resetRootPassword();
                cy.wait('@resetRootPassword');
                // Change maintenance.
                (0, databases_2.mockUpdateDatabase)(database.id, database.engine, database).as('updateDatabaseMaintenance');
                cy.findByText('Monthly').should('be.visible').click();
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.wait('@updateDatabaseMaintenance');
                ui_1.ui.toast.assertMessage('Maintenance Window settings saved successfully.');
            });
            /*
             * - Tests provisioning database update UI flows using mocked data.
             * - Confirms that database update flows work under error conditions.
             * - Confirms that users cannot change database label for provisioning DBs.
             * - Confirms that users cannot change access controls for provisioning DBs.
             * - Confirms that users cannot reset root passwords for provisioning DBs.
             * - Confirms that users cannot change maintenance schedules for provisioning DBs.
             */
            it('Cannot update database clusters while they are provisioning', function () {
                var initialLabel = configuration.label;
                var updateAttemptLabel = (0, random_1.randomLabel)();
                var allowedIp = (0, random_1.randomIp)();
                var database = databases_3.databaseFactory.build({
                    allow_list: [allowedIp],
                    engine: configuration.dbType,
                    hosts: {
                        primary: undefined,
                        secondary: undefined,
                    },
                    id: (0, random_1.randomNumber)(1, 1000),
                    label: initialLabel,
                    platform: 'rdbms-legacy',
                    region: configuration.region.id,
                    status: 'provisioning',
                    type: configuration.linodeType,
                });
                var errorMessage = 'Your database is provisioning; please wait until provisioning is complete to perform this operation.';
                var hostnameRegex = /your hostnames? will appear here once (it is|they are) available./i;
                (0, account_1.mockGetAccount)(factories_1.accountFactory.build()).as('getAccount');
                (0, databases_2.mockGetDatabase)(database).as('getDatabase');
                (0, databases_2.mockGetDatabaseTypes)(databases_1.mockDatabaseNodeTypes).as('getDatabaseTypes');
                (0, databases_2.mockUpdateProvisioningDatabase)(database.id, database.engine, errorMessage).as('updateDatabase');
                (0, databases_2.mockResetPasswordProvisioningDatabase)(database.id, database.engine, errorMessage).as('resetRootPassword');
                cy.visitWithLogin("/databases/".concat(database.engine, "/").concat(database.id));
                cy.wait(['@getAccount', '@getDatabase', '@getDatabaseTypes']);
                // Cannot update database label.
                updateDatabaseLabel(initialLabel, updateAttemptLabel);
                cy.wait('@updateDatabase');
                cy.findByText(errorMessage).should('be.visible');
                cy.get('[data-qa-cancel-edit="true"]')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.get('[data-qa-connection-details]').within(function () {
                    // DBaaS hostnames are not available until database/cluster has provisioned.
                    cy.findByText(hostnameRegex).should('be.visible');
                    // DBaaS passwords cannot be revealed until database/cluster has provisioned.
                    cy.findByText('Show')
                        .closest('button')
                        .should('be.visible')
                        .should('be.disabled');
                });
                // Cannot add or remove allowed IPs before database/cluster has provisioned.
                removeAllowedIp(allowedIp);
                cy.wait('@updateDatabase');
                ui_1.ui.dialog
                    .findByTitle("Remove IP Address ".concat(allowedIp))
                    .should('be.visible')
                    .within(function () {
                    cy.findByText(errorMessage).should('be.visible');
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('Cancel')
                        .should('be.visible')
                        .click();
                });
                manageAccessControl([(0, random_1.randomIp)()], 1);
                cy.wait('@updateDatabase');
                ui_1.ui.drawer.findByTitle('Manage Access').within(function () {
                    cy.findByText(errorMessage).should('be.visible');
                    ui_1.ui.drawerCloseButton.find().click();
                });
                // Navigate to "Settings" tab.
                ui_1.ui.tabList.findTabByTitle('Settings').click();
                // Cannot reset root password before database/cluster has provisioned.
                resetRootPassword();
                cy.wait('@resetRootPassword');
                ui_1.ui.dialog
                    .findByTitle('Reset Root Password')
                    .should('be.visible')
                    .within(function () {
                    cy.findByText(errorMessage).should('be.visible');
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('Cancel')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                // Cannot change maintenance schedule before database/cluster has provisioned.
                cy.findByText('Monthly').should('be.visible').click();
                ui_1.ui.button
                    .findByTitle('Save Changes')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.wait('@updateDatabase');
                cy.findByText(errorMessage).should('be.visible');
            });
        });
    });
});
