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
var factories_1 = require("@src/factories");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var constants_1 = require("src/features/VPCs/constants");
// TODO Remove feature flag mocks when feature flag is removed from codebase.
describe('VPC landing page', function () {
    /*
     * - Confirms that VPCs are listed on the VPC landing page.
     */
    it('lists VPC instances', function () {
        var mockVPCs = factories_1.vpcFactory.buildList(5);
        (0, vpc_1.mockGetVPCs)(mockVPCs).as('getVPCs');
        cy.visitWithLogin('/vpcs');
        cy.wait('@getVPCs');
        // Confirm each VPC is listed with expected data.
        mockVPCs.forEach(function (mockVPC) {
            var regionLabel = (0, regions_1.getRegionById)(mockVPC.region).label;
            cy.findByText(mockVPC.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(regionLabel).should('be.visible');
                ui_1.ui.button
                    .findByTitle('Edit')
                    .should('be.visible')
                    .should('be.enabled');
                ui_1.ui.button
                    .findByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled');
            });
        });
    });
    /*
     * - Confirms VPC landing page empty state is shown when no VPCs are present.
     */
    it('shows empty state when there are no VPCs', function () {
        (0, vpc_1.mockGetVPCs)([]).as('getVPCs');
        cy.visitWithLogin('/vpcs');
        cy.wait('@getVPCs');
        // Confirm that empty state is shown and that each section is present.
        cy.findByText(constants_1.VPC_LABEL).should('be.visible');
        cy.findByText('Create a private and isolated network').should('be.visible');
        cy.findByText('Getting Started Guides').should('be.visible');
        // Create button exists and navigates user to create page.
        ui_1.ui.button
            .findByTitle('Create VPC')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/vpcs/create');
    });
    /*
     * - Confirms that VPCs can be updated from the VPC landing page.
     * - Confirms that VPC landing page updates to reflected update VPC data.
     * - Confirms VPC deletion flow from landing page using mocked data and API responses.
     * - Confirms landing page automatically updates to reflect deleted VPCs.
     * - Confirms landing page reverts to its empty state when last VPC is deleted.
     */
    it('can update and delete VPCs from VPC landing page', function () {
        var mockVPCs = [
            factories_1.vpcFactory.build({
                label: (0, random_1.randomLabel)(),
                region: (0, regions_1.chooseRegion)().id,
                description: (0, random_1.randomPhrase)(),
            }),
            factories_1.vpcFactory.build({
                label: (0, random_1.randomLabel)(),
                region: (0, regions_1.chooseRegion)().id,
                description: (0, random_1.randomPhrase)(),
            }),
        ];
        var mockUpdatedVPC = __assign(__assign({}, mockVPCs[1]), { label: (0, random_1.randomLabel)(), description: (0, random_1.randomPhrase)() });
        (0, vpc_1.mockGetVPCs)([mockVPCs[1]]).as('getVPCs');
        (0, vpc_1.mockUpdateVPC)(mockVPCs[1].id, mockUpdatedVPC).as('updateVPC');
        cy.visitWithLogin('/vpcs');
        cy.wait('@getVPCs');
        // Find mocked VPC and click its "Edit" button.
        cy.findByText(mockVPCs[1].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button.findByTitle('Edit').should('be.visible').click();
        });
        // Confirm correct information is shown and update label and description.
        (0, vpc_1.mockGetVPCs)([mockUpdatedVPC]).as('getVPCs');
        ui_1.ui.drawer
            .findByTitle('Edit VPC')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label')
                .should('be.visible')
                .should('have.value', mockVPCs[1].label)
                .clear()
                .type(mockUpdatedVPC.label);
            cy.findByLabelText('Description')
                .should('be.visible')
                .should('have.value', mockVPCs[1].description)
                .clear()
                .type(mockUpdatedVPC.description);
            // TODO Add interactions/assertions for region selection once feature is available.
            ui_1.ui.button
                .findByTitle('Save')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that updated VPC information is shown on the landing page and
        // in the "Edit" drawer.
        cy.wait(['@updateVPC', '@getVPCs']);
        cy.findByText(mockVPCs[1].label).should('not.exist');
        cy.findByText(mockUpdatedVPC.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button.findByTitle('Edit').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle('Edit VPC')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label')
                .should('be.visible')
                .should('have.value', mockUpdatedVPC.label);
            cy.findByLabelText('Description')
                .should('be.visible')
                .should('have.value', mockUpdatedVPC.description);
        });
        // Delete VPCs Flow
        (0, vpc_1.mockGetVPCs)(mockVPCs).as('getVPCs');
        (0, vpc_1.mockDeleteVPC)(mockVPCs[0].id).as('deleteVPC');
        cy.visitWithLogin('/vpcs');
        cy.wait('@getVPCs');
        // Delete the first VPC instance
        cy.findByText(mockVPCs[0].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Complete type-to-confirm dialog.
        ui_1.ui.dialog
            .findByTitle("Delete VPC ".concat(mockVPCs[0].label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('VPC Label')
                .should('be.visible')
                .click()
                .type(mockVPCs[0].label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that toast notification appears and VPC is removed from landing page.
        cy.wait(['@deleteVPC', '@getVPCs']);
        ui_1.ui.toast.assertMessage('VPC deleted successfully.');
        cy.findByText(mockVPCs[0].label).should('not.exist');
        // Delete the second VPC instance
        (0, vpc_1.mockDeleteVPC)(mockVPCs[1].id).as('deleteVPC');
        (0, vpc_1.mockGetVPCs)([]).as('getVPCs');
        cy.findByText(mockVPCs[1].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Complete type-to-confirm dialog.
        ui_1.ui.dialog
            .findByTitle("Delete VPC ".concat(mockVPCs[1].label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('VPC Label')
                .should('be.visible')
                .click()
                .type(mockVPCs[1].label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that toast notification appears and VPC is removed from landing page.
        cy.wait(['@deleteVPC', '@getVPCs']);
        ui_1.ui.toast.assertMessage('VPC deleted successfully.');
        cy.findByText(mockVPCs[1].label).should('not.exist');
        // Confirm that landing page reverts to its empty state.
        cy.findByText('Create a private and isolated network').should('be.visible');
    });
    /**
     * Confirms UI handles errors gracefully when attempting to delete a VPC
     */
    it('cannot delete a VPC with linodes assigned to it', function () {
        var subnet = factories_1.subnetFactory.build();
        var mockVPCs = [
            factories_1.vpcFactory.build({
                label: (0, random_1.randomLabel)(),
                region: (0, regions_1.chooseRegion)().id,
                subnets: [subnet],
            }),
            factories_1.vpcFactory.build({
                label: (0, random_1.randomLabel)(),
                region: (0, regions_1.chooseRegion)().id,
            }),
        ];
        (0, vpc_1.mockGetVPCs)(mockVPCs).as('getVPCs');
        (0, vpc_1.mockDeleteVPCError)(mockVPCs[0].id).as('deleteVPCError');
        cy.visitWithLogin('/vpcs');
        cy.wait('@getVPCs');
        // Try to delete VPC
        cy.findByText(mockVPCs[0].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Complete type-to-confirm dialog.
        ui_1.ui.dialog
            .findByTitle("Delete VPC ".concat(mockVPCs[0].label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('VPC Label')
                .should('be.visible')
                .click()
                .type(mockVPCs[0].label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that VPC doesn't get deleted and that an error appears
        cy.wait(['@deleteVPCError']);
        cy.findByText(vpc_1.MOCK_DELETE_VPC_ERROR).should('be.visible');
        // close Delete dialog for this VPC and open it up for the second VPC to confirm that error message does not persist
        ui_1.ui.dialog
            .findByTitle("Delete VPC ".concat(mockVPCs[0].label))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByText(mockVPCs[1].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByText(vpc_1.MOCK_DELETE_VPC_ERROR).should('not.exist');
    });
});
