"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var random_1 = require("support/util/random");
var object_storage_1 = require("support/intercepts/object-storage");
var regions_1 = require("support/intercepts/regions");
describe('Object Storage Multicluster Bucket Details Tabs', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
            objectStorageGen2: { enabled: false },
        }).as('getFeatureFlags');
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: ['Object Storage', 'Object Storage Access Key Regions'],
        })).as('getAccount');
    });
    var mockRegion = factories_1.regionFactory.build({
        capabilities: ['Object Storage'],
    });
    var mockBucket = factories_1.objectStorageBucketFactory.build({
        label: (0, random_1.randomLabel)(),
        region: mockRegion.id,
    });
    describe('Properties tab without required capabilities', function () {
        /*
         * - Confirms that Gen 2-specific "Properties" tab is absent when OBJ Multicluster is enabled.
         */
        it("confirms the Properties tab does not exist for users without 'Object Storage Endpoint Types' capability", function () {
            var label = mockBucket.label;
            (0, object_storage_1.mockGetBucket)(label, mockRegion.id);
            (0, regions_1.mockGetRegions)([mockRegion]);
            cy.visitWithLogin("/object-storage/buckets/".concat(mockRegion.id, "/").concat(label, "/properties"));
            cy.wait(['@getFeatureFlags', '@getAccount']);
            // Confirm that expected tabs are visible.
            ui_1.ui.tabList.findTabByTitle('Objects').should('be.visible');
            ui_1.ui.tabList.findTabByTitle('Access').should('be.visible');
            ui_1.ui.tabList.findTabByTitle('SSL/TLS').should('be.visible');
            // Confirm that "Properties" tab is absent.
            cy.findByText('Properties').should('not.exist');
        });
    });
});
