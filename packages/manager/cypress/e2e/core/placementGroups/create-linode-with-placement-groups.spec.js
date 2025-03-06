"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var factories_1 = require("src/factories");
var factories_2 = require("src/factories");
var ui_1 = require("support/ui/");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var placement_groups_1 = require("support/intercepts/placement-groups");
var random_1 = require("support/util/random");
var constants_1 = require("src/features/PlacementGroups/constants");
var pages_1 = require("support/ui/pages");
var regions_2 = require("support/util/regions");
var mockAccount = factories_1.accountFactory.build();
var mockNewarkRegion = (0, regions_2.extendRegion)(factories_2.regionFactory.build({
    capabilities: ['Linodes', 'Placement Group'],
    id: 'us-east',
    label: 'Newark, NJ',
    country: 'us',
}));
var mockDallasRegion = (0, regions_2.extendRegion)(factories_2.regionFactory.build({
    capabilities: ['Linodes'],
    id: 'us-central',
    label: 'Dallas, TX',
    country: 'us',
}));
var mockRegions = [mockNewarkRegion, mockDallasRegion];
describe('Linode create flow with Placement Group', function () {
    beforeEach(function () {
        (0, account_1.mockGetAccount)(mockAccount);
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
    });
    /*
     * - Confirms Placement Group create UI flow using mock API data.
     * - Confirms that outgoing Placement Group create request contains expected data.
     * - Confirms that Cloud automatically updates to list new Placement Group on landing page.
     */
    it('can create a linode with a newly created Placement Group', function () {
        cy.visitWithLogin('/linodes/create');
        cy.findByText('Select a Region for your Linode to see existing placement groups.').should('be.visible');
        // Region without capability
        // Choose region
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(mockDallasRegion.label).click();
        // Choose plan
        cy.findByText('Shared CPU').click();
        cy.get('[id="g6-nanode-1"]').click();
        cy.findByText("Placement Groups in ".concat(mockDallasRegion.label, " (").concat(mockDallasRegion.id, ")")).should('be.visible');
        cy.get('[data-testid="placement-groups-no-capability-notice"]').should('be.visible');
        ui_1.ui.tooltip
            .findByText('Regions that support placement groups')
            .should('be.visible')
            .click();
        cy.get('[data-testid="supported-pg-region-us-east"]').should('be.visible');
        // Region with capability
        // Choose region
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect.findItemByRegionLabel(mockNewarkRegion.label).click();
        // Choose plan
        cy.findByText('Shared CPU').click();
        cy.get('[id="g6-nanode-1"]').click();
        // Choose Placement Group
        // No Placement Group available
        cy.findByText("Placement Groups in ".concat(mockNewarkRegion.label, " (").concat(mockNewarkRegion.id, ")")).should('be.visible');
        // Open the select
        cy.get('[data-testid="placement-groups-select"] input').click();
        cy.findByText('There are no placement groups in this region.').click();
        // Close the select
        cy.get('[data-testid="placement-groups-select"] input').click();
        // Create a Placement Group
        ui_1.ui.button
            .findByTitle('Create Placement Group')
            .should('be.visible')
            .should('be.enabled')
            .click();
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            label: 'pg-1-us-east',
            region: mockRegions[0].id,
            placement_group_type: 'anti_affinity:local',
            placement_group_policy: 'strict',
            is_compliant: true,
        });
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]).as('getPlacementGroups');
        (0, placement_groups_1.mockCreatePlacementGroup)(mockPlacementGroup).as('createPlacementGroup');
        ui_1.ui.drawer
            .findByTitle('Create Placement Group')
            .should('be.visible')
            .within(function () {
            // Confirm that the drawer contains the expected default information.
            // - A selection region
            // - An Placement Group Policy message
            // - a disabled "Create Placement Group" button.
            cy.findByText("".concat(mockNewarkRegion.label, " (").concat(mockNewarkRegion.id, ")")).should('be.visible');
            cy.findByText(constants_1.CANNOT_CHANGE_PLACEMENT_GROUP_POLICY_MESSAGE).should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Placement Group')
                .should('be.disabled');
            // Enter label and submit form.
            cy.findByLabelText('Label').type(mockPlacementGroup.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Placement Group')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Wait for outgoing API request and confirm that payload contains expected data.
        cy.wait('@createPlacementGroup').then(function (xhr) {
            var _a;
            var requestPayload = (_a = xhr.request) === null || _a === void 0 ? void 0 : _a.body;
            expect(requestPayload['placement_group_type']).to.equal('anti_affinity:local');
            expect(requestPayload['placement_group_policy']).to.equal('strict');
            expect(requestPayload['label']).to.equal(mockPlacementGroup.label);
            expect(requestPayload['region']).to.equal(mockRegions[0].id);
        });
        // Confirm that the drawer closes and a success message is displayed.
        ui_1.ui.toast.assertMessage("Placement Group ".concat(mockPlacementGroup.label, " successfully created."));
        // Select the newly created Placement Group.
        cy.wait('@getPlacementGroups');
        cy.get('[data-testid="placement-groups-select"] input').should('have.value', mockPlacementGroup.label);
        var linodeLabel = 'linode-with-placement-group';
        var mockLinode = factories_1.linodeFactory.build({
            label: linodeLabel,
            region: mockRegions[0].id,
            placement_group: {
                id: mockPlacementGroup.id,
            },
        });
        // Confirm the Placement group assignment is accounted for in the summary.
        cy.findByText('Assigned to Placement Group')
            .scrollIntoView()
            .should('be.visible');
        // Type in a label, password and submit the form.
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        cy.get('#linode-label').clear().type('linode-with-placement-group');
        cy.get('#root-password').type((0, random_1.randomString)(32));
        cy.findByText('Create Linode').should('be.enabled').click();
        // Wait for outgoing API request and confirm that payload contains expected data.
        cy.wait('@createLinode').then(function (xhr) {
            var _a;
            var requestPayload = (_a = xhr.request) === null || _a === void 0 ? void 0 : _a.body;
            expect(requestPayload['region']).to.equal(mockRegions[0].id);
            expect(requestPayload['label']).to.equal(linodeLabel);
            expect(requestPayload['placement_group'].id).to.equal(mockPlacementGroup.id);
        });
    });
    /*
     * - Confirms UI flow to create a Linode with an existing Placement Group using mock API data.
     * - Confirms that Placement Group is reflected in create summary section.
     * - Confirms that outgoing Linode Create API request specifies the selected Placement Group to be attached.
     */
    it('can assign existing Placement Group during Linode Create flow', function () {
        var mockPlacementGroup = factories_1.placementGroupFactory.build({
            label: 'pg-1-us-east',
            region: mockRegions[0].id,
            placement_group_type: 'anti_affinity:local',
            placement_group_policy: 'strict',
            is_compliant: true,
        });
        var linodeLabel = 'linode-with-placement-group';
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: linodeLabel,
            region: mockRegions[0].id,
            placement_group: {
                id: mockPlacementGroup.id,
            },
        });
        (0, placement_groups_1.mockGetPlacementGroups)([mockPlacementGroup]).as('getPlacementGroups');
        (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin('/linodes/create');
        pages_1.linodeCreatePage.selectRegionById(mockRegions[0].id);
        cy.wait('@getPlacementGroups');
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        pages_1.linodeCreatePage.setLabel(mockLinode.label);
        // Confirm that mocked Placement Group is shown in the Autocomplete, and then select it.
        cy.findByText("Placement Groups in ".concat(mockNewarkRegion.label, " (").concat(mockNewarkRegion.id, ")"))
            .click()
            .type("".concat(mockPlacementGroup.label));
        ui_1.ui.autocompletePopper
            .findByTitle(mockPlacementGroup.label)
            .should('be.visible')
            .click();
        // Confirm the Placement group assignment is accounted for in the summary.
        cy.findByText('Assigned to Placement Group')
            .scrollIntoView()
            .should('be.visible');
        // Create Linode and confirm contents of outgoing API request payload.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode').then(function (xhr) {
            var requestPayload = xhr.request.body;
            expect(requestPayload['region']).to.equal(mockRegions[0].id);
            expect(requestPayload['label']).to.equal(linodeLabel);
            expect(requestPayload['placement_group'].id).to.equal(mockPlacementGroup.id);
        });
        // Confirm redirect to new Linode.
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(mockLinode.label, " is being created."));
    });
});
