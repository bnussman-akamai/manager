"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var factories_1 = require("src/factories");
var factories_2 = require("src/factories");
var ui_1 = require("support/ui/");
var regions_1 = require("support/intercepts/regions");
var placement_groups_1 = require("support/intercepts/placement-groups");
var random_1 = require("support/util/random");
var regions_2 = require("support/util/regions");
var constants_1 = require("src/features/PlacementGroups/constants");
var mockAccount = factories_1.accountFactory.build();
describe('Placement Group create flow', function () {
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount);
    });
    /*
     * - Confirms Placement Group create UI flow using mock API data.
     * - Confirms that outgoing Placement Group create request contains expected data.
     * - Confirms that Cloud automatically updates to list new Placement Group on landing page.
     */
    it('can create Placement Group', function () {
        var mockRegions = factories_2.regionFactory.buildList(5, {
            placement_group_limits: {
                maximum_pgs_per_customer: (0, random_1.randomNumber)(),
            },
            capabilities: [
                'Linodes',
                'NodeBalancers',
                'Block Storage',
                'Object Storage',
                'Kubernetes',
                'Cloud Firewall',
                'Placement Group',
                'Vlans',
                'Premium Plans',
            ],
        });
        var mockPlacementGroupRegion = (0, regions_2.chooseRegion)({
            regions: mockRegions,
            capabilities: ['Placement Group'],
        });
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupRegion.id,
            placement_group_type: 'anti_affinity:local',
            placement_group_policy: 'strict',
            is_compliant: true,
        });
        var placementGroupLimitMessage = "Maximum placement groups in region: ".concat(mockPlacementGroupRegion.placement_group_limits.maximum_pgs_per_customer);
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, placement_groups_1.mockGetPlacementGroups)([]).as('getPlacementGroups');
        (0, placement_groups_1.mockCreatePlacementGroup)(mockPlacementGroup).as('createPlacementGroup');
        cy.visitWithLogin('/placement-groups');
        cy.wait('@getPlacementGroups');
        ui_1.ui.button
            .findByTitle('Create Placement Group')
            .should('be.visible')
            .should('be.enabled')
            .click();
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]).as('getPlacementGroups');
        ui_1.ui.drawer
            .findByTitle('Create Placement Group')
            .should('be.visible')
            .within(function () {
            // Confirm that create button is disabled before user selects region, etc.
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Placement Group')
                .should('be.disabled');
            // Enter label, select region, and submit form.
            cy.findByLabelText('Label').type(mockPlacementGroup.label);
            cy.findByLabelText('Region')
                .click()
                .type("".concat(mockPlacementGroupRegion.label, "{enter}"));
            cy.findByText(placementGroupLimitMessage).should('be.visible');
            cy.findByText(constants_1.CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE).should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Placement Group')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Wait for outgoing API request and confirm that payload contains
        // the options/data chosen by the user.
        cy.wait('@createPlacementGroup').then(function (xhr) {
            var _a;
            var requestPayload = (_a = xhr.request) === null || _a === void 0 ? void 0 : _a.body;
            expect(requestPayload['placement_group_type']).to.equal('anti_affinity:local');
            expect(requestPayload['placement_group_policy']).to.equal('strict');
            expect(requestPayload['label']).to.equal(mockPlacementGroup.label);
            expect(requestPayload['region']).to.equal(mockPlacementGroupRegion.id);
        });
        ui_1.ui.toast.assertMessage("Placement Group ".concat(mockPlacementGroup.label, " successfully created."));
        // Confirm that Cloud automatically updates to list the new Placement Group,
        // and that the expected information is displayed.
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Anti-affinity').should('be.visible');
            cy.findByText('Strict').should('be.visible');
            cy.findByText(mockPlacementGroupRegion.label).should('be.visible');
            cy.findByText('Non-compliant').should('not.exist');
        });
    });
});
