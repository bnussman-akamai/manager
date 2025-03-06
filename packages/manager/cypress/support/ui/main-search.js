"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainSearch = void 0;
var commonLocators = require("support/ui/locators/common-locators");
/**
 * Drawer UI element.
 *
 * Useful for validating content, filling out forms, etc. that appear within
 * a drawer.
 */
exports.mainSearch = {
    /**
     * Finds a drawer.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get(commonLocators.topMenuItemsLocator.searchInput);
    },
};
