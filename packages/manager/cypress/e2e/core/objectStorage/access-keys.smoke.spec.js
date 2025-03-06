"use strict";
/**
 * @file Smoke tests for crucial Object Storage Access Keys operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var objectStorage_1 = require("src/factories/objectStorage");
var feature_flags_1 = require("support/intercepts/feature-flags");
var object_storage_1 = require("support/intercepts/object-storage");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var account_1 = require("support/intercepts/account");
describe('object storage access keys smoke tests', function () {
    /*
     * - Tests core object storage key create flow using mocked API responses.
     * - Creates access key.
     * - Confirms access key and secret are displayed.
     * - Confirms access key is listed in table.
     */
    it('can create access key - smoke', function () {
        var mockAccessKey = objectStorage_1.objectStorageKeyFactory.build({
            label: (0, random_1.randomLabel)(),
            access_key: (0, random_1.randomString)(20),
            secret_key: (0, random_1.randomString)(39),
        });
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: false,
            objectStorageGen2: { enabled: false },
        });
        (0, object_storage_1.mockGetAccessKeys)([]).as('getKeys');
        (0, object_storage_1.mockCreateAccessKey)(mockAccessKey).as('createKey');
        cy.visitWithLogin('object-storage/access-keys');
        cy.wait('@getKeys');
        cy.findByText('No items to display.').should('be.visible');
        ui_1.ui.entityHeader.find().within(function () {
            cy.findByText('Create Access Key').should('be.visible').click();
        });
        (0, object_storage_1.mockGetAccessKeys)([mockAccessKey]).as('getKeys');
        ui_1.ui.drawer
            .findByTitle('Create Access Key')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label').click();
            cy.focused().type(mockAccessKey.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Access Key')
                .as('qaCreateAccessKey')
                .scrollIntoView();
            cy.get('@qaCreateAccessKey')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@createKey', '@getKeys']);
        ui_1.ui.dialog
            .findByTitle('Access Keys')
            .should('be.visible')
            .within(function () {
            cy.get('input[id="access-key"]')
                .should('be.visible')
                .should('have.value', mockAccessKey.access_key);
            cy.get('input[id="secret-key"]')
                .should('be.visible')
                .should('have.value', mockAccessKey.secret_key);
            ui_1.ui.buttonGroup
                .findButtonByTitle('I Have Saved My Secret Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByLabelText('List of Object Storage Access Keys').within(function () {
            cy.findByText(mockAccessKey.label).should('be.visible');
            cy.findByText(mockAccessKey.access_key).should('be.visible');
        });
    });
    /*
     * - Tests core object storage key revoke flow using mocked API responses.
     * - Confirms access key is listed in table.
     * - Revokes access key.
     * - Confirms access key is no longer listed in table.
     */
    it('can revoke access key - smoke', function () {
        var accessKey = objectStorage_1.objectStorageKeyFactory.build({
            label: (0, random_1.randomLabel)(),
            id: (0, random_1.randomNumber)(1, 99999),
            access_key: (0, random_1.randomString)(20),
            secret_key: (0, random_1.randomString)(39),
        });
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: false,
            objectStorageGen2: { enabled: false },
        });
        // Mock initial GET request to include an access key.
        (0, object_storage_1.mockGetAccessKeys)([accessKey]).as('getKeys');
        (0, object_storage_1.mockDeleteAccessKey)(accessKey.id).as('deleteKey');
        cy.visitWithLogin('/object-storage/access-keys');
        cy.wait('@getKeys');
        cy.findByLabelText('List of Object Storage Access Keys').within(function () {
            cy.findByText(accessKey.label).should('be.visible');
            cy.findByText(accessKey.access_key).should('be.visible');
            cy.findByText('Revoke').should('be.visible').click();
        });
        // Mock next GET request to respond with no data to reflect key revocation.
        (0, object_storage_1.mockGetAccessKeys)([]).as('getKeys');
        ui_1.ui.dialog.findByTitle("Revoking ".concat(accessKey.label)).within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Revoke')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@deleteKey', '@getKeys']);
        cy.findByText('No items to display.').should('be.visible');
    });
});
