"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var profile_1 = require("support/intercepts/profile");
var object_storage_1 = require("support/intercepts/object-storage");
var factories_1 = require("src/factories");
var profile_2 = require("src/factories/profile");
var ui_1 = require("support/ui");
describe('Object Storage gen2 access keys tests', function () {
    /**
     * - Confirms endpoint types are displayed in the "Regions/S3 Hostnames" column
     * - Confirms endpoint types are present in the list of hostnames of the "Regions / S3 Hostnames" drawer
     */
    it('Confirms the changes to the Access Keys page for Object Storage gen2', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
            objectStorageGen2: { enabled: true },
        }).as('getFeatureFlags');
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: [
                'Object Storage',
                'Object Storage Endpoint Types',
                'Object Storage Access Key Regions',
            ],
        })).as('getAccount');
        var mockAccessKey1 = factories_1.objectStorageKeyFactory.build({
            regions: [
                { id: 'us-east', s3_endpoint: 'us-east.com', endpoint_type: 'E3' },
            ],
        });
        var mockAccessKey2 = factories_1.objectStorageKeyFactory.build({
            regions: [
                {
                    id: 'us-southeast',
                    s3_endpoint: 'us-southeast.com',
                    endpoint_type: 'E3',
                },
                { id: 'in-maa', s3_endpoint: 'in-maa.com', endpoint_type: 'E2' },
                { id: 'us-mia', s3_endpoint: 'us-mia.com', endpoint_type: 'E1' },
                { id: 'it-mil', s3_endpoint: 'it-mil.com', endpoint_type: 'E0' },
            ],
        });
        (0, object_storage_1.mockGetAccessKeys)([mockAccessKey1, mockAccessKey2]).as('getObjectStorageAccessKeys'),
            cy.visitWithLogin('/object-storage/access-keys');
        cy.wait(['@getFeatureFlags', '@getAccount', '@getObjectStorageAccessKeys']);
        // confirm table headers exist
        cy.findByText('Label').should('be.visible');
        cy.findByText('Access Key').should('be.visible');
        cy.findByText('Regions/S3 Hostnames').should('be.visible');
        // confirm endpoint types are displayed
        cy.findByText(mockAccessKey1.label).should('be.visible');
        cy.findByText(mockAccessKey2.label).should('be.visible');
        cy.findByText('US, Newark, NJ (E3): us-east.com').should('be.visible');
        // Using contains since the text includes additional information, i.e. '| +2 regions | Show All'
        cy.contains('US, Atlanta, GA (E3): us-southeast.com').should('be.visible');
        cy.contains('+ 3 regions').should('be.visible');
        cy.findByText('Show All').should('be.visible').click();
        ui_1.ui.drawer
            .findByTitle('Regions / S3 Hostnames')
            .should('be.visible')
            .within(function () {
            cy.findByText('S3 Endpoint Hostnames').should('be.visible');
            cy.get('input[value="US, Atlanta, GA (E3): us-southeast.com"]').should('be.visible');
            cy.get('input[value="IN, Chennai (E2): in-maa.com"]').should('be.visible');
            cy.get('input[value="US, Miami, FL (E1): us-mia.com"]').should('be.visible');
            cy.get('input[value="IT, Milan (E0): it-mil.com"]').should('be.visible');
        });
    });
});
/**
 * When a restricted user navigates to object-storage/access-keys/create, an error is shown in the "Create Access Key" drawer noting that the user does not have access key creation permissions
 */
describe('Object Storage Gen2 create access key modal has disabled fields for restricted user', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
            objectStorageGen2: { enabled: true },
        }).as('getFeatureFlags');
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: [
                'Object Storage',
                'Object Storage Endpoint Types',
                'Object Storage Access Key Regions',
            ],
        })).as('getAccount');
        // restricted user
        (0, profile_1.mockGetProfile)(profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: true,
        })).as('getProfile');
    });
    // access keys creation
    it('create access keys form', function () {
        cy.visitWithLogin('/object-storage/access-keys/create');
        cy.wait(['@getFeatureFlags', '@getAccount', '@getProfile']);
        // error message
        ui_1.ui.drawer
            .findByTitle('Create Access Key')
            .should('be.visible')
            .within(function () {
            cy.findByText(/You don't have permissions to create an Access Key./).should('be.visible');
            // label
            cy.findByLabelText(/Label.*/)
                .should('be.visible')
                .should('be.disabled');
            // region
            ui_1.ui.regionSelect.find().should('be.visible').should('be.disabled');
            // submit button is disabled
            cy.findByTestId('submit').should('be.visible').should('be.disabled');
        });
    });
});
