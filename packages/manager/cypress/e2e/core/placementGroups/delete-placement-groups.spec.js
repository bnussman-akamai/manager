"use strict";
/**
 * @file Cypress integration tests for VM Placement Groups deletion flows.
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
var account_1 = require("support/intercepts/account");
var placement_groups_1 = require("support/intercepts/placement-groups");
var factories_1 = require("src/factories");
var PlacementGroupsLandingEmptyStateData_1 = require("src/features/PlacementGroups/PlacementGroupsLanding/PlacementGroupsLandingEmptyStateData");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var ui_1 = require("support/ui");
var arrays_1 = require("support/util/arrays");
var linodes_1 = require("support/intercepts/linodes");
// Mock an account with 'Placement Group' capability.
var mockAccount = factories_1.accountFactory.build();
// Warning stating that Placement Group deletion is permanent.
var deletionWarning = 'Deleting a placement group is permanent and cannot be undone.';
// Warning stating that Linodes must be unassigned before Placement Group deletion.
var unassignWarning = 'You need to unassign all Linodes before deleting a placement group.';
// Landing page empty state text.
var emptyStateMessage = PlacementGroupsLandingEmptyStateData_1.headers.description;
// Error message that when an unexpected error occurs.
var PlacementGroupErrorMessage = 'An unknown error has occurred.';
describe('Placement Group deletion', function () {
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount);
    });
    /*
     * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
     * - Confirms that user is not warned or prompted to unassign Linodes when none are assigned.
     * - Confirms that UI automatically updates to reflect deleted Placement Group.
     * - Confirms that landing page reverts to its empty state when last Placement Group is deleted.
     * - Confirms that user can retry and continue with deletion when unexpected error happens.
     */
    it('can delete without Linodes assigned when unexpected error show up and retry', function () {
        var mockPlacementGroupRegion = (0, regions_1.chooseRegion)();
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            members: [],
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
        });
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]).as('getPlacementGroups');
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        cy.visitWithLogin('/placement-groups');
        cy.wait('@getPlacementGroups');
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Click "Delete" button next to the mock Placement Group, mock an HTTP 500 error and confirm UI displays the message.
        (0, placement_groups_1.mockDeletePlacementGroupError)(mockPlacementGroup.id, PlacementGroupErrorMessage).as('deletePlacementGroupError');
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Placement Group').type(mockPlacementGroup.label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@deletePlacementGroupError');
            cy.findByText(PlacementGroupErrorMessage).should('be.visible');
        });
        // Click "Delete" button next to the mock Placement Group,
        // mock a successful response and confirm that Cloud
        (0, placement_groups_1.mockDeletePlacementGroup)(mockPlacementGroup.id).as('deletePlacementGroup');
        (0, placement_groups_1.mockGetPlacementGroups)([]).as('getPlacementGroups');
        // Confirm deletion warning appears, complete Type-to-Confirm, and submit confirmation.
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.findByText(deletionWarning).should('be.visible');
            cy.findByText(unassignWarning).should('not.exist');
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that UI updates to reflect deleted Placement Group.
        cy.wait(['@deletePlacementGroup', '@getPlacementGroups']);
        ui_1.ui.toast.assertMessage("Placement Group ".concat(mockPlacementGroup.label, " successfully deleted."));
        cy.findByText(emptyStateMessage).should('be.visible');
    });
    /*
     * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
     * - Confirms deletion flow when Placement Group has one or more Linodes assigned to it.
     * - Confirms that user is prompted to unassign Linodes before being able to proceed with deletion.
     * - Confirms that UI automatically updates to reflect unassigned Linodes during deletion.
     * - Confirms that UI automatically updates to reflect deleted Placement Group.
     * - Confirms that user can retry and continue with unassignment when unexpected error happens.
     */
    it('can delete with Linodes assigned when unexpected error show up and retry', function () {
        var mockPlacementGroupRegion = (0, regions_1.chooseRegion)();
        // Linodes that are assigned to the Placement Group being deleted.
        var mockPlacementGroupLinodes = (0, arrays_1.buildArray)(3, function () {
            return factories_1.linodeFactory.build({
                label: (0, random_1.randomLabel)(),
                id: (0, random_1.randomNumber)(),
                region: mockPlacementGroupRegion.id,
            });
        });
        // Placement Group that will be deleted.
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            members: mockPlacementGroupLinodes.map(function (linode) { return ({
                linode_id: linode.id,
                is_compliant: true,
            }); }),
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
        });
        // Second unrelated Placement Group to verify landing page content after deletion.
        var secondMockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            members: [],
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
        });
        (0, linodes_1.mockGetLinodes)(mockPlacementGroupLinodes).as('getLinodes');
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup, secondMockPlacementGroup]).as('getPlacementGroups');
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        cy.visitWithLogin('/placement-groups');
        cy.wait(['@getPlacementGroups']);
        // Click "Delete" button next to the mock Placement Group, and initially mock
        // an API error response and confirm that the error message is displayed in the
        // deletion modal.
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        (0, placement_groups_1.mockUnassignPlacementGroupLinodesError)(mockPlacementGroup.id, PlacementGroupErrorMessage).as('UnassignPlacementGroupError');
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.get('[data-qa-selection-list]').within(function () {
                // Select the first Linode to unassign
                var mockLinodeToUnassign = mockPlacementGroupLinodes[0];
                cy.findByText(mockLinodeToUnassign.label)
                    .should('be.visible')
                    .closest('li')
                    .within(function () {
                    ui_1.ui.button
                        .findByTitle('Unassign')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
            });
            cy.wait('@UnassignPlacementGroupError');
            cy.findByText(PlacementGroupErrorMessage).should('be.visible');
        });
        // Confirm deletion warning appears and that form cannot be submitted
        // while Linodes are assigned.
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.findByText(deletionWarning).should('be.visible');
            cy.findByText(unassignWarning).should('be.visible');
            // Confirm that type-to-confirm and submit button are disabled while
            // Linodes remain assigned.
            cy.findByLabelText('Placement Group').should('be.disabled');
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.disabled');
            // Unassign each Linode.
            cy.get('[data-qa-selection-list]').within(function () {
                mockPlacementGroupLinodes.forEach(function (mockLinode, i) {
                    // Update Placement Group mock to reflect each unassignment.
                    var placementGroupAfterUnassignment = __assign(__assign({}, mockPlacementGroup), { members: mockPlacementGroup.members.slice(i + 1) });
                    (0, placement_groups_1.mockUnassignPlacementGroupLinodes)(mockPlacementGroup.id, placementGroupAfterUnassignment).as('unassignLinode');
                    (0, placement_groups_1.mockGetPlacementGroups)([
                        placementGroupAfterUnassignment,
                        secondMockPlacementGroup,
                    ]).as('getPlacementGroups');
                    (0, placement_groups_1.mockGetPlacementGroup)(placementGroupAfterUnassignment).as('getPlacementGroups');
                    cy.findByText(mockLinode.label)
                        .should('be.visible')
                        .closest('li')
                        .within(function () {
                        ui_1.ui.button
                            .findByTitle('Unassign')
                            .should('be.visible')
                            .should('be.enabled')
                            .click();
                    });
                    cy.wait(['@unassignLinode']);
                    cy.findByText(mockLinode.label).should('not.exist');
                });
            });
            // Confirm that Type-to-Confirm is now enabled, enter label, and submit.
            cy.findByLabelText('Placement Group')
                .should('be.enabled')
                .type(mockPlacementGroup.label);
            (0, placement_groups_1.mockDeletePlacementGroup)(mockPlacementGroup.id).as('deletePlacementGroup');
            (0, placement_groups_1.mockGetPlacementGroups)([secondMockPlacementGroup]).as('getPlacementGroups');
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@deletePlacementGroup', '@getPlacementGroups']);
        ui_1.ui.toast.assertMessage("Placement Group ".concat(mockPlacementGroup.label, " successfully deleted."));
        // Confirm that deleted Placement Group has been removed from list and that
        // other Placement Group remains.
        cy.findByText(mockPlacementGroup.label).should('not.exist');
        cy.findByText(secondMockPlacementGroup.label).should('be.visible');
    });
    /*
     * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
     * - Confirms that user is not warned or prompted to unassign Linodes when none are assigned.
     * - Confirms that UI automatically updates to reflect deleted Placement Group.
     * - Confirms that landing page reverts to its empty state when last Placement Group is deleted.
     * - Confirms that user can close and reopen the dialog when unexpected error happens.
     */
    it('can delete without Linodes assigned when unexpected error show up and reopen the dialog', function () {
        var mockPlacementGroupRegion = (0, regions_1.chooseRegion)();
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            members: [],
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
        });
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]).as('getPlacementGroups');
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        cy.visitWithLogin('/placement-groups');
        cy.wait('@getPlacementGroups');
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Click "Delete" button next to the mock Placement Group, mock an HTTP 500 error and confirm UI displays the message.
        (0, placement_groups_1.mockDeletePlacementGroupError)(mockPlacementGroup.id, PlacementGroupErrorMessage).as('deletePlacementGroupError');
        // The dialog can be closed after an unexpect error show up
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Placement Group').type(mockPlacementGroup.label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@deletePlacementGroupError');
            cy.findByText(PlacementGroupErrorMessage).should('be.visible');
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label)).should('not.exist');
        // Click "Delete" button next to the mock Placement Group,
        // mock a successful response and confirm that Cloud
        (0, placement_groups_1.mockDeletePlacementGroup)(mockPlacementGroup.id).as('deletePlacementGroup');
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        (0, placement_groups_1.mockGetPlacementGroups)([]).as('getPlacementGroups');
        // Confirm deletion warning appears, complete Type-to-Confirm, and submit confirmation.
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            // ensure error message not exist when reopening the dialog
            cy.findByText(PlacementGroupErrorMessage).should('not.exist');
            cy.findByLabelText('Placement Group').type(mockPlacementGroup.label);
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
    });
    /*
     * - Confirms UI flow for Placement Group deletion from landing page using mock API data.
     * - Confirms deletion flow when Placement Group has one or more Linodes assigned to it.
     * - Confirms that user is prompted to unassign Linodes before being able to proceed with deletion.
     * - Confirms that user can close and reopen the dialog when unexpected error happens.
     */
    it('can unassign Linode when unexpected error show up and reopen the dialog', function () {
        var mockPlacementGroupRegion = (0, regions_1.chooseRegion)();
        // Linodes that are assigned to the Placement Group being deleted.
        var mockPlacementGroupLinodes = (0, arrays_1.buildArray)(3, function () {
            return factories_1.linodeFactory.build({
                label: (0, random_1.randomLabel)(),
                id: (0, random_1.randomNumber)(),
                region: mockPlacementGroupRegion.id,
            });
        });
        // Placement Group that will be deleted.
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            members: mockPlacementGroupLinodes.map(function (linode) { return ({
                linode_id: linode.id,
                is_compliant: true,
            }); }),
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
        });
        // Second unrelated Placement Group to verify landing page content after deletion.
        var secondMockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            members: [],
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
        });
        (0, linodes_1.mockGetLinodes)(mockPlacementGroupLinodes).as('getLinodes');
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup, secondMockPlacementGroup]).as('getPlacementGroups');
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        cy.visitWithLogin('/placement-groups');
        cy.wait(['@getPlacementGroups']);
        // Click "Delete" button next to the mock Placement Group.
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Click "Delete" button next to the mock Placement Group, mock an HTTP 500 error and confirm UI displays the message.
        (0, placement_groups_1.mockUnassignPlacementGroupLinodesError)(mockPlacementGroup.id, PlacementGroupErrorMessage).as('UnassignPlacementGroupError');
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.get('[data-qa-selection-list]').within(function () {
                // Select the first Linode to unassign
                var mockLinodeToUnassign = mockPlacementGroupLinodes[0];
                cy.findByText(mockLinodeToUnassign.label)
                    .should('be.visible')
                    .closest('li')
                    .within(function () {
                    ui_1.ui.button
                        .findByTitle('Unassign')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
            });
            cy.wait('@UnassignPlacementGroupError');
            cy.findByText(PlacementGroupErrorMessage).should('be.visible');
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label)).should('not.exist');
        // Click "Delete" button next to the mock Placement Group to reopen the dialog.
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that the error message from the previous attempt is no longer present.
        ui_1.ui.dialog
            .findByTitle("Delete Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.findByText(PlacementGroupErrorMessage).should('not.exist');
        });
    });
});
