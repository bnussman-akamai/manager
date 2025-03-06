"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var ui_1 = require("support/ui");
var images_1 = require("support/intercepts/images");
var factories_2 = require("src/factories");
var random_1 = require("support/util/random");
var factories_3 = require("src/factories");
var factories_4 = require("src/factories");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
function checkActionMenu(tableAlias, mockImages) {
    mockImages.forEach(function (image) {
        cy.get(tableAlias)
            .find('tbody tr')
            .should('contain', image.label)
            .then(function ($row) {
            // If the row contains the label, proceed with clicking the action menu
            var actionButton = $row.find("button[aria-label=\"Action menu for Image ".concat(image.label, "\"]"));
            if (actionButton) {
                cy.wrap(actionButton).click();
                // Check that the item with text 'Deploy to New Linode' is active
                cy.get('ul[role="menu"]')
                    .contains('Deploy to New Linode')
                    .should('be.visible')
                    .and('be.enabled');
                // Check that all other items are disabled
                cy.get('ul[role="menu"]')
                    .find('li')
                    .not(':contains("Deploy to New Linode")')
                    .each(function ($li) {
                    cy.wrap($li).should('be.visible').and('be.disabled');
                });
                // Close the action menu by clicking on Custom Image Title of the screen
                cy.get('body').click(0, 0);
            }
        });
    });
}
describe('image landing checks for non-empty state with restricted user', function () {
    beforeEach(function () {
        var mockImages = new Array(3).fill(null).map(function (_item, index) {
            return factories_1.imageFactory.build({
                label: "Image ".concat(index),
                tags: [index % 2 == 0 ? 'even' : 'odd', 'nums'],
            });
        });
        // Mock setup to display the Image landing page in an non-empty state
        (0, images_1.mockGetAllImages)(mockImages).as('getImages');
        // Alias the mockImages array
        cy.wrap(mockImages).as('mockImages');
    });
    it('checks restricted user with read access has no access to create image and can see existing images', function () {
        // Mock setup for user profile, account user, and user grants with restricted permissions,
        var mockProfile = factories_2.profileFactory.build({
            username: (0, random_1.randomLabel)(),
            restricted: true,
        });
        var mockUser = factories_4.accountUserFactory.build({
            username: mockProfile.username,
            restricted: true,
            user_type: 'default',
        });
        var mockGrants = factories_3.grantsFactory.build({
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
        cy.contains('h3', 'Custom Images')
            .closest('div[data-qa-paper="true"]')
            .find('[role="table"]')
            .should('exist')
            .as('customImageTable');
        cy.contains('h3', 'Recovery Images')
            .closest('div[data-qa-paper="true"]')
            .find('[role="table"]')
            .should('exist')
            .as('recoveryImageTable');
        // Assert that Create Image button is visible and disabled
        ui_1.ui.button
            .findByTitle('Create Image')
            .should('be.visible')
            .and('be.disabled')
            .trigger('mouseover');
        // Assert that tooltip is visible with message
        ui_1.ui.tooltip
            .findByText("You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions.")
            .should('be.visible');
        cy.get('@mockImages').then(function (mockImages) {
            // Assert that the correct number of Image entries are present in the customImageTable
            cy.get('@customImageTable')
                .find('tbody tr')
                .should('have.length', mockImages.length);
            // Assert that the correct number of Image entries are present in the recoveryImageTable
            cy.get('@recoveryImageTable')
                .find('tbody tr')
                .should('have.length', mockImages.length);
            checkActionMenu('@customImageTable', mockImages); // For the custom image table
            checkActionMenu('@recoveryImageTable', mockImages); // For the recovery image table
        });
    });
});
