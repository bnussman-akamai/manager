"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialog = void 0;
/**
 * Drawer UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a drawer.
 */
exports.dialog = {
    /**
     * Finds a drawer.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-dialog="true"]');
    },
    /**
     * Finds a drawer that has the given title.
     */
    findByTitle: function (title) {
        return cy
            .get("[data-qa-dialog-title=\"".concat(title, "\"]"))
            .closest('[data-qa-dialog="true"]');
    },
};
