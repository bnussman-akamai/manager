"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
/**
 * Creates an OAuth App with the given parameters.
 *
 * This assumes that the user has already navigated to the profile/clients
 * page.
 *
 * @param oauthClient - OAuth app to mock.
 */
var createOAuthApp = function (oauthApp) {
    ui_1.ui.button
        .findByTitle('Add an OAuth App')
        .should('be.visible')
        .should('be.enabled')
        .click();
    // Nothing will happen when cancelling.
    ui_1.ui.drawer
        .findByTitle('Create OAuth App')
        .should('be.visible')
        .within(function () {
        cy.findByLabelText('Label').click();
        cy.focused().clear();
        cy.focused().type(oauthApp.label);
        cy.findByLabelText('Callback URL').click();
        cy.focused().clear();
        cy.focused().type(oauthApp.redirect_uri);
        ui_1.ui.buttonGroup
            .findButtonByTitle('Cancel')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
    // The drawer is no longer rendered or visible
    ui_1.ui.drawer.find().should('not.exist');
    cy.findByText(oauthApp.label).should('not.exist');
    // Nothing will happen when clicking the 'X' button.
    ui_1.ui.button
        .findByTitle('Add an OAuth App')
        .should('be.visible')
        .should('be.enabled')
        .click();
    ui_1.ui.drawer
        .findByTitle('Create OAuth App')
        .should('be.visible')
        .within(function () {
        cy.findByLabelText('Label').click();
        cy.focused().clear();
        cy.focused().type(oauthApp.label);
        cy.findByLabelText('Callback URL').click();
        cy.focused().clear();
        cy.focused().type(oauthApp.redirect_uri);
    });
    ui_1.ui.drawerCloseButton.find().click();
    // The drawer is no longer rendered or visible
    ui_1.ui.drawer.find().should('not.exist');
    cy.findByText(oauthApp.label).should('not.exist');
    // Add an oauth app
    ui_1.ui.button
        .findByTitle('Add an OAuth App')
        .should('be.visible')
        .should('be.enabled')
        .click();
    ui_1.ui.drawer
        .findByTitle('Create OAuth App')
        .should('be.visible')
        .within(function () {
        // An error message appears when attempting to create an OAuth App without a label
        cy.findByLabelText('Label').click();
        cy.focused().clear();
        cy.findByLabelText('Callback URL').click();
        cy.focused().clear();
        ui_1.ui.button
            .findByTitle('Create')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText('Label is required.');
        cy.findByText('Redirect URI is required.');
        // Fill out and submit OAuth App create form.
        cy.findByLabelText('Label').click();
        cy.focused().clear();
        cy.focused().type(oauthApp.label);
        cy.findByLabelText('Callback URL').click();
        cy.focused().clear();
        cy.focused().type(oauthApp.redirect_uri);
        // Uncheck the 'public' checkbox
        if (!oauthApp.public) {
            cy.get('[data-qa-checked]').should('be.visible').click();
        }
        (0, profile_1.mockCreateOAuthApp)(oauthApp).as('createOauthApp');
        ui_1.ui.button
            .findByTitle('Create')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createOauthApp');
    });
    ui_1.ui.dialog
        .findByTitle('Client Secret')
        .should('be.visible')
        .within(function () {
        cy.get('input[id="client-secret"]')
            .should('be.visible')
            .should('have.value', oauthApp.secret);
        ui_1.ui.button
            .findByTitle('I Have Saved My Client Secret')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
    // The drawer/diaglog is no longer rendered or visible
    ui_1.ui.drawer.find().should('not.exist');
    ui_1.ui.dialog.find().should('not.exist');
};
describe('OAuth Apps', function () {
    /*
     * - Adds an oauth app
     * - Confirms that nothing happens when cancelling the configuration.
     * - Confirms that an error message appears upon submitting without a label and a callback URL.
     * - Confirms that the oauth app is listed correctly on OAuth Apps landing page.
     */
    it('Adds an OAuth App', function () {
        var oauthApps = [
            factories_1.oauthClientFactory.build({
                label: (0, random_1.randomLabel)(),
                secret: (0, random_1.randomHex)(64),
            }),
            factories_1.oauthClientFactory.build({
                label: (0, random_1.randomLabel)(),
                public: true,
                secret: (0, random_1.randomHex)(64),
            }),
        ];
        var privateOauthApp = oauthApps[0];
        var publicOauthApp = oauthApps[1];
        (0, profile_1.mockGetOAuthApps)([]).as('getOauthApps');
        cy.visitWithLogin('/profile/clients');
        cy.wait('@getOauthApps');
        cy.findByText('No items to display.');
        // Create a private access OAuth App
        (0, profile_1.mockGetOAuthApps)([privateOauthApp]).as('getOauthApps');
        createOAuthApp(privateOauthApp);
        cy.wait('@getOauthApps');
        cy.findByText(privateOauthApp.label).should('be.visible');
        // Create a public access OAuth App
        (0, profile_1.mockGetOAuthApps)(oauthApps).as('getOauthApps');
        createOAuthApp(publicOauthApp);
        cy.wait('@getOauthApps');
        // Confirms that the oauth app is listed on landing page with expected configuration.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText(privateOauthApp.label).should('be.visible');
            cy.findByText('Private').should('be.visible');
            cy.findByText(privateOauthApp.redirect_uri).should('be.visible');
        });
        cy.findByText(publicOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText(publicOauthApp.label).should('be.visible');
            cy.findByText('Public').should('be.visible');
            cy.findByText(publicOauthApp.redirect_uri).should('be.visible');
        });
    });
    /*
     * - Deletes an oauth app
     * - Confirms that nothing happens when cancelling the deletion.
     * - Confirms that the oauth app is removed correctly on OAuth Apps landing page.
     */
    it('Deletes an OAuth App', function () {
        var oauthApps = factories_1.oauthClientFactory.buildList(2);
        var privateOauthApp = oauthApps[0];
        privateOauthApp.label = (0, random_1.randomLabel)(5);
        var publicOauApp = oauthApps[1];
        publicOauApp.label = (0, random_1.randomLabel)(5);
        publicOauApp.public = true;
        (0, profile_1.mockGetOAuthApps)(oauthApps).as('getOAuthApps');
        cy.visitWithLogin('/profile/clients');
        cy.wait('@getOAuthApps');
        // Nothing will happen when the deletion is cancelled.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText('Delete').should('be.visible').click();
        });
        ui_1.ui.dialog
            .findByTitle("Delete ".concat(privateOauthApp.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // The diaglog is no longer rendered or visible
        ui_1.ui.dialog.find().should('not.exist');
        cy.findByText(privateOauthApp.label).should('be.visible');
        // Confirm deletion.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText('Delete').should('be.visible').click();
        });
        (0, profile_1.mockDeleteOAuthApps)(privateOauthApp.id).as('deleteOAuthApp');
        (0, profile_1.mockGetOAuthApps)(oauthApps.slice(1)).as('getDeletedOAuthApps');
        ui_1.ui.dialog
            .findByTitle("Delete ".concat(privateOauthApp.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // The diaglog is no longer rendered or visible
        ui_1.ui.dialog.find().should('not.exist');
        cy.wait('@deleteOAuthApp');
        cy.wait('@getDeletedOAuthApps');
        cy.findByText(privateOauthApp.label).should('not.exist');
    });
    /*
     * - Edits an oauth app
     * - Confirms that nothing happens when cancelling the edition.
     * - Confirms that the oauth app is updated correctly on OAuth Apps landing page.
     */
    it('Edits an OAuth App', function () {
        var oauthApps = factories_1.oauthClientFactory.buildList(2);
        var privateOauthApp = oauthApps[0];
        privateOauthApp.label = (0, random_1.randomLabel)(5);
        var publicOauApp = oauthApps[1];
        publicOauApp.label = (0, random_1.randomLabel)(5);
        publicOauApp.public = true;
        (0, profile_1.mockGetOAuthApps)(oauthApps).as('getOAuthApps');
        cy.visitWithLogin('/profile/clients');
        cy.wait('@getOAuthApps');
        // Nothing will happen when the edition is cancelled.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText('Edit').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle('Create OAuth App')
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // The drawer is no longer rendered or visible
        ui_1.ui.drawer.find().should('not.exist');
        cy.findByText(privateOauthApp.label).should('be.visible');
        // Nothing will happen when clicking the 'X' button.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText('Edit').should('be.visible').click();
        });
        ui_1.ui.drawer.findByTitle('Create OAuth App').should('be.visible');
        ui_1.ui.drawerCloseButton.find().click();
        // Confirm edition.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText('Edit').should('be.visible').click();
        });
        // Deep copy the oauth apps array
        var updatedApps = JSON.parse(JSON.stringify(oauthApps));
        var modified = '-modified';
        updatedApps[0].label = privateOauthApp.label + modified;
        updatedApps[0].redirect_uri = privateOauthApp.redirect_uri + modified;
        (0, profile_1.mockGetOAuthApps)(updatedApps).as('getUpdatedOAuthApps');
        (0, profile_1.mockUpdateOAuthApps)(updatedApps[0].id, updatedApps).as('updateOAuthApp');
        ui_1.ui.drawer
            .findByTitle('Create OAuth App')
            .should('be.visible')
            .within(function () {
            // If there is no changes, the 'save' button should disabled
            ui_1.ui.buttonGroup
                .findButtonByTitle('Save Changes')
                .should('be.visible')
                .should('be.disabled');
            cy.findByLabelText('Label').click();
            cy.focused().clear();
            cy.focused().type(updatedApps[0].label);
            cy.findByLabelText('Callback URL').click();
            cy.focused().clear();
            cy.focused().type(updatedApps[0].label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // The drawer is no longer rendered or visible
        ui_1.ui.drawer.find().should('not.exist');
        cy.wait('@getUpdatedOAuthApps');
        cy.wait('@updateOAuthApp');
        cy.findByText(privateOauthApp.label).should('not.exist');
        cy.findByText(updatedApps[0].label)
            .closest('tr')
            .within(function () {
            cy.findByText(updatedApps[0].label).should('be.visible');
            cy.findByText('Private').should('be.visible');
            cy.findByText(updatedApps[0].redirect_uri).should('be.visible');
        });
    });
    /*
     * - Resets an oauth app
     * - Confirms that nothing happens when cancelling the edition.
     * - Confirms that the oauth app is reset correctly on OAuth Apps landing page.
     */
    it('Resets an OAuth App', function () {
        var privateOauthApp = factories_1.oauthClientFactory.build({
            label: (0, random_1.randomLabel)(5),
            secret: (0, random_1.randomHex)(64),
        });
        (0, profile_1.mockGetOAuthApps)([privateOauthApp]).as('getOAuthApps');
        cy.visitWithLogin('/profile/clients');
        cy.wait('@getOAuthApps');
        // Nothing will happen when the edition is cancelled.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText('Reset').should('be.visible').click();
        });
        ui_1.ui.dialog
            .findByTitle("Reset secret for ".concat(privateOauthApp.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // The dialog is no longer rendered or visible
        ui_1.ui.dialog.find().should('not.exist');
        cy.findByText(privateOauthApp.label).should('be.visible');
        // Confirm resetting.
        cy.findByText(privateOauthApp.label)
            .closest('tr')
            .within(function () {
            cy.findByText('Reset').should('be.visible').click();
        });
        (0, profile_1.mockResetOAuthApps)(privateOauthApp.id, privateOauthApp).as('resetOAuthApp');
        ui_1.ui.dialog
            .findByTitle("Reset secret for ".concat(privateOauthApp.label, "?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('Reset Secret')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@resetOAuthApp');
        ui_1.ui.dialog
            .findByTitle('Client Secret')
            .should('be.visible')
            .within(function () {
            ui_1.ui.buttonGroup
                .findButtonByTitle('I Have Saved My Client Secret')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // The dialog is no longer rendered or visible
        ui_1.ui.dialog.find().should('not.exist');
        cy.findByText(privateOauthApp.label).should('be.visible');
    });
});
