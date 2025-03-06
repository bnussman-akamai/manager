"use strict";
/**
 * @file Smoke tests for crucial Object Storage operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("cypress-file-upload");
var objectStorage_1 = require("src/factories/objectStorage");
var object_storage_1 = require("support/intercepts/object-storage");
var feature_flags_1 = require("support/intercepts/feature-flags");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var account_1 = require("support/intercepts/account");
describe('object storage smoke tests', function () {
    /*
     * - Tests core object storage bucket create flow using mocked API responses.
     * - Creates bucket.
     * - Confirms bucket is listed in table.
     */
    it('can create object storage bucket - smoke', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketRegion = 'US, Atlanta, GA';
        var bucketCluster = 'us-southeast-1';
        var bucketHostname = "".concat(bucketLabel, ".").concat(bucketCluster, ".linodeobjects.com");
        var mockBucket = objectStorage_1.objectStorageBucketFactory.build({
            label: bucketLabel,
            cluster: bucketCluster,
            hostname: bucketHostname,
        });
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: false,
            objectStorageGen2: { enabled: false },
            gecko2: false,
        }).as('getFeatureFlags');
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, object_storage_1.mockCreateBucket)(mockBucket).as('createBucket');
        cy.visitWithLogin('/object-storage');
        cy.wait('@getBuckets');
        ui_1.ui.landingPageEmptyStateResources.find().within(function () {
            cy.findByText('Getting Started Guides').should('be.visible');
            cy.findByText('Video Playlist').should('be.visible');
            cy.findByText('Create Bucket').should('be.visible').click();
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
        cy.wait('@createBucket');
        cy.findByText(bucketLabel).should('be.visible');
        cy.findByText(bucketRegion).should('be.visible');
        cy.findByText(bucketHostname).should('be.visible');
    });
    /*
     * - Tests core object storage upload and delete flows using mocked API responses.
     * - Uploads files in `object-storage-files` fixtures directory.
     * - Confirms uploaded files are shown in object list.
     * - Deletes uploaded files.
     * - Confirms deleted files are removed from object list.
     */
    it('can upload, view, and delete bucket objects - smoke', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-southeast-1';
        var bucketContents = [
            'object-storage-files/1.txt',
            'object-storage-files/2.jpg',
            'object-storage-files/3.jpg',
            'object-storage-files/4.zip',
        ];
        (0, object_storage_1.mockGetBucketObjects)(bucketLabel, bucketCluster, []).as('getBucketObjects');
        cy.visitWithLogin("/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel));
        cy.wait('@getBucketObjects');
        cy.log('Upload bucket objects');
        bucketContents.forEach(function (bucketFile) {
            var filename = bucketFile.split('/')[1];
            (0, object_storage_1.mockUploadBucketObject)(bucketLabel, bucketCluster, filename).as('uploadBucketObject');
            (0, object_storage_1.mockUploadBucketObjectS3)(bucketLabel, bucketCluster, filename).as('uploadBucketObjectS3');
            // @TODO Intercept and mock bucket objects GET request to reflect upload.
            cy.fixture(bucketFile, null).then(function (bucketFileContents) {
                cy.get('[data-qa-drop-zone="true"]').attachFile({
                    fileContent: bucketFileContents,
                    fileName: filename,
                }, {
                    subjectType: 'drag-n-drop',
                });
            });
            cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);
        });
        cy.log('Check and delete bucket objects');
        bucketContents.forEach(function (bucketFile) {
            var filename = bucketFile.split('/')[1];
            (0, object_storage_1.mockDeleteBucketObject)(bucketLabel, bucketCluster, filename).as('deleteBucketObject');
            (0, object_storage_1.mockDeleteBucketObjectS3)(bucketLabel, bucketCluster, filename).as('deleteBucketObjectS3');
            cy.findByLabelText('List of Bucket Objects').within(function () {
                cy.findByText(filename)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByText('Delete').click();
                });
            });
            ui_1.ui.dialog.findByTitle("Delete ".concat(filename)).should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait(['@deleteBucketObject', '@deleteBucketObjectS3']);
        });
        cy.findByText('This bucket is empty.').should('be.visible');
    });
    /*
     * - Tests core object storage bucket deletion flow using mocked API responses.
     * - Mocks existing buckets.
     * - Deletes mocked bucket, confirms that landing page reflects deletion.
     */
    it('can delete object storage bucket - smoke', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-southeast-1';
        var bucketMock = objectStorage_1.objectStorageBucketFactory.build({
            label: bucketLabel,
            cluster: bucketCluster,
            hostname: "".concat(bucketLabel, ".").concat(bucketCluster, ".linodeobjects.com"),
            objects: 0,
        });
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: false,
            objectStorageGen2: { enabled: false },
        });
        (0, object_storage_1.mockGetBuckets)([bucketMock]).as('getBuckets');
        (0, object_storage_1.mockDeleteBucket)(bucketLabel, bucketCluster).as('deleteBucket');
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
