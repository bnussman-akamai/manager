"use strict";
/**
 * @file Integration tests for Managed navigation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var managed_1 = require("src/factories/managed");
var profile_1 = require("src/factories/profile");
var account_1 = require("support/intercepts/account");
var managed_2 = require("support/intercepts/managed");
var profile_2 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var managed_3 = require("support/api/managed");
// Array of URLs to all Managed-related pages.
var managedURLs = [
    '/managed/summary',
    '/managed/monitors',
    '/managed/ssh-access',
    '/managed/credentials',
    '/managed/contacts',
];
// User preferences object to ensure that nav sidebar is open.
var userPreferences = profile_1.userPreferencesFactory.build({
    // `false` corresponds to the sidebar being open.
    desktop_sidebar_open: false,
});
describe('Managed navigation', function () {
    /*
     * - Confirms that "Managed" nav item is present when Managed is enabled.
     * - Confirms that clicking "Managed" nav item navigates to '/managed/summary'.
     * - Confirms that "Managed" nav item is not present when Managed is disabled.
     */
    it('shows Managed in sidebar when enabled', function () {
        // Confirm that Managed is in sidebar when it's enabled.
        (0, account_1.mockGetAccountSettings)(managed_3.managedAccount).as('getAccountSettings');
        (0, profile_2.mockGetUserPreferences)(userPreferences).as('getUserPreferences');
        cy.visitWithLogin('/linodes');
        cy.wait(['@getAccountSettings', '@getUserPreferences']);
        ui_1.ui.nav.findItemByTitle('Managed').should('be.visible').click();
        cy.url().should('endWith', '/managed/summary');
        // Confirm that Managed is not in sidebar when it's not enabled.
        (0, account_1.mockGetAccountSettings)(managed_3.nonManagedAccount).as('getAccountSettings');
        cy.visitWithLogin('/linodes');
        cy.wait(['@getAccountSettings', '@getUserPreferences']);
        ui_1.ui.nav.find().within(function () {
            cy.findByText('Managed').should('not.exist');
        });
    });
    /*
     * - Confirms that Managed content is accessible when Managed is enabled.
     * - Confirms that Managed content is inaccessible when Managed is disabled.
     */
    it('allows access to Managed content when Managed is enabled', function () {
        // Confirm that Managed pages are accessible when Managed is enabled.
        // TODO Intercept Managed requests so that pages don't have unauthorized blocks.
        managedURLs.forEach(function (url) {
            (0, managed_2.mockGetServiceMonitors)(managed_1.monitorFactory.buildList(5)).as('getServiceMonitors');
            (0, managed_2.mockGetIssues)(managed_1.managedIssueFactory.buildList(3)).as('getIssues');
            (0, managed_2.mockGetContacts)(managed_1.contactFactory.buildList(10)).as('getContacts');
            (0, managed_2.mockGetCredentials)(managed_1.credentialFactory.buildList(3)).as('getCredentials');
            (0, managed_2.mockGetStats)().as('getStats');
            (0, managed_3.visitUrlWithManagedEnabled)(url);
            // Wait for page to load and for "Managed" heading to be visible.
            ui_1.ui.heading.findByText('Managed').should('be.visible');
            cy.findByText('Unauthorized').should('not.exist');
        });
        // Confirm that Managed pages are inaccessible when Managed is not enabled.
        managedURLs.forEach(function (url) {
            (0, managed_2.mockUnauthorizedManagedRequests)();
            (0, managed_3.visitUrlWithManagedDisabled)(url);
            // The Managed SSH tab has two sections that can each display an "Unauthorized" notice.
            // We're using `findAllByText` to ensure that Cypress succeeds when both load at the same time.
            cy.findAllByText('Unauthorized').should('exist').should('be.visible');
        });
    });
    /*
     * - Confirms that navigating to Cloud Manager redirects you to Managed when Managed is enabled.
     * - Confirms that navigating to Cloud Manager does not redirect you to Managed when Managed is disabled.
     */
    it('redirects you to Managed when you visit Cloud Manager', function () {
        (0, managed_3.visitUrlWithManagedEnabled)('/');
        cy.url().should('endWith', '/managed/summary');
        (0, managed_3.visitUrlWithManagedDisabled)('/');
        cy.url().should('not.endWith', '/managed/summary');
    });
});
