"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var stackscripts_1 = require("support/intercepts/stackscripts");
var linodes_1 = require("support/intercepts/linodes");
var one_click_apps_1 = require("support/util/one-click-apps");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var stackscripts_2 = require("src/factories/stackscripts");
var oneClickApps_1 = require("src/features/OneClickApps/oneClickApps");
var utilities_1 = require("src/features/Linodes/LinodeCreate/Tabs/Marketplace/utilities");
var factories_1 = require("src/factories");
var images_1 = require("support/intercepts/images");
describe('OneClick Apps (OCA)', function () {
    it('Lists all the OneClick Apps', function () {
        cy.tag('method:e2e');
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        cy.visitWithLogin("/linodes/create?type=One-Click");
        cy.wait('@getStackScripts').then(function (xhr) {
            var _a, _b;
            var stackScripts = (_b = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.data) !== null && _b !== void 0 ? _b : [];
            // Check the content of the app list
            cy.findByTestId('one-click-apps-container').within(function () {
                // Check that all sections are present (note: New apps can be empty so not asserting its presence)
                cy.findByText('Popular apps').should('be.visible');
                cy.findByText('All apps').should('be.visible');
                var _loop_1 = function (stackscriptId) {
                    var stackscript = stackScripts.find(function (stackScript) { return stackScript.id === +stackscriptId; });
                    if (!stackscript) {
                        throw new Error("Cloud Manager's fetch to GET /v4/linode/stackscripts did not receive a StackScript with ID ".concat(stackscriptId, ". We expected a StackScript to be in the response."));
                    }
                    var displayLabel = (0, utilities_1.getMarketplaceAppLabel)(stackscript.label);
                    // Using `findAllByText` because some apps may be duplicatd under different sections
                    cy.findAllByText(displayLabel).should('exist');
                };
                // For every Marketplace app defined in Cloud Manager, make sure the API returns
                // the nessesary StackScript and that the app renders on the page.
                for (var stackscriptId in oneClickApps_1.oneClickApps) {
                    _loop_1(stackscriptId);
                }
            });
        });
    });
    it('Can view app details of a marketplace app', function () {
        cy.tag('method:e2e');
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        cy.visitWithLogin("/linodes/create?type=One-Click");
        cy.wait('@getStackScripts').then(function (xhr) {
            var _a, _b;
            var stackScripts = (_b = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.data) !== null && _b !== void 0 ? _b : [];
            var candidateStackScriptId = (0, one_click_apps_1.getRandomOCAId)();
            var candidateApp = oneClickApps_1.oneClickApps[candidateStackScriptId];
            if (!candidateApp) {
                throw new Error('The candidate app for this test no longer exists. The tests needs updating.');
            }
            var candidateStackScript = stackScripts.find(function (s) { return s.id === candidateStackScriptId; });
            if (!candidateStackScript) {
                throw new Error('No StackScript returned by the API for the candidate app.');
            }
            cy.findByTestId('one-click-apps-container').within(function () {
                cy.findAllByLabelText("Info for \"".concat((0, utilities_1.getMarketplaceAppLabel)(candidateStackScript.label), "\""))
                    .as('qaInfoFor')
                    .first()
                    .scrollIntoView();
                cy.get('@qaInfoFor').should('be.visible').should('be.enabled').click();
            });
            ui_1.ui.drawer
                .findByTitle((0, utilities_1.getMarketplaceAppLabel)(candidateStackScript.label))
                .should('be.visible')
                .within(function () {
                // compare summary instead of description bc latter contains too many special characters and line breaks
                cy.findByText(candidateApp.summary).should('be.visible');
                cy.findByText(candidateApp.website).should('be.visible');
            });
            ui_1.ui.drawerCloseButton.find().click();
            ui_1.ui.drawer.find().should('not.exist');
        });
    });
    it('Deploys a Linode from a One Click App with user defined fields', function () {
        var images = [
            factories_1.imageFactory.build({
                id: 'linode/ubuntu22.04',
                label: 'Ubuntu 20.04',
            }),
            factories_1.imageFactory.build({
                id: 'linode/debian11',
                label: 'Debian 11',
            }),
        ];
        var stackscript = stackscripts_2.stackScriptFactory.build({
            id: (0, one_click_apps_1.getRandomOCAId)(),
            username: 'linode',
            user_gravatar_id: '9d4d301385af69ceb7ad658aad09c142',
            label: 'E2E Test App',
            description: 'Minecraft OCA',
            ordinal: 10,
            logo_url: 'assets/Minecraft.svg',
            images: ['linode/debian11', 'linode/ubuntu24.04'],
            deployments_total: 18854,
            deployments_active: 412,
            is_public: true,
            mine: false,
            created: '2019-03-08T21:13:32',
            updated: '2023-09-26T15:00:45',
            rev_note: 'remove maxplayers hard coded options [oca-707]',
            script: '#!/usr/bin/env bash\n',
            user_defined_fields: [
                {
                    name: 'username',
                    label: "The username for the Linode's non-root admin/SSH user(must be lowercase)",
                    example: 'lgsmuser',
                },
                {
                    name: 'password',
                    label: "The password for the Linode's non-root admin/SSH user",
                    example: 'S3cuReP@s$w0rd',
                },
                {
                    name: 'levelname',
                    label: 'World Name',
                },
            ],
        });
        var rootPassword = (0, random_1.randomString)(16);
        var region = (0, regions_1.chooseRegion)();
        var linodeLabel = (0, random_1.randomLabel)();
        // UDF values
        var firstName = (0, random_1.randomLabel)();
        var password = (0, random_1.randomString)(16);
        var levelName = 'Get the enderman!';
        var linode = factories_1.linodeFactory.build({
            label: linodeLabel,
        });
        (0, images_1.mockGetAllImages)(images);
        (0, stackscripts_1.mockGetStackScripts)([stackscript]).as('getStackScripts');
        (0, stackscripts_1.mockGetStackScript)(stackscript.id, stackscript);
        cy.visitWithLogin("/linodes/create?type=One-Click");
        cy.wait('@getStackScripts');
        cy.findByTestId('one-click-apps-container').within(function () {
            // Since it is mock data we can assert the New App section is present
            cy.findByText('New apps').should('be.visible');
            // Check that the app is listed and select it
            cy.get('[data-qa-selection-card="true"]').should('have.length', 2);
            cy.findAllByText(stackscript.label).first().should('be.visible').click();
        });
        cy.findByLabelText("The username for the Linode's non-root admin/SSH user(must be lowercase) (required)")
            .should('be.visible')
            .click();
        cy.focused().type(firstName);
        cy.findByLabelText("The password for the Linode's non-root admin/SSH user (required)")
            .should('be.visible')
            .click();
        cy.focused().type(password);
        cy.findByLabelText('World Name (required)').should('be.visible').click();
        cy.focused().type(levelName);
        // Check each field should persist when moving onto another field
        cy.findByLabelText("The username for the Linode's non-root admin/SSH user(must be lowercase) (required)").should('have.value', firstName);
        cy.findByLabelText("The password for the Linode's non-root admin/SSH user (required)").should('have.value', password);
        cy.findByLabelText('World Name (required)').should('have.value', levelName);
        // Choose an image
        cy.findByPlaceholderText('Choose an image').click();
        cy.focused().type('{downArrow}{enter}');
        // Choose a region
        ui_1.ui.regionSelect.find().click();
        cy.focused().type("".concat(region.id, "{enter}"));
        // Choose a Linode plan
        cy.get('[data-qa-plan-row="Dedicated 8 GB"]')
            .closest('tr')
            .within(function () {
            cy.get('[data-qa-radio]').click();
        });
        // Enter a label.
        cy.findByText('Linode Label').should('be.visible').click();
        cy.focused().type(linodeLabel);
        // Choose a Root Password
        cy.get('[id="root-password"]').type(rootPassword);
        // Create the Linode
        (0, linodes_1.mockCreateLinode)(linode).as('createLinode');
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode');
        ui_1.ui.toast.assertMessage("Your Linode ".concat(linode.label, " is being created."));
    });
    // leave test disabled by default
    xit('Validate the summaries of all the OneClick Apps', function () {
        cy.tag('method:e2e');
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        cy.visitWithLogin("/linodes/create?type=One-Click");
        cy.wait('@getStackScripts').then(function (xhr) {
            // Check the content of the app list
            cy.findByTestId('one-click-apps-container').within(function () {
                var _a, _b;
                var stackScripts = (_b = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.data) !== null && _b !== void 0 ? _b : [];
                var _loop_2 = function (stackscriptId) {
                    // expected data of the app in the selected tile
                    var candidateApp = oneClickApps_1.oneClickApps[stackscriptId];
                    var candidateStackScript = stackScripts.find(function (s) { return s.id === +stackscriptId; });
                    if (!candidateStackScript) {
                        console.log('missing stackscript from UI ', stackscriptId, candidateApp.description);
                        throw new Error('No StackScript returned by the API for the candidate app.');
                    }
                    else {
                        cy.findAllByLabelText("Info for \"".concat((0, utilities_1.getMarketplaceAppLabel)(candidateStackScript.label), "\""))
                            .as('qaInfoFor')
                            .first()
                            .scrollIntoView();
                        cy.get('@qaInfoFor')
                            .should('be.visible')
                            .should('be.enabled')
                            .click();
                        ui_1.ui.drawer.find().within(function () {
                            // compare summary instead of description bc latter contains too many special characters and line breaks
                            cy.findByText(candidateApp.summary).should('be.visible');
                        });
                        ui_1.ui.drawerCloseButton.find().click();
                    }
                };
                for (var stackscriptId in oneClickApps_1.oneClickApps) {
                    _loop_2(stackscriptId);
                }
            });
        });
    });
});
