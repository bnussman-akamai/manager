"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authentication_1 = require("support/api/authentication");
var firewalls_1 = require("support/intercepts/firewalls");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var linodes_1 = require("support/util/linodes");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var linodes_2 = require("src/factories/linodes");
(0, authentication_1.authenticate)();
describe('create firewall', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['lke-clusters', 'linodes', 'firewalls']);
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Creates a firewall that is not assigned to a Linode.
     * - Confirms that an error message appears upon submitting without a label.
     * - Confirms that firewall is listed correctly on firewalls landing page.
     */
    it('creates a firewall without a linode', function () {
        var firewall = {
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        };
        (0, firewalls_1.interceptCreateFirewall)().as('createFirewall');
        cy.visitWithLogin('/firewalls/create');
        ui_1.ui.drawer
            .findByTitle('Create Firewall')
            .should('be.visible')
            .within(function () {
            // An error message appears when attempting to create a Firewall without a label
            cy.get('[data-testid="submit"]').click();
            cy.findByText('Label is required.');
            // Fill out and submit firewall create form.
            cy.contains('Label').click();
            cy.focused().type(firewall.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Firewall')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@createFirewall');
        // Confirm redirect to landing page and that new firewall is listed.
        cy.url().should('endWith', '/firewalls');
        cy.findByText(firewall.label)
            .closest('tr')
            .within(function () {
            cy.findByText(firewall.label).should('be.visible');
            cy.findByText('Enabled').should('be.visible');
            cy.findByText('No rules').should('be.visible');
            cy.findByText('None assigned').should('be.visible');
        });
    });
    /*
     * - Creates a firewall that is assigned to an existing Linode.
     * - Confirms that firewall is listed correctly on firewalls landing page.
     * - Confirms that firewall is assigned to the linode.
     */
    it('creates a firewall assigned to a linode', function () {
        var region = (0, regions_1.chooseRegion)();
        var linodeRequest = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: region.id,
            root_pass: (0, random_1.randomString)(16),
        });
        var firewall = {
            label: (0, random_1.randomLabel)(),
        };
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeRequest, { securityMethod: 'powered_off' }); }, 'creating Linode').then(function (linode) {
            (0, firewalls_1.interceptCreateFirewall)().as('createFirewall');
            cy.visitWithLogin('/firewalls/create');
            ui_1.ui.drawer
                .findByTitle('Create Firewall')
                .should('be.visible')
                .within(function () {
                // Fill out and submit firewall create form.
                cy.contains('Label').click();
                cy.focused().type(firewall.label);
                cy.findByLabelText('Linodes').should('be.visible').click();
                cy.focused().type(linode.label);
                ui_1.ui.autocompletePopper
                    .findByTitle(linode.label)
                    .should('be.visible')
                    .click();
                cy.findByLabelText('Linodes').should('be.visible').click();
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Create Firewall')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@createFirewall');
            // Confirm that firewall is listed on landing page with expected configuration.
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText(firewall.label).should('be.visible');
                cy.findByText('Enabled').should('be.visible');
                cy.findByText('No rules').should('be.visible');
                cy.findByText(linode.label).should('be.visible');
            });
        });
    });
});
