"use strict";
/**
 * @file Integration tests for restricted user billing flows.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var accountUsers_1 = require("@src/factories/accountUsers");
var grants_1 = require("@src/factories/grants");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var constants_1 = require("src/features/Account/constants");
// Tooltip message that appears on disabled billing action buttons for restricted
// and child users.
var restrictedUserTooltip = "You don't have permissions to edit this Account.";
// Mock credit card payment method to use in tests.
var mockPaymentMethods = [
    factories_1.paymentMethodFactory.build({
        data: {
            card_type: 'Visa',
            expiry: '12/2026',
            last_four: '1234',
        },
        is_default: false,
    }),
    factories_1.paymentMethodFactory.build({
        data: {
            card_type: 'Visa',
            expiry: '12/2026',
            last_four: '5678',
        },
        is_default: true,
    }),
];
/**
 * Asserts that the billing contact "Edit" button is disabled.
 *
 * Additionally confirms that clicking the "Edit" button reveals a tooltip and
 * does not open the "Edit Billing Contact Info" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
var assertEditBillingInfoDisabled = function (tooltipText) {
    // Confirm Billing Contact section "Edit" button is disabled, then click it.
    cy.get('[data-qa-contact-summary]')
        .should('be.visible')
        .within(function () {
        ui_1.ui.button
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.disabled')
            .click();
    });
    // Assert that "Edit Contact Billing Info" drawer does not open and that tooltip is revealed.
    cy.get("[data-qa-drawer-title=\"Edit Billing Contact Info\"]").should('not.exist');
    ui_1.ui.tooltip.findByText(tooltipText).should('be.visible');
};
/**
 * Asserts that the billing contact "Edit" button is enabled.
 *
 * Additionally confirms that clicking the "Edit" button opens the "Edit Billing
 * Contact Info" drawer, then closes the drawer.
 */
