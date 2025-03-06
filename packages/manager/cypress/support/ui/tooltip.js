"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tooltip = void 0;
/**
 * Tooltip UI helper.
 */
exports.tooltip = {
    /**
     * Finds a tooltip that has the given text.
     */
    findByText: function (text) {
        return cy.document().its('body').find("[data-qa-tooltip=\"".concat(text, "\"]"));
    },
};
