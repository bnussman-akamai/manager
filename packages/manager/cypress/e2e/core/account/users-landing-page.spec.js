"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var accountUsers_1 = require("@src/factories/accountUsers");
var grants_1 = require("@src/factories/grants");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var constants_1 = require("src/features/Account/constants");
/**
 * Initialize test users before tests
 *
 * @param mockProfile - Account profile.
 * @param enableChildAccountAccess - Child account access switch.
 *
 * @returns User array.
 */
var initTestUsers = function (profile, enableChildAccountAccess) {
    var mockProfile = profile;
    var mockRestrictedParentWithoutChildAccountAccess = accountUsers_1.accountUserFactory.build({
        restricted: true,
        user_type: 'parent',
        username: 'restricted-parent-user-without-child-account-access',
    });
    var mockRestrictedParentWithChildAccountAccess = accountUsers_1.accountUserFactory.build({
        restricted: true,
        user_type: 'parent',
        username: 'restricted-parent-user-with-child-account-access',
    });
    var mockUsers = [
        mockRestrictedParentWithoutChildAccountAccess,
        mockRestrictedParentWithChildAccountAccess,
    ];
    var mockParentNoAccountAccessGrants = grants_1.grantsFactory.build({
        global: { child_account_access: false },
    });
    var mockParentWithAccountAccessGrants = grants_1.grantsFactory.build({
        global: { child_account_access: true },
    });
    var mockProfileGrants = grants_1.grantsFactory.build({
        global: { child_account_access: enableChildAccountAccess },
    });
    // Initially mock user with unrestricted account access.
    (0, account_1.mockGetUsers)(mockUsers).as('getUsers');
    (0, account_1.mockGetUser)(mockRestrictedParentWithoutChildAccountAccess);
    (0, account_1.mockGetUserGrants)(mockRestrictedParentWithoutChildAccountAccess.username, mockParentNoAccountAccessGrants);
    (0, account_1.mockGetUser)(mockRestrictedParentWithChildAccountAccess);
    (0, account_1.mockGetUserGrants)(mockRestrictedParentWithChildAccountAccess.username, mockParentWithAccountAccessGrants);
    (0, profile_1.mockGetProfileGrants)(mockProfileGrants);
    (0, profile_1.mockGetProfile)(mockProfile);
    return mockUsers;
};
describe('Users landing page', function () {
    /*
     * Confirm the visibility and status of the "Child account access" column for the following users:
     *   - Unrestricted parent user (Enabled)
     *   - Restricted parent user with child_account_access grant set to false (Disabled)
     *   - Restricted parent user with child_account_access grant set to true (Enabled)
     * Confirm that a "Child account access" column is present in the users table for parent users, but not for other types (default, proxy, and child))
     * Confirm the column reflects the status of child account access for the corresponding users
     */
    it('shows "Child account access" column for unrestricted parent users and shows restricted parent users who have the correct grant status', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            user_type: 'parent',
            username: 'unrestricted-parent-user',
        });
        var mockUsers = initTestUsers(mockProfile, true);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        // Confirm that "Child account access" column is present
        cy.findByText('Child Account Access').should('be.visible');
        mockUsers.forEach(function (user) {
            cy.get("[data-qa-table-row=\"".concat(user.username, "\"]"))
                .should('be.visible')
                .within(function () {
                if (user.username ===
                    'restricted-parent-user-without-child-account-access') {
                    // The status should be "Disabled" for the user without "child_account_access" grant
                    cy.findByText('Disabled').should('be.visible');
                }
                else {
                    // The status should be "Enabled" for the user without "child_account_access" grant
                    cy.findByText('Enabled').should('be.visible');
                }
            });
        });
    });
    it('shows "Child account access" column for restricted parent users with child_account_access grant set to true', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: true,
            user_type: 'parent',
            username: 'restricted-parent-user',
        });
        initTestUsers(mockProfile, true);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        // Confirm that "Child account access" column is present
        cy.findByText('Child Account Access').should('be.visible');
    });
    it('hides "Child account access" column for restricted parent users with child_account_access grant set to false', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: true,
            user_type: 'parent',
            username: 'restricted-parent-user',
        });
        initTestUsers(mockProfile, false);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        // Confirm that "Child account access" column is not present
        cy.findByText('Child Account Access').should('not.exist');
    });
    it('hides "Child account access" column for default users', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            username: 'default-user',
        });
        initTestUsers(mockProfile, false);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        // Confirm that "Child account access" column is not present
        cy.findByText('Child Account Access').should('not.exist');
    });
    it('hides "Child account access" column for proxy users', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            user_type: 'proxy',
            username: 'proxy-user',
        });
        initTestUsers(mockProfile, false);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        // Confirm that "Child account access" column is not present
        cy.findByText('Child Account Access').should('not.exist');
    });
    it('hides "Child account access" column for child users', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            user_type: 'child',
            username: 'child-user',
        });
        initTestUsers(mockProfile, false);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        // Confirm that "Child account access" column is not present
        cy.findByText('Child Account Access').should('not.exist');
    });
    /*
     * Confirm that "Parent User Settings" section is not present for parent users
     */
    it('hides "Parent User Settings" section for parent users', function () {
        var mockProfile = factories_1.profileFactory.build({
            restricted: false,
            user_type: 'parent',
            username: 'unrestricted-parent-user',
        });
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            username: 'unrestricted-user',
        });
        // Initially mock user with unrestricted account access.
        (0, account_1.mockGetUsers)([mockUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockUser);
        (0, account_1.mockGetUserGrantsUnrestrictedAccess)(mockUser.username).as('getUserGrants');
        (0, profile_1.mockGetProfile)(mockProfile);
        // Navigate to Users & Grants page.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        // Confirm the "Parent User Settings" and "User Settings" sections are not present.
        cy.findByText("".concat(constants_1.PARENT_USER, " Settings")).should('not.exist');
        cy.findByText('User Settings').should('not.exist');
    });
    /**
     * Confirm the Users & Grants and User Permissions pages flow for a child account viewing a proxy user.
     * Confirm that "Parent User Settings" and "User Settings" sections are present on the Users & Grants page.
     * Confirm that proxy accounts are listed under "Parent User Settings".
     * Confirm that clicking the "Manage Access" button navigates to the proxy user's User Permissions page at /account/users/:user/permissions.
     */
    it('tests the users landing flow for a child account viewing a proxy user', function () {
        var mockChildProfile = factories_1.profileFactory.build({
            user_type: 'child',
            username: 'child-user',
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
        // Navigate to Users & Grants page and confirm "Parent User Settings" and "User Settings" sections are visible.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        cy.findByText("".concat(constants_1.PARENT_USER, " Settings")).should('be.visible');
        cy.findByText('User Settings').should('be.visible');
        // Find mock restricted proxy user under "Parent User Settings", click its "Manage Access" button.
        cy.findByLabelText('List of Parent Users')
            .should('be.visible')
            .within(function () {
            cy.findByText(mockRestrictedProxyUser.username)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Manage Access')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
        });
        // Confirm button navigates to the proxy user's User Permissions page at /account/users/:user/permissions.
        cy.url().should('endWith', "/account/users/".concat(mockRestrictedProxyUser.username, "/permissions"));
    });
    it('can add users with full access', function () {
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            username: (0, random_1.randomLabel)(),
        });
        var username = (0, random_1.randomLabel)();
        var newUser = accountUsers_1.accountUserFactory.build({
            email: "".concat(username, "@test.com"),
            restricted: false,
            username: username,
        });
        (0, account_1.mockGetUsers)([mockUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockUser);
        (0, account_1.mockGetUserGrantsUnrestrictedAccess)(mockUser.username);
        (0, account_1.mockAddUser)(newUser).as('addUser');
        // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        // Confirm that the "Users & Grants" page initially lists the main user
        cy.findByText(mockUser.username).should('be.visible');
        (0, account_1.mockGetUsers)([mockUser, newUser]).as('getUsers');
        // "Add a User" button shows up and is clickable
        cy.findByText('Add a User')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // "Add a User" drawer shows up
        ui_1.ui.drawer
            .findByTitle('Add a User')
            .should('be.visible')
            .within(function () {
            cy.findByText('Username').click();
            cy.focused().type("".concat(newUser.username, "{enter}"));
            cy.findByText('Email').click();
            cy.focused().type("".concat(newUser.username, "@test.com{enter}"));
            ui_1.ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // the drawer has been closed
        cy.findByText('Add a User').should('not.exist');
        // cancel button will not add a new user
        cy.findByText(newUser.username).should('not.exist');
        cy.findByText('Add a User')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // "x" button will not add a new user
        ui_1.ui.drawer
            .findByTitle('Add a User')
            .should('be.visible')
            .within(function () {
            cy.findByText('Username').click();
            cy.focused().type("".concat(newUser.username, "{enter}"));
            cy.findByText('Email').click();
            cy.focused().type("".concat(newUser.username, "@test.com{enter}"));
            ui_1.ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // the drawer has been closed
        cy.findByText('Add a User').should('not.exist');
        // no new user is added
        cy.findByText(newUser.username).should('not.exist');
        // new user should be added and shown in the user list
        cy.findByText('Add a User')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // confirm to add a new user
        ui_1.ui.drawer
            .findByTitle('Add a User')
            .should('be.visible')
            .within(function () {
            // an inline error message will be displayed when username or email is not specified
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add User')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Username is required.').should('be.visible');
            cy.findByText('Email address is required.').should('be.visible');
            // type username
            cy.findByText('Username').click();
            cy.focused().type("".concat(newUser.username, "{enter}"));
            // an inline error message will be displayed when the email address is invalid
            cy.findByText('Email').click();
            cy.focused().type("not_valid_email_address{enter}");
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add User')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Must be a valid Email address.').should('be.visible');
            // type email address
            cy.get('[id="email"]').click();
            cy.focused().clear();
            cy.focused().type("".concat(newUser.username, "@test.com{enter}"));
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add User')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Cloud Manager passes "restricted: false" in the request payload
        cy.wait('@addUser').then(function (intercept) {
            expect(intercept.request.body['restricted']).to.equal(newUser.restricted);
        });
        cy.wait('@getUsers');
        // the new user is displayed in the user list
        cy.findByText(newUser.username).should('be.visible');
        // no redirect occurs
        cy.url().should('endWith', '/users');
    });
    it('can add users with restricted access', function () {
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            username: (0, random_1.randomLabel)(),
        });
        var username = (0, random_1.randomLabel)();
        var newUser = accountUsers_1.accountUserFactory.build({
            email: "".concat(username, "@test.com"),
            restricted: true,
            username: username,
        });
        (0, account_1.mockGetUsers)([mockUser]).as('getUsers');
        (0, account_1.mockGetUserGrantsUnrestrictedAccess)(mockUser.username);
        (0, account_1.mockAddUser)(newUser).as('addUser');
        // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        // Confirm that the "Users & Grants" page initially lists the main user
        cy.findByText(mockUser.username).should('be.visible');
        (0, account_1.mockGetUsers)([mockUser, newUser]).as('getUsers');
        // "Add a User" button shows up and is clickable
        cy.findByText('Add a User')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // "Add a User" drawer shows up
        ui_1.ui.drawer
            .findByTitle('Add a User')
            .should('be.visible')
            .within(function () {
            cy.findByText('Username').click();
            cy.focused().type("".concat(newUser.username, "{enter}"));
            cy.findByText('Email').click();
            cy.focused().type("".concat(newUser.username, "@test.com{enter}"));
            ui_1.ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // "x" or cancel button will not add a new user
        cy.findByText(newUser.username).should('not.exist');
        // new user should be added and shown in the user list
        cy.findByText('Add a User')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, account_1.mockGetUser)(newUser).as('getUser');
        // confirm to add a new user
        ui_1.ui.drawer
            .findByTitle('Add a User')
            .should('be.visible')
            .within(function () {
            // an inline error message will be displayed when username or email is not specified
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add User')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Username is required.').should('be.visible');
            cy.findByText('Email address is required.').should('be.visible');
            // type username
            cy.findByText('Username').click();
            cy.focused().type("".concat(newUser.username, "{enter}"));
            // an inline error message will be displayed when the email address is invalid
            cy.findByText('Email').click();
            cy.focused().type("not_valid_email_address{enter}");
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add User')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Must be a valid Email address.').should('be.visible');
            // type email address
            cy.get('[id="email"]').click();
            cy.focused().clear();
            cy.focused().type("".concat(newUser.username, "@test.com{enter}"));
            // toggle to disable full access
            cy.get('[data-qa-create-restricted="true"]')
                .should('be.visible')
                .click();
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add User')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Cloud Manager passes "restricted: true" in the request payload
        cy.wait('@addUser').then(function (intercept) {
            expect(intercept.request.body['restricted']).to.equal(newUser.restricted);
        });
        cy.wait('@getUser');
        // redirects to the new user's "User Permissions" page
        cy.url().should('endWith', "/users/".concat(newUser.username, "/permissions"));
    });
    it('can delete users', function () {
        var mockUser = accountUsers_1.accountUserFactory.build({
            restricted: false,
            username: (0, random_1.randomLabel)(),
        });
        var username = (0, random_1.randomLabel)();
        var additionalUser = accountUsers_1.accountUserFactory.build({
            email: "".concat(username, "@test.com"),
            restricted: false,
            username: username,
        });
        (0, account_1.mockGetUsers)([mockUser, additionalUser]).as('getUsers');
        (0, account_1.mockGetUser)(mockUser);
        (0, account_1.mockGetUserGrantsUnrestrictedAccess)(mockUser.username);
        (0, account_1.mockGetUserGrantsUnrestrictedAccess)(additionalUser.username);
        (0, account_1.mockDeleteUser)(additionalUser.username).as('deleteUser');
        // Navigate to Users & Grants page, find mock user, click its "User Permissions" button.
        cy.visitWithLogin('/account/users');
        cy.wait('@getUsers');
        (0, account_1.mockGetUsers)([mockUser]).as('getUsers');
        // Confirm that the "Users & Grants" page initially lists the main and additional users
        cy.findByText(mockUser.username).should('be.visible');
        cy.findByText(additionalUser.username)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // the "Confirm Deletion" dialog opens
        ui_1.ui.dialog.findByTitle('Confirm Deletion').within(function () {
            ui_1.ui.button.findByTitle('Cancel').should('be.visible').click();
        });
        // click the "Cancel" button will do nothing
        cy.findByText(mockUser.username).should('be.visible');
        cy.findByText(additionalUser.username).should('be.visible');
        // clicking the "x" button will dismiss the dialog and do nothing
        cy.findByText(additionalUser.username)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.dialog.findByTitle('Confirm Deletion').within(function () {
            cy.get('[data-testid="CloseIcon"]').should('be.visible').click();
        });
        cy.findByText(mockUser.username).should('be.visible');
        cy.findByText(additionalUser.username).should('be.visible');
        // delete the user
        cy.findByText(additionalUser.username)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // the "Confirm Deletion" dialog opens
        ui_1.ui.dialog.findByTitle('Confirm Deletion').within(function () {
            ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
        });
        cy.wait(['@deleteUser', '@getUsers']);
        // the user is deleted
        ui_1.ui.toast.assertMessage("User ".concat(additionalUser.username, " has been deleted successfully."));
        cy.findByText(additionalUser.username).should('not.exist');
    });
});