var assertEditBillingInfoEnabled = function () {
    cy.get('[data-qa-contact-summary]')
        .should('be.visible')
        .within(function () {
        ui_1.ui.button
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
    ui_1.ui.drawer
        .findByTitle('Edit Billing Contact Info')
        .should('be.visible')
        .within(function () {
        ui_1.ui.drawerCloseButton.find().click();
    });
};
/**
 * Asserts that the "Add Payment Method" button is disabled.
 *
 * Additionally confirms that clicking the "Add Payment Method" button reveals
 * a tooltip and does not open the "Add Payment Method" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
var assertAddPaymentMethodDisabled = function (tooltipText) {
    // Confirm that payment method action menu items are disabled.
    ui_1.ui.actionMenu
        .findByTitle('Action menu for card ending in 1234')
        .should('be.visible')
        .should('be.enabled')
        .click();
    ['Make a Payment', 'Make Default', 'Delete'].forEach(function (menuItem) {
        ui_1.ui.actionMenuItem.findByTitle(menuItem).should('be.disabled');
    });
    // Dismiss action menu.
    cy.get('[data-qa-action-menu="true"]').click();
    // Confirm Billing Summary section "Add Payment Method" button is disabled, then click it.
    cy.get('[data-qa-billing-summary]')
        .should('be.visible')
        .within(function () {
        ui_1.ui.button
            .findByTitle('Add Payment Method')
            .should('be.visible')
            .should('be.disabled')
            .click();
    });
    // Assert that "Add Payment Method" drawer does not open and that tooltip is revealed.
    cy.get("[data-qa-drawer-title=\"Add Payment Method\"]").should('not.exist');
    ui_1.ui.tooltip.findByText(tooltipText).should('be.visible');
};
/**
 * Asserts that the "Add Payment Method" button is enabled.
 *
 * Additionally confirms that clicking the "Add Payment Method" button opens the
 * "Add Payment Method" drawer, then closes the drawer.
 */
var assertAddPaymentMethodEnabled = function () {
    // Confirm that payment method action menu items are enabled.
    ui_1.ui.actionMenu
        .findByTitle('Action menu for card ending in 1234')
        .should('be.visible')
        .should('be.enabled')
        .click();
    ['Make a Payment', 'Make Default', 'Delete'].forEach(function (menuItem) {
        ui_1.ui.actionMenuItem.findByTitle(menuItem).should('be.enabled');
    });
    // Dismiss action menu.
    cy.get('[data-qa-action-menu="true"]').click();
    cy.get('[data-qa-billing-summary]')
        .should('be.visible')
        .within(function () {
        ui_1.ui.button
            .findByTitle('Add Payment Method')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
    ui_1.ui.drawer
        .findByTitle('Add Payment Method')
        .should('be.visible')
        .within(function () {
        ui_1.ui.drawerCloseButton.find().click();
    });
};
/**
 * Asserts that the "Make a Payment" button is disabled.
 *
 * Additionally confirms that clicking the "Make a Payment" button reveals
 * a tooltip and does not open the "Make a Payment" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
var assertMakeAPaymentDisabled = function (tooltipText) {
    // Confirm "Make A Payment" button is disabled, then click it.
    ui_1.ui.button
        .findByTitle('Make a Payment')
        .should('be.visible')
        .should('be.disabled')
        .click();
    // Assert that "Make a Payment" drawer does not open and that tooltip is revealed.
    cy.get("[data-qa-drawer-title=\"Make a Payment\"]").should('not.exist');
    ui_1.ui.tooltip.findByText(tooltipText).should('be.visible');
};
/**
 * Asserts that the "Make a Payment" button is enabled.
 *
 * Additionally confirms that clicking the "Make a Payment" button reveals
 * a tooltip and does not open the "Make a Payment" drawer.
 *
 * @param tooltipText - Expected tooltip message to be shown to the user.
 */
var assertMakeAPaymentEnabled = function () {
    // Confirm "Make A Payment" button is enabled, then click it.
    ui_1.ui.button
        .findByTitle('Make a Payment')
        .should('be.visible')
        .should('be.enabled')
        .click();
    cy.get("[data-qa-drawer-title=\"Make a Payment\"]").should('be.visible');
    ui_1.ui.drawer
        .findByTitle('Make a Payment')
        .should('be.visible')
        .within(function () {
        ui_1.ui.button
            .findByTitle('Pay Now')
            .should('be.visible')
            .should('be.enabled');
        ui_1.ui.drawerCloseButton.find().click();
    });
};
describe('restricted user billing flows', function () {
    beforeEach(function () {
        (0, account_1.mockGetPaymentMethods)(mockPaymentMethods);
    });
    /*
     * - Confirms that users with read-only account access cannot edit billing information.
     * - Confirms UX enhancements are applied when parent/child feature flag is enabled.
     * - Confirms that "Edit" and "Add Payment Method" buttons are disabled and have informational tooltips.
     * - Confirms that clicking "Edit" and "Add Payment Method" does not open their respective drawers when disabled.
     * - Confirms that button tooltip text reflects read-only account access.
     * - Confirms that payment method action menu items are disabled.
     */
    it('cannot edit billing information with read-only account access', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: true,
            username: (0, random_1.randomLabel)(),
        });
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: true,
            user_type: 'default',
            username: mockProfile.username,
        });
        var mockGrants = grants_1.grantsFactory.build({
            global: {
                account_access: 'read_only',
            },
        });
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetProfileGrants)(mockGrants);
        (0, account_1.mockGetUser)(mockUser);
        cy.visitWithLogin('/account/billing');
        assertEditBillingInfoDisabled(restrictedUserTooltip);
        assertAddPaymentMethodDisabled(restrictedUserTooltip);
        assertMakeAPaymentDisabled(restrictedUserTooltip +
            " Please contact your ".concat(constants_1.ADMINISTRATOR, " to request the necessary permissions."));
    });
    /*
     * - Confirms that child users cannot edit billing information.
     * - Confirms that UX enhancements are applied when parent/child feature flag is enabled.
     * - Confirms that "Edit" and "Add Payment Method" buttons are disabled and have informational tooltips.
     * - Confirms that clicking "Edit" and "Add Payment Method" does not open their respective drawers when disabled.
     * - Confirms that button tooltip text reflects child user access.
     * - Confirms that payment method action menu items are disabled.
     */
    it('cannot edit billing information as child account', function () {
        var mockProfile = factories_1.profileFactory.build({
            user_type: 'child',
            username: (0, random_1.randomLabel)(),
        });
        var mockUser = accountUsers_1.accountUserFactory.build({
            username: mockProfile.username,
        });
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, account_1.mockGetUser)(mockUser);
        cy.visitWithLogin('/account/billing');
        assertEditBillingInfoDisabled(restrictedUserTooltip);
        assertAddPaymentMethodDisabled(restrictedUserTooltip);
        assertMakeAPaymentDisabled(restrictedUserTooltip +
            " Please contact your ".concat(constants_1.PARENT_USER, " to request the necessary permissions."));
    });
    /*
     * - Smoke test to confirm that regular and parent users can edit billing information.
     * - Confirms that billing action buttons are enabled and open their respective drawers on click.
     */
    it('can edit billing information as a regular user and as a parent user', function () {
        var mockProfileRegular = factories_1.profileFactory.build({
            restricted: false,
            username: (0, random_1.randomLabel)(),
        });
        var mockUserRegular = accountUsers_1.accountUserFactory.build({
            restricted: false,
            user_type: 'default',
            username: mockProfileRegular.username,
        });
        var mockProfileParent = factories_1.profileFactory.build({
            restricted: false,
            username: (0, random_1.randomLabel)(),
        });
        var mockUserParent = accountUsers_1.accountUserFactory.build({
            restricted: false,
            user_type: 'parent',
            username: mockProfileParent.username,
        });
        // Confirm button behavior for regular users.
        (0, profile_1.mockGetProfile)(mockProfileRegular);
        (0, account_1.mockGetUser)(mockUserRegular);
        cy.visitWithLogin('/account/billing');
        cy.findByText(mockProfileRegular.username);
        assertEditBillingInfoEnabled();
        assertAddPaymentMethodEnabled();
        assertMakeAPaymentEnabled();
        // Confirm button behavior for parent users.
        (0, profile_1.mockGetProfile)(mockProfileParent);
        (0, account_1.mockGetUser)(mockUserParent);
        cy.visitWithLogin('/account/billing');
        cy.findByText(mockProfileParent.username);
        assertEditBillingInfoEnabled();
        assertAddPaymentMethodEnabled();
        assertMakeAPaymentEnabled();
    });
});
