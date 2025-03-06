"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUpload = void 0;
/**
 * File upload input element.
 */
exports.fileUpload = {
    /**
     * Finds the file upload input element and returns the Cypresss chainable.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('input[type="file"]');
    },
};
