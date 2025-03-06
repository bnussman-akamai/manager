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
var factories_1 = require("@src/factories");
var serverHandlers_1 = require("@src/mocks/serverHandlers");
require("cypress-file-upload");
var luxon_1 = require("luxon");
var authentication_1 = require("support/api/authentication");
var images_1 = require("support/intercepts/images");
var ui_1 = require("support/ui");
var common_1 = require("support/ui/common");
var cleanup_1 = require("support/util/cleanup");
var intercepts_1 = require("support/util/intercepts");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
/**
 * Returns a numeric image ID from a string-based image ID.
 *
 * @param imageIdString - Image ID string to convert to number.
 *
 * @example
 * numericImageIdFromString('private/1111111'); // Returns 1111111.
 *
 * @returns Numeric image ID.
 */
var numericImageIdFromString = function (imageIdString) {
    var substring = imageIdString.split('/')[1];
    return parseInt(substring, 10);
};
/**
 * Intercepts the response from the next events poll request.
 *
 * Responds with an `image_upload` event associated with an image.
 *
 * @param label - Label of image that is associated with the event.
 * @param id - ID of image that is associated with the event. Expected to be prefixed with a string (e.g. 'private/12345').
 * @param status - Event status.
 * @param message - Optional event message.
 * @param created - Optional event created data. If omitted, the current time is used.
 */
var eventIntercept = function (label, id, status, message, created) {
    var numericId = numericImageIdFromString(id);
    (0, common_1.interceptOnce)('GET', (0, intercepts_1.apiMatcher)('account/events*'), (0, serverHandlers_1.makeResourcePage)(factories_1.eventFactory.buildList(1, {
        created: created ? created : luxon_1.DateTime.local().toISO(),
        action: 'image_upload',
        entity: {
            label: label,
            id: numericId,
            type: 'image',
            url: "/v4/images/private/".concat(numericId),
        },
        status: status,
        secondary_entity: null,
        message: message ? message : '',
    }))).as('getEvent');
};
/**
 * Asserts that provisioning an image fails.
 *
 * @param label - Label for image that is expected to fail.
 * @param id - ID for image that is expected to fail. Expected to be prefixed with a string (e.g. 'private/12345').
 * @param message - Expected failure message.
 */
var assertFailed = function (label, id, message) {
    ui_1.ui.toast.assertMessage("Image ".concat(label, " could not be uploaded: ").concat(message));
    cy.get("[data-qa-image-cell=\"".concat(id, "\"]")).within(function () {
        cy.findByText(label).should('be.visible');
        cy.findByText('Upload Failed').should('be.visible'); // The status should be "Upload Failed"
        cy.findAllByText('N/A').should('be.visible'); // The size should be "N/A"
    });
};
/**
 * Asserts that an image is in the process of being provisioned.
 *
 * @param label - Label for image that is expected to be processing.
 * @param id - ID for image that is expected to be processing. Expected to be prefixed with a string (e.g. 'private/12345').
 */
var assertProcessing = function (label, id) {
    cy.get("[data-qa-image-cell=\"".concat(id, "\"]")).within(function () {
        cy.findByText(label).should('be.visible');
        cy.findByText('Pending Upload').should('be.visible'); // The status should be "Pending Upload"
        cy.findAllByText('Pending').should('be.visible'); // The size should be "Pending"
    });
};
/**
 * Uploads an image and intercepts the request response.
 *
 * The image is uploaded to a random region.
 *
 * @param label - Label to apply to uploaded image.
 */
