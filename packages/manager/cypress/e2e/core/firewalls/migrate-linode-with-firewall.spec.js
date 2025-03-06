"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable sonarjs/no-duplicate-string */
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var firewalls_1 = require("support/intercepts/firewalls");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/util/linodes");
var random_1 = require("support/util/random");
var regions_2 = require("support/util/regions");
var regions_3 = require("support/util/regions");
var mockDallas = (0, regions_2.extendRegion)(factories_1.regionFactory.build({
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    id: 'us-central',
    label: 'Dallas, TX',
    status: 'ok',
}));
var mockLondon = (0, regions_2.extendRegion)(factories_1.regionFactory.build({
    capabilities: ['Linodes', 'NodeBalancers', 'Block Storage'],
    country: 'uk',
    id: 'eu-west',
    label: 'London, UK',
    status: 'ok',
}));
var mockSingapore = (0, regions_2.extendRegion)(factories_1.regionFactory.build({
    capabilities: [
        'Linodes',
        'NodeBalancers',
        'Block Storage',
        'Cloud Firewall',
    ],
    country: 'sg',
    id: 'ap-south',
    label: 'Singapore, SG',
    status: 'ok',
}));
var mockRegions = [mockDallas, mockLondon, mockSingapore];
// Migration notes and warnings that are shown to the user.
// We want to confirm that these are displayed so that users are not surprised
// by migration side effects.
var migrationNoticeSubstrings = [
    'assigned new IPv4 and IPv6 addresses',
    'existing backups with the Linode Backup Service will not be migrated',
    'DNS records (including Reverse DNS) will need to be updated',
    'attached VLANs will be inaccessible if the destination region does not support VLANs',
    'Your Linode will be powered off.',
];
(0, authentication_1.authenticate)();
describe('Migrate Linode With Firewall', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['firewalls', 'linodes']);
    });
    /*
     * - Tests Linode migration flow for Linodes with Firewalls using mock API data.
     * - Confirms that user is warned of migration consequences.
     */
    it('test migrate flow - mocking all data', function () {
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: 'us-central',
        });
        var mockFirewall = factories_1.firewallFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            status: 'enabled',
        });
        (0, firewalls_1.mockGetFirewalls)([mockFirewall]).as('getFirewalls');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_1.mockMigrateLinode)(mockLinode.id).as('migrateLinode');
        cy.visitWithLogin("/linodes/".concat(mockLinode.id, "/migrate"));
        cy.wait(['@getLinode', '@getRegions']);
        cy.findByText(mockDallas.label).should('be.visible');
        ui_1.ui.dialog
            .findByTitle("Migrate Linode ".concat(mockLinode.label, " to another region"))
            .should('be.visible')
            .within(function () {
            // Confirm that 'Enter Migration Queue' button is disabled.
            ui_1.ui.button
                .findByTitle('Enter Migration Queue')
                .should('be.visible')
                .should('be.disabled');
            // Confirm that user is warned of Migration side effects.
            cy.findByText('Caution:').should('be.visible');
            migrationNoticeSubstrings.forEach(function (noticeSubstring) {
                cy.contains(noticeSubstring).should('be.visible');
            });
            // Click the "Accept" check box.
            cy.findByText('Accept').should('be.visible').click();
            // Select migration region.
            cy.findByText("North America: ".concat(mockDallas.label)).should('be.visible');
            ui_1.ui.regionSelect.find().click();
            ui_1.ui.regionSelect.findItemByRegionLabel(mockSingapore.label).click();
            ui_1.ui.button
                .findByTitle('Enter Migration Queue')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@migrateLinode').its('response.statusCode').should('eq', 200);
    });
    /*
     * - Uses real API data to create a Firewall, attach a Linode to it, then migrate the Linode.
     */
    it('migrates linode with firewall - real data', function () {
        cy.tag('method:e2e', 'purpose:dcTesting');
        var _a = (0, regions_3.chooseRegions)(2), migrationRegionStart = _a[0], migrationRegionEnd = _a[1];
        var firewallLabel = (0, random_1.randomLabel)();
        var linodePayload = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: migrationRegionStart.id,
        });
        (0, firewalls_1.interceptCreateFirewall)().as('createFirewall');
        (0, firewalls_1.interceptGetFirewalls)().as('getFirewalls');
        // Create a Linode, then navigate to the Firewalls landing page.
        cy.defer(function () {
            return (0, linodes_2.createTestLinode)(linodePayload, { securityMethod: 'powered_off' });
        }).then(function (linode) {
            (0, linodes_1.interceptMigrateLinode)(linode.id).as('migrateLinode');
            cy.visitWithLogin('/firewalls');
            cy.wait('@getFirewalls');
            ui_1.ui.button
                .findByTitle('Create Firewall')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.drawer
                .findByTitle('Create Firewall')
                .should('be.visible')
                .within(function () {
                cy.findByText('Label').should('be.visible').click();
                cy.focused().type(firewallLabel);
                cy.findByText('Linodes').should('be.visible').click();
                cy.focused().type(linode.label);
                ui_1.ui.autocompletePopper
                    .findByTitle(linode.label)
                    .should('be.visible')
                    .click();
                // Click on the Select again to dismiss the autocomplete popper.
                cy.findByLabelText('Linodes').should('be.visible').click();
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Create Firewall')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@createFirewall');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.get('[data-qa-link-text="true"]')
                .should('be.visible')
                .within(function () {
                cy.findByText('linodes').should('be.visible');
            });
            // Make sure Linode is running before attempting to migrate.
            cy.get('[data-qa-linode-status]').within(function () {
                cy.findByText('OFFLINE');
            });
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem.findByTitle('Migrate').should('be.visible').click();
            ui_1.ui.dialog
                .findByTitle("Migrate Linode ".concat(linode.label, " to another region"))
                .should('be.visible')
                .within(function () {
                // Click "Accept" check box.
                cy.findByText('Accept').should('be.visible').click();
                // Select region for migration.
                ui_1.ui.regionSelect.find().click();
                ui_1.ui.regionSelect
                    .findItemByRegionLabel(migrationRegionEnd.label)
                    .click();
                // Initiate migration.
                ui_1.ui.button
                    .findByTitle('Enter Migration Queue')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@migrateLinode').its('response.statusCode').should('eq', 200);
        });
    });
});
