"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggle = void 0;
/**
 * Toggle button UI element.
 */
exports.toggle = {
    /**
     * Find a toggle and returns the Cypress chainable.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-toggle]');
    },
    /**
     * Finds a toggle by the given data attribute and returns the Cypress chainable.
     *
     * @returns Cypress chainable.
     */
    findByDataAttribute: function (attributeName) {
        return cy.get("[".concat(attributeName, "]"));
    },
};
