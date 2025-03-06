"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var images_1 = require("support/intercepts/images");
var factories_1 = require("@src/factories");
var accountUsers_1 = require("@src/factories/accountUsers");
var grants_1 = require("@src/factories/grants");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var random_1 = require("support/util/random");
describe('Images empty landing page', function () {
    beforeEach(function () {
        // Mock setup to display the Image landing page in an empty state
        (0, images_1.mockGetAllImages)([]).as('getImages');
    });
    /*
     * - Confirms Images landing page empty state is shown when no Images are present:
     * - Confirms that "Getting Started Guides" and "Video Playlist" are listed on landing page.
     * - Confirms that clicking "Create Image" navigates user to image create page.
     */
    it('shows the empty state when there are no images', function () {
        cy.visitWithLogin('/images');
        cy.wait(['@getImages']);
        // confirms helper text
        cy.findByText('Store custom Linux images to rapidly deploy compute instances preconfigured with what you need.').should('be.visible');
        // checks that guides are visible
        cy.findByText('Getting Started Guides').should('be.visible');
        cy.findByText('Overview of Custom Images').should('be.visible');
        cy.findByText('Getting Started with Custom Images').should('be.visible');
        cy.findByText('Capture an Image from a Linode').should('be.visible');
        cy.findByText('Upload a Custom Image').should('be.visible');
        cy.findByText('View additional Images guides').should('be.visible');
        // checks that videos are visible
        cy.findByText('Video Playlist').should('be.visible');
        cy.findByText('How to use Linode Images | Learn how to Create, Upload, and Deploy Custom Images on Linode').should('be.visible');
        cy.findByText('Custom Images on Linode | Create, Upload, and Deploy Custom iso Images to Deploy on Linode').should('be.visible');
        cy.findByText('Using Images and Backups on Linode').should('be.visible');
        cy.findByText('View our YouTube channel').should('be.visible');
        // confirms clicking on 'Create Image' button
        ui_1.ui.button
            .findByTitle('Create Image')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/images/create/disk');
    });
    /*
     * - Confirms Images table not exist.
     * - Confirms that "Create Image" button is disabled for restricted user.
     * - Confirms that hovering "Create Image" button shows a Warning for restricted user.
     */
    it('checks restricted user has no access to create Image on Image landing page', function () {
        // object to create a mockProfile for non-restricted user
        var mockProfile = factories_1.profileFactory.build({
            username: (0, random_1.randomLabel)(),
            restricted: true,
        });
        // object to create a mockUser for non-restricted user
        var mockUser = accountUsers_1.accountUserFactory.build({
            username: mockProfile.username,
            restricted: true,
            user_type: 'default',
        });
        // object to create a mockGrants for non-restricted user
        var mockGrants = grants_1.grantsFactory.build({
            global: {
                add_images: false,
            },
        });
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetProfileGrants)(mockGrants);
        (0, account_1.mockGetUser)(mockUser);
        // Login and wait for application to load
        cy.visitWithLogin('/images');
        cy.wait('@getImages');
        cy.url().should('endWith', '/images');
        // Assert that List of Images table not exist
        cy.get('table[aria-label="List of Images"]').should('not.exist');
        // confirms 'Create Image' button is disabled
        ui_1.ui.button
            .findByTitle('Create Image')
            .should('be.visible')
            .and('be.disabled')
            .trigger('mouseover');
        ui_1.ui.tooltip
            .findByText("You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions.")
            .should('be.visible');
        // checks for reference section on empty page
        cy.findByText('Getting Started Guides').should('be.visible');
        cy.findByText('Video Playlist').should('be.visible');
    });
});
