"use strict";
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
var regions_1 = require("support/util/regions");
var factories_1 = require("src/factories");
var random_1 = require("support/util/random");
var feature_flags_1 = require("support/intercepts/feature-flags");
var account_1 = require("support/intercepts/account");
var regions_2 = require("support/intercepts/regions");
var object_storage_1 = require("support/intercepts/object-storage");
var ui_1 = require("support/ui");
describe('Object Storage Multicluster Bucket create', function () {
    /*
     * - Tests Object Storage bucket creation flow when OBJ Multicluster is enabled.
     * - Confirms that expected regions are displayed in drop-down.
     * - Confirms that region can be selected during create.
     * - Confirms that API errors are handled gracefully by drawer.
     * - Confirms that request payload contains desired Bucket region and not cluster.
     * - Confirms that created Bucket is listed on the landing page.
     */
    it('can create object storage bucket with OBJ Multicluster', function () {
        var mockErrorMessage = 'An unknown error has occurred.';
        var mockRegionWithObj = (0, regions_1.extendRegion)(factories_1.regionFactory.build({
            label: (0, random_1.randomLabel)(),
            id: "".concat((0, random_1.randomString)(2), "-").concat((0, random_1.randomString)(3)),
            capabilities: ['Object Storage'],
        }));
        var mockRegionsWithoutObj = factories_1.regionFactory
            .buildList(2, {
            capabilities: [],
        })
            .map(function (region) { return (0, regions_1.extendRegion)(region); });
        var mockRegions = __spreadArray([mockRegionWithObj], mockRegionsWithoutObj, true);
        var mockBucket = factories_1.objectStorageBucketFactory.build({
            label: (0, random_1.randomLabel)(),
            region: mockRegionWithObj.id,
            cluster: undefined,
            objects: 0,
        });
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: ['Object Storage', 'Object Storage Access Key Regions'],
        }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
            objectStorageGen2: { enabled: false },
        }).as('getFeatureFlags');
        (0, regions_2.mockGetRegions)(mockRegions).as('getRegions');
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, object_storage_1.mockCreateBucketError)(mockErrorMessage).as('createBucket');
        cy.visitWithLogin('/object-storage');
        cy.wait(['@getRegions', '@getBuckets']);
        ui_1.ui.entityHeader.find().within(function () {
            ui_1.ui.button.findByTitle('Create Bucket').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            // Enter label.
            cy.contains('Label').click();
            cy.focused().type(mockBucket.label);
            cy.log("".concat(mockRegionWithObj.label));
            cy.contains('Region').click();
            cy.focused().type(mockRegionWithObj.label);
            ui_1.ui.autocompletePopper
                .find()
                .should('be.visible')
                .within(function () {
                // Confirm that regions without 'Object Storage' capability are not listed.
                mockRegionsWithoutObj.forEach(function (mockRegionWithoutObj) {
                    cy.contains(mockRegionWithoutObj.id).should('not.exist');
                });
                // Confirm that region with 'Object Storage' capability is listed,
                // then select it.
                cy.findByText("".concat(mockRegionWithObj.label, " (").concat(mockRegionWithObj.id, ")"))
                    .should('be.visible')
                    .click();
            });
            // Close region select.
            cy.contains('Region').click();
            // On first attempt, mock an error response and confirm message is shown.
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .click();
            cy.wait('@createBucket');
            cy.findByText(mockErrorMessage).should('be.visible');
            // Click submit again, mock a successful response.
            (0, object_storage_1.mockCreateBucket)(mockBucket).as('createBucket');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .click();
        });
        // Confirm that Cloud includes the "region" property and omits the "cluster"
        // property in its payload when creating a bucket.
        cy.wait('@createBucket').then(function (xhr) {
            var body = xhr.request.body;
            expect(body.cluster).to.be.undefined;
            expect(body.region).to.eq(mockRegionWithObj.id);
        });
        cy.findByText(mockBucket.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            // TODO Confirm that bucket region is shown in landing page.
            cy.findByText(mockBucket.hostname).should('be.visible');
            // cy.findByText(mockRegionWithObj.label).should('be.visible');
        });
    });
});
