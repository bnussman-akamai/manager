"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appBar = void 0;
/**
 * UI helpers for Cloud Manager top app bar.
 */
exports.appBar = {
    /**
     * Finds the app bar.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-appbar]');
    },
};
