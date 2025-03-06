"use strict";
/**
 * @files Cypress intercepts and mocks for VPC API requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockEditSubnet = exports.mockCreateSubnet = exports.mockDeleteSubnet = exports.mockGetSubnets = exports.mockDeleteVPCError = exports.mockDeleteVPC = exports.mockUpdateVPC = exports.mockCreateVPCError = exports.mockCreateVPC = exports.mockGetVPCs = exports.mockGetVPC = exports.MOCK_DELETE_VPC_ERROR = void 0;
var errors_1 = require("support/util/errors");
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
exports.MOCK_DELETE_VPC_ERROR = 'Before deleting this VPC, you must remove all of its Linodes';
/**
 * Intercepts GET request to fetch a VPC and mocks response.
 *
 * @param vpc - VPC with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetVPC = function (vpc) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("vpcs/".concat(vpc.id)), (0, response_1.makeResponse)(vpc));
};
exports.mockGetVPC = mockGetVPC;
/**
 * Intercepts GET request to fetch VPCs and mocks response.
 *
 * @param vpcs - Array of VPCs with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetVPCs = function (vpcs) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('vpcs*'), (0, paginate_1.paginateResponse)(vpcs));
};
exports.mockGetVPCs = mockGetVPCs;
/**
 * Intercepts POST request to create a VPC and mocks the response.
 *
 * @param vpc - VPC object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateVPC = function (vpc) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('vpcs'), (0, response_1.makeResponse)(vpc));
};
exports.mockCreateVPC = mockCreateVPC;
/**
 * Intercepts POST request to create a VPC and mocks an HTTP error response.
 *
 * By default, a 500 response is mocked.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `500`.
 *
 * @returns Cypress chainable.
 */
var mockCreateVPCError = function (errorMessage, errorCode) {
    if (errorMessage === void 0) { errorMessage = 'An error has occurred'; }
    if (errorCode === void 0) { errorCode = 500; }
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('vpcs'), (0, errors_1.makeErrorResponse)(errorMessage, errorCode));
};
exports.mockCreateVPCError = mockCreateVPCError;
/**
 * Intercepts PUT request to update a VPC and mocks response.
 *
 * @param vpcId - ID of updated VPC for which to mock response.
 * @param updatedVPC - Updated VPC data with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateVPC = function (vpcId, updatedVPC) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("vpcs/".concat(vpcId)), updatedVPC);
};
exports.mockUpdateVPC = mockUpdateVPC;
/**
 * Intercepts DELETE request to delete a VPC and mocks response.
 *
 * @param vpcId - ID of deleted VPC for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockDeleteVPC = function (vpcId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("vpcs/".concat(vpcId)), {});
};
exports.mockDeleteVPC = mockDeleteVPC;
/**
 * Intercepts DELETE request to delete a VPC and mocks an HTTP error response.
 *
 * @param vpcId - ID of deleted VPC for which to mock response.
 * @param errorMessage - Optional error message with which to mock response.
 * @param errorCode - Optional error code with which to mock response. Default is `400`.
 *
 * @returns Cypress chainable.
 */
var mockDeleteVPCError = function (vpcId, errorMessage, errorCode) {
    if (errorMessage === void 0) { errorMessage = exports.MOCK_DELETE_VPC_ERROR; }
    if (errorCode === void 0) { errorCode = 400; }
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("/vpcs/".concat(vpcId)), (0, errors_1.makeErrorResponse)(errorMessage, errorCode));
};
exports.mockDeleteVPCError = mockDeleteVPCError;
/**
 * Intercepts GET request to get a VPC's subnets and mocks response.
 *
 * @param vpcId - ID of VPC for which to mock response.
 * @param subnets - Array of subnets for which to mock response
 *
 * @returns Cypress chainable.
 */
var mockGetSubnets = function (vpcId, subnets) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("vpcs/".concat(vpcId, "/subnets*")), (0, paginate_1.paginateResponse)(subnets));
};
exports.mockGetSubnets = mockGetSubnets;
/**
 * Intercepts DELETE request to delete a subnet of a VPC and mocks response
 *
 * @param vpcId - ID of VPC for which to mock response.
 * @param subnetId - ID of subnet for which to mock response
 *
 * @returns Cypress chainable.
 */
var mockDeleteSubnet = function (vpcId, subnetId) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("vpcs/".concat(vpcId, "/subnets/").concat(subnetId)), {});
};
exports.mockDeleteSubnet = mockDeleteSubnet;
/**
 * Intercepts POST request to create a subnet for a VPC and mocks response.
 *
 * @param vpcId - ID of VPC for which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockCreateSubnet = function (vpcId) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("vpcs/".concat(vpcId, "/subnets")), {});
};
exports.mockCreateSubnet = mockCreateSubnet;
/**
 * Intercepts PUT request to edit a subnet for a VPC and mocks response
 *
 * @param vpcId: ID of VPC for which to mock response
 * @param subnetId: ID of subnet for which to mock response
 * @param editedSubnet Updated subnet data with which to mock response
 *
 * @returns Cypress chainable
 */
var mockEditSubnet = function (vpcId, subnetId, editedSubnet) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("vpcs/".concat(vpcId, "/subnets/").concat(subnetId)), editedSubnet);
};
exports.mockEditSubnet = mockEditSubnet;
