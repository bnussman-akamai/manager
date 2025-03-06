"use strict";
/**
 * @file Integration tests for VPC navigation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var profile_1 = require("support/intercepts/profile");
describe('VPC navigation', function () {
    /*
     * - Confirms that VPC navigation item is shown when feature is enabled.
     * - Confirms that clicking VPC navigation item directs user to VPC landing page.
     */
    it('can navigate to VPC landing page', function () {
        // Ensure that the Primary Nav is open
        (0, profile_1.mockGetUserPreferences)({ desktop_sidebar_open: false }).as('getPreferences');
        cy.visitWithLogin('/linodes');
        ui_1.ui.nav.findItemByTitle('VPC').should('be.visible').click();
        cy.url().should('endWith', '/vpcs');
    });
});
