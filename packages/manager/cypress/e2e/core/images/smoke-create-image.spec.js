"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var disk_1 = require("src/factories/disk");
var images_1 = require("src/factories/images");
var events_1 = require("support/intercepts/events");
var images_2 = require("support/intercepts/images");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var profile_1 = require("support/intercepts/profile");
var account_1 = require("support/intercepts/account");
describe('create image (using mocks)', function () {
    it('create image from a linode', function () {
        var mockDisks = [
            disk_1.linodeDiskFactory.build({ label: 'Debian 12 Disk', filesystem: 'ext4' }),
            disk_1.linodeDiskFactory.build({
                label: '512 MB Swap Image',
                filesystem: 'swap',
            }),
        ];
        var mockLinode = factories_1.linodeFactory.build();
        var mockNewImage = images_1.imageFactory.build({
            id: "private/".concat((0, random_1.randomNumber)(1000, 99999)),
            label: (0, random_1.randomLabel)(),
            description: (0, random_1.randomPhrase)(),
            type: 'manual',
            is_public: false,
            vendor: null,
            expiry: null,
            eol: null,
            status: 'creating',
        });
        (0, linodes_1.mockGetLinodes)([mockLinode]).as('getLinodes');
        (0, linodes_1.mockGetLinodeDisks)(mockLinode.id, mockDisks).as('getDisks');
        cy.visitWithLogin('/images/create');
        // Wait for Linodes to load
        cy.wait('@getLinodes');
        // Find the Linode select and open it
        cy.findByLabelText('Linode')
            .should('be.visible')
            .should('be.enabled')
            .should('have.attr', 'placeholder', 'Select a Linode')
            .click();
        // Select the Linode
        ui_1.ui.autocompletePopper
            .findByTitle(mockLinode.label)
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Verify disks load when a Linode is selected
        cy.wait('@getDisks');
        // Find the Disk select and open it
        cy.findByLabelText('Disk')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Select the Linode disk
        ui_1.ui.autocompletePopper
            .findByTitle(mockDisks[0].label)
            .should('be.visible')
            .click();
        // Give the Image a label
        cy.findByLabelText('Label')
            .should('be.enabled')
            .should('be.visible')
            .clear();
        cy.focused().type(mockNewImage.label);
        // Give the Image a description
        cy.findByLabelText('Description')
            .should('be.enabled')
            .should('be.visible')
            .type(mockNewImage.description);
        // Mock the Image creation POST response
        (0, images_2.mockCreateImage)(mockNewImage).as('createImage');
        // Submit the image create form
        ui_1.ui.button
            .findByTitle('Create Image')
            .should('be.enabled')
            .should('have.attr', 'type', 'submit')
            .click();
        // Verify the POST /v4/images request happens
        cy.wait('@createImage');
        ui_1.ui.toast.assertMessage('Image scheduled for creation.');
        // Verify we redirect to the images landing page upon successful creation
        cy.url().should('endWith', 'images');
        (0, events_1.mockGetEvents)([
            factories_1.eventFactory.build({ action: 'disk_imagize', status: 'finished' }),
        ]).as('getEvents');
        // Wait for the next events polling request
        cy.wait('@getEvents');
        // Verify a success toast shows
        ui_1.ui.toast.assertMessage('Image My Config has been created.');
    });
    it('should not create image for the restricted users', function () {
        // Mock setup for user profile, account user, and user grants with restricted permissions,
        // simulating a default user without the ability to add Linodes.
        var mockProfile = factories_1.profileFactory.build({
            username: (0, random_1.randomLabel)(),
            restricted: true,
        });
        var mockUser = factories_1.accountUserFactory.build({
            username: mockProfile.username,
            restricted: true,
            user_type: 'default',
        });
        var mockGrants = factories_1.grantsFactory.build({
            global: {
                add_images: false,
            },
        });
        var mockDisks = [
            disk_1.linodeDiskFactory.build({ label: 'Debian 12 Disk', filesystem: 'ext4' }),
            disk_1.linodeDiskFactory.build({
                label: '512 MB Swap Image',
                filesystem: 'swap',
            }),
        ];
        var mockLinode = factories_1.linodeFactory.build();
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetProfileGrants)(mockGrants);
        (0, account_1.mockGetUser)(mockUser);
        (0, linodes_1.mockGetLinodes)([mockLinode]).as('getLinodes');
        (0, linodes_1.mockGetLinodeDisks)(mockLinode.id, mockDisks).as('getDisks');
        cy.visitWithLogin('/images/create');
        // Wait for Linodes to load
        cy.wait('@getLinodes');
        // Check the following fields are disable
        // Confirm that a notice should be shown informing the user they do not have permission to create a Linode
        cy.findByText("You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions.").should('be.visible');
        // Confirm that "Linode" field is diabled
        cy.get('[data-qa-autocomplete="Linode"]').within(function () {
            cy.get('[title="Open"]').should('be.visible').should('be.disabled');
        });
        // Confirm that "Disk" field is disabled
        cy.get('[data-qa-autocomplete="Disk"]').within(function () {
            cy.get('[title="Open"]').should('be.visible').should('be.disabled');
        });
        // Confirm that "Label" field is disabled
        cy.get('[id="label"]').should('be.visible').should('be.disabled');
        // Confirm that "Add Tags" field is disabled
        cy.get('[data-qa-autocomplete="Add Tags"]').within(function () {
            cy.get('[title="Open"]').should('be.visible').should('be.disabled');
        });
        // Confirm that "Description" field is disabled
        cy.get('[id="description"]').should('be.visible').should('be.disabled');
        // Confirm that "Create Image" button is disabled
        ui_1.ui.button
            .findByTitle('Create Image')
            .should('be.visible')
            .should('be.disabled');
    });
    it('should not upload image for the restricted users', function () {
        var mockProfile = factories_1.profileFactory.build({
            username: (0, random_1.randomLabel)(),
            restricted: true,
        });
        var mockUser = factories_1.accountUserFactory.build({
            username: mockProfile.username,
            restricted: true,
            user_type: 'default',
        });
        var mockGrants = factories_1.grantsFactory.build({
            global: {
                add_images: false,
            },
        });
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetProfileGrants)(mockGrants);
        (0, account_1.mockGetUser)(mockUser);
        cy.visitWithLogin('/images/create/upload');
        // Confirm that a notice should be shown informing the user they do not have permission to create a Linode.
        cy.findByText("You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions.").should('be.visible');
        // Check the following fields are disabled
        // Confirm that "Label" field is diabled
        cy.get('[id="label"]').should('be.visible').should('be.disabled');
        // Confirm that "Cloud init compatibility checkbox" field is diabled
        cy.get('[type="checkbox"]').should('be.disabled');
        // Confirm that "Region" field is diabled
        cy.get('[data-qa-autocomplete="Region"]').within(function () {
            cy.get('[title="Open"]').should('be.visible').should('be.disabled');
        });
        // Confirm that "Add Tags" field is disabled
        cy.get('[data-qa-autocomplete="Add Tags"]').within(function () {
            cy.get('[title="Open"]').should('be.visible').should('be.disabled');
        });
        // Confirm that "Description" field is disabled
        cy.get('[id="description"]').should('be.visible').should('be.disabled');
        // Confirm that "Choose File" button is disabled
        ui_1.ui.button
            .findByTitle('Choose File')
            .should('be.visible')
            .should('be.disabled');
        // Confirm that "Upload Using Command Line" button is disabled
        ui_1.ui.button
            .findByTitle('Upload Using Command Line')
            .should('be.visible')
            .should('be.disabled');
        // Confirm that "Upload Image" button is disabled
        cy.get('[type="submit"]').should('be.visible').should('be.disabled');
    });
});
