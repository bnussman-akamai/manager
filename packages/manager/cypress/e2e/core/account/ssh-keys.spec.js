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
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/constants/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
describe('SSH keys', function () {
    /*
     * - Vaildates SSH key creation flow using mock data.
     * - Confirms that the drawer opens when clicking.
     * - Confirms that a form validation error appears when the label or public key is not present.
     * - Confirms UI flow when user enters incorrect public key.
     * - Confirms UI flow when user clicks "Cancel".
     * - Confirms UI flow when user creates a new SSH key.
     */
    it('adds an SSH key via Profile page as expected', function () {
        var randomKey = (0, random_1.randomString)(400, {
            lowercase: true,
            numbers: true,
            spaces: false,
            symbols: false,
            uppercase: true,
        });
        var mockSSHKey = factories_1.sshKeyFactory.build({
            label: (0, random_1.randomLabel)(),
            ssh_key: "ssh-rsa e2etestkey".concat(randomKey, " e2etest@linode"),
        });
        (0, profile_1.mockGetSSHKeys)([]).as('getSSHKeys');
        // Navigate to SSH key landing page, click the "Add an SSH Key" button.
        cy.visitWithLogin('/profile/keys');
        cy.wait('@getSSHKeys');
        // When a user clicks "Add an SSH Key" button on SSH key landing page (/profile/keys), the "Add an SSH Key" drawer opens
        ui_1.ui.button
            .findByTitle('Add an SSH Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Add SSH Key')
            .should('be.visible')
            .within(function () {
            // When a user tries to create an SSH key without a label, a form validation error appears
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Label is required.');
            // When a user tries to create an SSH key without the SSH Public Key, a form validation error appears
            cy.get('[id="label"]').clear();
            cy.focused().type(mockSSHKey.label);
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findAllByText(account_1.sshFormatErrorMessage).should('be.visible');
            // An alert displays when the format of SSH key is incorrect
            cy.get('[id="ssh-public-key"]').clear();
            cy.focused().type('WrongFormatSshKey');
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findAllByText(account_1.sshFormatErrorMessage).should('be.visible');
            cy.get('[id="ssh-public-key"]').clear();
            cy.focused().type(mockSSHKey.ssh_key);
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // No new key is added when cancelling.
        cy.findAllByText(mockSSHKey.label).should('not.exist');
        (0, profile_1.mockGetSSHKeys)([mockSSHKey]).as('getSSHKeys');
        (0, profile_1.mockCreateSSHKey)(mockSSHKey).as('createSSHKey');
        ui_1.ui.button
            .findByTitle('Add an SSH Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Add SSH Key')
            .should('be.visible')
            .within(function () {
            // When a user clicks "Cancel" or the drawer's close button, and then clicks "Add an SSH Key" again, the content they previously entered into the form is erased
            cy.get('[id="label"]').should('be.empty');
            cy.get('[id="ssh-public-key"]').should('be.empty');
            // Create a new ssh key
            cy.get('[id="label"]').clear();
            cy.focused().type(mockSSHKey.label);
            cy.get('[id="ssh-public-key"]').clear();
            cy.focused().type(mockSSHKey.ssh_key);
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@getSSHKeys');
        // When a user creates an SSH key, a toast notification appears that says "Successfully created SSH key."
        ui_1.ui.toast.assertMessage('Successfully created SSH key.');
        // When a user creates an SSH key, the list of SSH keys for each user updates to show the new key for the signed in user
        cy.findAllByText(mockSSHKey.label).should('be.visible');
    });
    /*
     * - Vaildates SSH key creation error flow using mock data.
     * - Confirms that a useful error message is displayed on the form when receiving an API response error.
     */
    it('shows an error message when fail to add an SSH key', function () {
        var errorMessage = 'failed to add an SSH key.';
        var sshKeyLabel = (0, random_1.randomLabel)();
        var randomKey = (0, random_1.randomString)(400, {
            lowercase: true,
            numbers: true,
            spaces: false,
            symbols: false,
            uppercase: true,
        });
        var sshPublicKey = "ssh-rsa e2etestkey".concat(randomKey, " e2etest@linode");
        (0, profile_1.mockCreateSSHKeyError)(errorMessage).as('createSSHKeyError');
        (0, profile_1.mockGetSSHKeys)([]).as('getSSHKeys');
        // Navigate to SSH key landing page, click the "Add an SSH Key" button.
        cy.visitWithLogin('/profile/keys');
        cy.wait('@getSSHKeys');
        // When a user clicks "Add an SSH Key" button on SSH key landing page (/profile/keys), the "Add an SSH Key" drawer opens
        ui_1.ui.button
            .findByTitle('Add an SSH Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Add SSH Key')
            .should('be.visible')
            .within(function () {
            // When a user clicks "Cancel" or the drawer's close button, and then clicks "Add an SSH Key" again, the content they previously entered into the form is erased
            cy.get('[id="label"]').should('be.empty');
            cy.get('[id="ssh-public-key"]').should('be.empty');
            // Create a new ssh key
            cy.get('[id="label"]').clear();
            cy.focused().type(sshKeyLabel);
            cy.get('[id="ssh-public-key"]').clear();
            cy.focused().type(sshPublicKey);
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@createSSHKeyError');
        // When the API responds with an error (e.g. a 400 response), the API response error message is displayed on the form
        cy.findByText(errorMessage);
    });
    /*
     * - Validates SSH key update flow using mock data.
     * - Confirms that the drawer opens when clicking.
     * - Confirms that a form validation error appears when the label is not present.
     * - Confirms UI flow when user updates an SSH key.
     */
    it('updates an SSH key via Profile page as expected', function () {
        var randomKey = (0, random_1.randomString)(400, {
            lowercase: true,
            numbers: true,
            spaces: false,
            symbols: false,
            uppercase: true,
        });
        var mockSSHKey = factories_1.sshKeyFactory.build({
            label: (0, random_1.randomLabel)(),
            ssh_key: "ssh-rsa e2etestkey".concat(randomKey, " e2etest@linode"),
        });
        var newSSHKeyLabel = (0, random_1.randomLabel)();
        var modifiedSSHKey = factories_1.sshKeyFactory.build(__assign(__assign({}, mockSSHKey), { label: newSSHKeyLabel }));
        (0, profile_1.mockGetSSHKeys)([mockSSHKey]).as('getSSHKeys');
        // Navigate to SSH key landing page.
        cy.visitWithLogin('/profile/keys');
        cy.wait('@getSSHKeys');
        // When a user clicks "Edit" button on SSH key landing page (/profile/keys), the "Edit SSH Key" drawer opens
        ui_1.ui.button
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle("Edit SSH Key ".concat(mockSSHKey.label))
            .should('be.visible')
            .within(function () {
            // When the label is unchanged, the 'Save' button is diabled
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.disabled');
            // When a user tries to update an SSH key without a label, a form validation error appears
            cy.get('[id="label"]').clear();
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Label is required.');
            // SSH label is not modified when the operation is cancelled
            cy.get('[id="label"]').clear();
            cy.focused().type(newSSHKeyLabel);
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findAllByText(mockSSHKey.label).should('be.visible');
        (0, profile_1.mockGetSSHKeys)([modifiedSSHKey]).as('getSSHKeys');
        (0, profile_1.mockUpdateSSHKey)(mockSSHKey.id, modifiedSSHKey).as('updateSSHKey');
        ui_1.ui.button
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle("Edit SSH Key ".concat(mockSSHKey.label))
            .should('be.visible')
            .within(function () {
            // Update a new ssh key
            cy.get('[id="label"]').clear();
            cy.focused().type(newSSHKeyLabel);
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@updateSSHKey', '@getSSHKeys']);
        // When a user updates an SSH key, a toast notification appears that says "Successfully updated SSH key."
        ui_1.ui.toast.assertMessage('Successfully updated SSH key.');
        // When a user updates an SSH key, the list of SSH keys for each user updates to show the new key for the signed in user
        cy.findAllByText(modifiedSSHKey.label).should('be.visible');
    });
    /*
     * - Vaildates SSH key delete flow using mock data.
     * - Confirms that the dialog opens when clicking.
     * - Confirms UI flow when user deletes an SSH key.
     */
    it('deletes an SSH key via Profile page as expected', function () {
        var mockSSHKeys = factories_1.sshKeyFactory.buildList(2);
        (0, profile_1.mockGetSSHKeys)(mockSSHKeys).as('getSSHKeys');
        // Navigate to SSH key landing page.
        cy.visitWithLogin('/profile/keys');
        cy.wait('@getSSHKeys');
        (0, profile_1.mockDeleteSSHKey)(mockSSHKeys[0].id).as('deleteSSHKey');
        (0, profile_1.mockGetSSHKeys)([mockSSHKeys[1]]).as('getUpdatedSSHKeys');
        // When a user clicks "Delete" button on SSH key landing page (/profile/keys), the "Delete SSH Key" dialog opens
        cy.findAllByText("".concat(mockSSHKeys[0].label))
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.dialog
            .findByTitle('Delete SSH Key')
            .should('be.visible')
            .within(function () {
            cy.findAllByText("Are you sure you want to delete SSH key ".concat(mockSSHKeys[0].label, "?")).should('be.visible');
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@deleteSSHKey', '@getUpdatedSSHKeys']);
        // When a user deletes an SSH key, the SSH key is removed from the list
        cy.findAllByText(mockSSHKeys[0].label).should('not.exist');
        (0, profile_1.mockDeleteSSHKey)(mockSSHKeys[1].id).as('deleteSSHKey');
        (0, profile_1.mockGetSSHKeys)([]).as('getUpdatedSSHKeys');
        // When a user clicks "Delete" button on SSH key landing page (/profile/keys), the "Delete SSH Key" dialog opens
        cy.findAllByText("".concat(mockSSHKeys[1].label))
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.dialog
            .findByTitle('Delete SSH Key')
            .should('be.visible')
            .within(function () {
            cy.findAllByText("Are you sure you want to delete SSH key ".concat(mockSSHKeys[1].label, "?")).should('be.visible');
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@deleteSSHKey', '@getUpdatedSSHKeys']);
        // When a user deletes the last SSH key, the list of SSH keys updates to show "No items to display."
        cy.findAllByText(mockSSHKeys[1].label).should('not.exist');
        cy.findAllByText('No items to display.').should('be.visible');
    });
});
