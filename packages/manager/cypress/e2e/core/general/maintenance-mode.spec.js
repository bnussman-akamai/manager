"use strict";
/**
 * @file Integration tests for Cloud Manager maintenance mode handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var general_1 = require("support/intercepts/general");
describe('API maintenance mode', function () {
    /*
     * - Confirms that maintenance mode screen is shown when API responds with maintenance mode header.
     */
    it('shows maintenance screen when API is in maintenance mode', function () {
        (0, general_1.mockApiMaintenanceMode)();
        cy.visitWithLogin('/');
        // Confirm that maintenance message and link to status page are shown.
        cy.findByText('We are undergoing maintenance.').should('be.visible');
        cy.contains('status.linode.com').should('be.visible');
    });
});
