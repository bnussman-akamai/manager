"use strict";
/**
 * @file End-to-end tests for Object Storage operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var object_storage_1 = require("@linode/api-v4/lib/object-storage");
var factories_1 = require("src/factories");
var authentication_1 = require("support/api/authentication");
var account_1 = require("support/intercepts/account");
var object_storage_2 = require("support/intercepts/object-storage");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var cleanup_1 = require("support/util/cleanup");
var feature_flags_1 = require("support/intercepts/feature-flags");
/**
 * Create a bucket with the given label and cluster.
 *
 * This function assumes that OBJ Multicluster is not enabled. Use
 * `setUpBucketMulticluster` to set up OBJ buckets when Multicluster is enabled.
 *
 * @param label - Bucket label.
 * @param cluster - Bucket cluster.
 * @param cors_enabled - Enable CORS on the bucket: defaults to true for Gen1 and false for Gen2.
 *
 * @returns Promise that resolves to created Bucket.
 */
var setUpBucket = function (label, cluster, cors_enabled) {
    if (cors_enabled === void 0) { cors_enabled = true; }
    return (0, object_storage_1.createBucket)(factories_1.createObjectStorageBucketFactoryLegacy.build({
        label: label,
        cluster: cluster,
        cors_enabled: cors_enabled,
        // API accepts either `cluster` or `region`, but not both. Our factory
        // populates both fields, so we have to manually set `region` to `undefined`
        // to avoid 400 responses from the API.
        region: undefined,
    }));
};
(0, authentication_1.authenticate)();
beforeEach(function () {
    cy.tag('method:e2e');
});
describe('object storage end-to-end tests', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('obj-buckets');
    });
    /*
     * - Tests object bucket creation flow using real API responses.
     * - Confirms that bucket can be created.
     * - Confirms new bucket is listed on landing page.
     * - Confirms that empty buckets can be deleted.
     * - Confirms that deleted buckets are no longer listed on landing page.
     */
    it('can create and delete object storage buckets', function () {
        cy.tag('purpose:syntheticTesting');
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketRegion = 'US, Atlanta, GA';
        var bucketCluster = 'us-southeast-1';
        var bucketHostname = "".concat(bucketLabel, ".").concat(bucketCluster, ".linodeobjects.com");
        (0, object_storage_2.interceptGetBuckets)().as('getBuckets');
        (0, object_storage_2.interceptCreateBucket)().as('createBucket');
        (0, object_storage_2.interceptDeleteBucket)(bucketLabel, bucketCluster).as('deleteBucket');
        (0, account_1.interceptGetNetworkUtilization)().as('getNetworkUtilization');
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: false,
            objectStorageGen2: { enabled: false },
        }).as('getFeatureFlags');
        cy.visitWithLogin('/object-storage');
        cy.wait(['@getFeatureFlags', '@getBuckets', '@getNetworkUtilization']);
        // Wait for loader to disappear, indicating that all buckets have been loaded.
        // Mitigates test failures stemming from M3-7833.
        cy.findByLabelText('Buckets').within(function () {
            cy.findByLabelText('Content is loading').should('not.exist');
        });
        ui_1.ui.entityHeader.find().within(function () {
            ui_1.ui.button.findByTitle('Create Bucket').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            cy.findByText('Label').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.regionSelect.find().click();
            cy.focused().type("".concat(bucketRegion, "{enter}"));
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .click();
        });
        cy.wait(['@createBucket', '@getBuckets']);
        ui_1.ui.drawer.find().should('not.exist');
        // Confirm that bucket is created, initiate deletion.
        cy.findByText(bucketLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(bucketRegion).should('be.visible');
            cy.findByText(bucketHostname).should('be.visible');
            ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
        });
        ui_1.ui.dialog
            .findByTitle("Delete Bucket ".concat(bucketLabel))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Bucket Name').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that deletion succeeds.
        cy.wait('@deleteBucket').its('response.statusCode').should('eq', 200);
        cy.findByText(bucketLabel).should('not.exist');
    });
    /*
     * - Confirms that user can update Bucket access.
     * - Confirms user can switch bucket access from Private to Public Read.
     * - Confirms that toast notification appears confirming operation.
     */
    it('can update bucket access', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-southeast-1';
        var bucketAccessPage = "/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel, "/access");
        cy.defer(function () { return setUpBucket(bucketLabel, bucketCluster); }, 'creating Object Storage bucket').then(function () {
            (0, object_storage_2.interceptGetBucketAccess)(bucketLabel, bucketCluster).as('getBucketAccess');
            (0, object_storage_2.interceptUpdateBucketAccess)(bucketLabel, bucketCluster).as('updateBucketAccess');
        });
        // Navigate to new bucket page, upload and delete an object.
        cy.visitWithLogin(bucketAccessPage);
        cy.wait('@getBucketAccess');
        // Make object public, confirm it can be accessed.
        cy.findByLabelText('Access Control List (ACL)')
            .should('be.visible')
            .should('not.have.value', 'Loading access...')
            .should('have.value', 'Private')
            .click();
        cy.focused().type('Public Read');
        ui_1.ui.autocompletePopper
            .findByTitle('Public Read')
            .should('be.visible')
            .click();
        ui_1.ui.button.findByTitle('Save').should('be.visible').click();
        // TODO Confirm that outgoing API request contains expected values.
        cy.wait('@updateBucketAccess');
        cy.findByText('Bucket access updated successfully.');
    });
});
