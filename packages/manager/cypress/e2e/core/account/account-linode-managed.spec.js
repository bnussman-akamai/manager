"use strict";
/**
 * @file Integration tests for Cloud Manager account enable Linode Managed flows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var profile_1 = require("src/factories/profile");
var account_1 = require("src/factories/account");
var linodes_1 = require("src/factories/linodes");
var regions_1 = require("support/util/regions");
var account_2 = require("support/intercepts/account");
var linodes_2 = require("support/intercepts/linodes");
var account_3 = require("support/constants/account");
var profile_2 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var managed_1 = require("support/api/managed");
describe('Account Linode Managed', function () {
    /*
     * - Confirms that a user can add linode managed from the Account Settings page.
     * - Confirms that user is told about the Managed price.
     * - Confirms that Cloud Manager displays the Managed state.
     */
    it('users can enable Linode Managed', function () {
        var mockAccount = account_1.accountFactory.build();
        var mockProfile = profile_1.profileFactory.build({
            username: 'mock-user',
            restricted: false,
        });
        var mockLinodes = new Array(5).fill(null).map(function (item, index) {
            return linodes_1.linodeFactory.build({
                label: "Linode ".concat(index),
                region: (0, regions_1.chooseRegion)().id,
            });
        });
        (0, linodes_2.mockGetLinodes)(mockLinodes).as('getLinodes');
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_2.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_2.mockEnableLinodeManaged)().as('enableLinodeManaged');
        // Navigate to Account Settings page, click "Add Linode Managed" button.
        (0, managed_1.visitUrlWithManagedDisabled)('/account/settings');
        cy.wait(['@getAccount', '@getProfile', '@getLinodes']);
        ui_1.ui.button
            .findByTitle('Add Linode Managed')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.dialog
            .findByTitle('Just to confirm...')
            .should('be.visible')
            .within(function () {
            cy.get('h6')
                .invoke('text')
                .then(function (text) {
                console.log("h6 text: ".concat(text.trim()));
                expect(text.trim()).to.equal((0, account_3.linodeEnabledMessageText)(mockLinodes.length));
            });
            // Confirm that submit button is enabled.
            ui_1.ui.button
                .findByTitle('Add Linode Managed')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@enableLinodeManaged');
        // Confirm that Cloud Manager displays a notice about Linod managed is enabled.
        cy.findByText(account_3.linodeManagedStateMessageText, { exact: false }).should('be.visible');
    });
    /*
     * - Confirms Cloud Manager behavior when a restricted user attempts to enable Linode Managed.
     * - Confirms that API error response message is displayed in confirmation dialog.
     */
    it('restricted users cannot enable Managed', function () {
        var mockAccount = account_1.accountFactory.build();
        var mockProfile = profile_1.profileFactory.build({
            username: 'mock-restricted-user',
            restricted: true,
        });
        var errorMessage = 'Unauthorized';
        (0, linodes_2.mockGetLinodes)([]);
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_2.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_2.mockEnableLinodeManagedError)(errorMessage, 403).as('enableLinodeManaged');
        // Navigate to Account Settings page, click "Add Linode Managed" button.
        (0, managed_1.visitUrlWithManagedDisabled)('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        ui_1.ui.button
            .findByTitle('Add Linode Managed')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.dialog
            .findByTitle('Just to confirm...')
            .should('be.visible')
            .within(function () {
            cy.get('h6')
                .invoke('text')
                .then(function (text) {
                expect(text.trim()).to.equal((0, account_3.linodeEnabledMessageText)(0));
            });
            // Confirm that submit button is enabled.
            ui_1.ui.button
                .findByTitle('Add Linode Managed')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@enableLinodeManaged');
            // Confirm that Cloud Manager displays a notice about Linode managed is unauthorized.
            cy.findByText(errorMessage, { exact: false }).should('be.visible');
        });
    });
    /*
     * - Confirms that a user can aonly cancel Linode Managed by opening a support ticket.
     * - Confirms that user will be redirected to the creating support ticket page.
     */
    it('users can only open a support ticket to cancel Linode Managed', function () {
        var mockAccount = account_1.accountFactory.build();
        var mockProfile = profile_1.profileFactory.build({
            username: 'mock-user',
            restricted: false,
        });
        (0, account_2.mockGetAccount)(mockAccount).as('getAccount');
        (0, profile_2.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate to Account Settings page.
        (0, managed_1.visitUrlWithManagedEnabled)('/account/settings');
        cy.wait(['@getAccount', '@getProfile']);
        // Enable button should not exist for users that already enabled Linode Managed.
        cy.findByText('Add Linode Managed').should('not.exist');
        cy.findByText(account_3.linodeManagedStateMessageText, { exact: false }).should('be.visible');
        // Navigate to the 'Open a Support Ticket' page.
        cy.findByText('Support Ticket').should('be.visible').click();
        cy.url().should('endWith', '/support/tickets');
        // Confirm that title and category are related to cancelling Linode Managed.
        cy.findByLabelText('Title (required)').should('have.value', 'Cancel Linode Managed');
        cy.findByLabelText('What is this regarding?').should('have.value', 'General/Account/Billing');
    });
});
