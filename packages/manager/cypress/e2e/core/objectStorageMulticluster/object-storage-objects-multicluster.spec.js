"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cypress-file-upload");
var authentication_1 = require("support/api/authentication");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var object_storage_1 = require("support/intercepts/object-storage");
var feature_flags_1 = require("support/intercepts/feature-flags");
var api_v4_1 = require("@linode/api-v4");
// Message shown on-screen when user navigates to an empty bucket.
var emptyBucketMessage = 'This bucket is empty.';
// Message shown on-screen when user navigates to an empty folder.
var emptyFolderMessage = 'This folder is empty.';
/**
 * Returns the non-empty bucket error message for a bucket with the given label.
 *
 * This message appears when attempting to delete a bucket that has one or
 * more objects.
 *
 * @param bucketLabel - Label of bucket being deleted.
 *
 * @returns Non-empty bucket error message.
 */
var getNonEmptyBucketMessage = function (bucketLabel) {
    return "Bucket ".concat(bucketLabel, " is not empty. Please delete all objects and try again.");
};
/**
 * Create a bucket with the given label and cluster.
 *
 * This function assumes that OBJ Multicluster is enabled. Use
 * `setUpBucket` to set up OBJ buckets when Multicluster is disabled.
 *
 * @param label - Bucket label.
 * @param regionId - ID of Bucket region.
 * @param cors_enabled - Enable CORS on the bucket: defaults to true for Gen1 and false for Gen2.
 *
 * @returns Promise that resolves to created Bucket.
 */
var setUpBucketMulticluster = function (label, regionId, cors_enabled) {
    if (cors_enabled === void 0) { cors_enabled = true; }
    return (0, api_v4_1.createBucket)(factories_1.createObjectStorageBucketFactoryGen1.build({
        label: label,
        region: regionId,
        cors_enabled: cors_enabled,
        // API accepts either `cluster` or `region`, but not both. Our factory
        // populates both fields, so we have to manually set `cluster` to `undefined`
        // to avoid 400 responses from the API.
        cluster: undefined,
    }));
};
/**
 * Asserts that a URL assigned to an alias responds with a given status code.
 *
 * @param urlAlias - Cypress alias containing the URL to request.
 * @param expectedStatus - HTTP status to expect for URL.
 */
var assertStatusForUrlAtAlias = function (urlAlias, expectedStatus) {
    cy.get(urlAlias).then(function (url) {
        // An alias can resolve to anything. We're assuming the user passed a valid
        // alias which resolves to a string.
        cy.request({
            url: url,
            failOnStatusCode: false,
        }).then(function (response) {
            expect(response.status).to.eq(expectedStatus);
        });
    });
};
/**
 * Uploads the file at the given path and assigns it the given filename.
 *
 * This assumes that Cypress has already navigated to a page where a file
 * upload prompt is present.
 *
 * @param filepath - Path to file to upload.
 * @param filename - Filename to assign to uploaded file.
 */
