"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var regions_2 = require("support/util/regions");
var random_1 = require("support/util/random");
var vlans_1 = require("support/intercepts/vlans");
var linodes_1 = require("support/intercepts/linodes");
var feature_flags_1 = require("support/intercepts/feature-flags");
describe('Create Linode with VLANs', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
    });
    /*
     * - Uses mock API data to confirm VLAN attachment UI flow during Linode create.
     * - Confirms that outgoing Linode create API request contains expected data for VLAN.
     * - Confirms that attached VLAN is reflected in the Linode create summary.
     */
    it('can assign existing VLANs during Linode create flow', function () {
        var mockLinodeRegion = (0, regions_2.chooseRegion)({
            capabilities: ['Linodes', 'Vlans'],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockLinodeRegion.id,
        });
        var mockVlan = factories_1.VLANFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockLinodeRegion.id,
            cidr_block: "".concat((0, random_1.randomIp)(), "/24"),
            linodes: [],
        });
        (0, vlans_1.mockGetVLANs)([mockVlan]);
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');
        // Fill out necessary Linode create fields.
        pages_1.linodeCreatePage.selectRegionById(mockLinodeRegion.id);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Open VLAN accordion and select existing VLAN.
        ui_1.ui.accordionHeading.findByTitle('VLAN').click();
        ui_1.ui.accordion
            .findByTitle('VLAN')
            .scrollIntoView()
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);
            ui_1.ui.autocompletePopper
                .findByTitle(mockVlan.label)
                .should('be.visible')
                .click();
            cy.findByLabelText(/IPAM Address/)
                .should('be.enabled')
                .type(mockVlan.cidr_block);
        });
        // Confirm that VLAN attachment is listed in summary, then create Linode.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('VLAN Attached').should('be.visible');
        });
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm outgoing API request payload has expected data.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var expectedPublicInterface = requestPayload['interfaces'][0];
            var expectedVlanInterface = requestPayload['interfaces'][1];
            // Confirm that first interface is for public internet.
            expect(expectedPublicInterface['purpose']).to.equal('public');
            // Confirm that second interface is our chosen VLAN.
            expect(expectedVlanInterface['purpose']).to.equal('vlan');
            expect(expectedVlanInterface['label']).to.equal(mockVlan.label);
            expect(expectedVlanInterface['ipam_address']).to.equal(mockVlan.cidr_block);
        });
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
    /*
     * - Uses mock API data to confirm VLAN creation and attachment UI flow during Linode create.
     * - Confirms that outgoing Linode create API request contains expected data for new VLAN.
     * - Confirms that attached VLAN is reflected in the Linode create summary.
     */
    it('can assign new VLANs during Linode create flow', function () {
        var mockLinodeRegion = (0, regions_2.chooseRegion)({
            capabilities: ['Linodes', 'Vlans'],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockLinodeRegion.id,
        });
        var mockVlan = factories_1.VLANFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockLinodeRegion.id,
            cidr_block: "".concat((0, random_1.randomIp)(), "/24"),
            linodes: [],
        });
        (0, vlans_1.mockGetVLANs)([]);
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');
        // Fill out necessary Linode create fields.
        pages_1.linodeCreatePage.selectRegionById(mockLinodeRegion.id);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Open VLAN accordion and specify new VLAN.
        ui_1.ui.accordionHeading.findByTitle('VLAN').click();
        ui_1.ui.accordion
            .findByTitle('VLAN')
            .scrollIntoView()
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('VLAN').should('be.enabled').type(mockVlan.label);
            ui_1.ui.autocompletePopper
                .findByTitle("Create \"".concat(mockVlan.label, "\""))
                .should('be.visible')
                .click();
        });
        // Confirm that VLAN attachment is listed in summary, then create Linode.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('VLAN Attached').should('be.visible');
        });
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm outgoing API request payload has expected data.
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var expectedPublicInterface = requestPayload['interfaces'][0];
            var expectedVlanInterface = requestPayload['interfaces'][1];
            // Confirm that first interface is for public internet.
            expect(expectedPublicInterface['purpose']).to.equal('public');
            // Confirm that second interface is our chosen VLAN.
            expect(expectedVlanInterface['purpose']).to.equal('vlan');
            expect(expectedVlanInterface['label']).to.equal(mockVlan.label);
            expect(expectedVlanInterface['ipam_address']).to.equal('');
        });
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
    /*
     * - Uses mock API data to confirm that VLANs cannot be assigned to Linodes in regions without capability.
     * - Confirms that VLAN fields are disabled before and after selecting a region.
     */
    it('cannot assign VLANs in regions without capability', function () {
        var availabilityNotice = 'VLANs are currently available in select regions.';
        var nonVlanRegion = factories_1.regionFactory.build({
            capabilities: ['Linodes'],
        });
        var vlanRegion = factories_1.regionFactory.build({
            capabilities: ['Linodes', 'Vlans'],
        });
        (0, regions_1.mockGetRegions)([nonVlanRegion, vlanRegion]);
        cy.visitWithLogin('/linodes/create');
        // Expand VLAN accordion, confirm VLAN availability notice is displayed and
        // that VLAN fields are disabled while no region is selected.
        ui_1.ui.accordionHeading.findByTitle('VLAN').click();
        ui_1.ui.accordion
            .findByTitle('VLAN')
            .scrollIntoView()
            .within(function () {
            cy.contains(availabilityNotice).should('be.visible');
            cy.findByLabelText('VLAN').should('be.disabled');
            cy.findByLabelText(/IPAM Address/).should('be.disabled');
        });
        // Select a region that is known not to have VLAN capability.
        pages_1.linodeCreatePage.selectRegionById(nonVlanRegion.id);
        // Confirm that VLAN fields are still disabled.
        ui_1.ui.accordion
            .findByTitle('VLAN')
            .scrollIntoView()
            .within(function () {
            cy.findByLabelText('VLAN').should('be.disabled');
            cy.findByLabelText(/IPAM Address/).should('be.disabled');
        });
    });
});
