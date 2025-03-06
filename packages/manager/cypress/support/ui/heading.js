"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heading = void 0;
/**
 * Page heading UI element.
 */
exports.heading = {
    /**
     * Finds the main page heading element.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-header]');
    },
    /**
     * Finds the main page heading element with the given text.
     *
     * @param text - Text for heading to find.
     *
     * @returns Cypress chainable.
     */
    findByText: function (text) {
        return cy.get("[data-qa-header=\"".concat(text, "\"]"));
    },
};
