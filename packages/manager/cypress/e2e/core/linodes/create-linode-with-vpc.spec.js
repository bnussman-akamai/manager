"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("src/factories");
var configs_1 = require("support/intercepts/configs");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var vpc_1 = require("support/intercepts/vpc");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
var regions_2 = require("support/util/regions");
var constants_1 = require("src/features/VPCs/constants");
var feature_flags_1 = require("support/intercepts/feature-flags");
describe('Create Linode with VPCs', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
    });
    /*
     * - Confirms UI flow to create a Linode with an existing VPC assigned using mock API data.
     * - Confirms that VPC assignment is reflected in create summary section.
     * - Confirms that outgoing API request contains expected VPC interface data.
     * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
     */
    it('can assign existing VPCs during Linode Create flow', function () {
        var linodeRegion = (0, regions_2.chooseRegion)({ capabilities: ['VPCs'] });
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            linodes: [],
            ipv4: "".concat((0, random_1.randomIp)(), "/0"),
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
            subnets: [mockSubnet],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockInterface = factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
            vpc_id: mockVPC.id,
            subnet_id: mockSubnet.id,
            primary: true,
            active: true,
        });
        var mockLinodeConfig = factories_1.linodeConfigFactory.build({
            interfaces: [mockInterface],
        });
        var mockUpdatedSubnet = __assign(__assign({}, mockSubnet), { linodes: [
                {
                    id: mockLinode.id,
                    interfaces: [{ id: mockInterface.id, active: true, config_id: 1 }],
                },
            ] });
        (0, vpc_1.mockGetVPCs)([mockVPC]).as('getVPCs');
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Confirm that mocked VPC is shown in the Autocomplete, and then select it.
        cy.findByText('Assign VPC').click();
        cy.focused().type(mockVPC.label);
        ui_1.ui.autocompletePopper
            .findByTitle(mockVPC.label)
            .should('be.visible')
            .click();
        // Confirm that VPC's subnet gets selected
        cy.findByLabelText('Subnet').should('have.value', "".concat(mockSubnet.label, " (").concat(mockSubnet.ipv4, ")"));
        // Confirm VPC assignment indicator is shown in Linode summary.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('VPC Assigned').should('be.visible');
        });
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var expectedVpcInterface = requestPayload['interfaces'][0];
            // Confirm that request payload includes VPC interface.
            expect(expectedVpcInterface['vpc_id']).to.equal(mockVPC.id);
            expect(expectedVpcInterface['ipv4']).to.be.an('object').that.is.empty;
            expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
            expect(expectedVpcInterface['purpose']).to.equal('vpc');
            // Confirm that VPC interfaces are always marked as the primary interface
            expect(expectedVpcInterface['primary']).to.equal(true);
        });
        // Confirm redirect to new Linode.
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
        // Confirm newly created Linode does not have unrecommended configuration notice
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockLinodeConfig]).as('getLinodeConfigs');
        cy.visit("/vpcs/".concat(mockVPC.id));
        cy.findByLabelText("expand ".concat(mockSubnet.label, " row")).click();
        cy.wait('@getLinodeConfigs');
        cy.findByTestId(constants_1.WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
    });
    /*
     * - Confirms UI flow to create a Linode with a new VPC assigned using mock API data.
     * - Creates a VPC and a subnet from within the Linode Create flow.
     * - Confirms that Cloud responds gracefully when VPC create API request fails.
     * - Confirms that outgoing API request contains correct VPC interface data.
     * - Confirms newly assigned Linode does not have an unrecommended config notice inside VPC
     */
    it('can assign new VPCs during Linode Create flow', function () {
        var linodeRegion = (0, regions_2.chooseRegion)({ capabilities: ['VPCs'] });
        var mockErrorMessage = 'An unknown error occurred.';
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            linodes: [],
            ipv4: '10.0.0.0/24',
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            description: (0, random_1.randomPhrase)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
            subnets: [mockSubnet],
        });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockInterface = factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
            vpc_id: mockVPC.id,
            subnet_id: mockSubnet.id,
            primary: true,
            active: true,
        });
        var mockLinodeConfig = factories_1.linodeConfigFactory.build({
            interfaces: [mockInterface],
        });
        var mockUpdatedSubnet = __assign(__assign({}, mockSubnet), { linodes: [
                {
                    id: mockLinode.id,
                    interfaces: [{ id: mockInterface.id, active: true, config_id: 1 }],
                },
            ] });
        (0, vpc_1.mockGetVPCs)([]);
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        cy.findByText('Create VPC').should('be.visible').click();
        ui_1.ui.drawer
            .findByTitle('Create VPC')
            .should('be.visible')
            .within(function () {
            pages_1.vpcCreateDrawer.setLabel(mockVPC.label);
            pages_1.vpcCreateDrawer.setDescription(mockVPC.description);
            pages_1.vpcCreateDrawer.setSubnetLabel(mockSubnet.label);
            pages_1.vpcCreateDrawer.setSubnetIpRange(mockSubnet.ipv4);
            // Confirm that unexpected API errors are handled gracefully upon
            // failed VPC creation.
            (0, vpc_1.mockCreateVPCError)(mockErrorMessage, 500).as('createVpc');
            pages_1.vpcCreateDrawer.submit();
            cy.wait('@createVpc');
            cy.findByText(mockErrorMessage).scrollIntoView();
            cy.findByText(mockErrorMessage).should('be.visible');
            // Create VPC with successful API response mocked.
            (0, vpc_1.mockCreateVPC)(mockVPC).as('createVpc');
            (0, vpc_1.mockGetVPCs)([mockVPC]);
            pages_1.vpcCreateDrawer.submit();
        });
        // Verify the VPC field gets populated
        cy.findByLabelText('Assign VPC').should('have.value', mockVPC.label);
        // Verify the subnet gets populated
        cy.findByLabelText('Subnet').should('have.value', "".concat(mockSubnet.label, " (").concat(mockSubnet.ipv4, ")"));
        // Clear the subnet value
        cy.get('[data-qa-autocomplete="Subnet"]').within(function () {
            cy.findByLabelText('Clear').click();
        });
        // Try to submit the form without a subnet selected
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Verify a validation error shows
        cy.findByText('Subnet is required.').should('be.visible');
        cy.findByLabelText('Subnet').should('be.visible').type(mockSubnet.label);
        ui_1.ui.autocompletePopper
            .findByTitle("".concat(mockSubnet.label, " (").concat(mockSubnet.ipv4, ")"))
            .should('be.visible')
            .click();
        // Check box to assign public IPv4.
        cy.findByText('Assign a public IPv4 address for this Linode')
            .should('be.visible')
            .click();
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            var expectedVpcInterface = requestPayload['interfaces'][0];
            // Confirm that request payload includes VPC interface.
            expect(expectedVpcInterface['vpc_id']).to.equal(mockVPC.id);
            expect(expectedVpcInterface['ipv4']).to.deep.equal({ nat_1_1: 'any' });
            expect(expectedVpcInterface['subnet_id']).to.equal(mockSubnet.id);
            expect(expectedVpcInterface['purpose']).to.equal('vpc');
            // Confirm that VPC interfaces are always marked as the primary interface
            expect(expectedVpcInterface['primary']).to.equal(true);
        });
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
        // Confirm newly created Linode does not have unrecommended configuration notice
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockUpdatedSubnet]).as('getSubnets');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockLinodeConfig]).as('getLinodeConfigs');
        cy.visit("/vpcs/".concat(mockVPC.id));
        cy.findByLabelText("expand ".concat(mockSubnet.label, " row")).click();
        cy.wait('@getLinodeConfigs');
        cy.findByTestId(constants_1.WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
    });
    /*
     * - Confirms UI flow when attempting to assign VPC to Linode in region without capability.
     * - Confirms that VPCs selection is disabled.
     * - Confirms that notice text is present to explain that VPCs are unavailable.
     */
    it('cannot assign VPCs to Linodes in regions without VPC capability', function () {
        var mockRegion = factories_1.regionFactory.build({
            capabilities: ['Linodes'],
        });
        var vpcNotAvailableMessage = 'VPC is not available in the selected region.';
        (0, regions_1.mockGetRegions)([mockRegion]);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.selectRegionById(mockRegion.id);
        cy.findByLabelText('Assign VPC').scrollIntoView();
        cy.findByLabelText('Assign VPC').should('be.visible').should('be.disabled');
        cy.findByText(vpcNotAvailableMessage).should('be.visible');
    });
});
