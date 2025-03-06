"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager Object Storage operations.
 */
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
exports.mockGetBucketAccess = exports.mockGetBucket = exports.mockGetBucketObjectFilename = exports.mockGetObjectStorageEndpoints = exports.interceptUpdateBucketAccess = exports.interceptGetBucketAccess = exports.mockGetClusters = exports.mockCancelObjectStorage = exports.mockDeleteAccessKey = exports.mockUpdateAccessKey = exports.mockCreateAccessKey = exports.interceptCreateAccessKey = exports.mockGetAccessKeys = exports.interceptGetAccessKeys = exports.mockDeleteBucketObjectS3 = exports.mockDeleteBucketObject = exports.mockUploadBucketObjectS3 = exports.interceptUploadBucketObjectS3 = exports.mockUploadBucketObject = exports.mockGetBucketObjects = exports.mockDeleteBucket = exports.interceptDeleteBucket = exports.mockCreateBucketError = exports.mockCreateBucket = exports.interceptCreateBucket = exports.mockGetBucketsForRegionError = exports.mockGetBucketsForRegion = exports.mockGetBuckets = exports.interceptGetBuckets = void 0;
var sequential_stub_1 = require("support/stubs/sequential-stub");
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
var factories_1 = require("src/factories");
/**
 * Intercepts GET requests to fetch buckets.
 *
 * @returns Cypress chainable.
 */
var interceptGetBuckets = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('object-storage/buckets/*'));
};
exports.interceptGetBuckets = interceptGetBuckets;
/**
 * Intercepts GET requests to fetch buckets and mocks response.
 *
 * Only returns data for the first request intercepted.
 *
 * @param buckets - Object storage buckets with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetBuckets = function (buckets) {
    /*
     * Only the first mocked response will contain data. Subsequent responses
     * will contain an empty array.
     *
     * This is necessary because the Object Storage Buckets landing page makes
     * an indeterminate number of requests to `/object-storage/buckets/<region>`,
     * where `<region>` may be any region where Object Storage is supported.
     */
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('object-storage/buckets/*'), (0, sequential_stub_1.sequentialStub)([(0, paginate_1.paginateResponse)(buckets), (0, paginate_1.paginateResponse)([])]));
};
exports.mockGetBuckets = mockGetBuckets;
/**
 * Intercepts GET request to fetch buckets for a region and mocks response.
 *
 * @param regionId - ID of region for which to mock buckets.
 * @param buckets - Array of Bucket objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetBucketsForRegion = function (regionId, buckets) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(regionId, "*")), (0, paginate_1.paginateResponse)(buckets));
};
exports.mockGetBucketsForRegion = mockGetBucketsForRegion;
/**
 * Intercepts POST request to create a bucket and mocks an error response.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetBucketsForRegionError = function (regionId, errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error occurred.'; }
    if (statusCode === void 0) { statusCode = 500; }
    console.log('mockGetBucketsForRegionError', regionId);
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(regionId, "*")), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockGetBucketsForRegionError = mockGetBucketsForRegionError;
/**
 * Intercepts POST request to create bucket.
 *
 * @returns Cypress chainable.
 */
var interceptCreateBucket = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('object-storage/buckets'));
};
exports.interceptCreateBucket = interceptCreateBucket;
/**
 * Intercepts POST request to create a bucket and mocks response.
 *
 * @param bucket - Bucket with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateBucket = function (bucket) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('object-storage/buckets'), (0, response_1.makeResponse)(factories_1.objectStorageBucketFactoryGen2.build(__assign(__assign({}, bucket), { s3_endpoint: undefined }))));
};
exports.mockCreateBucket = mockCreateBucket;
/**
 * Intercepts POST request to create a bucket and mocks an error response.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateBucketError = function (errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error occurred.'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('object-storage/buckets'), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockCreateBucketError = mockCreateBucketError;
/**
 * Intercepts DELETE request to delete bucket.
 *
 * If a bucket label and cluster are provided, only requests to delete the
 * given bucket in the given cluster are intercepted.
 *
 * If only a cluster is provided, only requests to delete buckets in the
 * given cluster are intercepted.
 *
 * If no cluster or label are provided, all requests to delete buckets are
 * intercepted.
 *
 * @param label - Optional label for bucket deletion to intercept.
 * @param cluster - Optional cluster for bucket deletion to intercept.
 *
 * @returns Cypress chainable.
 */