var uploadImage = function (label) {
    var region = (0, regions_1.chooseRegion)({ capabilities: ['Object Storage'] });
    var upload = 'machine-images/test-image.gz';
    cy.visitWithLogin('/images/create/upload');
    cy.findByLabelText('Label').click();
    cy.focused().type(label);
    cy.findByLabelText('Description').click();
    cy.focused().type('This is a machine image upload test');
    ui_1.ui.regionSelect.find().click();
    ui_1.ui.regionSelect.findItemByRegionId(region.id).click();
    // Pass `null` to `cy.fixture()` to ensure file is encoded as a Cypress buffer object.
    cy.fixture(upload, null).then(function (fileContent) {
        cy.get('input[type="file"]').attachFile({
            fileContent: fileContent,
            fileName: 'test-image',
            mimeType: 'application/x-gzip',
        });
    });
    cy.intercept('POST', (0, intercepts_1.apiMatcher)('images/upload')).as('imageUpload');
    ui_1.ui.button
        .findByAttribute('type', 'submit')
        .should('be.enabled')
        .should('be.visible')
        .click();
};
(0, authentication_1.authenticate)();
describe('machine image', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('images');
    });
    /*
     * - Confirms update and delete UI flows using mock API data.
     * - Confirms that image label can be updated.
     * - Confirms that image description can be updated.
     * - Confirms that image can be deleted.
     */
    it('updates and deletes a machine image', function () {
        var initialLabel = (0, random_1.randomLabel)();
        var updatedLabel = (0, random_1.randomLabel)();
        var updatedDescription = (0, random_1.randomPhrase)();
        var mockImage = factories_1.imageFactory.build({
            label: initialLabel,
        });
        var mockImageUpdated = __assign(__assign({}, mockImage), { label: updatedLabel, description: updatedDescription });
        (0, images_1.mockGetCustomImages)([mockImage]).as('getImages');
        (0, images_1.mockGetImage)(mockImage.id, mockImage).as('getImage');
        cy.visitWithLogin('/images');
        cy.wait('@getImages');
        cy.get("[data-qa-image-cell=\"".concat(mockImage.id, "\"]")).within(function () {
            cy.findByText(initialLabel).should('be.visible');
            cy.findByText('Available').should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Image ".concat(initialLabel))
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();
        cy.wait('@getImage');
        (0, images_1.mockUpdateImage)(mockImage.id, mockImageUpdated).as('updateImage');
        (0, images_1.mockGetCustomImages)([mockImageUpdated]).as('getImages');
        ui_1.ui.drawer
            .findByTitle('Edit Image')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label').should('be.visible').clear();
            cy.focused().type(updatedLabel);
            cy.findByLabelText('Description').should('be.visible').clear();
            cy.focused().type(updatedDescription);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@getImages', '@updateImage']);
        cy.get("[data-qa-image-cell=\"".concat(mockImage.id, "\"]")).within(function () {
            cy.findByText(updatedLabel).should('be.visible');
            cy.findByText(initialLabel).should('not.exist');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Image ".concat(updatedLabel))
                .should('be.visible')
                .click();
        });
        (0, images_1.mockDeleteImage)(mockImage.id).as('deleteImage');
        (0, images_1.mockGetCustomImages)([]).as('getImages');
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete Image ".concat(updatedLabel))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete Image')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@deleteImage', '@getImages']);
        ui_1.ui.toast.assertMessage('Image has been scheduled for deletion.');
        cy.findByText(updatedLabel).should('not.exist');
    });
    /*
     * - Uploads machine image.
     * - Mocks events and image requests to simulate successful upload.
     * - Confirms that machine image is listed in landing page as expected.
     * - Confirms that notifications appear that describe the image's success status.
     */
    it('uploads machine image, mock finish event', function () {
        var label = (0, random_1.randomLabel)();
        var status = 'finished';
        var uploadMessage = "Image ".concat(label, " uploaded successfully. It is being processed and will be available shortly.");
        var availableMessage = "Image ".concat(label, " is now available.");
        uploadImage(label);
        cy.wait('@imageUpload').then(function (xhr) {
            var _a;
            var imageId = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.image.id;
            assertProcessing(label, imageId);
            (0, images_1.mockGetCustomImages)([
                factories_1.imageFactory.build({ label: label, id: imageId, status: 'available' }),
            ]).as('getImages');
            eventIntercept(label, imageId, status);
            ui_1.ui.toast.assertMessage(uploadMessage);
            cy.wait('@getImages');
            ui_1.ui.toast.assertMessage(availableMessage);
            cy.get("[data-qa-image-cell=\"".concat(imageId, "\"]")).within(function () {
                cy.findByText(label).should('be.visible');
                cy.findByText('Available').should('be.visible');
            });
        });
    });
    /*
     * - Uploads machine image.
     * - Mocks events to simulate cancelled upload.
     * - Confirms that machine image is listed in landing page as expected.
     * - Confirms that notifications appear that describe the image's failed status.
     */
    it('uploads machine image, mock upload canceled failed event', function () {
        var label = (0, random_1.randomLabel)();
        var status = 'failed';
        var message = 'Upload canceled';
        uploadImage(label);
        cy.wait('@imageUpload').then(function (xhr) {
            var _a;
            var imageId = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.image.id;
            assertProcessing(label, imageId);
            eventIntercept(label, imageId, status, message);
            cy.wait('@getEvent');
            assertFailed(label, imageId, message);
        });
    });
    /*
     * - Uploads machine image.
     * - Mocks events to simulate decompression failure.
     * - Confirms that machine image is listed in landing page as expected.
     * - Confirms that notifications appear that describe the image's failed status.
     */
    it('uploads machine image, mock failed to decompress failed event', function () {
        var label = (0, random_1.randomLabel)();
        var status = 'failed';
        var message = 'Failed to decompress image';
        uploadImage(label);
        cy.wait('@imageUpload').then(function (xhr) {
            var _a;
            var imageId = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.image.id;
            assertProcessing(label, imageId);
            eventIntercept(label, imageId, status, message);
            cy.wait('@getEvent');
            assertFailed(label, imageId, message);
        });
    });
    /*
     * - Uploads machine image.
     * - Mocks events to simulate upload expiration failure.
     * - Confirms that machine image is listed in landing page as expected.
     * - Confirms that notifications appear that describe the image's failed status.
     */
    it('uploads machine image, mock expired upload event', function () {
        var label = (0, random_1.randomLabel)();
        var status = 'failed';
        var message = 'Upload window expired';
        uploadImage(label);
        cy.wait('@imageUpload').then(function (xhr) {
            var _a;
            var imageId = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.image.id;
            assertProcessing(label, imageId);
            eventIntercept(label, imageId, status, message);
            cy.wait('@getEvent');
            assertFailed(label, imageId, message);
        });
    });
});
