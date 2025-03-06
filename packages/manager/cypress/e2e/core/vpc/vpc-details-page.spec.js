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
var vpc_1 = require("support/intercepts/vpc");
var configs_1 = require("support/intercepts/configs");
var linodes_1 = require("support/intercepts/linodes");
var factories_1 = require("@src/factories");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var regions_2 = require("support/util/regions");
var ui_1 = require("support/ui");
var constants_1 = require("src/features/VPCs/constants");
describe('VPC details page', function () {
    /**
     * - Confirms that VPC details pages can be visited.
     * - Confirms that VPC details pages show VPC information.
     * - Confirms UI flow when editing a VPC from details page.
     * - Confirms UI flow when deleting a VPC from details page.
     */
    it('can edit and delete a VPC from the VPC details page', function () {
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockVPCUpdated = __assign(__assign({}, mockVPC), { label: (0, random_1.randomLabel)(), description: (0, random_1.randomPhrase)() });
        var vpcRegion = (0, regions_2.getRegionById)(mockVPC.region);
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockUpdateVPC)(mockVPC.id, mockVPCUpdated).as('updateVPC');
        (0, vpc_1.mockDeleteVPC)(mockVPC.id).as('deleteVPC');
        cy.visitWithLogin("/vpcs/".concat(mockVPC.id));
        cy.wait('@getVPC');
        // Confirm that VPC details are displayed.
        cy.findByText(mockVPC.label).should('be.visible');
        cy.findByText(vpcRegion.label).should('be.visible');
        // Confirm that VPC can be updated and that page reflects changes.
        ui_1.ui.button
            .findByTitle('Edit')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Edit VPC')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label')
                .should('be.visible')
                .click()
                .clear()
                .type(mockVPCUpdated.label);
            cy.findByLabelText('Description')
                .should('be.visible')
                .click()
                .clear()
                .type(mockVPCUpdated.description);
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@updateVPC');
        cy.findByText(mockVPCUpdated.label).should('be.visible');
        cy.findByText(mockVPCUpdated.description).should('be.visible');
        // Confirm that VPC can be deleted and user is redirected to landing page.
        ui_1.ui.button
            .findByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.dialog
            .findByTitle("Delete VPC ".concat(mockVPCUpdated.label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('VPC Label')
                .should('be.visible')
                .click()
                .type(mockVPCUpdated.label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        (0, vpc_1.mockGetVPCs)([]).as('getVPCs');
        cy.wait(['@deleteVPC', '@getVPCs']);
        // Confirm that user is redirected to VPC landing page.
        cy.url().should('endWith', '/vpcs');
        cy.findByText('Create a private and isolated network');
    });
    /**
     * - Confirms UI flow when creating a subnet on a VPC's detail page.
     * - Confirms UI flow for editing a subnet.
     * - Confirms Subnets section and table is shown on the VPC details page.
     * - Confirms UI flow when deleting a subnet from a VPC's detail page.
     */
    it('can create, edit, and delete a subnet from the VPC details page', function () {
        // create a subnet
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            linodes: [],
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockVPCAfterSubnetCreation = factories_1.vpcFactory.build(__assign(__assign({}, mockVPC), { subnets: [mockSubnet] }));
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, []).as('getSubnets');
        (0, vpc_1.mockCreateSubnet)(mockVPC.id).as('createSubnet');
        cy.visitWithLogin("/vpcs/".concat(mockVPC.id));
        cy.wait(['@getVPC', '@getSubnets']);
        // confirm that vpc and subnet details get displayed
        cy.findByText(mockVPC.label).should('be.visible');
        cy.findByText('Subnets (0)');
        cy.findByText('No Subnets are assigned.');
        ui_1.ui.button.findByTitle('Create Subnet').should('be.visible').click();
        (0, vpc_1.mockGetVPC)(mockVPCAfterSubnetCreation).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockSubnet]).as('getSubnets');
        ui_1.ui.drawer
            .findByTitle('Create Subnet')
            .should('be.visible')
            .within(function () {
            cy.findByText('Subnet Label')
                .should('be.visible')
                .click()
                .type(mockSubnet.label);
            cy.findByTestId('create-subnet-drawer-button')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@createSubnet', '@getVPC', '@getSubnets']);
        // confirm that newly created subnet should now appear on VPC's detail page
        cy.findByText(mockVPC.label).should('be.visible');
        cy.findByText('Subnets (1)').should('be.visible');
        cy.findByText(mockSubnet.label).should('be.visible');
        // edit a subnet
        var mockEditedSubnet = factories_1.subnetFactory.build(__assign(__assign({}, mockSubnet), { label: (0, random_1.randomLabel)() }));
        var mockVPCAfterSubnetEdited = factories_1.vpcFactory.build(__assign(__assign({}, mockVPC), { subnets: [mockEditedSubnet] }));
        // confirm that subnet can be edited and that page reflects changes
        (0, vpc_1.mockEditSubnet)(mockVPC.id, mockEditedSubnet.id, mockEditedSubnet).as('editSubnet');
        (0, vpc_1.mockGetVPC)(mockVPCAfterSubnetEdited).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockEditedSubnet]).as('getSubnets');
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Subnet ".concat(mockSubnet.label))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();
        ui_1.ui.drawer
            .findByTitle('Edit Subnet')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label')
                .should('be.visible')
                .click()
                .clear()
                .type(mockEditedSubnet.label);
            cy.findByLabelText('Subnet IP Address Range')
                .should('be.visible')
                .should('not.be.enabled');
            cy.findByTestId('save-button')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that edited subnet info displays
        cy.wait(['@editSubnet', '@getVPC', '@getSubnets']);
        cy.findByText(mockVPC.label).should('be.visible');
        cy.findByText('Subnets (1)').should('be.visible');
        cy.findByText(mockEditedSubnet.label).should('be.visible');
        // delete a subnet
        var mockVPCAfterSubnetDeletion = factories_1.vpcFactory.build(__assign(__assign({}, mockVPC), { subnets: [] }));
        (0, vpc_1.mockDeleteSubnet)(mockVPC.id, mockEditedSubnet.id).as('deleteSubnet');
        // confirm that subnet can be deleted and that page reflects changes
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Subnet ".concat(mockEditedSubnet.label))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
        (0, vpc_1.mockGetVPC)(mockVPCAfterSubnetDeletion).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, []).as('getSubnets');
        ui_1.ui.dialog
            .findByTitle("Delete Subnet ".concat(mockEditedSubnet.label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Subnet Label')
                .should('be.visible')
                .click()
                .type(mockEditedSubnet.label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@deleteSubnet', '@getVPC', '@getSubnets']);
        // confirm that user should still be on VPC's detail page
        // confirm there are no remaining subnets
        cy.url().should('endWith', "/".concat(mockVPC.id));
        cy.findByText('Subnets (0)');
        cy.findByText('No Subnets are assigned.');
        cy.findByText(mockEditedSubnet.label).should('not.exist');
    });
    /**
     * - Confirms UI for Linode with a recommended config (no notice displayed)
     */
    it('does not display an unrecommended config notice for a Linode', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['VPCs'] });
        var mockInterfaceId = (0, random_1.randomNumber)();
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            linodes: [
                {
                    id: mockLinode.id,
                    interfaces: [{ id: mockInterfaceId, active: true }],
                },
            ],
            ipv4: '10.0.0.0/24',
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
            subnets: [mockSubnet],
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
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockSubnet]).as('getSubnets');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockLinodeConfig]).as('getLinodeConfigs');
        cy.visitWithLogin("/vpcs/".concat(mockVPC.id));
        cy.findByLabelText("expand ".concat(mockSubnet.label, " row")).click();
        cy.wait('@getLinodeConfigs');
        cy.findByTestId(constants_1.WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
    });
    /**
     * - Confirms UI for Linode with a config with an implicit primary VPC interface (no notice)
     */
    it('does not display an unrecommended config notice for a Linode with an implicit primary VPC', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['VPCs'] });
        var mockInterfaceId = (0, random_1.randomNumber)();
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            linodes: [
                {
                    id: mockLinode.id,
                    interfaces: [{ id: mockInterfaceId, active: true }],
                },
            ],
            ipv4: '10.0.0.0/24',
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
            subnets: [mockSubnet],
        });
        var mockInterface = factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
            id: mockInterfaceId,
            vpc_id: mockVPC.id,
            subnet_id: mockSubnet.id,
            primary: false,
            active: true,
        });
        var mockLinodeConfig = factories_1.linodeConfigFactory.build({
            interfaces: [mockInterface],
        });
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockSubnet]).as('getSubnets');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockLinodeConfig]).as('getLinodeConfigs');
        cy.visitWithLogin("/vpcs/".concat(mockVPC.id));
        cy.findByLabelText("expand ".concat(mockSubnet.label, " row")).click();
        cy.wait('@getLinodeConfigs');
        cy.findByTestId(constants_1.WARNING_ICON_UNRECOMMENDED_CONFIG).should('not.exist');
    });
    /**
     * - Confirms UI for Linode with an unrecommended config (notice displayed)
     */
    it('displays an unrecommended config notice for a Linode', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['VPCs'] });
        var mockInterfaceId = (0, random_1.randomNumber)();
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
        });
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            linodes: [
                {
                    id: mockLinode.id,
                    interfaces: [{ id: mockInterfaceId, active: true }],
                },
            ],
            ipv4: '10.0.0.0/24',
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: linodeRegion.id,
            subnets: [mockSubnet],
        });
        var mockPrimaryInterface = factories_1.LinodeConfigInterfaceFactory.build({
            primary: true,
            active: false,
            purpose: 'public',
        });
        var mockInterface = factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
            id: mockInterfaceId,
            vpc_id: mockVPC.id,
            subnet_id: mockSubnet.id,
            primary: false,
            active: true,
        });
        var mockLinodeConfig = factories_1.linodeConfigFactory.build({
            interfaces: [mockInterface, mockPrimaryInterface],
        });
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockSubnet]).as('getSubnets');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockLinodeConfig]).as('getLinodeConfigs');
        cy.visitWithLogin("/vpcs/".concat(mockVPC.id));
        cy.findByLabelText("expand ".concat(mockSubnet.label, " row")).click();
        cy.wait('@getLinodeConfigs');
        cy.findByTestId(constants_1.WARNING_ICON_UNRECOMMENDED_CONFIG).should('exist');
    });
});
