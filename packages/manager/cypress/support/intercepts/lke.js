"use strict";
/**
 * @file Cypress intercepts and mocks for Cloud Manager LKE operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUpdateNodePoolError = exports.mockUpdateClusterError = exports.mockGetLKEClusterTypes = exports.mockUpdateControlPlaneACLError = exports.mockUpdateControlPlaneACL = exports.mockGetControlPlaneACLError = exports.mockGetControlPlaneACL = exports.mockResetKubeconfig = exports.mockGetApiEndpoints = exports.mockGetDashboardUrl = exports.mockRecycleAllNodes = exports.mockRecycleNodePool = exports.mockRecycleNode = exports.mockDeleteNodePool = exports.mockUpdateNodePool = exports.mockAddNodePool = exports.mockDeleteCluster = exports.mockCreateClusterError = exports.mockCreateCluster = exports.interceptCreateCluster = exports.mockGetKubeconfig = exports.mockGetClusterPools = exports.mockUpdateCluster = exports.mockGetCluster = exports.mockGetClusters = exports.mockGetTieredKubernetesVersions = exports.mockGetKubernetesVersions = void 0;
var factories_1 = require("@src/factories");
var lke_1 = require("support/constants/lke");
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var random_1 = require("support/util/random");
var response_1 = require("support/util/response");
/**
 * Intercepts GET request to retrieve Kubernetes versions and mocks response.
 *
 * @param versions - Optional array of strings containing mocked versions.
 *
 * @returns Cypress chainable.
 */
var mockGetKubernetesVersions = function (versions) {
    var versionObjects = (versions ? versions : lke_1.kubernetesVersions).map(function (kubernetesVersionString) {
        return { id: kubernetesVersionString };
    });
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('lke/versions*'), (0, paginate_1.paginateResponse)(versionObjects));
};
exports.mockGetKubernetesVersions = mockGetKubernetesVersions;
/**
 * Intercepts GET request to retrieve tiered Kubernetes versions and mocks response.
 *
 * @param tier - Standard or enterprise Kubernetes tier.
 * @param versions - Optional array of strings containing mocked tiered versions.
 *
 * @returns Cypress chainable.
 */
var mockGetTieredKubernetesVersions = function (tier, versions) {
    var defaultTieredVersions = tier === 'enterprise'
        ? [lke_1.latestEnterpriseTierKubernetesVersion]
        : [lke_1.latestStandardTierKubernetesVersion];
    var versionObjects = (versions ? versions : defaultTieredVersions).map(function (kubernetesTieredVersion) {
        return {
            id: kubernetesTieredVersion.id,
            tier: kubernetesTieredVersion.tier,
        };
    });
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("lke/tiers/".concat(tier, "/versions*")), (0, paginate_1.paginateResponse)(versionObjects));
};
exports.mockGetTieredKubernetesVersions = mockGetTieredKubernetesVersions;
/**
 * Intercepts GET request to retrieve LKE clusters and mocks response.
 *
 * @param clusters - LKE clusters with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetClusters = function (clusters) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('lke/clusters*'), (0, paginate_1.paginateResponse)(clusters));
};
exports.mockGetClusters = mockGetClusters;
/**
 * Intercepts GET request to retrieve an LKE cluster and mocks the response.
 *
 * @param cluster - LKE cluster with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetCluster = function (cluster) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(cluster.id)), (0, response_1.makeResponse)(cluster));
};
exports.mockGetCluster = mockGetCluster;
/**
 * Intercepts PUT request to update an LKE cluster and mocks response.
 *
 * @param clusterId - ID of cluster for which to intercept PUT request.
 * @param cluster - Updated Kubernetes cluster with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateCluster = function (clusterId, cluster) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId)), (0, response_1.makeResponse)(cluster));
};
exports.mockUpdateCluster = mockUpdateCluster;
/**
 * Intercepts GET request to retrieve an LKE cluster's node pools and mocks response.
 *
 * @param clusterId - ID of cluster for which to intercept GET request.
 * @param pools - Array of LKE node pools with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetClusterPools = function (clusterId, pools) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/pools*")), (0, paginate_1.paginateResponse)(pools));
};
exports.mockGetClusterPools = mockGetClusterPools;
/**
 * Intercepts GET request to retrieve an LKE cluster's kubeconfig and mocks response.
 *
 * @param clusterId - ID of cluster for which to mock response.
 * @param kubeconfig - Kubeconfig object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetKubeconfig = function (clusterId, kubeconfig) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/kubeconfig")), (0, response_1.makeResponse)(kubeconfig));
};
exports.mockGetKubeconfig = mockGetKubeconfig;
/**
 * Intercepts POST request to create an LKE cluster.
 *
 * @returns Cypress chainable.
 */
