"use strict";
/**
 * @file End-to-end tests for Object Storage Access Key operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var objectStorage_1 = require("src/factories/objectStorage");
var authentication_1 = require("support/api/authentication");
var object_storage_1 = require("@linode/api-v4/lib/object-storage");
var feature_flags_1 = require("support/intercepts/feature-flags");
var object_storage_2 = require("support/intercepts/object-storage");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var account_1 = require("support/intercepts/account");
var factories_1 = require("src/factories");
(0, authentication_1.authenticate)();
describe('object storage access key end-to-end tests', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['obj-buckets', 'obj-access-keys']);
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Creates an access key with unlimited access
     * - Confirms that access key and secret key from API response are displayed.
     * - Confirms that secret key warning is displayed.
     * - Confirms that new access key is listed in landing page table.
     * - Confirms that access key has expected permissions.
     */
    it('can create an access key with unlimited access - e2e', function () {
        var keyLabel = (0, random_1.randomLabel)();
        (0, object_storage_2.interceptGetAccessKeys)().as('getKeys');
        (0, object_storage_2.interceptCreateAccessKey)().as('createKey');
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: false,
            objectStorageGen2: { enabled: false },
        });
        cy.visitWithLogin('/object-storage/access-keys');
        cy.wait('@getKeys');
        // Click "Create Access Key" button in entity header.
        ui_1.ui.entityHeader.find().within(function () {
            cy.findByText('Create Access Key').should('be.visible').click();
        });
        // Enter access key label in drawer, then click "Create Access Key".
        ui_1.ui.drawer
            .findByTitle('Create Access Key')
            .should('be.visible')
            .within(function () {
            cy.findByText('Label').click();
            cy.focused().type(keyLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Access Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@createKey').then(function (intercepts) {
            var _a, _b, _c, _d;
            // Use non-exact match; this allows leniency for wording to change but
            // ensures that the user is warned that secret key only displays once.
            var secretKeyWarning = 'we can only display your secret key once';
            var accessKey = (_b = (_a = intercepts.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.access_key;
            var secretKey = (_d = (_c = intercepts.response) === null || _c === void 0 ? void 0 : _c.body) === null || _d === void 0 ? void 0 : _d.secret_key;
            ui_1.ui.dialog
                .findByTitle('Access Keys')
                .should('be.visible')
                .within(function () {
                cy.findByText(secretKeyWarning, { exact: false }).should('be.visible');
                cy.get('input[id="access-key"]')
                    .should('be.visible')
                    .should('have.value', accessKey);
                cy.get('input[id="secret-key"]')
                    .should('be.visible')
                    .should('have.value', secretKey);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('I Have Saved My Secret Key')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.findByLabelText('List of Object Storage Access Keys').within(function () {
                cy.findByText(keyLabel)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByText(accessKey).should('be.visible');
                    cy.findByText('Permissions').click();
                });
            });
            var unlimitedPermissionsNotice = 'This key has unlimited access to all buckets on your account.';
            cy.findByText(unlimitedPermissionsNotice).should('be.visible');
        });
    });
    /**
     * - Creates an access key with only read access to a bucket.
     * - Confirms that access key and secret key from API response are displayed.
     * - Confirms that new access key is listed in landing page title.
     * - Confirms that access key has expected permissions.
     */
    it('can create an access key with limited access - e2e', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-east-1';
        var bucketRequest = objectStorage_1.createObjectStorageBucketFactoryLegacy.build({
            label: bucketLabel,
            cluster: bucketCluster,
            // Default factory sets `cluster` and `region`, but API does not accept `region` yet.
            region: undefined,
        });
        // Create a bucket before creating access key.
        cy.defer(function () { return (0, object_storage_1.createBucket)(bucketRequest); }, 'creating Object Storage bucket').then(function () {
            var keyLabel = (0, random_1.randomLabel)();
            (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
            (0, feature_flags_1.mockAppendFeatureFlags)({
                objMultiCluster: false,
                objectStorageGen2: { enabled: false },
            });
            (0, object_storage_2.interceptGetAccessKeys)().as('getKeys');
            (0, object_storage_2.interceptCreateAccessKey)().as('createKey');
            cy.visitWithLogin('/object-storage/access-keys');
            cy.wait('@getKeys');
            // Click "Create Access Key" button in entity header.
            ui_1.ui.entityHeader.find().within(function () {
                cy.findByText('Create Access Key').should('be.visible').click();
            });
            // Enter access key label in drawer, set read-only access, then click "Create Access Key".
            ui_1.ui.drawer
                .findByTitle('Create Access Key')
                .should('be.visible')
                .within(function () {
                cy.findByText('Label').click();
                cy.focused().type(keyLabel);
                cy.findByLabelText('Limited Access').click();
                cy.findByLabelText('Select read-only for all').click();
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Create Access Key')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            /*
             * Wait for access key to be created, confirm that dialog is shown, close
             * dialog. Then confirm that key is listed in table and displays the correct
             * permissions.
             */
            cy.wait('@createKey').then(function (intercepts) {
                var _a, _b, _c, _d;
                var accessKey = (_b = (_a = intercepts.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.access_key;
                var secretKey = (_d = (_c = intercepts.response) === null || _c === void 0 ? void 0 : _c.body) === null || _d === void 0 ? void 0 : _d.secret_key;
                ui_1.ui.dialog
                    .findByTitle('Access Keys')
                    .should('be.visible')
                    .within(function () {
                    cy.get('input[id="access-key"]')
                        .should('be.visible')
                        .should('have.value', accessKey);
                    cy.get('input[id="secret-key"]')
                        .should('be.visible')
                        .should('have.value', secretKey);
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('I Have Saved My Secret Key')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                cy.findByLabelText('List of Object Storage Access Keys').within(function () {
                    cy.findByText(keyLabel)
                        .should('be.visible')
                        .closest('tr')
                        .within(function () {
                        cy.findByText(accessKey).should('be.visible');
                        cy.findByText('Permissions').click();
                    });
                });
                var permissionLabel = "This token has read-only access for ".concat(bucketCluster, "-").concat(bucketLabel);
                cy.findByLabelText(permissionLabel).should('be.visible');
            });
        });
    });
});
