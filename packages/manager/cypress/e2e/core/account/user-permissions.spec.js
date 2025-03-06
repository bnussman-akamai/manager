"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var accountUsers_1 = require("@src/factories/accountUsers");
var grants_1 = require("@src/factories/grants");
var user_permissions_1 = require("support/constants/user-permissions");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var arrays_1 = require("support/util/arrays");
var random_1 = require("support/util/random");
// Message shown when user has unrestricted account access.
var unrestrictedAccessMessage = 'This user has unrestricted access to the account.';
// Toggle button labels for Global Permissions section.
var globalPermissionsLabels = [
    'Can add Linodes to this account ($)',
    'Can add Longview clients to this account',
    'Can add Domains using the DNS Manager',
    'Can create frozen Images under this account ($)',
    'Can add Firewalls to this account',
    'Can add VPCs to this account',
    'Can add NodeBalancers to this account ($)',
    'Can modify this account’s Longview subscription ($)',
    'Can create StackScripts under this account',
    'Can add Block Storage Volumes to this account ($)',
    'Can add Databases to this account ($)',
];
// Specific permission entity types.
var specificPermissionsTypes = [
    'Linodes',
    'Firewalls',
    'StackScripts',
    'Images',
    'Volumes',
    'NodeBalancers',
    'Domains',
    'Longview Clients',
    'Databases',
    'VPCs',
];
/**
 * Returns a copy of a Grants object with its entity-specific permissions set to a new value.
 *
 * @param grants - Grants that should be copied with new permissions applied.
 * @param newPermissions - New permissions to apply to Grants.
 *
 * @returns Clone of `grants` with new permissions applied.
 */
var updateGrantMockPermissions = function (grants, newPermissions) {
    return __assign(__assign({}, grants), { database: grants.database.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), domain: grants.domain.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), firewall: grants.firewall.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), image: grants.image.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), linode: grants.linode.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), longview: grants.longview.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), nodebalancer: grants.nodebalancer.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), stackscript: grants.stackscript.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), volume: grants.volume.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }), vpc: grants.vpc.map(function (grant) { return (__assign(__assign({}, grant), { permissions: newPermissions })); }) });
};
/**
 * Returns an array of entity labels belonging to the given Grants object.
 *
 * @returns Array of entity labels.
 */
var entityLabelsFromGrants = function (grants) {
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], grants.database, true), grants.domain, true), grants.firewall, true), grants.image, true), grants.linode, true), grants.longview, true), grants.nodebalancer, true), grants.stackscript, true), grants.volume, true), grants.vpc, true).map(function (grant) { return grant.label; });
};
/**
 * Assert whether all global permissions are enabled or disabled.
 *
 * @param enabled - When `true`, assert that all permissions are enabled. Otherwise, assert they are disabled.
 */
var assertAllGlobalPermissions = function (enabled) {
    globalPermissionsLabels.forEach(function (permissionLabel) {
        var checkedQuery = enabled ? 'be.checked' : 'not.be.checked';
        cy.findByLabelText(permissionLabel).should(checkedQuery);
    });
};
/**
 * Selects "None", "Read Only", or "Read-Write" billing access.
 *
 * @param billingAccess - Billing access to select.
 */
var selectBillingAccess = function (billingAccess) {
    cy.get("[data-qa-select-card-heading=\"".concat(billingAccess, "\"]"))
        .closest('[data-qa-selection-card]')
        .should('be.visible')
        .click();
};
/**
 * Asserts whether "None", "Read Only", or "Read-Write" billing access is selected.
 *
 * @param billingAccess - Selected billing access to assert.
 */
