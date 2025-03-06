"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var linodes_1 = require("support/intercepts/linodes");
var firewalls_1 = require("support/intercepts/firewalls");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var feature_flags_1 = require("support/intercepts/feature-flags");
describe('Create Linode with Firewall', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
    });
    /*
     * - Confirms UI flow to create a Linode with an existing Firewall using mock API data.
     * - Confirms that Firewall is reflected in create summary section.
     * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
     */
    it('can assign existing Firewall during Linode Create flow', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['Cloud Firewall'] });
        var mockFirewall = factories_1.firewallFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        (0, firewalls_1.mockGetFirewalls)([mockFirewall]).as('getFirewall');
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Confirm that mocked Firewall is shown in the Autocomplete, and then select it.
        cy.findByText('Assign Firewall').click();
        cy.focused().type("".concat(mockFirewall.label));
        ui_1.ui.autocompletePopper
            .findByTitle(mockFirewall.label)
            .should('be.visible')
            .click();
        // Confirm Firewall assignment indicator is shown in Linode summary.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('Firewall Assigned').should('be.visible');
        });
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var firewallId = requestPayload['firewall_id'];
            expect(firewallId).to.equal(mockFirewall.id);
        });
        // Confirm redirect to new Linode.
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
    /*
     * - Uses mock API data to confirm Firewall creation and attachment UI flow during Linode create.
     * - Confirms that Firewall is reflected in create summary section.
     * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
     */
    it('can assign new Firewall during Linode Create flow', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['Cloud Firewall'] });
        var mockFirewall = factories_1.firewallFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        (0, firewalls_1.mockCreateFirewall)(mockFirewall).as('createFirewall');
        (0, firewalls_1.mockGetFirewalls)([mockFirewall]).as('getFirewall');
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        cy.findByText('Create Firewall').should('be.visible').click();
        ui_1.ui.drawer
            .findByTitle('Create Firewall')
            .should('be.visible')
            .within(function () {
            // An error message appears when attempting to create a Firewall without a label
            cy.get('[data-testid="submit"]').click();
            cy.findByText('Label is required.');
            // Fill out and submit firewall create form.
            cy.contains('Label').click();
            cy.focused().type(mockFirewall.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Firewall')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@getFirewall');
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Firewall ".concat(mockFirewall.label, " successfully created"));
        // Confirm that mocked Firewall is shown in the Autocomplete, and then select it.
        cy.findByText('Assign Firewall').click();
        cy.focused().type("".concat(mockFirewall.label));
        ui_1.ui.autocompletePopper
            .findByTitle(mockFirewall.label)
            .should('be.visible')
            .click();
        // Confirm Firewall assignment indicator is shown in Linode summary.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('Firewall Assigned').should('be.visible');
        });
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var firewallId = requestPayload['firewall_id'];
            expect(firewallId).to.equal(mockFirewall.id);
        });
        // Confirm redirect to new Linode.
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
    /*
     * - Mocks the internal header to enable the Generate Compliant Firewall banner.
     * - Confirms that Firewall is reflected in create summary section.
     * - Confirms that outgoing Linode Create API request specifies the selected Firewall to be attached.
     */
    it('can generate and assign a compliant Firewall during Linode Create flow', function () {
        cy.intercept({
            middleware: true,
            url: /\/v4(?:beta)?\/.*/,
        }, function (req) {
            // Re-add internal-only header
            req.on('response', function (res) {
                res.headers['akamai-internal-account'] = '*';
            });
        });
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['Cloud Firewall'] });
        var mockFirewall = factories_1.firewallFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockTemplate = factories_1.firewallTemplateFactory.build({
            slug: 'akamai-non-prod',
        });
        (0, firewalls_1.mockCreateFirewall)(mockFirewall).as('createFirewall');
        (0, firewalls_1.mockGetFirewalls)([mockFirewall]).as('getFirewall');
        (0, firewalls_1.mockGetTemplate)(mockTemplate).as('getTemplate');
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Creating the linode without a firewall should display a warning.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.disabled');
        cy.findByLabelText('I am authorized to create a Linode without a Cloud Firewall').click();
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled');
        cy.findByText('Generate Compliant Firewall').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle('Generate an Akamai Compliant Firewall')
            .should('be.visible')
            .within(function () {
            cy.findByText('Generate Firewall Now')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Generating Firewall');
            cy.findByText('Complete!');
            cy.findByText('OK').should('be.visible').should('be.enabled').click();
        });
        cy.wait('@createFirewall');
        cy.findByText(mockFirewall.label).should('be.visible');
        // Confirm Firewall assignment indicator is shown in Linode summary.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('Firewall Assigned').should('be.visible');
        });
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var firewallId = requestPayload['firewall_id'];
            expect(firewallId).to.equal(mockFirewall.id);
        });
        // Confirm redirect to new Linode.
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
    /*
     * - Mocks the internal header to enable the Generate Compliant Firewall banner.
     * - Mocks an error response to the Create Firewall call.
     */
    it('displays errors encountered while trying to generate a compliant firewall', function () {
        cy.intercept({
            middleware: true,
            url: /\/v4(?:beta)?\/.*/,
        }, function (req) {
            // Re-add internal-only header
            req.on('response', function (res) {
                res.headers['akamai-internal-account'] = '*';
            });
        });
        var mockFirewall = factories_1.firewallFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockTemplate = factories_1.firewallTemplateFactory.build({
            slug: 'akamai-non-prod',
        });
        var mockError = 'Mock error';
        (0, firewalls_1.mockGetFirewalls)([mockFirewall]).as('getFirewall');
        (0, firewalls_1.mockGetTemplate)(mockTemplate).as('getTemplate');
        (0, firewalls_1.mockCreateFirewallError)(mockError).as('createFirewall');
        cy.visitWithLogin('/linodes/create');
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled');
        cy.findByText('Generate Compliant Firewall').should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle('Generate an Akamai Compliant Firewall')
            .should('be.visible')
            .within(function () {
            cy.findByText('Generate Firewall Now')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Generating Firewall');
            cy.findByText(mockError);
            cy.findByText('Retry').should('be.visible').should('be.enabled');
            cy.findByText('Close').should('be.visible').should('be.enabled');
        });
        cy.wait('@createFirewall');
    });
});
