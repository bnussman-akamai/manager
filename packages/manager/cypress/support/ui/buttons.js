"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buttonGroup = exports.button = void 0;
/**
 * Button UI element.
 */
exports.button = {
    /**
     * Finds a button by the value of a given attribute.
     *
     * @param attributeName - Attribute to compare against.
     * @param attributeValue - Expected value for attribute.
     *
     * @returns Cypress chainable.
     */
    findByAttribute: function (attributeName, attributeValue) {
        return cy.get("button[".concat(attributeName, "=\"").concat(attributeValue, "\"]"));
    },
    /**
     * Finds a button by its title.
     *
     * Most buttons in Cloud Manager have a child `<span />` element containing
     * the title text. Hence, the `<button />` element itself must be selected
     * by traversing the DOM.
     *
     * @param buttonTitle - Title of button to find.
     *
     * @returns Cypress chainable.
     */
    findByTitle: function (buttonTitle) {
        return cy.findByText(buttonTitle).closest('button');
    },
};
/**
 * Button group UI element.
 *
 * Generally used to contain buttons in drawers and dialogs.
 */
exports.buttonGroup = {
    /**
     * Finds a button group and returns the Cypress chainable.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-buttons="true"]');
    },
    /**
     * Finds a button within a button group by its title and returns the Cypress chainable.
     *
     * @param buttonTitle - Title of button to find.
     *
     * @returns Cypress chainable.
     */
    findButtonByTitle: function (buttonTitle) {
        return cy
            .get('[data-qa-buttons="true"]')
            .findByText(buttonTitle)
            .closest('button');
    },
};