var interceptDeleteBucket = function (label, cluster) {
    if (label && cluster) {
        return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label)));
    }
    if (cluster) {
        return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/*")));
    }
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)('object-storage/buckets/*'));
};
exports.interceptDeleteBucket = interceptDeleteBucket;
/**
 * Intercepts DELETE request to delete bucket and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 *
 * @returns Cypress chainable.
 */
var mockDeleteBucket = function (label, cluster, statusCode) {
    if (statusCode === void 0) { statusCode = 200; }
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label)), {
        body: {},
        statusCode: statusCode,
    });
};
exports.mockDeleteBucket = mockDeleteBucket;
/**
 * Intercepts GET request to fetch bucket objects and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param data - Mocked response data.
 * @param statusCode - Mocked response status code.
 *
 * @returns Cypress chainable.
 */
var mockGetBucketObjects = function (label, cluster, data, statusCode) {
    if (statusCode === void 0) { statusCode = 200; }
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label, "/object-list?delimiter=%2F&prefix=")), {
        body: {
            data: data,
            is_truncated: false,
            next_marker: null,
        },
        statusCode: statusCode,
    });
};
exports.mockGetBucketObjects = mockGetBucketObjects;
/**
 * Intercepts POST request to upload bucket object and mocks response.
 *
 * By default, an HTTP 200 response which contains the S3 URL for the object
 * is mocked.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Mocked response object filename.
 * @param data - Optional mocked response data.
 * @param statusCode - Opiontal mocked response status code.
 *
 * @returns Cypress chainable.
 */
var mockUploadBucketObject = function (label, cluster, filename, data, statusCode) {
    if (statusCode === void 0) { statusCode = 200; }
    var mockResponse = {
        body: data || {
            exists: false,
            url: "https://".concat(cluster, ".linodeobjects.com:443/").concat(label, "/").concat(filename),
        },
        statusCode: statusCode,
    };
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label, "/object-url")), mockResponse);
};
exports.mockUploadBucketObject = mockUploadBucketObject;
/**
 * Intercepts S3 PUT request to upload bucket object.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
var interceptUploadBucketObjectS3 = function (label, cluster, filename) {
    return cy.intercept('PUT', "https://".concat(cluster, ".linodeobjects.com/").concat(label, "/").concat(filename, "*"));
};
exports.interceptUploadBucketObjectS3 = interceptUploadBucketObjectS3;
/**
 * Intercepts S3 PUT request to upload bucket object and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
var mockUploadBucketObjectS3 = function (label, cluster, filename) {
    return cy.intercept('PUT', "https://".concat(cluster, ".linodeobjects.com/").concat(label, "/").concat(filename, "*"), {});
};
exports.mockUploadBucketObjectS3 = mockUploadBucketObjectS3;
/**
 * Intercepts POST request to delete bucket object and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
var mockDeleteBucketObject = function (label, cluster, filename) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label, "/object-url")), {
        exists: true,
        url: "https://".concat(cluster, ".linodeobjects.com:443/").concat(label, "/").concat(filename),
    });
};
exports.mockDeleteBucketObject = mockDeleteBucketObject;
/**
 * Intercepts S3 DELETE request to delete bucket object and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 * @param status - Response status.
 *
 * @returns Cypress chainable.
 */
var mockDeleteBucketObjectS3 = function (label, cluster, filename, status) {
    if (status === void 0) { status = 204; }
    return cy.intercept('DELETE', "https://".concat(cluster, ".linodeobjects.com/").concat(label, "/").concat(filename, "*"), {
        statusCode: status,
    });
};
exports.mockDeleteBucketObjectS3 = mockDeleteBucketObjectS3;
/**
 * Intercepts GET request to fetch object storage access keys.
 *
 * @returns Cypress chainable.
 */
var interceptGetAccessKeys = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('object-storage/keys*'));
};
exports.interceptGetAccessKeys = interceptGetAccessKeys;
/**
 * Intercepts GET request to fetch object storage access keys, and mocks response.
 *
 * @param response - Mocked response.
 *
 * @returns Cypress chainable.
 */
