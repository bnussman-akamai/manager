"use strict";
/**
 * @file Linode Create end-to-end tests.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("support/ui");
var regions_1 = require("support/util/regions");
var random_1 = require("support/util/random");
var linodes_1 = require("support/constants/linodes");
var cleanup_1 = require("support/util/cleanup");
var pages_1 = require("support/ui/pages");
var authentication_1 = require("support/api/authentication");
var linodes_2 = require("support/intercepts/linodes");
var profile_1 = require("support/intercepts/profile");
var regions_2 = require("support/util/regions");
var factories_1 = require("src/factories");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var regions_3 = require("support/intercepts/regions");
var vlans_1 = require("support/intercepts/vlans");
var vpc_1 = require("support/intercepts/vpc");
var configs_1 = require("support/intercepts/configs");
var profile_2 = require("support/intercepts/profile");
var account_2 = require("support/intercepts/account");
var username;
(0, authentication_1.authenticate)();
describe('Create Linode', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('linodes');
        (0, cleanup_1.cleanUp)('ssh-keys');
    });
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            linodeInterfaces: { enabled: false },
        });
    });
    /*
     * End-to-end tests to create Linodes for each available plan type.
     */
    describe('End-to-end', function () {
        // Run an end-to-end test to create a basic Linode for each plan type described below.
        describe('By plan type', function () {
            [
                {
                    planType: 'Shared CPU',
                    planLabel: 'Nanode 1 GB',
                    planId: 'g6-nanode-1',
                },
                {
                    planType: 'Dedicated CPU',
                    planLabel: 'Dedicated 4 GB',
                    planId: 'g6-dedicated-2',
                },
                {
                    planType: 'High Memory',
                    planLabel: 'Linode 24 GB',
                    planId: 'g7-highmem-1',
                },
                {
                    planType: 'Premium CPU',
                    planLabel: 'Premium 4 GB',
                    planId: 'g7-premium-2',
                },
                // TODO Include GPU plan types.
                // TODO Include Accelerated plan types (when they're no longer as restricted)
            ].forEach(function (planConfig) {
                /*
                 * - Parameterized end-to-end test to create a Linode for each plan type.
                 * - Confirms that a Linode of the given plan type can be deployed.
                 */
                it("creates a ".concat(planConfig.planType, " Linode"), function () {
                    var linodeRegion = (0, regions_1.chooseRegion)({
                        capabilities: ['Linodes', 'Premium Plans', 'Vlans'],
                    });
                    var linodeLabel = (0, random_1.randomLabel)();
                    (0, profile_1.interceptGetProfile)().as('getProfile');
                    (0, linodes_2.interceptCreateLinode)().as('createLinode');
                    cy.visitWithLogin('/linodes/create');
                    // Set Linode label, OS, plan type, password, etc.
                    pages_1.linodeCreatePage.setLabel(linodeLabel);
                    pages_1.linodeCreatePage.selectImage('Debian 12');
                    pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
                    pages_1.linodeCreatePage.selectPlan(planConfig.planType, planConfig.planLabel);
                    pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
                    // Confirm information in summary is shown as expected.
                    cy.get('[data-qa-linode-create-summary]').scrollIntoView();
                    cy.get('[data-qa-linode-create-summary]').within(function () {
                        cy.findByText('Debian 12').should('be.visible');
                        cy.findByText(linodeRegion.label).should('be.visible');
                        cy.findByText(planConfig.planLabel).should('be.visible');
                    });
                    // Create Linode and confirm it's provisioned as expected.
                    ui_1.ui.button
                        .findByTitle('Create Linode')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                    cy.wait('@createLinode').then(function (xhr) {
                        var _a;
                        var requestPayload = xhr.request.body;
                        var responsePayload = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body;
                        // Confirm that API request and response contain expected data
                        expect(requestPayload['label']).to.equal(linodeLabel);
                        expect(requestPayload['region']).to.equal(linodeRegion.id);
                        expect(requestPayload['type']).to.equal(planConfig.planId);
                        expect(responsePayload['label']).to.equal(linodeLabel);
                        expect(responsePayload['region']).to.equal(linodeRegion.id);
                        expect(responsePayload['type']).to.equal(planConfig.planId);
                        // Confirm that Cloud redirects to details page
                        cy.url().should('endWith', "/linodes/".concat(responsePayload['id']));
                    });
                    cy.wait('@getProfile').then(function (xhr) {
                        var _a;
                        username = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.username;
                    });
                    // Confirm toast notification should appear on Linode create.
                    ui_1.ui.toast.assertMessage("Your Linode ".concat(linodeLabel, " is being created."));
                    cy.findByText('RUNNING', { timeout: linodes_1.LINODE_CREATE_TIMEOUT }).should('be.visible');
                    // confirm that LISH Console via SSH section is correct
                    cy.contains('LISH Console via SSH')
                        .should('be.visible')
                        .closest('tr')
                        .within(function () {
                        cy.contains("ssh -t ".concat(username, "@lish-").concat(linodeRegion.id, ".linode.com ").concat(linodeLabel)).should('be.visible');
                    });
                });
            });
        });
    });
    // Mocks creating an accelerated Linode due to accelerated linodes currently having limited deployment availability
    // TODO: eventually transition this to an e2e test (in the above test)
    it('creates a mock accelerated Linode and confirms response', function () {
        // Create mocks
        var linodeLabel = (0, random_1.randomLabel)();
        var mockLinode = factories_1.linodeFactory.build({
            label: linodeLabel,
            specs: {
                accelerated_devices: 2,
                disk: 51200,
                gpus: 0,
                memory: 2048,
                transfer: 2000,
                vcpus: 1,
            },
            type: 'accelerated-1',
        });
        var mockAcceleratedType = [
            factories_1.linodeTypeFactory.build({
                id: 'accelerated-1',
                label: 'accelerated-1',
                class: 'accelerated',
            }),
        ];
        var mockRegions = [
            factories_1.regionFactory.build({
                capabilities: ['Linodes', 'Kubernetes', 'NETINT Quadra T1U'],
                id: 'us-east',
                label: 'Newark, NJ',
            }),
        ];
        var linodeRegion = mockRegions[0];
        // Create request intercepts
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({
            capabilities: ['NETINT Quadra T1U'],
        })).as('getAccount');
        (0, feature_flags_1.mockAppendFeatureFlags)({
            acceleratedPlans: {
                linodePlans: true,
                lkePlans: false,
            },
        }).as('getFeatureFlags');
        (0, regions_3.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_2.mockGetLinodeTypes)(__spreadArray([], mockAcceleratedType, true)).as('getLinodeTypes');
        (0, linodes_2.mockCreateLinode)(mockLinode).as('createLinode');
        cy.visitWithLogin('/linodes/create');
        cy.wait([
            '@getRegions',
            '@getLinodeTypes',
            '@getAccount',
            '@getFeatureFlags',
        ]);
        // Set Linode label, OS, plan type, password, etc.
        pages_1.linodeCreatePage.setLabel(linodeLabel);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Accelerated', mockAcceleratedType[0].label);
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Confirm information in summary is shown as expected.
        cy.get('[data-qa-linode-create-summary]').scrollIntoView();
        cy.get('[data-qa-linode-create-summary]').within(function () {
            cy.findByText('Debian 12').should('be.visible');
            cy.findByText("US, ".concat(linodeRegion.label)).should('be.visible');
            cy.findByText(mockAcceleratedType[0].label).should('be.visible');
        });
        // Create Linode and confirm it's provisioned as expected.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode').then(function (xhr) {
            var _a;
            var requestPayload = xhr.request.body;
            var responsePayload = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body;
            // Confirm that API request and response contain expected data
            expect(requestPayload['label']).to.equal(linodeLabel);
            expect(requestPayload['region']).to.equal(linodeRegion.id);
            expect(requestPayload['type']).to.equal(mockAcceleratedType[0].id);
            expect(responsePayload['label']).to.equal(linodeLabel);
            expect(responsePayload['region']).to.equal(linodeRegion.id);
            expect(responsePayload['type']).to.equal(mockAcceleratedType[0].id);
            // Accelerated linodes: Confirm accelerated_devices value is returned as expected
            expect(responsePayload['specs']).has.property('accelerated_devices', 2);
            // Confirm that Cloud redirects to details page
            cy.url().should('endWith', "/linodes/".concat(responsePayload['id']));
        });
    });
    it('adds an SSH key to the linode during create flow', function () {
        var rootpass = (0, random_1.randomString)(32);
        var sshPublicKeyLabel = (0, random_1.randomLabel)();
        var randomKey = (0, random_1.randomString)(400, {
            uppercase: true,
            lowercase: true,
            numbers: true,
            spaces: false,
            symbols: false,
        });
        var sshPublicKey = "ssh-rsa e2etestkey".concat(randomKey, " e2etest@linode");
        var linodeLabel = (0, random_1.randomLabel)();
        var region = (0, regions_2.getRegionById)('us-southeast');
        var diskLabel = 'Debian 10 Disk';
        var mockLinode = factories_1.linodeFactory.build({
            label: linodeLabel,
            region: region.id,
            type: dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id,
        });
        var mockVLANs = factories_1.VLANFactory.buildList(2);
        var mockSubnet = factories_1.subnetFactory.build({
            id: (0, random_1.randomNumber)(2),
            label: (0, random_1.randomLabel)(),
        });
        var mockVPC = factories_1.vpcFactory.build({
            id: (0, random_1.randomNumber)(),
            region: 'us-southeast',
            subnets: [mockSubnet],
        });
        var mockVPCRegion = factories_1.regionFactory.build({
            id: region.id,
            label: region.label,
            capabilities: ['Linodes', 'VPCs', 'Vlans'],
        });
        var mockPublicConfigInterface = factories_1.LinodeConfigInterfaceFactory.build({
            ipam_address: null,
            purpose: 'public',
        });
        var mockVlanConfigInterface = factories_1.LinodeConfigInterfaceFactory.build();
        var mockVpcConfigInterface = factories_1.LinodeConfigInterfaceFactoryWithVPC.build({
            vpc_id: mockVPC.id,
            purpose: 'vpc',
            active: true,
        });
        var mockConfig = factories_1.linodeConfigFactory.build({
            id: (0, random_1.randomNumber)(),
            interfaces: [
                // The order of this array is significant. Index 0 (eth0) should be public.
                mockPublicConfigInterface,
                mockVlanConfigInterface,
                mockVpcConfigInterface,
            ],
        });
        var mockDisks = [
            {
                id: 44311273,
                status: 'ready',
                label: diskLabel,
                created: '2020-08-21T17:26:14',
                updated: '2020-08-21T17:26:30',
                filesystem: 'ext4',
                size: 81408,
            },
            {
                id: 44311274,
                status: 'ready',
                label: '512 MB Swap Image',
                created: '2020-08-21T17:26:14',
                updated: '2020-08-21T17:26:31',
                filesystem: 'swap',
                size: 512,
            },
        ];
        // Mock requests to get individual types.
        (0, linodes_2.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[0]);
        (0, linodes_2.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypes[1]);
        (0, linodes_2.mockGetLinodeTypes)(dc_specific_pricing_1.dcPricingMockLinodeTypes).as('getLinodeTypes');
        (0, regions_3.mockGetRegions)([mockVPCRegion]).as('getRegions');
        (0, vlans_1.mockGetVLANs)(mockVLANs);
        (0, vpc_1.mockGetVPC)(mockVPC).as('getVPC');
        (0, vpc_1.mockGetVPCs)([mockVPC]).as('getVPCs');
        (0, linodes_2.mockCreateLinode)(mockLinode).as('linodeCreated');
        (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
        (0, linodes_2.mockGetLinodeDisks)(mockLinode.id, mockDisks).as('getDisks');
        (0, linodes_2.mockGetLinodeVolumes)(mockLinode.id, []).as('getVolumes');
        // intercept request
        cy.visitWithLogin('/linodes/create');
        cy.wait('@getLinodeTypes');
        cy.get('[data-qa-header="Create"]').should('have.text', 'Create');
        // Check the 'Backups' add on
        cy.get('[data-testid="backups"]').should('be.visible').click();
        ui_1.ui.regionSelect.find().click().type("".concat(region.label, " {enter}"));
        // Verify VPCs get fetched once a region is selected
        cy.wait('@getVPCs');
        cy.findByText('Shared CPU').click();
        cy.get("[id=\"".concat(dc_specific_pricing_1.dcPricingMockLinodeTypes[0].id, "\"]")).click();
        // the "VPC" section is present, and the VPC in the same region of
        // the linode can be selected.
        cy.get('[data-testid="vpc-panel"]')
            .should('be.visible')
            .within(function () {
            cy.contains('Assign this Linode to an existing VPC.').should('be.visible');
            // select VPC
            cy.findByLabelText('Assign VPC').should('be.visible').focus();
            cy.focused().type("".concat(mockVPC.label, "{downArrow}{enter}"));
            // select subnet
            cy.findByPlaceholderText('Select Subnet')
                .should('be.visible')
                .type("".concat(mockSubnet.label, "{downArrow}{enter}"));
        });
        // The drawer opens when clicking "Add an SSH Key" button
        ui_1.ui.button
            .findByTitle('Add an SSH Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Add SSH Key')
            .should('be.visible')
            .within(function () {
            cy.get('[id="label"]').clear();
            cy.focused().type(sshPublicKeyLabel);
            // An alert displays when the format of SSH key is incorrect
            cy.get('[id="ssh-public-key"]').clear();
            cy.focused().type('WrongFormatSshKey');
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findAllByText('SSH Key key-type must be ssh-dss, ssh-rsa, ecdsa-sha2-nistp, ssh-ed25519, or sk-ecdsa-sha2-nistp256.').should('be.visible');
            // Create a new ssh key
            cy.get('[id="ssh-public-key"]').clear();
            cy.focused().type(sshPublicKey);
            ui_1.ui.button
                .findByTitle('Add Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // When a user creates an SSH key, a toast notification appears that says "Successfully created SSH key."
        ui_1.ui.toast.assertMessage('Successfully created SSH key.');
        // When a user creates an SSH key, the list of SSH keys for each user updates to show the new key for the signed in user
        cy.findByText(sshPublicKeyLabel, { exact: false }).should('be.visible');
        cy.get('#linode-label').clear();
        cy.focused().type(linodeLabel);
        cy.focused().click();
        cy.get('#root-password').type(rootpass);
        ui_1.ui.button.findByTitle('Create Linode').click();
        cy.wait('@linodeCreated').its('response.statusCode').should('eq', 200);
        cy.findByText(linodeLabel).should('be.visible');
        cy.contains('RUNNING', { timeout: 300000 }).should('be.visible');
    });
    /*
     * - Confirms error message can show up during Linode create flow.
     * - Confirms Linode can be created after retry.
     */
    it('shows unexpected error during Linode create flow', function () {
        var linodeRegion = (0, regions_1.chooseRegion)({
            capabilities: ['Linodes'],
        });
        var linodeLabel = (0, random_1.randomLabel)();
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: linodeLabel,
            region: linodeRegion.id,
        });
        var createLinodeErrorMessage = 'An error has occurred during Linode creation flow';
        (0, linodes_2.mockCreateLinodeError)(createLinodeErrorMessage).as('createLinodeError');
        cy.visitWithLogin('/linodes/create');
        // Set Linode label, OS, plan type, password, etc.
        pages_1.linodeCreatePage.setLabel(linodeLabel);
        pages_1.linodeCreatePage.selectImage('Debian 12');
        pages_1.linodeCreatePage.selectRegionById(linodeRegion.id);
        pages_1.linodeCreatePage.selectPlan('Shared CPU', 'Nanode 1 GB');
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Create Linode by clicking the button.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinodeError');
        // Confirm the createLinodeErrorMessage show up on the web page.
        cy.findByText("".concat(createLinodeErrorMessage)).should('be.visible');
        // Retry to create a Linode.
        (0, linodes_2.mockCreateLinode)(mockLinode).as('createLinode');
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode');
        // Confirm toast notification should appear on Linode create.
        ui_1.ui.toast.assertMessage("Your Linode ".concat(linodeLabel, " is being created."));
        // Confirm the createLinodeErrorMessage disappears.
        cy.findByText("".concat(createLinodeErrorMessage)).should('not.exist');
    });
    it('shows correct validation errors if no backup or plan is selected', function () {
        cy.visitWithLogin('/linodes/create');
        // Navigate to Linode Create page "Backups" tab
        cy.get('[role="tablist"]')
            .should('be.visible')
            .findByText('Backups')
            .click();
        // Submit without selecting any options
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Confirm the correct validation errors show up on the page.
        cy.findByText('You must select a Backup.').should('be.visible');
        cy.findByText('Plan is required.').should('be.visible');
    });
    /*
     * - Confirms UI flow when creating a Linode with a restricted user.
     * - Confirms that a notice is shown informing the user they do not have permission to create a Linode.
     * - Confirms that "Regions" field is disabled.
     * - Confirms that "Linux Distribution" field is disabled.
     * - Confirms that "Create Linode" button is disabled.
     */
    it('should not allow restricted users to create linodes', function () {
        // Mock setup for user profile, account user, and user grants with restricted permissions,
        // simulating a default user without the ability to add Linodes.
        var mockProfile = factories_1.profileFactory.build({
            username: (0, random_1.randomLabel)(),
            restricted: true,
        });
        var mockUser = factories_1.accountUserFactory.build({
            username: mockProfile.username,
            restricted: true,
            user_type: 'default',
        });
        var mockGrants = factories_1.grantsFactory.build({
            global: {
                add_linodes: false,
            },
        });
        (0, profile_2.mockGetProfile)(mockProfile);
        (0, profile_2.mockGetProfileGrants)(mockGrants);
        (0, account_2.mockGetUser)(mockUser);
        // Login and wait for application to load
        cy.visitWithLogin('/linodes/create');
        // Confirm that a notice should be shown informing the user they do not have permission to create a Linode.
        cy.findByText("You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions.").should('be.visible');
        // Confirm that "Region" select dropdown is disabled
        ui_1.ui.regionSelect.find().should('be.visible').should('be.disabled');
        // Confirm that "Linux Distribution" select dropdown is disabled
        cy.get('[data-qa-autocomplete="Linux Distribution"]').within(function () {
            cy.get('[placeholder="Choose a Linux distribution"]')
                .should('be.visible')
                .should('be.disabled');
            cy.get('[aria-label="Open"]').should('be.visible').should('be.disabled');
        });
        // Confirm that "Create Linode" button is visible and disabled
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .and('be.disabled');
    });
});