var uploadFile = function (filepath, filename) {
    cy.fixture(filepath, null).then(function (contents) {
        cy.get('[data-qa-drop-zone]').attachFile({
            fileContent: contents,
            fileName: filename,
        }, {
            subjectType: 'drag-n-drop',
        });
    });
};
(0, authentication_1.authenticate)();
describe('Object Storage Multicluster objects', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('obj-buckets');
    });
    beforeEach(function () {
        cy.tag('method:e2e');
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
        });
    });
    /*
     * - Confirms that users can upload new objects.
     * - Confirms that users can replace objects with identical filenames.
     * - Confirms that users can delete objects.
     * - Confirms that users can create folders.
     * - Confirms that users can delete empty folders.
     * - Confirms that users cannot delete folders with objects.
     * - Confirms that users cannot delete buckets with objects.
     * - Confirms that private objects cannot be accessed over HTTP.
     * - Confirms that public objects can be accessed over HTTP.
     */
    it('can upload, access, and delete objects', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-southeast-1';
        var bucketRegionId = 'us-southeast';
        var bucketPage = "/object-storage/buckets/".concat(bucketRegionId, "/").concat(bucketLabel, "/objects");
        var bucketFolderName = (0, random_1.randomLabel)();
        var bucketFiles = [
            { path: 'object-storage-files/1.txt', name: '1.txt' },
            { path: 'object-storage-files/2.jpg', name: '2.jpg' },
        ];
        cy.defer(function () { return setUpBucketMulticluster(bucketLabel, bucketRegionId); }, 'creating Object Storage bucket').then(function () {
            (0, object_storage_1.interceptUploadBucketObjectS3)(bucketLabel, bucketCluster, bucketFiles[0].name).as('uploadObject');
            // Navigate to new bucket page, upload and delete an object.
            cy.visitWithLogin(bucketPage);
            ui_1.ui.entityHeader.find().within(function () {
                cy.findByText(bucketLabel).should('be.visible');
            });
            uploadFile(bucketFiles[0].path, bucketFiles[0].name);
            // @TODO Investigate why files do not appear automatically in Cypress.
            cy.wait('@uploadObject');
            cy.reload();
            cy.findByText(bucketFiles[0].name).should('be.visible');
            ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Delete ".concat(bucketFiles[0].name))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete')
                    .should('be.visible')
                    .click();
            });
            cy.findByText(emptyBucketMessage).should('be.visible');
            cy.findByText(bucketFiles[0].name).should('not.exist');
            // Create a folder, navigate into it and upload object.
            ui_1.ui.button.findByTitle('Create Folder').should('be.visible').click();
            ui_1.ui.drawer
                .findByTitle('Create Folder')
                .should('be.visible')
                .within(function () {
                cy.findByLabelText('Folder Name').should('be.visible').click();
                cy.focused().type(bucketFolderName);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Create')
                    .should('be.visible')
                    .click();
            });
            cy.findByText(bucketFolderName).should('be.visible').click();
            cy.findByText(emptyFolderMessage).should('be.visible');
            (0, object_storage_1.interceptUploadBucketObjectS3)(bucketLabel, bucketCluster, "".concat(bucketFolderName, "/").concat(bucketFiles[1].name)).as('uploadObject');
            uploadFile(bucketFiles[1].path, bucketFiles[1].name);
            cy.wait('@uploadObject');
            // Re-upload file to confirm replace prompt behavior.
            uploadFile(bucketFiles[1].path, bucketFiles[1].name);
            cy.findByText('This file already exists. Are you sure you want to overwrite it?');
            ui_1.ui.button.findByTitle('Replace').should('be.visible').click();
            cy.wait('@uploadObject');
            // Confirm that you cannot delete a bucket with objects in it.
            cy.visitWithLogin('/object-storage/buckets');
            cy.findByText(bucketLabel)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
            });
            ui_1.ui.dialog
                .findByTitle("Delete Bucket ".concat(bucketLabel))
                .should('be.visible')
                .within(function () {
                cy.findByText('Bucket Name').click();
                cy.focused().type(bucketLabel);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                cy.findByText(getNonEmptyBucketMessage(bucketLabel)).should('be.visible');
            });
            // Confirm that you cannot delete a folder with objects in it.
            cy.visitWithLogin(bucketPage);
            ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Delete ".concat(bucketFolderName))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
                cy.findByText('The folder must be empty to delete it.').should('be.visible');
                ui_1.ui.button.findByTitle('Cancel').should('be.visible').click();
            });
            // Confirm public/private access controls work as expected.
            cy.findByText(bucketFolderName).should('be.visible').click();
            cy.findByText(bucketFiles[1].name).should('be.visible').click();
            ui_1.ui.drawer
                .findByTitle("".concat(bucketFolderName, "/").concat(bucketFiles[1].name))
                .should('be.visible')
                .within(function () {
                // Confirm that object is not public by default.
                cy.get('[data-testid="external-site-link"]')
                    .should('be.visible')
                    .invoke('attr', 'href')
                    .as('bucketObjectUrl');
                assertStatusForUrlAtAlias('@bucketObjectUrl', 403);
                // Make object public, confirm it can be accessed, then close drawer.
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
                cy.findByText('Object access updated successfully.');
                assertStatusForUrlAtAlias('@bucketObjectUrl', 200);
                ui_1.ui.drawerCloseButton.find().should('be.visible').click();
            });
            // Delete object, then delete folder that contained the object.
            ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Delete ".concat(bucketFiles[1].name))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete')
                    .should('be.visible')
                    .click();
            });
            cy.findByText(emptyFolderMessage).should('be.visible');
            cy.visitWithLogin(bucketPage);
            ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Delete ".concat(bucketFolderName))
                .should('be.visible')
                .within(function () {
                ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
            });
            // Confirm that bucket is empty.
            cy.findByText(emptyBucketMessage).should('be.visible');
        });
    });
});