var interceptCreateCluster = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('lke/clusters'));
};
exports.interceptCreateCluster = interceptCreateCluster;
/**
 * Intercepts POST request to create an LKE cluster and mocks the response.
 *
 * @param cluster - LKE cluster with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateCluster = function (cluster) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('lke/clusters'), (0, response_1.makeResponse)(cluster));
};
exports.mockCreateCluster = mockCreateCluster;
/**
 * Intercepts POST request to create an LKE cluster and mocks an error response.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateClusterError = function (errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error occurred.'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('lke/clusters'), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockCreateClusterError = mockCreateClusterError;
/**
 * Intercepts DELETE request to delete an LKE cluster and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockDeleteCluster = function (clusterId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId)), (0, response_1.makeResponse)());
};
exports.mockDeleteCluster = mockDeleteCluster;
/**
 * Intercepts POST request to add a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePool - Node pool response object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockAddNodePool = function (clusterId, nodePool) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/pools")), (0, response_1.makeResponse)(nodePool));
};
exports.mockAddNodePool = mockAddNodePool;
/**
 * Intercepts PUT request to update a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateNodePool = function (clusterId, nodePool) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/pools/").concat(nodePool.id)), (0, response_1.makeResponse)(nodePool));
};
exports.mockUpdateNodePool = mockUpdateNodePool;
/**
 * Intercepts DELETE request to delete a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockDeleteNodePool = function (clusterId, nodePoolId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/pools/").concat(nodePoolId)), (0, response_1.makeResponse)({}));
};
exports.mockDeleteNodePool = mockDeleteNodePool;
/**
 * Intercepts POST request to recycle a node and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodeId - ID of node for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockRecycleNode = function (clusterId, nodeId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/nodes/").concat(nodeId, "/recycle")), (0, response_1.makeResponse)({}));
};
exports.mockRecycleNode = mockRecycleNode;
/**
 * Intercepts POST request to recycle a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockRecycleNodePool = function (clusterId, poolId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/pools/").concat(poolId, "/recycle")), (0, response_1.makeResponse)({}));
};
exports.mockRecycleNodePool = mockRecycleNodePool;
/**
 * Intercepts POST request to recycle all of a cluster's nodes and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockRecycleAllNodes = function (clusterId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/recycle")), (0, response_1.makeResponse)({}));
};
exports.mockRecycleAllNodes = mockRecycleAllNodes;
/**
 * Intercepts GET request to retrieve Kubernetes cluster dashboard URL and mocks response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param url - Optional URL to include in mocked response.
 *
 * @returns Cypress chainable.
 */
var mockGetDashboardUrl = function (clusterId, url) {
    var dashboardUrl = url !== null && url !== void 0 ? url : "https://".concat((0, random_1.randomDomainName)());
    var dashboardResponse = factories_1.kubernetesDashboardUrlFactory.build({
        url: dashboardUrl,
    });
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/dashboard")), (0, response_1.makeResponse)(dashboardResponse));
};
exports.mockGetDashboardUrl = mockGetDashboardUrl;
/**
 * Intercepts GET request to retrieve cluster API endpoints and mocks response.
 *
 * By default, a single endpoint 'https://cy-test.linodelke.net:443' is returned.
 * Cloud Manager will only display endpoints that end with 'linodelke.net:443'.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param endpoints - Optional array of API endpoints to include in mocked response.
 *
 * @returns Cypress chainable.
 */
