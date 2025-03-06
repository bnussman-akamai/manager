"use strict";
/**
 * @file Integration tests for Managed SSH access.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var managed_1 = require("src/factories/managed");
var managed_2 = require("support/api/managed");
var managed_3 = require("support/intercepts/managed");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
// Message that is shown when no Linodes are listed.
var noLinodesMessage = "You don't have any Linodes on your account.";
/**
 * Generates a random SSH public key to use for mocking.
 *
 * @returns Random SSH public key.
 */
var randomPublicSshKey = function () {
    var randomKey = (0, random_1.randomString)(400, {
        uppercase: true,
        lowercase: true,
        numbers: true,
        spaces: false,
        symbols: false,
    });
    return "ssh-rsa e2etestkey".concat(randomKey, " managedservices@linode");
};
describe('Managed SSH Access tab', function () {
    /*
     * - Confirms that Linode public SSH key for Managed account is shown.
     * - Confirms that each managed Linode is listed in the table.
     * - Confirms that a message is shown when there are no managed Linodes.
     */
    it('shows Managed SSH access info and list of Linodes', function () {
        var sshKey = randomPublicSshKey();
        var mockManagedLinodes = managed_1.managedLinodeSettingFactory.buildList(5);
        // Confirm that public SSH key is shown, and managed Linodes are shown.
        (0, managed_3.mockGetSshPublicKey)(sshKey).as('getSshPublicKey');
        (0, managed_3.mockGetLinodeSettings)(mockManagedLinodes).as('getLinodeSettings');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/ssh-access');
        cy.wait(['@getSshPublicKey', '@getLinodeSettings']);
        cy.findByText(sshKey).should('be.visible');
        mockManagedLinodes.forEach(function (mockManagedLinode) {
            cy.findByText(mockManagedLinode.label).should('be.visible');
        });
        // Reset mocks, reload page, confirm that no managed Linodes are shown.
        (0, managed_3.mockGetLinodeSettings)([]).as('getLinodeSettings');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/ssh-access');
        cy.wait(['@getSshPublicKey', '@getLinodeSettings']);
        cy.findByText(noLinodesMessage).should('be.visible');
    });
    /*
     * - Confirm UI flow for updating managed Linode SSH access settings.
     * - Confirm updated SSH access settings are shown in table.
     * - Confirm UI flow for enabling/disabling SSH access via table row button and drawer toggle button.
     */
    it('can update managed Linode SSH access', function () {
        var linodeLabel = (0, random_1.randomLabel)();
        var linodeId = 1;
        var newPort = (0, random_1.randomNumber)(65535);
        var newUser = (0, random_1.randomString)(8);
        // Mock Linode settings to use before updating settings.
        var originalLinodeSettings = managed_1.managedLinodeSettingFactory.build({
            id: 1,
            label: linodeLabel,
            ssh: managed_1.managedSSHSettingFactory.build({
                ip: (0, random_1.randomIp)(),
            }),
        });
        // Mock Linode settings to reflect updated settings.
        var newLinodeSettings = __assign(__assign({}, originalLinodeSettings), { ssh: __assign(__assign({}, originalLinodeSettings.ssh), { user: newUser, port: newPort, ip: 'any' }) });
        // Mock Linode settings to reflect updated settings with disabled access.
        var newLinodeDisabledSettings = __assign(__assign({}, newLinodeSettings), { ssh: __assign(__assign({}, newLinodeSettings.ssh), { access: false }) });
        (0, managed_3.mockGetSshPublicKey)(randomPublicSshKey()).as('getSshPublicKey');
        (0, managed_3.mockGetLinodeSettings)([originalLinodeSettings]).as('getLinodeSettings');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/ssh-access');
        cy.wait(['@getSshPublicKey', '@getLinodeSettings']);
        cy.findByText(linodeLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Edit')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Fill out and submit SSH access edit form.
        (0, managed_3.mockUpdateLinodeSettings)(linodeId, newLinodeSettings).as('updateLinodeSettings');
        ui_1.ui.drawer
            .findByTitle("Edit SSH Access for ".concat(linodeLabel))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('User Account').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newUser);
            // Set IP address to 'Any'.
            cy.findByLabelText('IP Address').should('be.visible').click();
            cy.focused().type('Any{enter}');
            cy.findByLabelText('Port').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type("".concat(newPort));
            ui_1.ui.button
                .findByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that updated Linode SSH access settings are shown in the table,
        // then click "Disable".
        cy.wait('@updateLinodeSettings');
        (0, managed_3.mockUpdateLinodeSettings)(linodeId, newLinodeDisabledSettings).as('updateLinodeSettings');
        cy.findByText(linodeLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(newUser).should('be.visible');
            cy.findByText(newPort).should('be.visible');
            cy.findByText('Any').should('be.visible');
            ui_1.ui.button
                .findByTitle('Disable')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that Linode SSH access is disabled, then click "Edit".
        cy.wait('@updateLinodeSettings');
        ui_1.ui.toast.assertMessage('SSH Access disabled successfully.');
        cy.findByText(linodeLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Disabled').should('be.visible');
            ui_1.ui.button
                .findByTitle('Edit')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Use toggle button to enable SSH access, then click "Save Changes".
        (0, managed_3.mockUpdateLinodeSettings)(linodeId, newLinodeSettings).as('updateLinodeSettings');
        ui_1.ui.drawer
            .findByTitle("Edit SSH Access for ".concat(linodeLabel))
            .should('be.visible')
            .within(function () {
            cy.findByText('Access disabled').should('be.visible').click();
            ui_1.ui.button
                .findByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that Linode SSH access is re-enabled.
        // No toast notification is shown when enabling/disabling via drawer.
        cy.wait('@updateLinodeSettings');
        cy.findByText(linodeLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Enabled').should('be.visible');
        });
    });
});