var assertBillingAccessSelected = function (billingAccess) {
    cy.get("[data-qa-select-card-heading=\"".concat(billingAccess, "\"]"))
        .closest('[data-qa-selection-card]')
        .should('be.visible')
        .should('have.attr', 'data-qa-selection-card-checked', 'true');
};
describe('User permission management', function () {
    /*
     * - Confirms that full account access can be toggled for account users using mock API data.
     * - Confirms that users can navigate to User Permissions pages via Users & Grants page.
     * - Confirms that User Permissions page updates to reflect enabled full account access.
     * - Confirms that User Permissions page updates to reflect disabled full account access.
     */
    it('can toggle full account access', function () {
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            username: (0, random_1.randomLabel)(),
        });
        var mockUserUpdated = __assign(__assign({}, mockUser), { restricted: true });
        var mockUserGrantsUpdated = grants_1.grantsFactory.build();
        // Initially mock user with unrestricted account access.
        (0, account_1.mockGetUsers)([mockUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockUser).as('getUser');
        (0, account_1.mockGetUserGrantsUnrestrictedAccess)(mockUser.username).as('getUserGrants');
        // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        cy.findByText(mockUser.username)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('User Permissions')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that Cloud navigates to the user's permissions page and that user has
        // unrestricted account access.
        cy.url().should('endWith', "/account/users/".concat(mockUser.username, "/permissions"));
        cy.findByText(unrestrictedAccessMessage).should('be.visible');
        // Restrict account access, confirm page updates to reflect change.
        (0, account_1.mockUpdateUser)(mockUser.username, mockUserUpdated);
        (0, account_1.mockGetUserGrants)(mockUser.username, mockUserGrantsUpdated);
        cy.get('[data-qa="toggle-full-account-access"]')
            .should('be.visible')
            .click();
        ui_1.ui.toast.assertMessage('User permissions successfully saved.');
        // Smoke tests to confirm that "General Permissions" and "Specific Permissions"
        // sections are visible.
        cy.findByText('General Permissions').should('be.visible');
        cy.findByText(unrestrictedAccessMessage).should('not.exist');
        cy.get('[data-qa-global-section]')
            .should('be.visible')
            .within(function () {
            cy.contains('Configure the specific rights and privileges this user has within the account.').should('be.visible');
            cy.findByText('Billing Access').should('be.visible');
            globalPermissionsLabels.forEach(function (permissionLabel) {
                cy.findByText(permissionLabel).should('be.visible');
            });
        });
        cy.get('[data-qa-entity-section]')
            .should('be.visible')
            .within(function () {
            cy.findByText('Specific Permissions').should('be.visible');
            specificPermissionsTypes.forEach(function (permissionLabel) {
                cy.findByText(permissionLabel).should('be.visible');
            });
        });
        // Re-enable unrestricted account access, confirm page updates to reflect change.
        (0, account_1.mockUpdateUser)(mockUser.username, mockUser);
        (0, account_1.mockGetUserGrantsUnrestrictedAccess)(mockUser.username);
        cy.get('[data-qa="toggle-full-account-access"]')
            .should('be.visible')
            .click();
        cy.findByText('General Permissions').should('be.visible');
        cy.findByText(unrestrictedAccessMessage).should('be.visible');
        cy.findByText('Billing Access').should('not.exist');
        cy.findByText('Specific Permissions').should('not.exist');
    });
    /*
     * - Confirms that global and specific user permissions can be updated using mock API data.
     * - Confirms that toast notification is shown when updating global and specific permissions.
     */
    it('can update global and specific permissions', function () {
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: true,
            username: (0, random_1.randomLabel)(),
        });
        var mockUserGrants = __assign({}, user_permissions_1.userPermissionsGrants);
        var grantEntities = entityLabelsFromGrants(mockUserGrants);
        // Mock grants after global permissions changes have been applied.
        var mockUserGrantsUpdatedGlobal = __assign(__assign({}, mockUserGrants), { global: {
                account_access: 'read_only',
                add_buckets: true,
                add_databases: true,
                add_domains: true,
                add_firewalls: true,
                add_images: true,
                add_kubernetes: true,
                add_linodes: true,
                add_longview: true,
                add_nodebalancers: true,
                add_stackscripts: true,
                add_volumes: true,
                add_vpcs: true,
                cancel_account: true,
                child_account_access: true,
                longview_subscription: true,
            } });
        // Mock grants after entity-specific permissions changes have been applied.
        var mockUserGrantsUpdatedSpecific = __assign(__assign({}, mockUserGrantsUpdatedGlobal), updateGrantMockPermissions(mockUserGrantsUpdatedGlobal, 'read_write'));
        (0, account_1.mockGetUser)(mockUser).as('getUser');
        (0, account_1.mockGetUserGrants)(mockUser.username, mockUserGrants).as('getUserGrants');
        cy.visitWithLogin("/account/users/".concat(mockUser.username, "/permissions"));
        cy.wait(['@getUser', '@getUserGrants']);
        (0, account_1.mockUpdateUserGrants)(mockUser.username, mockUserGrantsUpdatedGlobal).as('updateUserGrants');
        cy.get('[data-qa-global-section]')
            .should('be.visible')
            .within(function () {
            // Confirm that all global permissions are disabled, and then enable some.
            assertAllGlobalPermissions(false);
            assertBillingAccessSelected('None');
            // Enable all global permissions and "Read-Only" billing access.
            globalPermissionsLabels.forEach(function (permissionLabel) {
                cy.findByText(permissionLabel).should('be.visible').click();
            });
            selectBillingAccess('Read Only');
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@updateUserGrants');
        });
        // Confirm that toast notification appears when updating global permissions.
        ui_1.ui.toast.assertMessage('General user permissions successfully saved.');
        // Update entity-specific user permissions.
        (0, account_1.mockUpdateUserGrants)(mockUser.username, mockUserGrantsUpdatedSpecific).as('updateUserGrants');
        cy.get('[data-qa-entity-section]')
            .should('be.visible')
            .within(function () {
            grantEntities.forEach(function (entityLabel) {
                cy.findByText(entityLabel)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    // Confirm that "None" radio button is selected.
                    cy.get('[data-qa-permission="None"]')
                        .should('have.attr', 'data-qa-radio', 'true')
                        .should('be.visible');
                    // Click "Read-Write" radio button, confirm selection changes.
                    cy.get('[data-qa-permission="Read-Write"]')
                        .should('have.attr', 'data-qa-radio', 'false')
                        .should('be.visible')
                        .click();
                    cy.get('[data-qa-permission="Read-Write"]').should('have.attr', 'data-qa-radio', 'true');
                });
            });
            // Save changes and confirm that toast notification appears.
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@updateUserGrants');
        });
        ui_1.ui.toast.assertMessage('Entity-specific user permissions successfully saved.');
    });
    /*
     * - Confirms that users can discard changes to their global permissions using "Reset" button.
     * - Confirms that users can discard changes to their entity-specific permissions using "Reset" button.
     */
    it('can reset user permissions changes', function () {
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: true,
            username: (0, random_1.randomLabel)(),
        });
        var mockUserGrants = __assign({}, user_permissions_1.userPermissionsGrants);
        var grantEntities = entityLabelsFromGrants(mockUserGrants);
        (0, account_1.mockGetUser)(mockUser);
        (0, account_1.mockGetUserGrants)(mockUser.username, mockUserGrants);
        cy.visitWithLogin("/account/users/".concat(mockUser.username, "/permissions"));
        // Test reset in Global Permissions section.
        cy.get('[data-qa-global-section]')
            .should('be.visible')
            .within(function () {
            // Confirm that all global permissions are disabled and that the user
            // does not have billing access.
            assertAllGlobalPermissions(false);
            assertBillingAccessSelected('None');
            // Enable random permissions and billing read-write access.
            (0, arrays_1.shuffleArray)(globalPermissionsLabels)
                .slice(0, 5)
                .forEach(function (permissionLabel) {
                cy.findByText(permissionLabel).should('be.visible').click();
            });
            selectBillingAccess('Read-Write');
            // Click "Reset" button and confirm that global permissions revert to
            // their initial state.
            ui_1.ui.button
                .findByTitle('Reset')
                .should('be.visible')
                .should('be.enabled')
                .click();
            assertAllGlobalPermissions(false);
            assertBillingAccessSelected('None');
        });
        // Test reset in Specific Permissions section.
        cy.get('[data-qa-entity-section]')
            .should('be.visible')
            .within(function () {
            grantEntities.forEach(function (entityLabel) {
                cy.findByText(entityLabel)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    // Confirm that "None" radio button is selected.
                    cy.get('[data-qa-permission="None"]')
                        .should('have.attr', 'data-qa-radio', 'true')
                        .should('be.visible');
                    // Click "Read Only" radio button, confirm selection changes.
                    cy.get('[data-qa-permission="Read Only"]')
                        .should('have.attr', 'data-qa-radio', 'false')
                        .should('be.visible')
                        .click();
                    cy.get('[data-qa-permission="Read Only"]').should('have.attr', 'data-qa-radio', 'true');
                });
            });
            // Reset changes and confirm that permissions revert to initial state.
            ui_1.ui.button
                .findByTitle('Reset')
                .should('be.visible')
                .should('be.enabled')
                .click();
            grantEntities.forEach(function (entityLabel) {
                cy.findByText(entityLabel)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    // Confirm that "None" radio button is selected.
                    cy.get('[data-qa-permission="None"]')
                        .should('have.attr', 'data-qa-radio', 'true')
                        .should('be.visible');
                });
            });
        });
    });
    /**
     * Confirm the User Permissions flow for a child account.
     * Confirm that child accounts default to "Read Only" Billing Access and have disabled "Read Write".
     */
    it('tests the user permissions for a child account', function () {
        var mockProfile = factories_1.profileFactory.build({
            username: 'unrestricted-child-user',
        });
        var mockActiveUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            user_type: 'child',
            username: 'unrestricted-child-user',
        });
        var mockRestrictedUser = __assign(__assign({}, mockActiveUser), { restricted: true, username: 'restricted-child-user' });
        var mockUserGrants = grants_1.grantsFactory.build({
            global: { account_access: 'read_write' },
        });
        (0, account_1.mockGetUsers)([mockActiveUser, mockRestrictedUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockActiveUser);
        (0, account_1.mockGetUserGrants)(mockActiveUser.username, mockUserGrants);
        (0, profile_1.mockGetProfile)(mockProfile);
        cy.visitWithLogin("/account/users/".concat(mockRestrictedUser.username, "/permissions"));
        (0, account_1.mockGetUser)(mockRestrictedUser);
        (0, account_1.mockGetUserGrants)(mockRestrictedUser.username, mockUserGrants);
        cy.get('[data-qa-global-section]')
            .should('be.visible')
            .within(function () {
            // Confirm that 'Read-Write' Billing Access is disabled and 'Read Only' Billing Access is selected by default.
            cy.get("[data-qa-select-card-heading=\"Read-Write\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'disabled');
            assertBillingAccessSelected('Read Only');
            // Switch billing access to "None" and confirm that "Read Only" has been deselected.
            selectBillingAccess('None');
            cy.get("[data-qa-select-card-heading=\"Read Only\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'data-qa-selection-card-checked', 'false');
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
    });
    /**
     * Confirm the User Permissions flow for a child account viewing a proxy user.
     * Confirm that no "Profile" tab is present on the proxy user's User Permissions page.
     * Confirm that proxy accounts default to "Read Write" Billing Access and have disabled "Read Only" and "None" options.
     */
    it('tests the user permissions for a child account viewing a proxy user', function () {
        var mockChildProfile = factories_1.profileFactory.build({
            user_type: 'child',
            username: 'proxy-user',
        });
        var mockChildUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            user_type: 'child',
        });
        var mockRestrictedProxyUser = accountUsers_1.accountUserFactory.build({
            restricted: true,
            user_type: 'proxy',
            username: 'restricted-proxy-user',
        });
        var mockUserGrants = grants_1.grantsFactory.build({
            global: { account_access: 'read_write' },
        });
        (0, account_1.mockGetUsers)([mockRestrictedProxyUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockChildUser);
        (0, account_1.mockGetUserGrants)(mockChildUser.username, mockUserGrants);
        (0, profile_1.mockGetProfile)(mockChildProfile);
        (0, account_1.mockGetUser)(mockRestrictedProxyUser);
        (0, account_1.mockGetUserGrants)(mockRestrictedProxyUser.username, mockUserGrants);
        cy.visitWithLogin("/account/users/".concat(mockRestrictedProxyUser.username, "/permissions"));
        cy.findByText('Parent User Permissions', { exact: false }).should('be.visible');
        // Confirm that no "Profile" tab is present on the proxy user's User Permissions page.
        expect(cy.findByText('User Profile').should('not.exist'));
        cy.get('[data-qa-global-section]')
            .should('be.visible')
            .within(function () {
            // Confirm that 'Read-Write' Billing Access is enabled
            cy.get("[data-qa-select-card-heading=\"Read-Write\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('be.enabled');
            assertBillingAccessSelected('Read-Write');
            // Confirm that 'Read Only' and 'None' Billing Access are disabled
            cy.get("[data-qa-select-card-heading=\"Read Only\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'disabled');
            cy.get("[data-qa-select-card-heading=\"None\"]")
                .closest('[data-qa-selection-card]')
                .should('be.visible')
                .should('have.attr', 'disabled');
        });
    });
});
