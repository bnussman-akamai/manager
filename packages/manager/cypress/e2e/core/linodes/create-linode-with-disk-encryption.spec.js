"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var linodes_1 = require("support/intercepts/linodes");
var regions_1 = require("support/intercepts/regions");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var feature_flags_2 = require("support/util/feature-flags");
var random_1 = require("support/util/random");
var regions_2 = require("support/util/regions");
var constants_1 = require("src/components/Encryption/constants");
describe('Create Linode with Disk Encryption', function () {
    it('should not have a "Disk Encryption" section visible if the feature flag is off, user does not have capability, and the selected region does not support LDE', function () {
        // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeDiskEncryption: (0, feature_flags_2.makeFeatureFlagData)(false),
        }).as('getFeatureFlags');
        // Mock account response
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes'],
        });
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        // Mock regions response
        var mockRegion = factories_1.regionFactory.build({
            capabilities: ['Linodes'],
        });
        var mockRegions = [mockRegion];
        (0, regions_1.mockGetRegions)(mockRegions);
        // intercept request
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getFeatureFlags', '@getAccount']);
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionLabel(mockRegion.label, mockRegions)
            .click();
        // Check if section is visible
        cy.get("[data-testid=".concat(constants_1.headerTestId, "]")).should('not.exist');
    });
    it('should have a "Disk Encryption" section visible if feature flag is on and user has the capability', function () {
        // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeDiskEncryption: (0, feature_flags_2.makeFeatureFlagData)(true),
        }).as('getFeatureFlags');
        // Mock account response
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes', 'Disk Encryption'],
        });
        var mockRegion = factories_1.regionFactory.build({
            capabilities: ['Linodes', 'Disk Encryption'],
        });
        var mockRegionWithoutDiskEncryption = factories_1.regionFactory.build({
            capabilities: ['Linodes'],
        });
        var mockRegions = [mockRegion, mockRegionWithoutDiskEncryption];
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        (0, regions_1.mockGetRegions)(mockRegions);
        // intercept request
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getFeatureFlags', '@getAccount']);
        // Check if section is visible
        cy.get("[data-testid=\"".concat(constants_1.headerTestId, "\"]")).should('exist');
        // "Encrypt Disk" checkbox should be disabled if a region that does not support LDE is selected
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionLabel(mockRegionWithoutDiskEncryption.label, mockRegions)
            .click();
        cy.get("[data-testid=\"".concat(constants_1.checkboxTestId, "\"]")).should('be.disabled');
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionLabel(mockRegion.label, mockRegions)
            .click();
        cy.get("[data-testid=\"".concat(constants_1.checkboxTestId, "\"]")).should('be.enabled');
    });
    it('should have a "Disk Encryption" section visible if the feature flag is off, user does not have the capability, but the selected region has the "Disk Encryption" capability', function () {
        // Situation where LDE is in GA in the selected region/DC
        // Mock feature flag -- @TODO LDE: Remove feature flag once LDE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeDiskEncryption: (0, feature_flags_2.makeFeatureFlagData)(false),
        }).as('getFeatureFlags');
        // Mock account response
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes'],
        });
        var mockRegion = factories_1.regionFactory.build({
            capabilities: ['Linodes', 'Disk Encryption'],
        });
        var mockRegionWithoutDiskEncryption = factories_1.regionFactory.build({
            capabilities: ['Linodes'],
        });
        var mockRegions = [mockRegion, mockRegionWithoutDiskEncryption];
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        (0, regions_1.mockGetRegions)(mockRegions);
        // intercept request
        cy.visitWithLogin('/linodes/create');
        cy.wait(['@getFeatureFlags', '@getAccount']);
        // "Disk Encryption" section should not be visible if a region that does not support LDE is selected
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionLabel(mockRegionWithoutDiskEncryption.label, mockRegions)
            .click();
        cy.get("[data-testid=\"".concat(constants_1.headerTestId, "\"]")).should('not.exist');
        // "Disk Encryption" section should be visible if a region that supports LDE is selected
        ui_1.ui.regionSelect.find().click();
        ui_1.ui.regionSelect
            .findItemByRegionLabel(mockRegion.label, mockRegions)
            .click();
        cy.get("[data-testid=\"".concat(constants_1.headerTestId, "\"]")).should('exist');
        cy.get("[data-testid=\"".concat(constants_1.checkboxTestId, "\"]")).should('be.enabled'); // "Encrypt Disk" checkbox should be enabled
    });
    // Confirm Linode Disk Encryption features when using Distributed Regions.
    describe('Distributed regions', function () {
        var encryptionTooltipMessage = 'Distributed Compute Instances are encrypted. This setting can not be changed.';
        var mockDistributedRegionWithoutCapability = factories_1.regionFactory.build({
            capabilities: [
                'Linodes',
                'Cloud Firewall',
                'Distributed Plans',
                'Placement Group',
            ],
            site_type: 'distributed',
        });
        var mockDistributedRegionWithCapability = factories_1.regionFactory.build({
            capabilities: [
                'Linodes',
                'Cloud Firewall',
                'Distributed Plans',
                'Placement Group',
                'Disk Encryption',
            ],
            site_type: 'distributed',
        });
        var mockDistributedRegions = [
            mockDistributedRegionWithCapability,
            mockDistributedRegionWithoutCapability,
        ];
        var mockLinodeType = factories_1.linodeTypeFactory.build({
            class: 'nanode',
            id: 'nanode-edge-1',
            label: 'Nanode 1GB',
        });
        /*
         * Right now there's some ambiguity over the 'Disk Encryption' capability
         * and whether it's expected to be present for Distributed Regions. We'll
         * test Cloud against both scenarios -- when distributed regions do and do
         * not have the capability -- and confirm that the Linode Create flow works
         * as expected in both cases.
         */
        mockDistributedRegions.forEach(function (distributedRegion) {
            var suffix = distributedRegion.capabilities.includes('Disk Encryption')
                ? '(with region capability)'
                : '(without region capability)';
            /*
             * - Confirms that disk encryption works as expected for distributed regions. Specifically:
             * - Encrypted checkbox is always checked, is disabled, and therefore cannot be changed.
             * - Outgoing Linode create API request payload does NOT contain encryption property.
             */
            it("creates a Linode with Disk Encryption in a distributed region ".concat(suffix), function () {
                var mockRegions = [distributedRegion];
                var mockLinode = factories_1.linodeFactory.build({
                    label: (0, random_1.randomLabel)(),
                    region: distributedRegion.id,
                });
                (0, feature_flags_1.mockAppendFeatureFlags)({
                    gecko2: {
                        enabled: true,
                    },
                });
                (0, regions_1.mockGetRegions)(mockRegions);
                (0, linodes_1.mockGetLinodeTypes)([mockLinodeType]);
                (0, regions_1.mockGetRegionAvailability)(distributedRegion.id, []);
                (0, linodes_1.mockCreateLinode)(mockLinode).as('createLinode');
                cy.visitWithLogin('/linodes/create');
                cy.get('[data-qa-linode-region]').within(function () {
                    ui_1.ui.tabList.find().within(function () {
                        cy.findByText('Distributed').click();
                    });
                    cy.findByLabelText('Region').type(distributedRegion.label);
                    ui_1.ui.regionSelect
                        .findItemByRegionLabel((0, regions_2.extendRegion)(distributedRegion).label, mockRegions)
                        .click();
                });
                pages_1.linodeCreatePage.setLabel(mockLinode.label);
                pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
                // Select mock Nanode plan type.
                cy.get('[data-qa-plan-row="Nanode 1 GB"]').click();
                cy.findByLabelText('Encrypt Disk')
                    .should('be.disabled')
                    .should('be.checked');
                cy.findByLabelText(encryptionTooltipMessage).click();
                ui_1.ui.tooltip.findByText(encryptionTooltipMessage).should('be.visible');
                // Click "Create Linode" and confirm outgoing API request payload.
                ui_1.ui.button
                    .findByTitle('Create Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Submit form to create Linode and confirm that outgoing API request
                // contains expected user data.
                cy.wait('@createLinode').then(function (xhr) {
                    var requestPayload = xhr.request.body;
                    var regionId = requestPayload['region'];
                    expect(regionId).to.equal(mockLinode.region);
                    expect(requestPayload['disk_encryption']).to.be.undefined;
                });
            });
        });
    });
});
