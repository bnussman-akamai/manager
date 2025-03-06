"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInternalHeader = void 0;
/**
 * Intercept APIv4 responses to delete internal-only headers
 * and ensure our tests replicate what users see.
 */
var deleteInternalHeader = function () {
    // Set up Linode APIv4 intercepts and set default alias value.
    beforeEach(function () {
        cy.intercept({
            middleware: true,
            url: /\/v4(?:beta)?\/.*/,
        }, function (req) {
            // Delete internal-only header
            req.on('before:response', function (res) {
                delete res.headers['akamai-internal-account'];
            });
        });
    });
};
exports.deleteInternalHeader = deleteInternalHeader;
