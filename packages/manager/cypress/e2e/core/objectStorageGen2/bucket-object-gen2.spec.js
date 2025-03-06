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
require("cypress-file-upload");
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var factories_1 = require("src/factories");
var regions_1 = require("support/util/regions");
var regions_2 = require("support/intercepts/regions");
var random_1 = require("support/util/random");
var regions_3 = require("support/util/regions");
var object_storage_1 = require("support/intercepts/object-storage");
var ui_1 = require("support/ui");
describe('Object Storage Gen2 bucket object tests', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: true,
            objectStorageGen2: { enabled: true },
        }).as('getFeatureFlags');
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: [
                'Object Storage',
                'Object Storage Endpoint Types',
                'Object Storage Access Key Regions',
            ],
        })).as('getAccount');
    });
    // Moved these constants to top of scope - they will likely be used for other obj storage gen2 bucket create tests
    var mockRegions = factories_1.regionFactory.buildList(5, {
        capabilities: ['Object Storage'],
    });
    var mockRegion = (0, regions_1.chooseRegion)({ regions: __spreadArray([], mockRegions, true) });
    var mockEndpoints = [
        factories_1.objectStorageEndpointsFactory.build({
            endpoint_type: 'E0',
            region: mockRegion.id,
            s3_endpoint: null,
        }),
        factories_1.objectStorageEndpointsFactory.build({
            endpoint_type: 'E1',
            region: mockRegion.id,
            s3_endpoint: null,
        }),
        factories_1.objectStorageEndpointsFactory.build({
            endpoint_type: 'E1',
            region: mockRegion.id,
            s3_endpoint: 'us-sea-1.linodeobjects.com',
        }),
        factories_1.objectStorageEndpointsFactory.build({
            endpoint_type: 'E2',
            region: mockRegion.id,
            s3_endpoint: null,
        }),
        factories_1.objectStorageEndpointsFactory.build({
            endpoint_type: 'E3',
            region: mockRegion.id,
            s3_endpoint: null,
        }),
    ];
    var bucketFile = (0, random_1.randomItem)([
        'object-storage-files/1.txt',
        'object-storage-files/2.jpg',
        'object-storage-files/3.jpg',
        'object-storage-files/4.zip',
    ]);
    var bucketFilename = bucketFile.split('/')[1];
    var ACLNotification = 'Private: Only you can download this Object';
    // For E0/E1, ACL selection is present
    // For E2/E3, confirm ACL is removed
    var checkBucketObjectDetailsDrawer = function (bucketFilename, endpointType) {
        ui_1.ui.drawer.findByTitle(bucketFilename).within(function () {
            if (endpointType === 'Standard (E3)' ||
                endpointType === 'Standard (E2)') {
                cy.findByLabelText('Access Control List (ACL)').should('not.exist');
            }
            else {
                cy.contains(ACLNotification).should('not.exist');
                // Verify that ACL selection show up as options
                cy.findByLabelText('Access Control List (ACL)')
                    .should('be.visible')
                    .should('have.value', 'Private')
                    .click();
                ui_1.ui.autocompletePopper
                    .findByTitle('Public Read')
                    .should('be.visible')
                    .should('be.enabled');
                ui_1.ui.autocompletePopper
                    .findByTitle('Authenticated Read')
                    .should('be.visible')
                    .should('be.enabled');
                ui_1.ui.autocompletePopper
                    .findByTitle('Private')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            }
            // Close the Details drawer
            cy.get('[data-qa-close-drawer="true"]').should('be.visible').click();
        });
    };
    /**
  
       */
    it('can check Object details drawer with E0 endpoint type', function () {
        var endpointTypeE0 = 'Legacy (E0)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = mockRegion.id;
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E0',
            s3_endpoint: undefined,
        });
        //mockGetBuckets([]).as('getBuckets');
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E0',
            cors_enabled: true,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetBucketsForRegion)(mockRegion.id, [mockBucket]).as('getBuckets');
        (0, object_storage_1.mockGetBucketObjects)(bucketLabel, bucketCluster, []).as('getBucketObjects');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, object_storage_1.mockUploadBucketObject)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObject');
        (0, object_storage_1.mockUploadBucketObjectS3)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObjectS3');
        (0, object_storage_1.mockGetBucketObjectFilename)(bucketLabel, bucketCluster, bucketFilename).as('getBucketFilename');
        cy.visitWithLogin("/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel));
        cy.fixture(bucketFile, null).then(function (bucketFileContents) {
            cy.get('[data-qa-drop-zone="true"]').attachFile({
                fileContent: bucketFileContents,
                fileName: bucketFilename,
            }, {
                subjectType: 'drag-n-drop',
            });
        });
        cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);
        cy.findByLabelText('List of Bucket Objects').within(function () {
            cy.findByText(bucketFilename).should('be.visible').click();
        });
        ui_1.ui.drawer.findByTitle(bucketFilename).should('be.visible');
        checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE0);
    });
    it('can check Object details drawer with E1 endpoint type', function () {
        var endpointTypeE1 = 'Standard (E1)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = mockRegion.id;
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E1',
            s3_endpoint: 'us-sea-1.linodeobjects.com',
        });
        //mockGetBuckets([]).as('getBuckets');
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E1',
            cors_enabled: true,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetBucketsForRegion)(mockRegion.id, [mockBucket]).as('getBuckets');
        (0, object_storage_1.mockGetBucketObjects)(bucketLabel, bucketCluster, []).as('getBucketObjects');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, object_storage_1.mockUploadBucketObject)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObject');
        (0, object_storage_1.mockUploadBucketObjectS3)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObjectS3');
        (0, object_storage_1.mockGetBucketObjectFilename)(bucketLabel, bucketCluster, bucketFilename).as('getBucketFilename');
        cy.visitWithLogin("/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel));
        cy.fixture(bucketFile, null).then(function (bucketFileContents) {
            cy.get('[data-qa-drop-zone="true"]').attachFile({
                fileContent: bucketFileContents,
                fileName: bucketFilename,
            }, {
                subjectType: 'drag-n-drop',
            });
        });
        cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);
        cy.findByLabelText('List of Bucket Objects').within(function () {
            cy.findByText(bucketFilename).should('be.visible').click();
        });
        ui_1.ui.drawer.findByTitle(bucketFilename).should('be.visible');
        checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE1);
    });
    it('can check Object details drawer with E2 endpoint type', function () {
        var endpointTypeE2 = 'Standard (E2)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = mockRegion.id;
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E2',
            s3_endpoint: undefined,
        });
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E2',
            cors_enabled: true,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetBucketsForRegion)(mockRegion.id, [mockBucket]).as('getBuckets');
        (0, object_storage_1.mockGetBucketObjects)(bucketLabel, bucketCluster, []).as('getBucketObjects');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, object_storage_1.mockUploadBucketObject)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObject');
        (0, object_storage_1.mockUploadBucketObjectS3)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObjectS3');
        (0, object_storage_1.mockGetBucketObjectFilename)(bucketLabel, bucketCluster, bucketFilename).as('getBucketFilename');
        (0, object_storage_1.mockGetBucket)(bucketLabel, bucketCluster).as('getBucket');
        cy.visitWithLogin("/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel));
        cy.fixture(bucketFile, null).then(function (bucketFileContents) {
            cy.get('[data-qa-drop-zone="true"]').attachFile({
                fileContent: bucketFileContents,
                fileName: bucketFilename,
            }, {
                subjectType: 'drag-n-drop',
            });
        });
        cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);
        cy.findByLabelText('List of Bucket Objects').within(function () {
            cy.findByText(bucketFilename).should('be.visible').click();
        });
        ui_1.ui.drawer.findByTitle(bucketFilename).should('be.visible');
        checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE2);
    });
    it('can check Object details drawer with E3 endpoint type', function () {
        var endpointTypeE3 = 'Standard (E3)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = mockRegion.id;
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E3',
            s3_endpoint: undefined,
        });
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E3',
            cors_enabled: true,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetBucketsForRegion)(mockRegion.id, [mockBucket]).as('getBuckets');
        (0, object_storage_1.mockGetBucketObjects)(bucketLabel, bucketCluster, []).as('getBucketObjects');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, object_storage_1.mockUploadBucketObject)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObject');
        (0, object_storage_1.mockUploadBucketObjectS3)(bucketLabel, bucketCluster, bucketFilename).as('uploadBucketObjectS3');
        (0, object_storage_1.mockGetBucketObjectFilename)(bucketLabel, bucketCluster, bucketFilename).as('getBucketFilename');
        (0, object_storage_1.mockGetBucket)(bucketLabel, bucketCluster).as('getBucket');
        cy.visitWithLogin("/object-storage/buckets/".concat(bucketCluster, "/").concat(bucketLabel));
        cy.fixture(bucketFile, null).then(function (bucketFileContents) {
            cy.get('[data-qa-drop-zone="true"]').attachFile({
                fileContent: bucketFileContents,
                fileName: bucketFilename,
            }, {
                subjectType: 'drag-n-drop',
            });
        });
        cy.wait(['@uploadBucketObject', '@uploadBucketObjectS3']);
        cy.findByLabelText('List of Bucket Objects').within(function () {
            cy.findByText(bucketFilename).should('be.visible').click();
        });
        ui_1.ui.drawer.findByTitle(bucketFilename).should('be.visible');
        checkBucketObjectDetailsDrawer(bucketFilename, endpointTypeE3);
    });
    it('displays successfully fetched buckets, warning message for single failed fetch', function () {
        var mockRegions = factories_1.regionFactory
            .buildList(2, {
            capabilities: ['Object Storage'],
        })
            .map(function (region) { return (0, regions_3.extendRegion)(region); });
        (0, regions_2.mockGetRegions)(mockRegions).as('getRegions');
        var mockEndpoints = mockRegions.map(function (mockRegion) {
            return factories_1.objectStorageEndpointsFactory.build({
                endpoint_type: 'E2',
                region: mockRegion.id,
                s3_endpoint: "".concat(mockRegion.id, ".linodeobjects.com"),
            });
        });
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getEndpoints');
        var mockBucket1 = factories_1.objectStorageBucketFactoryGen2.build({
            label: (0, random_1.randomLabel)(),
            region: mockRegions[0].id,
        });
        // this bucket should display
        (0, object_storage_1.mockGetBucketsForRegion)(mockRegions[0].id, [mockBucket1]).as('getBucketsForRegion');
        (0, object_storage_1.mockGetBucketsForRegionError)(mockRegions[1].id).as('getBucketsForRegionError');
        cy.visitWithLogin('/object-storage/buckets');
        cy.wait([
            '@getRegions',
            '@getEndpoints',
            '@getBucketsForRegion',
            '@getBucketsForRegionError',
        ]);
        // table with retrieved bucket
        cy.findByText(mockBucket1.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(mockRegions[0].label).should('be.visible');
        });
        // warning message
        cy.findByTestId('notice-warning-important').within(function () {
            cy.contains("There was an error loading buckets in ".concat(mockRegions[1].label));
        });
        cy.contains("If you have buckets in ".concat(mockRegions[1].label, ", you may not see them listed below."));
    });
    it('displays successfully fetched buckets, warning message for multiple failed fetches', function () {
        var mockRegions = factories_1.regionFactory.buildList(3, {
            capabilities: ['Object Storage'],
        });
        (0, regions_2.mockGetRegions)(mockRegions).as('getRegions');
        var mockEndpoints = mockRegions.map(function (mockRegion) {
            return factories_1.objectStorageEndpointsFactory.build({
                endpoint_type: 'E2',
                region: mockRegion.id,
                s3_endpoint: "".concat(mockRegion.id, ".linodeobjects.com"),
            });
        });
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getEndpoints');
        var mockBucket1 = factories_1.objectStorageBucketFactoryGen2.build({
            label: (0, random_1.randomLabel)(),
            region: mockRegions[0].id,
        });
        // this bucket should display
        (0, object_storage_1.mockGetBucketsForRegion)(mockRegions[0].id, [mockBucket1]).as('getBucketsForRegion');
        // force errors for 2 regions' buckets
        (0, object_storage_1.mockGetBucketsForRegionError)(mockRegions[1].id).as('getBucketsForRegionError0');
        (0, object_storage_1.mockGetBucketsForRegionError)(mockRegions[2].id).as('getBucketsForRegionError1');
        cy.visitWithLogin('/object-storage/buckets');
        cy.wait([
            '@getRegions',
            '@getEndpoints',
            '@getBucketsForRegion',
            '@getBucketsForRegionError0',
            '@getBucketsForRegionError1',
        ]);
        // table with retrieved bucket
        cy.get('table tbody tr').should('have.length', 1);
        // warning message
        cy.findByTestId('notice-warning-important').within(function () {
            cy.contains('There was an error loading buckets in the following regions:');
            var strError1 = "".concat(mockRegions[1].country.toUpperCase(), ", ").concat(mockRegions[1].label);
            var strError2 = "".concat(mockRegions[2].country.toUpperCase(), ", ").concat(mockRegions[2].label);
            cy.get('ul>li').eq(0).contains(strError1);
            cy.get('ul>li').eq(1).contains(strError2);
            // bottom of warning message
            cy.contains('If you have buckets in these regions, you may not see them listed below.');
        });
    });
});
