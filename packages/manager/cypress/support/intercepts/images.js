"use strict";
/**
 * @file Cypress intercepts and mocks for Image API requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUpdateImageRegions = exports.mockDeleteImage = exports.mockUpdateImage = exports.mockGetImage = exports.mockGetRecoveryImages = exports.mockGetCustomImages = exports.mockGetAllImages = exports.interceptGetAllImages = exports.interceptUploadImage = exports.mockCreateImage = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var request_1 = require("support/util/request");
var response_1 = require("support/util/response");
/**
 * Intercepts POST request to create a machine image and mocks the response.
 *
 * @param image - an image objects
 *
 * @returns Cypress chainable.
 */
var mockCreateImage = function (image) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('images'), image);
};
exports.mockCreateImage = mockCreateImage;
/**
 * Intercepts POST request to upload a machine image.
 *
 * @returns Cypress chainable.
 */
var interceptUploadImage = function () {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('images/upload'));
};
exports.interceptUploadImage = interceptUploadImage;
/**
 * Intercepts GET request to retrieve all images.
 *
 * @returns Cypress chainable.
 */
var interceptGetAllImages = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('images*'));
};
exports.interceptGetAllImages = interceptGetAllImages;
/**
 * Intercepts GET request to retrieve all images and mocks response.
 *
 * @param images - Array of Image objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetAllImages = function (images) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('images*'), (0, paginate_1.paginateResponse)(images));
};
exports.mockGetAllImages = mockGetAllImages;
/**
 * Intercepts GET request to retrieve custom images and mocks response.
 *
 * @param images - Array of Image objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetCustomImages = function (images) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('images*'), function (req) {
        var filters = (0, request_1.getFilters)(req);
        if ((filters === null || filters === void 0 ? void 0 : filters.type) === 'manual') {
            req.reply((0, paginate_1.paginateResponse)(images));
        }
    });
};
exports.mockGetCustomImages = mockGetCustomImages;
/**
 * Intercepts GET request to retrieve custom images and mocks response.
 *
 * @param images - Array of Image objects with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockGetRecoveryImages = function (images) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('images*'), function (req) {
        var filters = (0, request_1.getFilters)(req);
        if ((filters === null || filters === void 0 ? void 0 : filters.type) === 'automatic') {
            req.reply((0, paginate_1.paginateResponse)(images));
        }
    });
};
exports.mockGetRecoveryImages = mockGetRecoveryImages;
/**
 * Intercepts the response for an image GET request.
 *
 * Responds with an image with the given label, ID, and status.
 *
 * @param label - Response image label.
 * @param id - Response image ID. Expected to be prefixed with a string (e.g. 'private/12345').
 * @param status - Image status.
 *
 * @returns Cypress chainable.
 */
var mockGetImage = function (imageId, image) {
    var encodedId = encodeURIComponent(imageId);
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)("images/".concat(encodedId, "*")), (0, response_1.makeResponse)(image));
};
exports.mockGetImage = mockGetImage;
/**
 * Intercepts PUT request to update an image and mocks the response.
 *
 * @param id - ID of image being updated.
 * @param updatedImage - Updated image with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateImage = function (id, updatedImage) {
    var encodedId = encodeURIComponent(id);
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("images/".concat(encodedId)), updatedImage);
};
exports.mockUpdateImage = mockUpdateImage;
/**
 * Intercepts DELETE request to delete an image and mocks the response.
 *
 * @param id - ID of image being deleted.
 *
 * @returns Cypress chainable.
 */
var mockDeleteImage = function (id) {
    var encodedId = encodeURIComponent(id);
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("images/".concat(encodedId)), {});
};
exports.mockDeleteImage = mockDeleteImage;
/**
 * Intercepts POST request to update an image's regions and mocks the response.
 *
 * @param id - ID of image
 * @param updatedImage - Updated image with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateImageRegions = function (id, updatedImage) {
    var encodedId = encodeURIComponent(id);
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)("images/".concat(encodedId, "/regions")), updatedImage);
};
exports.mockUpdateImageRegions = mockUpdateImageRegions;
