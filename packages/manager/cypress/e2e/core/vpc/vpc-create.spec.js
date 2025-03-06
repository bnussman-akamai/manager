"use strict";
/**
 * @file Integration tests for VPC create flow.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var regions_1 = require("support/intercepts/regions");
var vpc_1 = require("support/intercepts/vpc");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var arrays_1 = require("support/util/arrays");
var utils_1 = require("src/features/VPCs/utils");
var regions_2 = require("support/util/regions");
/**
 * Gets the "Add another Subnet" section with the given index.
 *
 * @returns Cypress chainable.
 */
var getSubnetNodeSection = function (index) {
    return cy.get("[data-qa-subnet-node=\"".concat(index, "\"]"));
};
describe('VPC create flow', function () {
    /*
     * - Confirms VPC creation flow using mock API data.
     * - Confirms that users can create and delete subnets.
     * - Confirms client side validation when entering invalid IP ranges.
     * - Confirms that UI handles API errors gracefully.
     * - Confirms that UI redirects to created VPC page after creating a VPC.
     */
    it('can create a VPC', function () {
        var mockVPCRegion = (0, regions_2.extendRegion)(factories_1.regionFactory.build({
            capabilities: ['VPCs'],
        }));
        var mockSubnets = (0, arrays_1.buildArray)(3, function (index) {
            return factories_1.subnetFactory.build({
                label: (0, random_1.randomLabel)(),
                id: (0, random_1.randomNumber)(10000, 99999),
                ipv4: "".concat((0, random_1.randomIp)(), "/").concat((0, random_1.randomNumber)(0, 32)),
                linodes: factories_1.linodeFactory.buildList(index + 1),
            });
        });
        var mockSubnetToDelete = factories_1.subnetFactory.build();
        var mockInvalidIpRange = "".concat((0, random_1.randomIp)(), "/").concat((0, random_1.randomNumber)(33, 100));
        var mockVpc = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(10000, 99999),
            label: (0, random_1.randomLabel)(),
            region: mockVPCRegion.id,
            description: (0, random_1.randomPhrase)(),
            subnets: mockSubnets,
        });
        var ipValidationErrorMessage1 = 'A subnet must have an IPv4 range.';
        var ipValidationErrorMessage2 = 'The IPv4 range must be in CIDR format.';
        var vpcCreationErrorMessage = 'An unknown error has occurred.';
        var totalSubnetUniqueLinodes = (0, utils_1.getUniqueLinodesFromSubnets)(mockSubnets);
        (0, regions_1.mockGetRegions)([mockVPCRegion]).as('getRegions');
        cy.visitWithLogin('/vpcs/create');
        cy.wait('@getRegions');
        ui_1.ui.regionSelect.find().click().type("".concat(mockVPCRegion.label, "{enter}"));
        cy.findByText('VPC Label').should('be.visible').click().type(mockVpc.label);
        cy.findByText('Description')
            .should('be.visible')
            .click()
            .type(mockVpc.description);
        // Fill out the first Subnet.
        // Insert an invalid empty IP range to confirm client side validation.
        getSubnetNodeSection(0)
            .should('be.visible')
            .within(function () {
            cy.findByText('Subnet Label')
                .should('be.visible')
                .click()
                .type(mockSubnets[0].label);
            cy.findByText('Subnet IP Address Range')
                .should('be.visible')
                .click()
                .type("{selectAll}{backspace}");
        });
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText(ipValidationErrorMessage1).should('be.visible');
        // Enter a random non-IP address string to further test client side validation.
        cy.findByText('Subnet IP Address Range')
            .should('be.visible')
            .click()
            .type("{selectAll}{backspace}")
            .type((0, random_1.randomString)(18));
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText(ipValidationErrorMessage2).should('be.visible');
        // Enter a valid IP address with an invalid network prefix to further test client side validation.
        cy.findByText('Subnet IP Address Range')
            .should('be.visible')
            .click()
            .type("{selectAll}{backspace}")
            .type(mockInvalidIpRange);
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.findByText(ipValidationErrorMessage2).should('be.visible');
        // Replace invalid IP address range with valid range.
        cy.findByText('Subnet IP Address Range')
            .should('be.visible')
            .click()
            .type("{selectAll}{backspace}")
            .type(mockSubnets[0].ipv4);
        // Add another subnet that we will remove later.
        ui_1.ui.button
            .findByTitle('Add another Subnet')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out subnet section, but leave label blank, then attempt to create
        // VPC with missing subnet label.
        getSubnetNodeSection(1)
            .should('be.visible')
            .within(function () {
            cy.findByText('Subnet IP Address Range')
                .should('be.visible')
                .click()
                .type("{selectAll}{backspace}")
                .type(mockSubnetToDelete.ipv4);
        });
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm that label validation message is displayed, then remove the
        // subnet and confirm that UI responds accordingly.
        getSubnetNodeSection(1)
            .should('be.visible')
            .within(function () {
            cy.findByText('Label must be between 1 and 64 characters.').should('be.visible');
            // Delete subnet.
            cy.findByLabelText('Remove Subnet 1')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        getSubnetNodeSection(1).should('not.exist');
        cy.findByText(mockSubnetToDelete.label).should('not.exist');
        // Continue adding remaining subnets.
        mockSubnets.slice(1).forEach(function (mockSubnet, index) {
            ui_1.ui.button
                .findByTitle('Add another Subnet')
                .should('be.visible')
                .should('be.enabled')
                .click();
            getSubnetNodeSection(index + 1)
                .should('be.visible')
                .within(function () {
                cy.findByText('Subnet Label')
                    .should('be.visible')
                    .click()
                    .type(mockSubnet.label);
                cy.findByText('Subnet IP Address Range')
                    .should('be.visible')
                    .click()
                    .type("{selectAll}{backspace}")
                    .type("".concat((0, random_1.randomIp)(), "/").concat((0, random_1.randomNumber)(0, 32)));
            });
        });
        // Click "Create VPC", mock an HTTP 500 error and confirm UI displays the message.
        (0, vpc_1.mockCreateVPCError)(vpcCreationErrorMessage).as('createVPC');
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createVPC');
        cy.findByText(vpcCreationErrorMessage).should('be.visible');
        // Click "Create VPC", mock a successful response and confirm that Cloud
        // redirects to the VPC details page for the new VPC.
        (0, vpc_1.mockCreateVPC)(mockVpc).as('createVPC');
        (0, vpc_1.mockGetSubnets)(mockVpc.id, mockVpc.subnets).as('getSubnets');
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createVPC');
        cy.url().should('endWith', "/vpcs/".concat(mockVpc.id));
        cy.wait('@getSubnets');
        // Confirm that new VPC information is displayed on details page as expected.
        cy.findByText(mockVpc.label).should('be.visible');
        cy.get('[data-qa-vpc-summary]')
            .should('be.visible')
            .within(function () {
            cy.contains("Subnets ".concat(mockVpc.subnets.length)).should('be.visible');
            cy.contains("Linodes ".concat(totalSubnetUniqueLinodes)).should('be.visible');
            cy.contains("VPC ID ".concat(mockVpc.id)).should('be.visible');
            cy.contains("Region ".concat(mockVPCRegion.label)).should('be.visible');
        });
        mockSubnets.forEach(function (mockSubnet) {
            cy.findByText(mockSubnet.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(mockSubnet.id).should('be.visible');
                cy.findByText(mockSubnet.ipv4).should('be.visible');
                cy.findByText(mockSubnet.linodes.length).should('be.visible');
            });
        });
    });
    /*
     * - Confirms VPC creation flow without creating subnets using mock API data.
     * - Confirms that users can delete the pre-existing subnet in the create form.
     * - Confirms that "Add another Subnet" button label updates to reflect no subnets.
     * - Confirms that Cloud Manager UI responds accordingly when creating a VPC without subnets.
     */
    it('can create a VPC without any subnets', function () {
        var mockVPCRegion = (0, regions_2.extendRegion)(factories_1.regionFactory.build({
            capabilities: ['VPCs'],
        }));
        var mockVpc = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(10000, 99999),
            label: (0, random_1.randomLabel)(),
            region: mockVPCRegion.id,
            description: (0, random_1.randomPhrase)(),
            subnets: [],
        });
        var totalSubnetUniqueLinodes = (0, utils_1.getUniqueLinodesFromSubnets)([]);
        (0, regions_1.mockGetRegions)([mockVPCRegion]).as('getRegions');
        cy.visitWithLogin('/vpcs/create');
        cy.wait('@getRegions');
        ui_1.ui.regionSelect.find().click().type("".concat(mockVPCRegion.label, "{enter}"));
        cy.findByText('VPC Label').should('be.visible').click().type(mockVpc.label);
        // Remove the subnet.
        getSubnetNodeSection(0)
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Remove Subnet 0')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that subnet button label is "Add a Subnet" when there are no
        // subnets.
        (0, vpc_1.mockCreateVPC)(mockVpc).as('createVpc');
        (0, vpc_1.mockGetSubnets)(mockVpc.id, []).as('getSubnets');
        ui_1.ui.button
            .findByTitle('Add a Subnet')
            .should('be.visible')
            .should('be.enabled');
        cy.findByText('Add another Subnet').should('not.exist');
        // Create the VPC and confirm the user is redirected to the details page.
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createVpc');
        cy.url().should('endWith', "/vpcs/".concat(mockVpc.id));
        cy.wait('@getSubnets');
        // Confirm that the expected VPC information is shown, and that no Subnets
        // are listed in the table.
        cy.get('[data-qa-vpc-summary]')
            .should('be.visible')
            .within(function () {
            cy.contains("Subnets ".concat(mockVpc.subnets.length)).should('be.visible');
            cy.contains("Linodes ".concat(totalSubnetUniqueLinodes)).should('be.visible');
            cy.contains("VPC ID ".concat(mockVpc.id)).should('be.visible');
            cy.contains("Region ".concat(mockVPCRegion.label)).should('be.visible');
        });
        cy.findByText('No Subnets are assigned.').should('be.visible');
    });
});
