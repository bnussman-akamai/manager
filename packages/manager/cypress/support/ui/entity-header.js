"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityHeader = void 0;
/**
 * Entity header UI element.
 *
 * Useful for selecting buttons within the entity header, validating entity
 * page heading content, etc.
 */
exports.entityHeader = {
    /**
     * Finds the entity header and returns the Cypress chainable.
     *
     * @returns Cypress chainable.
     */
    find: function () {
        return cy.get('[data-qa-entity-header="true"]');
    },
};
