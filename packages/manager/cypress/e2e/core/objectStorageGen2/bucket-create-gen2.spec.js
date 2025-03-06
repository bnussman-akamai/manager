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
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var object_storage_1 = require("support/intercepts/object-storage");
var profile_1 = require("support/intercepts/profile");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var object_storage_gen2_1 = require("support/util/object-storage-gen2");
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
var profile_2 = require("src/factories/profile");
var regions_2 = require("support/util/regions");
describe('Object Storage Gen2 create bucket tests', function () {
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
    var mockRegions = factories_1.regionFactory.buildList(10, {
        capabilities: ['Object Storage'],
    });
    var mockRegion = (0, regions_2.chooseRegion)({ regions: __spreadArray([], mockRegions, true) });
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
    var mockAccess = {
        acl: 'private',
        acl_xml: '',
        cors_enabled: true,
        cors_xml: '',
    };
    var bucketRateLimitsNotice = 'Specifies the maximum Requests Per Second (RPS) for a bucket. To increase it to High, open a support ticket. Understand bucket rate limits.';
    var CORSNotice = 'CORS (Cross Origin Sharing) is not available for endpoint types E2 and E3';
    // For E0/E1, confirm CORS toggle and ACL selection are both present
    // For E2/E3, confirm rate limit notice and table are present, ACL selection is present, CORS toggle is absent
    var checkBucketDetailsDrawer = function (bucketLabel, endpointType) {
        ui_1.ui.drawer.findByTitle(bucketLabel).within(function () {
            if (endpointType === 'Standard (E3)' ||
                endpointType === 'Standard (E2)') {
                cy.contains(bucketRateLimitsNotice).should('be.visible');
                cy.get('[data-testid="bucket-rate-limit-table"]').should('be.visible');
                cy.contains(CORSNotice).should('be.visible');
                ui_1.ui.toggle.find().should('not.exist');
            }
            else {
                cy.get('[data-testid="bucket-rate-limit-table"]').should('not.exist');
                ui_1.ui.toggle
                    .find()
                    .should('have.attr', 'data-qa-toggle', 'true')
                    .should('be.visible');
                cy.contains('CORS Enabled').should('be.visible');
            }
            // Verify that all ACL selection show up as options
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
                .findByTitle('Public Read/Write')
                .should('be.visible')
                .should('be.enabled');
            ui_1.ui.autocompletePopper
                .findByTitle('Private')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Close the Details drawer
            cy.get('[data-qa-close-drawer="true"]').should('be.visible').click();
        });
    };
    /**
     * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E0
     * Confirms all endpoints are displayed regardless if there's multiple of the same type
     * Confirms S3 endpoint hostname displayed to differentiate between identical options in the dropdown
     * Confirms correct information displays in the details drawer for a bucket with endpoint E0
     */
    it('can create a bucket with E0 endpoint type', function () {
        var endpointTypeE0 = 'Legacy (E0)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-iad-12';
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, object_storage_1.mockDeleteBucket)(bucketLabel, mockRegion.id).as('deleteBucket');
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E0',
            cors_enabled: true,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, object_storage_1.mockGetBucketAccess)(bucketLabel, bucketCluster, mockAccess).as('getBucketAccess');
        cy.visitWithLogin('/object-storage/buckets/create');
        cy.wait([
            '@getFeatureFlags',
            '@getBuckets',
            '@getAccount',
            '@getObjectStorageEndpoints',
        ]);
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E0',
            s3_endpoint: undefined,
        });
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            cy.findByText('Label').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.regionSelect.find().click();
            cy.focused().type("".concat(mockRegion.label, "{enter}"));
            cy.findByLabelText('Object Storage Endpoint Type')
                .should('be.visible')
                .click();
            // verify that all mocked endpoints show up as options
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E1)')
                .should('be.visible')
                .should('be.enabled');
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E1) us-sea-1.linodeobjects.com')
                .should('be.visible')
                .should('be.enabled');
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E2)')
                .should('be.visible')
                .should('be.enabled');
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E3)')
                .should('be.visible')
                .should('be.enabled');
            // Select E0 endpoint
            ui_1.ui.autocompletePopper
                .findByTitle('Legacy (E0)')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm bucket rate limits text for E0 endpoint
            cy.findByText('Bucket Rate Limits').should('be.visible');
            cy.contains('This endpoint type supports up to 750 Requests Per Second (RPS). Understand bucket rate limits').should('be.visible');
            // Confirm bucket rate limit table should not exist when E0 endpoint is selected
            cy.get('[data-testid="bucket-rate-limit-table"]').should('not.exist');
            (0, object_storage_1.mockGetBuckets)([mockBucket]).as('getBuckets');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm request body has expected data
        cy.wait('@createBucket').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload['endpoint_type']).to.equal('E0');
            expect(requestPayload['cors_enabled']).to.equal(true);
        });
        ui_1.ui.drawer.find().should('not.exist');
        // Confirm that bucket is created, initiate deletion for cleanup
        cy.findByText(endpointTypeE0).should('be.visible');
        cy.findByText(bucketLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(mockRegion.label).should('be.visible');
            // Confirm that clicking "Details" button for the bucket opens details drawer
            ui_1.ui.button.findByTitle('Details').should('be.visible').click();
        });
        checkBucketDetailsDrawer(bucketLabel, endpointTypeE0);
        // Delete the bucket to clean up
        ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete Bucket ".concat(bucketLabel))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Bucket Name').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm bucket gets deleted
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        cy.wait(['@deleteBucket', '@getBuckets']);
        cy.findByText(bucketLabel).should('not.exist');
    });
    /**
     * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E1
     * Confirms correct information displays in the details drawer for a bucket with endpoint E1
     */
    it('can create a bucket with E1 endpoint type', function () {
        var endpointTypeE1 = 'Standard (E1)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-iad-12';
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, object_storage_1.mockDeleteBucket)(bucketLabel, mockRegion.id).as('deleteBucket');
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E1',
            cors_enabled: true,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, object_storage_1.mockGetBucketAccess)(bucketLabel, bucketCluster, mockAccess).as('getBucketAccess');
        cy.visitWithLogin('/object-storage/buckets/create');
        cy.wait([
            '@getFeatureFlags',
            '@getBuckets',
            '@getAccount',
            '@getObjectStorageEndpoints',
        ]);
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E1',
            s3_endpoint: 'us-sea-1.linodeobjects.com',
        });
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            cy.findByText('Label').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.regionSelect.find().click();
            cy.focused().type("".concat(mockRegion.label, "{enter}"));
            cy.findByLabelText('Object Storage Endpoint Type')
                .should('be.visible')
                .click();
            // Select E1 endpoint
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E1) us-sea-1.linodeobjects.com')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm bucket rate limits text for E1 endpoint
            cy.findByText('Bucket Rate Limits').should('be.visible');
            cy.contains('This endpoint type supports up to 750 Requests Per Second (RPS). Understand bucket rate limits').should('be.visible');
            // Confirm bucket rate limit table should not exist when E1 endpoint is selected
            cy.get('[data-testid="bucket-rate-limit-table"]').should('not.exist');
            (0, object_storage_1.mockGetBuckets)([mockBucket]).as('getBuckets');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm request body has expected data
        cy.wait('@createBucket').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload['endpoint_type']).to.equal('E1');
            expect(requestPayload['cors_enabled']).to.equal(true);
            expect(requestPayload['s3_endpoint']).to.equal('us-sea-1.linodeobjects.com');
        });
        ui_1.ui.drawer.find().should('not.exist');
        // Confirm that bucket is created, initiate deletion for cleanup
        cy.findByText(endpointTypeE1).should('be.visible');
        cy.findByText(bucketLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(mockRegion.label).should('be.visible');
            // Confirm that clicking "Details" button for the bucket opens details drawer
            ui_1.ui.button.findByTitle('Details').should('be.visible').click();
        });
        checkBucketDetailsDrawer(bucketLabel, endpointTypeE1);
        // Delete the bucket to clean up
        ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete Bucket ".concat(bucketLabel))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Bucket Name').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm bucket gets deleted
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        cy.wait(['@deleteBucket', '@getBuckets']);
        cy.findByText(bucketLabel).should('not.exist');
    });
    /**
     * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E2
     * Confirms correct information displays in the details drawer for a bucket with endpoint E2
     */
    it('can create a bucket with E2 endpoint type', function () {
        var endpointTypeE2 = 'Standard (E2)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-iad-12';
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, object_storage_1.mockDeleteBucket)(bucketLabel, mockRegion.id).as('deleteBucket');
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E2',
            cors_enabled: true,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, object_storage_1.mockGetBucketAccess)(bucketLabel, bucketCluster, mockAccess).as('getBucketAccess');
        cy.visitWithLogin('/object-storage/buckets/create');
        cy.wait([
            '@getFeatureFlags',
            '@getBuckets',
            '@getAccount',
            '@getObjectStorageEndpoints',
        ]);
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E2',
            s3_endpoint: undefined,
        });
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            cy.findByText('Label').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.regionSelect.find().click();
            cy.focused().type("".concat(mockRegion.label, "{enter}"));
            cy.findByLabelText('Object Storage Endpoint Type')
                .should('be.visible')
                .click();
            // Select E2 endpoint
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E2)')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm bucket rate limits text for E2 endpoint
            cy.findByText('Bucket Rate Limits').should('be.visible');
            cy.contains(bucketRateLimitsNotice).should('be.visible');
            // Confirm bucket rate limit table should exist when E2 endpoint is selected
            cy.get('[data-testid="bucket-rate-limit-table"]').should('exist');
            // Confirm that basic rate limits table is displayed
            (0, object_storage_gen2_1.checkRateLimitsTable)(mockBucket.endpoint_type);
            (0, object_storage_1.mockGetBuckets)([mockBucket]).as('getBuckets');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm request body has expected data
        cy.wait('@createBucket').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload['endpoint_type']).to.equal('E2');
            expect(requestPayload['cors_enabled']).to.equal(false);
        });
        ui_1.ui.drawer.find().should('not.exist');
        // Confirm that bucket is created, initiate deletion for cleanup
        cy.findByText(endpointTypeE2).should('be.visible');
        cy.findByText(bucketLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(mockRegion.label).should('be.visible');
            // Confirm that clicking "Details" button for the bucket opens details drawer
            ui_1.ui.button.findByTitle('Details').should('be.visible').click();
        });
        checkBucketDetailsDrawer(bucketLabel, endpointTypeE2);
        // Delete the bucket to clean up
        ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete Bucket ".concat(bucketLabel))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Bucket Name').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm bucket gets deleted
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        cy.wait(['@deleteBucket', '@getBuckets']);
        cy.findByText(bucketLabel).should('not.exist');
    });
    /**
     * Confirms UI flow for creating a gen2 Object Storage bucket with endpoint E3
     * Confirms correct information displays in the details drawer for a bucket with endpoint E3
     */
    it('can create a bucket with E3 endpoint type', function () {
        var endpointTypeE3 = 'Standard (E3)';
        var bucketLabel = (0, random_1.randomLabel)();
        var bucketCluster = 'us-iad-12';
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, object_storage_1.mockDeleteBucket)(bucketLabel, mockRegion.id).as('deleteBucket');
        (0, object_storage_1.mockCreateBucket)({
            label: bucketLabel,
            endpoint_type: 'E3',
            cors_enabled: false,
            region: mockRegion.id,
        }).as('createBucket');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, object_storage_1.mockGetBucketAccess)(bucketLabel, bucketCluster, mockAccess).as('getBucketAccess');
        cy.visitWithLogin('/object-storage/buckets/create');
        cy.wait([
            '@getFeatureFlags',
            '@getBuckets',
            '@getAccount',
            '@getObjectStorageEndpoints',
        ]);
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            label: bucketLabel,
            region: mockRegion.id,
            endpoint_type: 'E3',
            s3_endpoint: undefined,
        });
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            cy.findByText('Label').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.regionSelect.find().click();
            cy.focused().type("".concat(mockRegion.label, "{enter}"));
            cy.findByLabelText('Object Storage Endpoint Type')
                .should('be.visible')
                .click();
            // Select E3 endpoint
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E3)')
                .scrollIntoView()
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm bucket rate limits text for E3 endpoint
            cy.findByText('Bucket Rate Limits').should('be.visible');
            cy.contains(bucketRateLimitsNotice).should('be.visible');
            // Confirm bucket rate limit table should exist when E3 endpoint is selected
            cy.get('[data-testid="bucket-rate-limit-table"]').should('exist');
            // Confirm that basic rate limits table is displayed
            (0, object_storage_gen2_1.checkRateLimitsTable)(mockBucket.endpoint_type);
            (0, object_storage_1.mockGetBuckets)([mockBucket]).as('getBuckets');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm request body has expected data
        cy.wait('@createBucket').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload['endpoint_type']).to.equal('E3');
            expect(requestPayload['cors_enabled']).to.equal(false);
        });
        ui_1.ui.drawer.find().should('not.exist');
        // Confirm that bucket is created, initiate deletion for cleanup
        cy.findByText(endpointTypeE3).should('be.visible');
        cy.findByText(bucketLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(mockRegion.label).should('be.visible');
            // Confirm that clicking "Details" button for the bucket opens details drawer
            ui_1.ui.button.findByTitle('Details').should('be.visible').click();
        });
        checkBucketDetailsDrawer(bucketLabel, endpointTypeE3);
        // Delete the bucket to clean up
        ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle("Delete Bucket ".concat(bucketLabel))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Bucket Name').click();
            cy.focused().type(bucketLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm bucket gets deleted
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        cy.wait(['@deleteBucket', '@getBuckets']);
        cy.findByText(bucketLabel).should('not.exist');
    });
    /**
     * Confirms UI flow for when creating a bucket results in validation and API errors
     * - Confirms trying to create a bucket without an endpoint leads to a validation error that later disappears when an endpoint is specified
     * - Confirms trying to create a bucket without a label leads to a validation error that later disappears when a label is specified
     * - Confirms an error returned by the API is displayed and does not crash Cloud Manager
     */
    it('handles errors and validation', function () {
        var bucketLabel = (0, random_1.randomLabel)();
        var mockErrorMessage = 'An unknown error has occurred.';
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, object_storage_1.mockGetObjectStorageEndpoints)(mockEndpoints).as('getObjectStorageEndpoints');
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, object_storage_1.mockCreateBucketError)(mockErrorMessage).as('createBucket');
        cy.visitWithLogin('/object-storage/buckets/create');
        cy.wait([
            '@getFeatureFlags',
            '@getAccount',
            '@getBuckets',
            '@getObjectStorageEndpoints',
        ]);
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            ui_1.ui.regionSelect.find().click().type("".concat(mockRegion.label, "{enter}"));
            // Confirms error appears when an endpoint isn't selected, and disappears after one is selected
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.contains('Endpoint Type is required.').should('be.visible');
            cy.findByLabelText('Object Storage Endpoint Type')
                .should('be.visible')
                .click();
            ui_1.ui.autocompletePopper
                .findByTitle('Standard (E3)')
                .scrollIntoView()
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.contains('Endpoint Type is required.').should('not.exist');
            // confirms error appears when label isn't filled in and disappears once a label is entered
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.contains('Label is required.').should('be.visible');
            cy.findByText('Label').click();
            cy.focused().type(bucketLabel);
            cy.contains('Label is required.').should('not.exist');
            // confirms (mock) API error appears
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@createBucket');
            cy.findByText(mockErrorMessage).should('be.visible');
        });
    });
});
/**
 * When a restricted user navigates to object-storage/buckets/create, an error is shown in the "Create Bucket" drawer noting that the user does not have bucket creation permissions
 */
describe('Object Storage Gen2 create bucket modal has disabled fields for restricted user', function () {
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
        // restricted user
        (0, profile_1.mockGetProfile)(profile_2.profileFactory.build({
            email: 'mock-user@linode.com',
            restricted: true,
        })).as('getProfile');
    });
    // bucket creation
    it('create bucket form', function () {
        cy.visitWithLogin('/object-storage/buckets/create');
        cy.wait(['@getFeatureFlags', '@getAccount', '@getProfile']);
        // error message
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            cy.findByText(/You don't have permissions to create a Bucket./).should('be.visible');
            cy.findByLabelText(/Label.*/)
                .should('be.visible')
                .should('be.disabled');
            ui_1.ui.regionSelect.find().should('be.visible').should('be.disabled');
            // submit button should be disabled
            cy.findByTestId('create-bucket-button')
                .should('be.visible')
                .should('be.disabled');
        });
    });
});
