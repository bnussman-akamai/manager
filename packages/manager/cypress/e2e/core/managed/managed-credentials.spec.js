"use strict";
/**
 * @file Integration tests for Managed credentials.
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
// Message that's shown when there are no Managed credentials.
var noCredentialsMessage = "You don't have any Credentials on your account.";
describe('Managed Credentials tab', function () {
    /*
     * - Confirms that Managed credentials are listed in the table.
     * - Confirms that a message is shown when there are no credentials.
     */
    it('shows a list of Managed credentials', function () {
        var credentialIds = [1, 2, 3, 4, 5];
        var credentials = credentialIds.map(function (id) {
            return managed_1.credentialFactory.build({
                id: id,
                label: "Credentials ".concat(id),
            });
        });
        (0, managed_3.mockGetCredentials)(credentials).as('getCredentials');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/credentials');
        cy.wait('@getCredentials');
        // Confirm that each credential is listed.
        credentialIds.forEach(function (id) {
            cy.findByText("Credentials ".concat(id)).should('be.visible');
        });
        // Reset mocks and reload page, then confirm that no credentials are listed.
        (0, managed_3.mockGetCredentials)([]).as('getCredentials');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/credentials');
        cy.wait('@getCredentials');
        cy.findByText(noCredentialsMessage).should('be.visible');
    });
    /*
     * - Confirms UI flow for adding a Managed credential.
     * - Confirms that new credential is listed in the table.
     */
    it('can add Managed credentials', function () {
        var credentialLabel = (0, random_1.randomString)(10);
        var credentialUsername = (0, random_1.randomString)(10);
        var credentialPassword = (0, random_1.randomString)(32);
        var credential = managed_1.credentialFactory.build({
            label: credentialLabel,
        });
        (0, managed_3.mockGetCredentials)([]).as('getCredentials');
        (0, managed_3.mockCreateCredential)(credential).as('createCredential');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/credentials');
        cy.wait('@getCredentials');
        ui_1.ui.button
            .findByTitle('Add Credential')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out Add Credential form and click 'Add Credential'.
        ui_1.ui.drawer
            .findByTitle('Add Credential')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label').should('be.visible').click();
            cy.focused().type(credentialLabel);
            cy.findByLabelText('Username', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().type(credentialUsername);
            cy.findByLabelText('Password').should('be.visible').click();
            cy.focused().type(credentialPassword);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add Credential')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that new credential is listed in the table.
        cy.wait('@createCredential');
        cy.findByText(credentialLabel).should('be.visible');
    });
    /*
     * - Confirms UI flow for updating a Managed credential.
     * - Confirms that credential info is updated in table.
     */
    it('can update Managed credentials', function () {
        var credentialId = 1;
        var credentialOldLabel = (0, random_1.randomLabel)();
        var credentialNewLabel = (0, random_1.randomLabel)();
        var credential = managed_1.credentialFactory.build({
            id: credentialId,
            label: credentialOldLabel,
        });
        var updatedCredential = __assign(__assign({}, credential), { label: credentialNewLabel });
        (0, managed_3.mockGetCredentials)([credential]).as('getCredentials');
        (0, managed_3.mockUpdateCredential)(credentialId, updatedCredential).as('updateCredential');
        (0, managed_3.mockUpdateCredentialUsernamePassword)(credentialId).as('updateCredentialUsernamePassword');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/credentials');
        cy.wait('@getCredentials');
        // Find credential and click "Edit".
        cy.findByText(credentialOldLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Edit')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Fill out forms to update credential label, and username/password pair.
        ui_1.ui.drawer
            .findByTitle("Edit Credential: ".concat(credentialOldLabel))
            .should('be.visible')
            .within(function () {
            // Update label.
            cy.findByLabelText('Label').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(credentialNewLabel);
            ui_1.ui.button
                .findByTitle('Update label')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@updateCredential');
            cy.findByText('Label updated successfully.').should('be.visible');
            // Update credentials.
            cy.findByLabelText('Username', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().type((0, random_1.randomString)());
            cy.findByLabelText('Password').should('be.visible').click();
            cy.focused().type((0, random_1.randomString)());
            ui_1.ui.button
                .findByTitle('Update credentials')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@updateCredentialUsernamePassword');
            cy.findByText('Updated successfully.').should('be.visible');
            // Close drawer.
            ui_1.ui.drawerCloseButton
                .find()
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that updated credential label is listed in table.
        cy.findByText(credentialNewLabel).should('be.visible');
    });
    /*
     * - Confirms UI flow for deleting a Managed credential.
     * - Confirms that credential is removed from table upon deletion.
     */
    it('can delete Managed credentials', function () {
        var credentialLabel = (0, random_1.randomLabel)();
        var credentialId = 1;
        var credential = managed_1.credentialFactory.build({
            id: credentialId,
            label: credentialLabel,
        });
        (0, managed_3.mockGetCredentials)([credential]).as('getCredentials');
        (0, managed_3.mockDeleteCredential)(credentialId).as('deleteCredential');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/credentials');
        cy.wait('@getCredentials');
        // Find mocked credential and click "Delete" button.
        cy.findByText(credentialLabel)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Fill out and submit type-to-confirm.
        ui_1.ui.dialog
            .findByTitle("Delete Credential ".concat(credentialLabel, "?"))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Credential Name:').should('be.visible').click();
            cy.focused().type(credentialLabel);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete Credential')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that toast notification is shown and credential is no longer listed.
        cy.wait('@deleteCredential');
        ui_1.ui.toast.assertMessage('Credential deleted successfully.');
        cy.findByText(noCredentialsMessage).should('be.visible');
    });
});
