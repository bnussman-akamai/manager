"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authentication_1 = require("support/api/authentication");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var linodes_1 = require("support/util/linodes");
var random_1 = require("support/util/random");
(0, authentication_1.authenticate)();
describe('create image (e2e)', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'images']);
    });
    it('create image from a linode', function () {
        cy.tag('method:e2e');
        var label = (0, random_1.randomLabel)();
        var description = (0, random_1.randomPhrase)();
        // When Alpine 3.20 becomes deprecated, we will have to update these values for the test to pass.
        var image = 'linode/alpine3.20';
        var disk = 'Alpine 3.20 Disk';
        cy.defer(function () { return (0, linodes_1.createTestLinode)({ image: image }, { waitForDisks: true }); }, 'create linode').then(function (linode) {
            cy.visitWithLogin('/images/create');
            // Find the Linode select and open it
            cy.findByLabelText('Linode')
                .should('be.visible')
                .should('be.enabled')
                .should('have.attr', 'placeholder', 'Select a Linode')
                .click();
            cy.focused().type(linode.label);
            // Select the Linode
            ui_1.ui.autocompletePopper
                .findByTitle(linode.label)
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Find the Disk select and open it
            cy.findByLabelText('Disk')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Select the Linode disk
            ui_1.ui.autocompletePopper.findByTitle(disk).should('be.visible').click();
            // Give the Image a label
            cy.findByLabelText('Label')
                .should('be.enabled')
                .should('be.visible')
                .clear();
            cy.focused().type(label);
            // Give the Image a description
            cy.findByLabelText('Description')
                .should('be.enabled')
                .should('be.visible')
                .type(description);
            // Submit the image create form
            ui_1.ui.button
                .findByTitle('Create Image')
                .should('be.enabled')
                .should('have.attr', 'type', 'submit')
                .click();
            ui_1.ui.toast.assertMessage('Image scheduled for creation.');
            // Verify we redirect to the images landing page upon successful creation
            cy.url().should('endWith', 'images');
            // Verify the newly created image shows on the Images landing page
            cy.findByText(label)
                .closest('tr')
                .within(function () {
                // Verify Image label shows
                cy.findByText(label).should('be.visible');
                // Verify Image has status of "Creating"
                cy.findByText('Creating', { exact: false }).should('be.visible');
            });
        });
    });
});