var mockGetAccessKeys = function (accessKeys) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('object-storage/keys*'), (0, paginate_1.paginateResponse)(accessKeys));
};
exports.mockGetAccessKeys = mockGetAccessKeys;
/**
 * Intercepts object storage access key POST request.
 *
 * @returns Cypress chainable.
 */
var interceptCreateAccessKey = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('object-storage/keys'));
};
exports.interceptCreateAccessKey = interceptCreateAccessKey;
/**
 * Intercepts object storage access key POST request and mocks response.
 *
 * @param accessKey - Access key with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateAccessKey = function (accessKey) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('object-storage/keys'), (0, response_1.makeResponse)(accessKey));
};
exports.mockCreateAccessKey = mockCreateAccessKey;
/**
 * Intercepts request to update an Object Storage Access Key and mocks response.
 *
 * @param updatedAccessKey - Access key with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateAccessKey = function (updatedAccessKey) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("object-storage/keys/".concat(updatedAccessKey.id)), (0, response_1.makeResponse)(updatedAccessKey));
};
exports.mockUpdateAccessKey = mockUpdateAccessKey;
/**
 * Intercepts object storage access key DELETE request and mocks success response.
 *
 * @param keyId - ID of access key for which to intercept DELETE request.
 *
 * @returns Cypress chainable.
 */
var mockDeleteAccessKey = function (keyId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("object-storage/keys/".concat(keyId)), {
        body: {},
        statusCode: 200,
    });
};
exports.mockDeleteAccessKey = mockDeleteAccessKey;
/**
 * Intercepts POST request to cancel Object Storage and mocks response.
 *
 * @returns Cypress chainable.
 */
var mockCancelObjectStorage = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('object-storage/cancel'), {});
};
exports.mockCancelObjectStorage = mockCancelObjectStorage;
/**
 * Intercepts GET request to fetch Object Storage clusters and mocks response.
 *
 * @param clusters - Clusters with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetClusters = function (clusters) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('object-storage/clusters*'), (0, paginate_1.paginateResponse)(clusters));
};
exports.mockGetClusters = mockGetClusters;
/**
 * Intercepts GET request to fetch access information (ACL, CORS) for a given Bucket.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 *
 * @returns Cypress chainable.
 */
var interceptGetBucketAccess = function (label, cluster) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label, "/access")));
};
exports.interceptGetBucketAccess = interceptGetBucketAccess;
/**
 * Intercepts PUT request to update access information (ACL, CORS) for a given Bucket.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 *
 * @returns Cypress chainable.
 */
var interceptUpdateBucketAccess = function (label, cluster) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label, "/access")));
};
exports.interceptUpdateBucketAccess = interceptUpdateBucketAccess;
/**
 * Intercepts GET request to get object storage endpoints and mocks response.
 *
 * @param endpoints - Object Storage endpoints for which to mock response
 *
 * @returns Cypress chainable.
 */
var mockGetObjectStorageEndpoints = function (endpoints) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/endpoints*"), (0, paginate_1.paginateResponse)(endpoints));
};
exports.mockGetObjectStorageEndpoints = mockGetObjectStorageEndpoints;
/**
 * Intercepts GET request to fetch access information (ACL, CORS) for a given Bucket and mock the response.
 *
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param bucketFilename - uploaded bucketFilename
 *
 * @returns Cypress chainable.
 */
var mockGetBucketObjectFilename = function (label, cluster, bucketFilename) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label, "/object-acl?name=").concat(bucketFilename)), {
        body: {},
        statusCode: 200,
    });
};
exports.mockGetBucketObjectFilename = mockGetBucketObjectFilename;
var mockGetBucket = function (label, cluster) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label)), {
        body: {},
        statusCode: 200,
    });
};
exports.mockGetBucket = mockGetBucket;
/* Intercepts GET request to fetch access information (ACL, CORS) for a given Bucket, and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param bucketAccess - Access details for which to mock the response
 *
 * @returns Cypress chainable.
 */
var mockGetBucketAccess = function (label, cluster, bucketAccess) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("object-storage/buckets/".concat(cluster, "/").concat(label, "/access")), (0, response_1.makeResponse)(bucketAccess));
};
exports.mockGetBucketAccess = mockGetBucketAccess;
