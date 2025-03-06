"use strict";
/**
 * @file Integration tests for Cloud Manager Object Storage failure paths.
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("cypress-file-upload");
var object_storage_1 = require("support/intercepts/object-storage");
var errors_1 = require("support/util/errors");
var random_1 = require("support/util/random");
describe('object storage failure paths', function () {
    /*
     * - Tests error UI when an object upload fails.
     * - Initiates object upload, mocks API 404 error response.
     * - Confirms that error is displayed.
     */
    it('shows error upon object upload failure', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-southeast-1';
        var bucketFile = (0, random_1.randomItem)([
            'object-storage-files/1.txt',
            'object-storage-files/2.jpg',
            'object-storage-files/3.jpg',
            'object-storage-files/4.zip',
        ]);
        var bucketFilename = bucketFile.split('/')[1];
        // Mock empty object list and failed object-url upload request.
        (0, object_storage_1.mockGetBucketObjects)(bucketLabel, bucketCluster, []).as('getBucketObjects');
        (0, object_storage_1.mockUploadBucketObject)(bucketLabel, bucketCluster, bucketFilename, (0, errors_1.makeError)((0, random_1.randomString)()), 404).as('uploadBucketObject');
        // Visit bucket details page, initiate object upload.
        cy.visitWithLogin("/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel));
        cy.wait('@getBucketObjects');
        cy.fixture(bucketFile, null).then(function (bucketFileContents) {
            cy.get('[data-qa-drop-zone="true"]').attachFile({
                fileContent: bucketFileContents,
                fileName: bucketFilename,
            }, {
                subjectType: 'drag-n-drop',
            });
        });
        // Confirm that error indicator appears, and that error tooltip is shown upon hover.
        cy.wait(['@uploadBucketObject']);
        cy.get('[data-qa-file-upload-error]').should('be.visible');
        cy.findByText(bucketFilename).should('be.visible').trigger('mouseover');
        cy.findByText('Error uploading object. Click to retry.').should('be.visible');
    });
    /*
     * - Tests error UI when bucket object list fails to load.
     * - Visits bucket details page, mocks API error response.
     * - Confirms that error is displayed.
     */
    it('shows error upon object list retrieval failure', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-southeast-1';
        (0, object_storage_1.mockGetBucketObjects)(bucketLabel, bucketCluster, (0, errors_1.makeError)((0, random_1.randomString)()), 404).as('getBucketObjects');
        cy.visitWithLogin("/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel));
        cy.wait('@getBucketObjects');
        cy.findByText('We were unable to load your Objects.').should('be.visible');
    });
});
