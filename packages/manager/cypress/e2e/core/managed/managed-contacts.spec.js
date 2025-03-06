"use strict";
/**
 * @file Integration tests for Managed contacts.
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
// Message that's shown when there are no Managed contacts.
var noContactsMessage = "You don't have any Contacts on your account.";
describe('Managed Contacts tab', function () {
    /**
     * - Confirms that Managed contacts are listed in the table.
     * - Confirms that a message is shown when there are no contacts.
     */
    it('shows a list of Managed contacts', function () {
        var contactIds = [1, 2, 3, 4, 5];
        var contacts = contactIds.map(function (id) {
            return managed_1.contactFactory.build({
                name: "Managed Contact ".concat(id),
                email: "contact-email-".concat(id, "@example.com"),
                id: id,
            });
        });
        (0, managed_3.mockGetContacts)(contacts).as('getContacts');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/contacts');
        cy.wait('@getContacts');
        // Confirm that each contact name and email is listed.
        contactIds.forEach(function (id) {
            cy.findByText("Managed Contact ".concat(id)).should('be.visible');
            cy.findByText("contact-email-".concat(id, "@example.com")).should('be.visible');
        });
        // Reset mocks and reload page.
        // Confirm that a message is shown when there are no Managed contacts.
        (0, managed_3.mockGetContacts)([]).as('getContacts');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/contacts');
        cy.wait('@getContacts');
        cy.findByText(noContactsMessage).should('be.visible');
    });
    /*
     * - Confirms UI flow for adding a Managed contact.
     * - Confirms that new contact is listed in the table.
     */
    it('can add Managed contacts', function () {
        var contactId = 1;
        var contactName = (0, random_1.randomString)(12);
        var contactPrimaryPhone = (0, random_1.randomPhoneNumber)();
        var contactEmail = "".concat(contactName, "@example.com");
        var contact = managed_1.contactFactory.build({
            id: contactId,
            name: contactName,
            email: contactEmail,
            phone: {
                primary: contactPrimaryPhone,
                secondary: null,
            },
        });
        (0, managed_3.mockGetContacts)([]).as('getContacts');
        (0, managed_3.mockCreateContact)(contact).as('createContact');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/contacts');
        cy.wait('@getContacts');
        ui_1.ui.button
            .findByTitle('Add Contact')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out and submit Add Contact form.
        ui_1.ui.drawer
            .findByTitle('Add Contact')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Name', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().type(contactName);
            cy.findByLabelText('E-mail', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().type(contactEmail);
            cy.findByLabelText('Primary Phone').should('be.visible').click();
            cy.focused().type(contactPrimaryPhone);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Add Contact')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that new contact is listed in the table.
        cy.wait('@createContact');
        cy.findByText(contactName)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(contactEmail).should('be.visible');
            cy.findByText(contactPrimaryPhone).should('be.visible');
        });
    });
    /*
     * - Confirms UI flow for updating a Managed contact.
     * - Confirms that contact info is updated in table.
     */
    it('can update Managed contacts', function () {
        var contactId = 1;
        var contactOldName = (0, random_1.randomString)();
        var contactOldEmail = "".concat(contactOldName, "@example.com");
        var contactOldPrimaryPhone = (0, random_1.randomPhoneNumber)();
        var contactNewName = (0, random_1.randomString)();
        var contactNewEmail = "".concat(contactNewName, "@example.com");
        var contactNewPrimaryPhone = (0, random_1.randomPhoneNumber)();
        var contact = managed_1.contactFactory.build({
            id: contactId,
            name: contactOldName,
            email: contactOldEmail,
            phone: {
                primary: contactOldPrimaryPhone,
            },
        });
        var updatedContact = __assign(__assign({}, contact), { name: contactNewName, email: contactNewEmail, phone: __assign(__assign({}, contact.phone), { primary: contactNewPrimaryPhone }) });
        (0, managed_3.mockGetContacts)([contact]).as('getContacts');
        (0, managed_3.mockUpdateContact)(contactId, updatedContact).as('updateContact');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/contacts');
        cy.wait('@getContacts');
        // Find contact and click "Edit".
        cy.findByText(contactOldName)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Edit')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Fill out and submit "Edit Contact" form.
        ui_1.ui.drawer
            .findByTitle('Edit Contact')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Name', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().clear();
            cy.focused().type(contactNewName);
            cy.findByLabelText('E-mail', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().clear();
            cy.focused().type(contactNewEmail);
            cy.findByLabelText('Primary Phone').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(contactNewPrimaryPhone);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that contact information is updated in table.
        cy.wait('@updateContact');
        cy.findByText(contactNewName)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(contactNewEmail).should('be.visible');
            cy.findByText(contactNewPrimaryPhone).should('be.visible');
        });
    });
    /*
     * - Confirms UI flow for deleting a Managed contact.
     * - Confirms that contact is removed from the table upon deletion.
     */
    it('can delete Managed contacts', function () {
        var contactId = 1;
        var contactName = (0, random_1.randomString)();
        var contact = managed_1.contactFactory.build({
            id: contactId,
            name: contactName,
        });
        (0, managed_3.mockGetContacts)([contact]).as('getContacts');
        (0, managed_3.mockDeleteContact)(contactId).as('deleteContact');
        (0, managed_2.visitUrlWithManagedEnabled)('/managed/contacts');
        cy.wait('@getContacts');
        // Find contact and click "Delete".
        cy.findByText(contactName)
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
            .findByTitle("Delete Contact ".concat(contactName, "?"))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Contact Name:').should('be.visible').click();
            cy.focused().type(contactName);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete Contact')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that toast notification is shown, and contact is removed from table.
        cy.wait('@deleteContact');
        ui_1.ui.toast.assertMessage('Contact deleted successfully.');
        cy.findByText(noContactsMessage).should('be.visible');
    });
});
