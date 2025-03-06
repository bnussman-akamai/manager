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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var arrays_1 = require("support/util/arrays");
var regions_1 = require("support/util/regions");
var factories_1 = require("src/factories");
var random_1 = require("support/util/random");
var feature_flags_1 = require("support/intercepts/feature-flags");
var account_1 = require("support/intercepts/account");
var regions_2 = require("support/intercepts/regions");
var object_storage_1 = require("support/intercepts/object-storage");
var ui_1 = require("support/ui");
describe('Object Storage Multicluster access keys', function () {
    var mockRegionsObj = (0, arrays_1.buildArray)(3, function () {
        return (0, regions_1.extendRegion)(factories_1.regionFactory.build({
            id: "us-".concat((0, random_1.randomString)(5)),
            label: "mock-obj-region-".concat((0, random_1.randomString)(5)),
            capabilities: ['Object Storage'],
        }));
    });
    var mockRegions = __spreadArray([], mockRegionsObj, true);
    beforeEach(function () {
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: ['Object Storage', 'Object Storage Access Key Regions'],
        }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
            objectStorageGen2: { enabled: false },
        });
    });
    /*
     * - Confirms user can create access keys with unlimited access when OBJ Multicluster is enabled.
     * - Confirms multiple regions can be selected when creating an access key.
     * - Confirms that UI updates to reflect created access key.
     */
    it('can create unlimited access keys with OBJ Multicluster', function () {
        var mockAccessKey = factories_1.objectStorageKeyFactory.build({
            id: (0, random_1.randomNumber)(10000, 99999),
            label: (0, random_1.randomLabel)(),
            access_key: (0, random_1.randomString)(20),
            secret_key: (0, random_1.randomString)(39),
            regions: mockRegionsObj.map(function (mockObjRegion) { return ({
                id: mockObjRegion.id,
                s3_endpoint: (0, random_1.randomDomainName)(),
            }); }),
        });
        (0, object_storage_1.mockGetAccessKeys)([]);
        (0, object_storage_1.mockCreateAccessKey)(mockAccessKey).as('createAccessKey');
        (0, regions_2.mockGetRegions)(mockRegions);
        mockRegions.forEach(function (region) {
            (0, object_storage_1.mockGetBucketsForRegion)(region.id, []);
        });
        cy.visitWithLogin('/object-storage/access-keys');
        ui_1.ui.button
            .findByTitle('Create Access Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, object_storage_1.mockGetAccessKeys)([mockAccessKey]);
        ui_1.ui.drawer
            .findByTitle('Create Access Key')
            .should('be.visible')
            .within(function () {
            cy.contains('Label (required)').should('be.visible').click();
            cy.focused().type(mockAccessKey.label);
            cy.contains('Regions (required)').should('be.visible').click();
            // Select each region with the OBJ capability.
            mockRegionsObj.forEach(function (mockRegion) {
                cy.contains('Regions (required)').type(mockRegion.label);
                ui_1.ui.autocompletePopper
                    .findByTitle("".concat(mockRegion.label, " (").concat(mockRegion.id, ")"))
                    .should('be.visible')
                    .click();
            });
            // Close the regions drop-down.
            cy.contains('Regions (required)').should('be.visible').click();
            cy.focused().type('{esc}');
            // TODO Confirm expected regions are shown.
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Access Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@createAccessKey');
        ui_1.ui.dialog
            .findByTitle('Access Keys')
            .should('be.visible')
            .within(function () {
            // TODO Add assertions for S3 hostnames
            cy.get('input[id="access-key"]')
                .should('be.visible')
                .should('have.value', mockAccessKey.access_key);
            cy.get('input[id="secret-key"]')
                .should('be.visible')
                .should('have.value', mockAccessKey.secret_key);
            ui_1.ui.button
                .findByTitle('I Have Saved My Secret Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByText(mockAccessKey.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            // TODO Add assertions for regions/S3 hostnames
            cy.findByText(mockAccessKey.access_key).should('be.visible');
        });
    });
    /*
     * - Confirms user can create access keys with limited access when OBJ Multicluster is enabled.
     * - Confirms that UI updates to reflect created access key.
     * - Confirms that "Permissions" drawer contains expected scope and permission data.
     */
    it('can create limited access keys with OBJ Multicluster', function () {
        var mockRegion = (0, regions_1.extendRegion)(factories_1.regionFactory.build({
            id: "us-".concat((0, random_1.randomString)(5)),
            label: "mock-obj-region-".concat((0, random_1.randomString)(5)),
            capabilities: ['Object Storage'],
        }));
        var mockBuckets = factories_1.objectStorageBucketFactory.buildList(2, {
            region: mockRegion.id,
            cluster: undefined,
        });
        var mockAccessKey = factories_1.objectStorageKeyFactory.build({
            id: (0, random_1.randomNumber)(10000, 99999),
            label: (0, random_1.randomLabel)(),
            access_key: (0, random_1.randomString)(20),
            secret_key: (0, random_1.randomString)(39),
            regions: [
                {
                    id: mockRegion.id,
                    s3_endpoint: (0, random_1.randomDomainName)(),
                },
            ],
            limited: true,
            bucket_access: mockBuckets.map(function (bucket) { return ({
                bucket_name: bucket.label,
                cluster: '',
                permissions: 'read_only',
                region: mockRegion.id,
            }); }),
        });
        (0, object_storage_1.mockGetAccessKeys)([]);
        (0, object_storage_1.mockCreateAccessKey)(mockAccessKey).as('createAccessKey');
        (0, regions_2.mockGetRegions)([mockRegion]);
        (0, object_storage_1.mockGetBucketsForRegion)(mockRegion.id, mockBuckets);
        // Navigate to access keys page, click "Create Access Key" button.
        cy.visitWithLogin('/object-storage/access-keys');
        ui_1.ui.button
            .findByTitle('Create Access Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out form in "Create Access Key" drawer.
        ui_1.ui.drawer
            .findByTitle('Create Access Key')
            .should('be.visible')
            .within(function () {
            cy.contains('Label (required)').should('be.visible').click();
            cy.focused().type(mockAccessKey.label);
            cy.contains('Regions (required)').should('be.visible').click();
            cy.focused().type("".concat(mockRegion.label, "{enter}"));
            ui_1.ui.autocompletePopper
                .findByTitle("".concat(mockRegion.label, " (").concat(mockRegion.id, ")"))
                .should('be.visible');
            // Dismiss region drop-down.
            cy.contains('Regions (required)').should('be.visible').click();
            cy.focused().type('{esc}');
            // Enable "Limited Access" toggle for access key and confirm Create button is disabled.
            cy.findByText('Limited Access').should('be.visible').click();
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Access Key')
                .should('be.disabled');
            // Select access rules for all buckets to enable Create button.
            mockBuckets.forEach(function (mockBucket) {
                cy.findByText(mockBucket.label)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByLabelText("read-only for ".concat(mockRegion.id, "-").concat(mockBucket.label))
                        .should('be.enabled')
                        .click();
                });
            });
            (0, object_storage_1.mockGetAccessKeys)([mockAccessKey]);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Access Key')
                .should('be.enabled')
                .click();
        });
        // Dismiss secrets dialog.
        cy.wait('@createAccessKey');
        ui_1.ui.buttonGroup
            .findButtonByTitle('I Have Saved My Secret Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Open "Permissions" drawer for new access key.
        cy.findByText(mockAccessKey.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Object Storage Key ".concat(mockAccessKey.label))
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem.findByTitle('Permissions').click();
        ui_1.ui.drawer
            .findByTitle("Permissions for ".concat(mockAccessKey.label))
            .should('be.visible')
            .within(function () {
            mockBuckets.forEach(function (mockBucket) {
                // TODO M3-7733 Update this selector when ARIA label is fixed.
                cy.findByLabelText("This token has read-only access for ".concat(mockRegion.id, "-").concat(mockBucket.label));
            });
        });
    });
    /*
     * - Confirms user can edit access key labels and regions when OBJ Multicluster is enabled.
     * - Confirms that user can deselect regions via the region selection list.
     * - Confirms that access keys landing page automatically updates to reflect edited access key.
     */
    it('can update access keys with OBJ Multicluster', function () {
        var mockInitialRegion = (0, regions_1.extendRegion)(factories_1.regionFactory.build({
            id: "us-".concat((0, random_1.randomString)(5)),
            label: "mock-obj-region-".concat((0, random_1.randomString)(5)),
            capabilities: ['Object Storage'],
        }));
        var mockUpdatedRegion = (0, regions_1.extendRegion)(factories_1.regionFactory.build({
            id: "us-".concat((0, random_1.randomString)(5)),
            label: "mock-obj-region-".concat((0, random_1.randomString)(5)),
            capabilities: ['Object Storage'],
        }));
        var mockRegions = [mockInitialRegion, mockUpdatedRegion];
        var mockAccessKey = factories_1.objectStorageKeyFactory.build({
            id: (0, random_1.randomNumber)(10000, 99999),
            label: (0, random_1.randomLabel)(),
            access_key: (0, random_1.randomString)(20),
            secret_key: (0, random_1.randomString)(39),
            regions: [
                {
                    id: mockInitialRegion.id,
                    s3_endpoint: (0, random_1.randomDomainName)(),
                },
            ],
        });
        var mockUpdatedAccessKeyEndpoint = (0, random_1.randomDomainName)();
        var mockUpdatedAccessKey = __assign(__assign({}, mockAccessKey), { label: (0, random_1.randomLabel)(), regions: [
                {
                    id: mockUpdatedRegion.id,
                    s3_endpoint: mockUpdatedAccessKeyEndpoint,
                },
            ] });
        (0, object_storage_1.mockGetAccessKeys)([mockAccessKey]);
        (0, regions_2.mockGetRegions)(mockRegions);
        cy.visitWithLogin('/object-storage/access-keys');
        cy.findByText(mockAccessKey.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Object Storage Key ".concat(mockAccessKey.label))
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Edit Access Key')
            .should('be.visible')
            .within(function () {
            cy.contains('Label (required)').should('be.visible').click();
            cy.focused().type('{selectall}{backspace}');
            cy.focused().type(mockUpdatedAccessKey.label);
            cy.contains('Regions (required)').should('be.visible').click();
            cy.focused().type("".concat(mockUpdatedRegion.label, "{enter}{esc}"));
            cy.contains(mockUpdatedRegion.label).should('be.visible').and('exist');
            // Directly find the close button within the chip
            cy.findByTestId("".concat(mockUpdatedRegion.id))
                .findByTestId('CloseIcon')
                .click();
            (0, object_storage_1.mockUpdateAccessKey)(mockUpdatedAccessKey).as('updateAccessKey');
            (0, object_storage_1.mockGetAccessKeys)([mockUpdatedAccessKey]);
            ui_1.ui.button
                .findByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@updateAccessKey');
        // Confirm that access key landing page reflects updated key.
        cy.findByText(mockAccessKey.label).should('not.exist');
        cy.findByText(mockUpdatedAccessKey.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.contains(mockUpdatedRegion.label).should('be.visible');
            cy.contains(mockUpdatedAccessKeyEndpoint).should('be.visible');
        });
    });
});