var mockGetApiEndpoints = function (clusterId, endpoints) {
    // Endpoint has to end with 'linodelke.net:443' to be displayed in Cloud.
    var kubeEndpoints = endpoints
        ? endpoints.map(function (endpoint) {
            return factories_1.kubeEndpointFactory.build({ endpoint: endpoint });
        })
        : factories_1.kubeEndpointFactory.build({
            endpoint: "https://cy-test.linodelke.net:443",
        });
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/api-endpoints*")), (0, paginate_1.paginateResponse)(kubeEndpoints));
};
exports.mockGetApiEndpoints = mockGetApiEndpoints;
/**
 * Intercepts DELETE request to reset Kubeconfig and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockResetKubeconfig = function (clusterId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/kubeconfig")), (0, response_1.makeResponse)({}));
};
exports.mockResetKubeconfig = mockResetKubeconfig;
/**
 * Intercepts GET request for a cluster's Control Plane ACL and mocks the response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param controlPlaneACL - control plane ACL data for which to mock response
 *
 * @returns Cypress chainable
 */
var mockGetControlPlaneACL = function (clusterId, controlPlaneACL) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("/lke/clusters/".concat(clusterId, "/control_plane_acl")), (0, response_1.makeResponse)(controlPlaneACL));
};
exports.mockGetControlPlaneACL = mockGetControlPlaneACL;
/**
 * Intercepts GET request for a cluster's Control Plane ACL and mocks an error response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable
 */
var mockGetControlPlaneACLError = function (clusterId, errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error occurred.'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("/lke/clusters/".concat(clusterId, "/control_plane_acl")), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockGetControlPlaneACLError = mockGetControlPlaneACLError;
/**
 * Intercepts PUT request for a cluster's Control Plane ACL and mocks the response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param controlPlaneACL - control plane ACL data for which to mock response
 *
 * @returns Cypress chainable
 */
var mockUpdateControlPlaneACL = function (clusterId, controlPlaneACL) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("/lke/clusters/".concat(clusterId, "/control_plane_acl")), (0, response_1.makeResponse)(controlPlaneACL));
};
exports.mockUpdateControlPlaneACL = mockUpdateControlPlaneACL;
/**
 * Intercepts PUT request for a cluster's Control Plane ACL and mocks the response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateControlPlaneACLError = function (clusterId, errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error occurred.'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("/lke/clusters/".concat(clusterId, "/control_plane_acl")), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockUpdateControlPlaneACLError = mockUpdateControlPlaneACLError;
/**
 * Intercepts GET request for LKE cluster types and mocks the response
 *
 * @param types - LKE cluster types with which to mock response
 *
 * @returns Cypress chainable
 */
var mockGetLKEClusterTypes = function (types) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('lke/types*'), (0, paginate_1.paginateResponse)(types));
};
exports.mockGetLKEClusterTypes = mockGetLKEClusterTypes;
/**
 * Intercepts PUT request to update an LKE cluster and mocks an error response.
 *
 * @param clusterId - ID of cluster for which to intercept PUT request.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateClusterError = function (clusterId, errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error occurred.'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId)), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockUpdateClusterError = mockUpdateClusterError;
/**
 * Intercepts PUT request to update an LKE cluster node pool and mocks an error response.
 *
 * @param clusterId - ID of cluster for which to intercept PUT request.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateNodePoolError = function (clusterId, nodePool, errorMessage, statusCode) {
    if (errorMessage === void 0) { errorMessage = 'An unknown error occurred.'; }
    if (statusCode === void 0) { statusCode = 500; }
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("lke/clusters/".concat(clusterId, "/pools/").concat(nodePool.id)), (0, errors_1.makeErrorResponse)(errorMessage, statusCode));
};
exports.mockUpdateNodePoolError = mockUpdateNodePoolError;
