"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var placement_groups_1 = require("support/intercepts/placement-groups");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var account_1 = require("support/intercepts/account");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var linodes_1 = require("support/intercepts/linodes");
var mockAccount = factories_1.accountFactory.build();
describe('VM Placement landing page', function () {
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
    });
    /**
     * - Confirms landing page empty state is shown when there are no Placement Groups.
     * - Confirms that clicking "Create Placement Groups" opens PG create drawer.
     */
    it('displays empty state when there are no Placement Groups', function () {
        (0, placement_groups_1.mockGetPlacementGroups)([]).as('getPlacementGroups');
        cy.visitWithLogin('/placement-groups');
        cy.wait('@getPlacementGroups');
        ui_1.ui.heading.find().within(function () {
            cy.findByText('Placement Groups').should('be.visible');
        });
        ui_1.ui.button
            .findByTitle('Create Placement Group')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer.findByTitle('Create Placement Group').should('be.visible');
    });
    /**
     * - Confirms landing page populated state is shown when there are Placement Groups.
     * - Confirms that each Placement Group is listed on the landing page.
     * - Confirms that clicking a Placement Group's label navigates to its details page.
     */
    it('lists Placement Groups when user has Placement Groups', function () {
        var mockPlacementGroupCompliantRegion = (0, regions_1.chooseRegion)();
        var mockPlacementGroupNoncompliantRegion = (0, regions_1.chooseRegion)();
        var mockPlacementGroupLinode = factories_1.linodeFactory.build({
            label: (0, random_1.randomLabel)(),
            id: (0, random_1.randomNumber)(),
            region: mockPlacementGroupNoncompliantRegion.id,
        });
        var mockPlacementGroupCompliant = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupCompliantRegion.id,
            placement_group_type: 'anti_affinity:local',
            is_compliant: true,
            placement_group_policy: 'flexible',
            members: [],
        });
        var mockPlacementGroupNoncompliant = factories_1.placementGroupFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            region: mockPlacementGroupNoncompliantRegion.id,
            placement_group_type: 'affinity:local',
            is_compliant: false,
            placement_group_policy: 'strict',
            members: [
                { linode_id: mockPlacementGroupLinode.id, is_compliant: false },
            ],
        });
        var mockPlacementGroups = [
            mockPlacementGroupCompliant,
            mockPlacementGroupNoncompliant,
        ];
        (0, placement_groups_1.mockGetPlacementGroups)(mockPlacementGroups).as('getPlacementGroups');
        (0, linodes_1.mockGetLinodes)([mockPlacementGroupLinode]);
        cy.visitWithLogin('/placement-groups');
        cy.wait('@getPlacementGroups');
        // Confirm that compliant Placement Group is listed with expected info.
        cy.findByText(mockPlacementGroupCompliant.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Anti-affinity').should('be.visible');
            cy.findByText('Flexible').should('be.visible');
            cy.findByText('0 of 5').should('be.visible');
            cy.findByText(mockPlacementGroupCompliantRegion.label).should('be.visible');
            cy.findByText('Non-compliant').should('not.exist');
        });
        // Confirm that non-compliant Placement Group is listed with expected info.
        cy.findByText(mockPlacementGroupNoncompliant.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText('Affinity').should('be.visible');
            cy.findByText('Strict').should('be.visible');
            cy.contains('1 of 5').should('be.visible');
            cy.findByText(mockPlacementGroupNoncompliantRegion.label).should('be.visible');
            cy.findByText('Non-compliant').should('be.visible');
        });
        cy.findByText(mockPlacementGroupCompliant.label).click();
        cy.url().should('endWith', "/placement-groups/".concat(mockPlacementGroupCompliant.id));
    });
    // TODO Re-evaluate whether this test is possible/necessary.
    /**
     * - Confirms that Cloud responds to compliance events and updates status on landing page.
     */
    // it.skip('updates Placement Group compliance status on event');
});
