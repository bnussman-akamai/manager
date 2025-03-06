"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var object_storage_1 = require("support/intercepts/object-storage");
var factories_1 = require("src/factories");
describe('Object Storage Gen 2 bucket details tabs', function () {
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
    var mockRegion = factories_1.regionFactory.build({
        capabilities: ['Object Storage'],
    });
    var mockAccess = {
        acl: 'private',
        acl_xml: '',
        cors_enabled: true,
        cors_xml: '',
    };
    var createMocksBasedOnEndpointType = function (endpointType) {
        var mockBucket = factories_1.objectStorageBucketFactoryGen2.build({
            endpoint_type: endpointType,
            region: mockRegion.id,
        });
        var mockEndpoint = factories_1.objectStorageEndpointsFactory.build({
            endpoint_type: endpointType,
            region: mockRegion.id,
        });
        return { mockBucket: mockBucket, mockEndpoint: mockEndpoint };
    };
    describe('Access and SSL/TLS tabs', function () {
        ['E0', 'E1'].forEach(function (endpoint) {
            /**
             * Parameterized test for object storage endpoint types E0 and E1
             * - Confirms the CORS toggle still appears
             * - Confirms the SSL/TLS tab appears
             */
            it("does not hide the CORS toggle and SSL/TLS tab for buckets with an ".concat(endpoint, " endpoint"), function () {
                var _a = createMocksBasedOnEndpointType(endpoint), mockBucket = _a.mockBucket, mockEndpoint = _a.mockEndpoint;
                var cluster = mockBucket.cluster, label = mockBucket.label;
                (0, object_storage_1.mockGetBucketAccess)(label, cluster, mockAccess).as('getBucketAccess');
                (0, object_storage_1.mockGetBucketsForRegion)(mockRegion.id, [mockBucket]).as('getBucketsForRegion');
                (0, object_storage_1.mockGetObjectStorageEndpoints)([mockEndpoint]).as('getObjectStorageEndpoints');
                cy.visitWithLogin("/object-storage/buckets/".concat(cluster, "/").concat(label, "/access"));
                cy.wait([
                    '@getFeatureFlags',
                    '@getAccount',
                    '@getObjectStorageEndpoints',
                    '@getBucketsForRegion',
                    '@getBucketAccess',
                ]);
                cy.findByText('Bucket Access').should('be.visible');
                cy.findByLabelText('Access Control List (ACL)').should('be.visible');
                // confirm CORS is visible
                cy.findByText('CORS Enabled').should('be.visible');
                cy.contains('Whether Cross-Origin Resource Sharing is enabled for all origins. For more fine-grained control of CORS, please use another S3-compatible tool.').should('be.visible');
                // Confirm SSL/TLS tab is not hidden and is clickable
                cy.findByText('SSL/TLS').should('be.visible').click();
                cy.url().should('endWith', '/ssl');
            });
        });
        ['E2', 'E3'].forEach(function (endpoint) {
            /**
             * Parameterized test for object storage endpoint types E2 and E3
             * - Confirms the CORS toggle is hidden
             * - Confirms the SSL/TLS tab is hidden
             */
            it("hides the CORS toggle and SSL/TLS tab for for buckets with an ".concat(endpoint, " endpoint"), function () {
                var _a = createMocksBasedOnEndpointType(endpoint), mockBucket = _a.mockBucket, mockEndpoint = _a.mockEndpoint;
                var cluster = mockBucket.cluster, label = mockBucket.label;
                (0, object_storage_1.mockGetBucketAccess)(label, cluster, mockAccess).as('getBucketAccess');
                (0, object_storage_1.mockGetBucketsForRegion)(mockRegion.id, [mockBucket]).as('getBucketsForRegion');
                (0, object_storage_1.mockGetObjectStorageEndpoints)([mockEndpoint]).as('getObjectStorageEndpoints');
                cy.visitWithLogin("/object-storage/buckets/".concat(cluster, "/").concat(label, "/access"));
                cy.wait([
                    '@getFeatureFlags',
                    '@getAccount',
                    '@getObjectStorageEndpoints',
                    '@getBucketsForRegion',
                    '@getBucketAccess',
                ]);
                cy.findByText('Bucket Access').should('be.visible');
                cy.findByLabelText('Access Control List (ACL)').should('be.visible');
                // confirm CORS is not visible
                cy.contains('CORS (Cross Origin Sharing) is not available for endpoint types E2 and E3').should('be.visible');
                // confirms the SSL/TLS tab is not present
                cy.findByText('SSL/TLS').should('not.exist');
            });
        });
    });
});
