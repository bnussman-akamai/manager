"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawerCloseButton = exports.drawer = void 0;
/**
 * Drawer UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a drawer.
 */
exports.drawer = {
    /**
     * Finds a drawer.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-drawer="true"]');
    },
    /**
     * Finds a drawer that has the given title.
     */
    findByTitle: function (title) {
        return cy
            .get("[data-qa-drawer-title=\"".concat(title, "\"]"))
            .closest('[data-qa-drawer="true"]');
    },
};
/**
 * Drawer close button UI element.
 */
exports.drawerCloseButton = {
    /**
     * Finds a drawer close button.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-close-drawer="true"]');
    },
};
