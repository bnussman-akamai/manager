"use strict";
/**
 * @file Integration tests for VPC assign/unassign Linodes flows.
 */
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
var factories_1 = require("@src/factories");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var linodes_1 = require("support/intercepts/linodes");
var configs_1 = require("support/intercepts/configs");
var vpc_2 = require("support/constants/vpc");
describe('VPC assign/unassign flows', function () {
    var mockVPCs;
    var mockLinode;
    var mockConfig;
    before(function () {
        mockVPCs = factories_1.vpcFactory.buildList(5);
        mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        mockConfig = factories_1.linodeConfigFactory.build({
            id: (0, random_1.randomNumber)(),
        });
    });
    /*
     * - Confirms that can assign a Linode to the VPC when feature is enabled.
     */
    it('can assign Linode(s) to a VPC', function () {
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(2),
            label: (0, random_1.randomLabel)(),
            linodes: [],
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockVPCAfterSubnetCreation = factories_1.vpcFactory.build(__assign(__assign({}, mockVPC), { subnets: [mockSubnet] }));
        var mockSubnetAfterLinodeAssignment = factories_1.subnetFactory.build(__assign(__assign({}, mockSubnet), { linodes: [mockLinode] }));
        var mockVPCAfterLinodeAssignment = factories_1.vpcFactory.build(__assign(__assign({}, mockVPCAfterSubnetCreation), { subnets: [mockSubnetAfterLinodeAssignment] }));
        (0, vpc_1.mockGetVPCs)(mockVPCs).as('getVPCs');
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, []).as('getSubnets');
        (0, vpc_1.mockCreateSubnet)(mockVPC.id).as('createSubnet');
        (0, linodes_1.mockGetLinodes)([mockLinode]).as('getLinodes');
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
        cy.wait(['@createSubnet', '@getVPC', '@getSubnets', '@getLinodes']);
        // confirm that newly created subnet should now appear on VPC's detail page
        cy.findByText(mockVPC.label).should('be.visible');
        cy.findByText('Subnets (1)').should('be.visible');
        cy.findByText(mockSubnet.label).should('be.visible');
        // assign a linode to the subnet
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Subnet ".concat(mockSubnet.label))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem
            .findByTitle('Assign Linodes')
            .should('be.visible')
            .click();
        ui_1.ui.drawer
            .findByTitle("Assign Linodes to subnet: ".concat(mockSubnet.label, " (0.0.0.0/0)"))
            .should('be.visible')
            .within(function () {
            // confirm that the user is warned that a reboot is required
            cy.findByText(vpc_2.vpcAssignLinodeRebootNotice).should('be.visible');
            ui_1.ui.button
                .findByTitle('Assign Linode')
                .should('be.visible')
                .should('be.disabled');
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
            cy.findByLabelText('Linode')
                .should('be.visible')
                .click()
                .type(mockLinode.label)
                .should('have.value', mockLinode.label);
            ui_1.ui.autocompletePopper
                .findByTitle(mockLinode.label)
                .should('be.visible')
                .click();
            cy.wait('@getLinodeConfigs');
            (0, configs_1.mockCreateLinodeConfigInterfaces)(mockLinode.id, mockConfig).as('createLinodeConfigInterfaces');
            (0, vpc_1.mockGetVPC)(mockVPCAfterLinodeAssignment).as('getVPCLinodeAssignment');
            (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockSubnetAfterLinodeAssignment]).as('getSubnetsLinodeAssignment');
            ui_1.ui.button
                .findByTitle('Assign Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait([
                '@createLinodeConfigInterfaces',
                '@getVPCLinodeAssignment',
                '@getSubnetsLinodeAssignment',
            ]);
            ui_1.ui.button
                .findByTitle('Done')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.get('[data-qa-table-row="collapsible-table-headers-row"]')
            .siblings('tbody')
            .within(function () {
            // after assigning Linode(s) to a VPC, VPC page increases number in 'Linodes' column
            cy.findByText('1').should('be.visible');
        });
    });
    /*
     * - Confirms that can unassign a Linode from the VPC when feature is enabled.
     */
    it('can unassign Linode(s) from a VPC', function () {
        var _a;
        var mockSecondLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
        });
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(2),
            label: (0, random_1.randomLabel)(),
            linodes: [mockLinode, mockSecondLinode],
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            subnets: [mockSubnet],
        });
        var vpcInterface = factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
            vpc_id: mockVPC.id,
            subnet_id: mockSubnet.id,
        });
        var mockLinodeConfig = factories_1.linodeConfigFactory.build({
            interfaces: [vpcInterface],
        });
        var mockLinodeConfigInterfaces = (_a = mockLinodeConfig.interfaces) !== null && _a !== void 0 ? _a : [
            vpcInterface,
        ];
        (0, vpc_1.mockGetVPCs)(mockVPCs).as('getVPCs');
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetSubnets)(mockVPC.id, [mockSubnet]).as('getSubnets');
        (0, linodes_1.mockGetLinodes)([mockLinode, mockSecondLinode]).as('getLinodes');
        cy.visitWithLogin("/vpcs/".concat(mockVPC.id));
        cy.wait(['@getVPC', '@getSubnets', '@getLinodes']);
        // confirm that subnet should get displayed on VPC's detail page
        cy.findByText(mockVPC.label).should('be.visible');
        cy.findByText('Subnets (1)').should('be.visible');
        cy.findByText(mockSubnet.label).should('be.visible');
        // unassign a linode to the subnet
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Subnet ".concat(mockSubnet.label))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem
            .findByTitle('Unassign Linodes')
            .should('be.visible')
            .click();
        ui_1.ui.drawer
            .findByTitle("Unassign Linodes from subnet: ".concat(mockSubnet.label, " (0.0.0.0/0)"))
            .should('be.visible')
            .within(function () {
            // confirm that the user is warned that a reboot is required
            cy.findByText(vpc_2.vpcUnassignLinodeRebootNotice).should('be.visible');
            ui_1.ui.button
                .findByTitle('Unassign Linodes')
                .should('be.visible')
                .should('be.disabled');
            // confirm that unassign a single Linode from the VPC correctly
            (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockLinodeConfig]).as('getLinodeConfigs');
            cy.findByLabelText('Linodes')
                .should('be.visible')
                .click()
                .type(mockLinode.label);
            ui_1.ui.autocompletePopper
                .findByTitle(mockLinode.label)
                .should('be.visible')
                .click();
            cy.wait('@getLinodeConfigs');
            // the select option won't disappear unless click on somewhere else
            cy.findByText(vpc_2.vpcUnassignLinodeRebootNotice).click();
            // confirm that unassigned Linode(s) are displayed on the details page
            cy.findByText('Linodes to be Unassigned from Subnet (1)').should('be.visible');
            cy.findByText(mockLinode.label).should('be.visible');
            // confirm that unassign multiple Linodes from the VPC correctly
            (0, configs_1.mockGetLinodeConfigs)(mockSecondLinode.id, [mockLinodeConfig]).as('getLinodeConfigs');
            cy.findByText('Linodes')
                .should('be.visible')
                .click()
                .type(mockSecondLinode.label);
            cy.findByText(mockSecondLinode.label).should('be.visible').click();
            cy.wait('@getLinodeConfigs');
            // confirm that unassigned Linode(s) are displayed on the details page
            cy.findByText(vpc_2.vpcUnassignLinodeRebootNotice).click();
            cy.findByText('Linodes to be Unassigned from Subnet (2)').should('be.visible');
            cy.findByText(mockSecondLinode.label).should('be.visible');
            (0, configs_1.mockDeleteLinodeConfigInterface)(mockLinode.id, mockLinodeConfig.id, mockLinodeConfigInterfaces[0].id).as('deleteLinodeConfigInterface1');
            (0, configs_1.mockDeleteLinodeConfigInterface)(mockSecondLinode.id, mockLinodeConfig.id, mockLinodeConfigInterfaces[0].id).as('deleteLinodeConfigInterface2');
            ui_1.ui.button
                .findByTitle('Unassign Linodes')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm that click on 'Unassign Linodes' button will send request to update the subnet details on the VPC page.
            cy.wait('@deleteLinodeConfigInterface1')
                .its('response.statusCode')
                .should('eq', 200);
            cy.wait('@deleteLinodeConfigInterface2')
                .its('response.statusCode')
                .should('eq', 200);
        });
    });
});
