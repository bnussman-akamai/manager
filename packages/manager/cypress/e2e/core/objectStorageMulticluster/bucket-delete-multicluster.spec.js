"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var object_storage_1 = require("support/intercepts/object-storage");
var ui_1 = require("support/ui");
describe('Object Storage Multicluster Bucket delete', function () {
    /*
     * - Tests core object storage bucket deletion flow using mocked API responses.
     * - Mocks existing buckets.
     * - Deletes mocked bucket, confirms that landing page reflects deletion.
     */
    it('can delete object storage bucket with OBJ Multicluster', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-southeast-1';
        var bucketMock = factories_1.objectStorageBucketFactory.build({
            label: bucketLabel,
            cluster: bucketCluster,
            hostname: "".concat(bucketLabel, ".").concat(bucketCluster, ".linodeobjects.com"),
            objects: 0,
        });
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: ['Object Storage', 'Object Storage Access Key Regions'],
        }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
            objectStorageGen2: { enabled: false },
        });
        (0, object_storage_1.mockGetBuckets)([bucketMock]).as('getBuckets');
        (0, object_storage_1.mockDeleteBucket)(bucketLabel, bucketMock.region).as('deleteBucket');
        cy.visitWithLogin('/object-storage');
        cy.wait('@getBuckets');
        cy.findByText(bucketLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Delete').should('be.visible').click();
        });
        ui_1.ui.dialog
            .findByTitle("Delete Bucket ".concat(bucketLabel))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Bucket Name').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.enabled')
                .should('be.visible')
                .click();
        });
        cy.wait('@deleteBucket');
        cy.findByText('S3-compatible storage solution').should('be.visible');
    });
});
