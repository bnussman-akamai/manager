"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTestLabel = exports.isTestEntity = exports.deleteByLabel = exports.deleteByIdBeta = exports.deleteById = exports.getAllBeta = exports.getAll = exports.apiCheckErrors = void 0;
var api_1 = require("support/constants/api");
var cypress_1 = require("support/constants/cypress");
var apiroot = Cypress.env('REACT_APP_API_ROOT') + '/';
var apirootBeta = Cypress.env('REACT_APP_API_ROOT') + 'beta/';
var apiCheckErrors = function (resp, failOnError) {
    if (failOnError === void 0) { failOnError = true; }
    var errs = undefined;
    if (resp.body && resp.body.ERRORARRAY && resp.body.ERRORARRAY.length > 0) {
        errs = resp.body.ERRORARRAY;
    }
    if (failOnError) {
        if (errs) {
            expect(errs[0].ERRORMESSAGE).not.to.be.exist;
        }
        else {
            expect(!!errs).to.be.false;
        }
    }
    return errs;
};
exports.apiCheckErrors = apiCheckErrors;
var getAll = function (path, headers) {
    if (headers === void 0) { headers = {}; }
    return cy.request({
        auth: {
            bearer: api_1.oauthToken,
        },
        headers: headers,
        method: 'GET',
        url: "".concat(apiroot).concat(path),
    });
};
exports.getAll = getAll;
var getAllBeta = function (path) {
    return cy.request({
        auth: {
            bearer: api_1.oauthToken,
        },
        method: 'GET',
        url: "".concat(apirootBeta).concat(path),
    });
};
exports.getAllBeta = getAllBeta;
/**
 * Deletes an entity with the given ID.
 *
 * @param path API path for the type of entity to delete.
 * @param id ID of entity to delete.
 *
 * @example
 * // Delete a volume whose ID is `123`.
 * deleteById('volumes', 123);
 */
var deleteById = function (path, id) {
    return cy.request({
        auth: {
            bearer: api_1.oauthToken,
        },
        //     to another e2e in progress.
        failOnStatusCode: false,
        method: 'DELETE',
        // Sometimes a entity may fail to delete. This should not fail a test.
        // Ex. A Linode created by Cypress may be cloning due to another E2E test
        //     running and the API will return 400. We don't want to fail due
        url: "".concat(apiroot).concat(path, "/").concat(id),
    });
};
exports.deleteById = deleteById;
var deleteByIdBeta = function (path, id) {
    return cy.request({
        auth: {
            bearer: api_1.oauthToken,
        },
        method: 'DELETE',
        url: "".concat(apirootBeta).concat(path, "/").concat(id),
    });
};
exports.deleteByIdBeta = deleteByIdBeta;
/**
 * Deletes an entity with the given label.
 *
 * @param path API path for the type of entity to delete.
 * @param label Label of entity to delete.
 *
 * @example
 * // Delete a tag named "cy-test-my-label".
 * deleteByLabel('tags', 'cy-test-my-label');
 */
var deleteByLabel = function (path, label) {
    return cy.request({
        auth: {
            bearer: api_1.oauthToken,
        },
        failOnStatusCode: false,
        method: 'DELETE',
        url: "".concat(apiroot).concat(path, "/").concat(label),
    });
};
exports.deleteByLabel = deleteByLabel;
// Images do not have tags
var isTestEntity = function (entity) {
    var _a, _b, _c;
    return ((_a = entity.tags) === null || _a === void 0 ? void 0 : _a.includes(cypress_1.entityTag)) ||
        ((_b = entity.label) === null || _b === void 0 ? void 0 : _b.startsWith(cypress_1.entityPrefix)) ||
        ((_c = entity.summary) === null || _c === void 0 ? void 0 : _c.includes(cypress_1.entityTag));
};
exports.isTestEntity = isTestEntity;
/**
 * Determines whether or not a label is a test label.
 *
 * @param label Label to check.
 *
 * @example
 * isTestLabel('my-label'); // `false`.
 * isTestLabel('cy-test-my-label'); // `true`.
 *
 * @returns True if label is a test label, false otherwise.
 */
var isTestLabel = function (label) {
    return label.startsWith(cypress_1.entityPrefix);
};
exports.isTestLabel = isTestLabel;
