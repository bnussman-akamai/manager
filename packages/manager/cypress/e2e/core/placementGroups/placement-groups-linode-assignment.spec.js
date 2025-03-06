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
var account_1 = require("support/intercepts/account");
var linodes_1 = require("support/intercepts/linodes");
var placement_groups_1 = require("support/intercepts/placement-groups");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var arrays_1 = require("support/util/arrays");
var random_1 = require("support/util/random");
var regions_2 = require("support/util/regions");
var mockAccount = factories_1.accountFactory.build();
var mockRegions = factories_1.regionFactory.buildList(10, {
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
    placement_group_limits: {
        maximum_linodes_per_pg: 10,
        maximum_pgs_per_customer: 5,
    },
});
describe('Placement Groups Linode assignment', function () {
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
    });
    /*
     * - Confirms Placement Group Linode assignment UI flow using mock API data.
     * - Confirms that no Linodes are listed when Placement Group has no assigned Linodes.
     * - Confirms that Cloud handles API errors gracefully upon failed Linode assignment.
     * - Confirms that Placement Group details page updates its content upon successful assignment.
     * - Confirms that assigned Linode is listed and clicking its label navigates to its details page.
     */
    it('can assign a Linode', function () {
        var mockPlacementGroupRegion = (0, regions_2.chooseRegion)({ regions: mockRegions });
        var mockLinodes = (0, arrays_1.buildArray)(5, function (i) {
            return factories_1.linodeFactory.build({
                id: (0, random_1.randomNumber)(i * 100, i * 100 + 50),
                label: (0, random_1.randomLabel)(),
                region: mockPlacementGroupRegion.id,
                status: 'running',
            });
        });
        var mockLinode = mockLinodes[0];
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupRegion.id,
            members: [],
            is_compliant: true,
        });
        var mockPlacementGroupWithLinode = __assign(__assign({}, mockPlacementGroup), { members: [{ is_compliant: true, linode_id: mockLinode.id }] });
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, linodes_1.mockGetLinodes)(mockLinodes);
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]);
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        cy.visitWithLogin("/placement-groups/".concat(mockPlacementGroup.id));
        cy.wait('@getPlacementGroup');
        // Confirm that no assigned Linodes are listed for the Placement Group, then
        // click the assignment button.
        cy.findByText('0 of 10').should('be.visible');
        cy.findByText('No data to display.').should('be.visible');
        ui_1.ui.button
            .findByTitle('Assign Linode to Placement Group')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out assignment form and click submit.
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroupWithLinode).as('getPlacementGroup');
        (0, placement_groups_1.mockAssignPlacementGroupLinodesError)(mockPlacementGroup.id).as('assignLinode');
        ui_1.ui.drawer
            .findByTitle("Assign Linodes to Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            // Confirm that Assign button is disabled before selecting Linode.
            ui_1.ui.button
                .findByTitle('Assign Linode')
                .should('be.visible')
                .should('be.disabled');
            cy.findByLabelText("Linodes in ".concat(mockPlacementGroupRegion.label, " (").concat(mockPlacementGroupRegion.id, ")")).type(mockLinode.label);
            ui_1.ui.autocomplete.find().should('be.visible');
            ui_1.ui.autocompletePopper
                .findByTitle(mockLinode.label)
                .should('be.visible')
                .click();
            ui_1.ui.button.findByTitle('Assign Linode').should('be.enabled').click();
            // Confirm that initial attempt error message is displayed to the user.
            // Then re-submit with a successful response.
            cy.findByText('An error has occurred').should('be.visible');
            (0, placement_groups_1.mockAssignPlacementGroupLinodes)(mockPlacementGroup.id, mockPlacementGroup).as('assignLinode');
            cy.findByLabelText("Linodes in ".concat(mockPlacementGroupRegion.label, " (").concat(mockPlacementGroupRegion.id, ")")).type("".concat(mockLinode.label));
            ui_1.ui.autocomplete.find().should('be.visible');
            ui_1.ui.autocompletePopper
                .findByTitle(mockLinode.label)
                .should('be.visible')
                .click();
            ui_1.ui.button.findByTitle('Assign Linode').click();
        });
        // Confirm that outgoing assignment API request includes the correct Linode.
        cy.wait('@assignLinode').then(function (xhr) {
            var _a;
            var requestBody = (_a = xhr.request) === null || _a === void 0 ? void 0 : _a.body;
            expect(requestBody['linodes'][0]).to.equal(mockLinode.id);
        });
        // Confirm that UI responds by showing toast notification, displaying the assigned
        // Linode in the list, and confirm that clicking the Linode navigates to its
        // details page.
        ui_1.ui.toast.assertMessage("Linode ".concat(mockLinode.label, " successfully assigned."));
        cy.findByText('1 of 10').should('be.visible');
        cy.findByText(mockLinode.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Running');
            cy.findByText(mockLinode.label).click();
        });
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
    });
    /*
     * - Confirms Placement Group non-compliant Linode assignment UI flow using mock API data.
     * - Confirms that non-compliant Linode is assigned to the Placement Group.
     * - Confirms that UI automatically updates and shows a warning indicating the non-compliance status.
     * - Confirms that non-compliance status is indicated on the Placement Group landing page.
     */
    it('can assign non-compliant Linode with flexible placement group policy', function () {
        var mockPlacementGroupRegion = (0, regions_2.chooseRegion)({ regions: mockRegions });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(10000, 99999),
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupRegion.id,
            status: 'running',
        });
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            label: (0, random_1.randomLabel)(),
            members: [],
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
            placement_group_policy: 'flexible',
        });
        var mockPlacementGroupAfterAssignment = __assign(__assign({}, mockPlacementGroup), { members: [
                {
                    linode_id: mockLinode.id,
                    is_compliant: false,
                },
            ], is_compliant: false });
        var complianceWarning = "Placement Group ".concat(mockPlacementGroup.label, " is non-compliant. We are working to resolve compliance issues so that you can continue assigning Linodes to this Placement Group.");
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, linodes_1.mockGetLinodes)([mockLinode]);
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]);
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        (0, placement_groups_1.mockAssignPlacementGroupLinodes)(mockPlacementGroup.id, mockPlacementGroupAfterAssignment).as('assignLinode');
        cy.visitWithLogin("/placement-groups/".concat(mockPlacementGroup.id));
        cy.wait('@getPlacementGroup');
        // Confirm that `flexible` Placement Group Policy is indicated on page, then
        // initiate Linode assignment.
        cy.findByText('Flexible');
        ui_1.ui.button
            .findByTitle('Assign Linode to Placement Group')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Select Linode and click "Assign Linode" button.
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroupAfterAssignment]);
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroupAfterAssignment).as('getPlacementGroup');
        ui_1.ui.drawer
            .findByTitle("Assign Linodes to Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText("Linodes in ".concat(mockPlacementGroupRegion.label, " (").concat(mockPlacementGroupRegion.id, ")")).type(mockLinode.label);
            ui_1.ui.autocomplete.find().should('be.visible');
            ui_1.ui.autocompletePopper
                .findByTitle(mockLinode.label)
                .should('be.visible')
                .click();
            ui_1.ui.button
                .findByTitle('Assign Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that Linode is displayed and that compliance warning appears.
        cy.wait('@assignLinode');
        ui_1.ui.toast.assertMessage("Linode ".concat(mockLinode.label, " successfully assigned."));
        cy.contains(complianceWarning).should('be.visible');
        cy.findByText(mockLinode.label).should('be.visible');
        // Navigate back to Placement Group landing page and confirm that compliance
        // indicator is displayed beneath the Placement Group.
        ui_1.ui.entityHeader.find().within(function () {
            cy.findByText('Placement Groups').click();
        });
        cy.url().should('endWith', '/placement-groups');
        cy.findByText(mockPlacementGroup.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Non-compliant').should('be.visible');
        });
    });
    /**
     * - Confirms UI flow when attempting to assign non-compliant Linode using mock API data.
     * - Confirms graceful error handling when Placement Group Policy is `strict`.
     */
    it('cannot assign non-compliant Linode with `strict` Placement Group Policy', function () {
        var mockPlacementGroupRegion = (0, regions_2.chooseRegion)({ regions: mockRegions });
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(10000, 99999),
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupRegion.id,
            status: 'running',
        });
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            label: (0, random_1.randomLabel)(),
            members: [],
            region: mockPlacementGroupRegion.id,
            is_compliant: true,
            placement_group_policy: 'strict',
        });
        var complianceErrorMessage = "Assignment would break Placement Group's compliance, non compliant Linode IDs: [".concat(mockLinode.id, "]");
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, linodes_1.mockGetLinodes)([mockLinode]);
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]);
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        (0, placement_groups_1.mockAssignPlacementGroupLinodesError)(mockPlacementGroup.id, complianceErrorMessage, 400).as('assignLinode');
        cy.visitWithLogin("/placement-groups/".concat(mockPlacementGroup.id));
        cy.wait('@getPlacementGroup');
        // Confirm that `strict` Placement Group Policy is indicated on page, then
        // initiate Linode assignment.
        cy.findByText('Strict');
        ui_1.ui.button
            .findByTitle('Assign Linode to Placement Group')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Select Linode and click "Assign Linode" button, then confirm that
        // API error message is displayed in the drawer.
        ui_1.ui.drawer
            .findByTitle("Assign Linodes to Placement Group ".concat(mockPlacementGroup.label))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText("Linodes in ".concat(mockPlacementGroupRegion.label, " (").concat(mockPlacementGroupRegion.id, ")")).type(mockLinode.label);
            ui_1.ui.autocomplete.find().should('be.visible');
            ui_1.ui.autocompletePopper
                .findByTitle(mockLinode.label)
                .should('be.visible')
                .click();
            ui_1.ui.button
                .findByTitle('Assign Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText(complianceErrorMessage).should('be.visible');
        });
    });
    /*
     * - Confirms Placement Group Linode unassign UI flow using mock API data.
     * - Confirms that attached Linodes are listed on Placement Group details page.
     * - Confirms that Cloud handles API errors gracefully upon failed unassignment.
     * - Confirms that Placement Group details page updates its content upon successful assignment.
     */
    it('can unassign a Linode', function () {
        var mockPlacementGroupRegion = (0, regions_2.chooseRegion)({ regions: mockRegions });
        var mockLinodes = (0, arrays_1.buildArray)(2, function (i) {
            return factories_1.linodeFactory.build({
                id: (0, random_1.randomNumber)(i * 100, i * 100 + 50),
                label: (0, random_1.randomLabel)(),
                region: mockPlacementGroupRegion.id,
                status: 'running',
            });
        });
        var mockLinodeUnassigned = mockLinodes[0];
        var mockLinodeRemaining = mockLinodes[1];
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupRegion.id,
            members: mockLinodes.map(function (linode) { return ({
                linode_id: linode.id,
                is_compliant: true,
            }); }),
            is_compliant: true,
        });
        var mockPlacementGroupAfterUnassignment = __assign(__assign({}, mockPlacementGroup), { members: [{ linode_id: mockLinodeRemaining.id, is_compliant: true }] });
        (0, regions_1.mockGetRegions)(mockRegions);
        (0, linodes_1.mockGetLinodes)(mockLinodes);
        (0, linodes_1.mockGetLinodeDetails)(mockLinodeUnassigned.id, mockLinodeUnassigned);
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]);
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroup).as('getPlacementGroup');
        cy.visitWithLogin("/placement-groups/".concat(mockPlacementGroup.id));
        cy.wait('@getPlacementGroup');
        // Confirm that both assigned Linodes are listed.
        cy.findByText('2 of 10').should('be.visible');
        mockLinodes.forEach(function (linode) {
            cy.findByText(linode.label).should('be.visible');
        });
        // Unassign the first Linode.
        cy.findByText(mockLinodeUnassigned.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            ui_1.ui.button.findByTitle('Unassign').should('be.enabled').click();
        });
        (0, placement_groups_1.mockUnassignPlacementGroupLinodesError)(mockPlacementGroup.id).as('unassignLinode');
        (0, placement_groups_1.mockGetPlacementGroup)(mockPlacementGroupAfterUnassignment).as('getPlacementGroup');
        ui_1.ui.dialog
            .findByTitle("Unassign ".concat(mockLinodeUnassigned.label))
            .should('be.visible')
            .within(function () {
            // On first attempt, mock an HTTP error and confirm that Cloud handles
            // it by displaying its message.
            ui_1.ui.button
                .findByTitle('Unassign')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('An error has occurred').should('be.visible');
            // Confirm again with a successful response mocked.
            (0, placement_groups_1.mockUnassignPlacementGroupLinodes)(mockPlacementGroup.id, mockPlacementGroupAfterUnassignment).as('unassignLinode');
            ui_1.ui.button.findByTitle('Unassign').click();
        });
        // Confirm that outgoing unassignment API request contains expected payload data.
        cy.wait('@unassignLinode').then(function (xhr) {
            var _a;
            var requestBody = (_a = xhr.request) === null || _a === void 0 ? void 0 : _a.body;
            expect(requestBody['linodes'][0]).to.equal(mockLinodeUnassigned.id);
        });
        ui_1.ui.toast.assertMessage("Linode ".concat(mockLinodeUnassigned.label, " successfully unassigned."));
        // Confirm that unassigned Linode is removed from list while other Linode remains.
        cy.findByText('2 of 10').should('not.exist');
        cy.findByText('1 of 10').should('be.visible');
        cy.findByText(mockLinodeUnassigned.label).should('not.exist');
        cy.findByText(mockLinodeRemaining.label).should('be.visible');
    });
});
