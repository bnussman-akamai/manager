"use strict";
/**
 * @file Integration tests for Placement Group update label flows.
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
var random_1 = require("support/util/random");
var placement_groups_1 = require("support/intercepts/placement-groups");
var factories_1 = require("src/factories");
var account_1 = require("support/intercepts/account");
var regions_1 = require("support/util/regions");
var ui_1 = require("support/ui");
var mockAccount = factories_1.accountFactory.build();
describe('Placement Group update label flow', function () {
    // Mock the VM Placement Groups feature flag to be enabled for each test in this block.
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount);
    });
    /**
     * - Confirms that a Placement Group's label can be updated from the landing page.
     * - Confirms that clicking "Edit" opens PG edit drawer.
     * - Only the label field is shown in the edit drawer.
     * - A new value can be entered into the label field.
     * - Confirms that Placement Groups landing page updates to reflect successful label update.
     * - Confirms a toast notification is shown upon successful label update.
     */
    it("update to a Placement Group's label is successful", function () {
        var mockPlacementGroupCompliantRegion = (0, regions_1.chooseRegion)();
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupCompliantRegion.id,
            placement_group_type: 'anti_affinity:local',
            is_compliant: true,
            placement_group_policy: 'flexible',
            members: [],
        });
        var mockPlacementGroupUpdated = __assign(__assign({}, mockPlacementGroup), { label: (0, random_1.randomLabel)() });
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]).as('getPlacementGroups');
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        (0, placement_groups_1.mockUpdatePlacementGroup)(mockPlacementGroup.id, mockPlacementGroupUpdated.label).as('updatePlacementGroupLabel');
        cy.visitWithLogin('/placement-groups');
        cy.wait(['@getPlacementGroups']);
        // Confirm that Placement Group is listed  on landing page, click "Edit" to open drawer.
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Edit').click();
        });
        // Enter new label, click "Edit".
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroupUpdated]).as('getPlacementGroups');
        cy.get('[data-qa-drawer="true"]').within(function () {
            cy.findByText('Edit').should('be.visible');
            cy.findByDisplayValue(mockPlacementGroup.label)
                .should('be.visible')
                .click()
                .type("{selectall}{backspace}".concat(mockPlacementGroupUpdated.label));
            cy.findByText('Edit').should('be.visible').click();
            cy.wait('@updatePlacementGroupLabel').then(function (intercept) {
                expect(intercept.request.body['label']).to.equal(mockPlacementGroupUpdated.label);
            });
        });
        ui_1.ui.toast.assertMessage("Placement Group ".concat(mockPlacementGroupUpdated.label, " successfully updated."));
    });
    /**
     * - Confirms that an http error is handled gracefully for Placement Group label update.
     * - A new value can be entered into the label field.
     * - Confirms an error notice is shown upon failure to label update.
     */
    it("update to a Placement Group's label fails with error message", function () {
        var mockPlacementGroupCompliantRegion = (0, regions_1.chooseRegion)();
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupCompliantRegion.id,
            placement_group_type: 'anti_affinity:local',
            is_compliant: true,
            placement_group_policy: 'flexible',
            members: [],
        });
        var mockPlacementGroupUpdated = __assign(__assign({}, mockPlacementGroup), { label: (0, random_1.randomLabel)() });
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]).as('getPlacementGroups');
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        (0, placement_groups_1.mockUpdatePlacementGroupError)(mockPlacementGroup.id, 'An unexpected error occurred.', 400).as('updatePlacementGroupLabelError');
        cy.visitWithLogin('/placement-groups');
        cy.wait(['@getPlacementGroups']);
        // Confirm that Placement Group is listed  on landing page, click "Edit" to open drawer.
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Edit').click();
        });
        // Enter new label, click "Edit".
        cy.get('[data-qa-drawer="true"]').within(function () {
            cy.findByText('Edit').should('be.visible');
            cy.findByDisplayValue(mockPlacementGroup.label)
                .should('be.visible')
                .click()
                .type("{selectall}{backspace}".concat(mockPlacementGroupUpdated.label));
            cy.findByText('Edit').should('be.visible').click();
            // Confirm error message is displayed in the drawer.
            cy.wait('@updatePlacementGroupLabelError');
            cy.findByText('An unexpected error occurred.').should('be.visible');
        });
    });
});
