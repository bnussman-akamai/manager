"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var linodes_1 = require("support/util/linodes");
var linodes_2 = require("src/factories/linodes");
var authentication_1 = require("support/api/authentication");
var cleanup_1 = require("support/util/cleanup");
var volumes_1 = require("support/intercepts/volumes");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var ui_1 = require("support/ui");
var feature_flags_1 = require("support/intercepts/feature-flags");
var factories_1 = require("src/factories");
var account_1 = require("support/intercepts/account");
var regions_2 = require("support/intercepts/regions");
var linodes_3 = require("support/intercepts/linodes");
var cypress_1 = require("support/constants/cypress");
// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
var pageSizeOverride = {
    PAGE_SIZE: 100,
};
var mockRegions = [
    factories_1.regionFactory.build({
        capabilities: ['Linodes', 'Block Storage', 'Block Storage Encryption'],
        id: 'us-east',
        label: 'Newark, NJ',
        site_type: 'core',
    }),
];
var CLIENT_LIBRARY_UPDATE_COPY = 'This Linode requires a client library update and will need to be rebooted prior to attaching an encrypted volume.';
(0, authentication_1.authenticate)();
describe('volume create flow', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['volumes', 'linodes']);
    });
    /*
     * - Creates a volume that is not attached to a Linode.
     * - Confirms that volume is listed correctly on volumes landing page.
     * - Add a single tag to the volume during creation.
     */
    it('creates an unattached volume', function () {
        cy.tag('purpose:syntheticTesting', 'method:e2e', 'purpose:dcTesting');
        var region = (0, regions_1.chooseRegion)();
        var volume = {
            label: (0, random_1.randomLabel)(),
            size: "".concat((0, random_1.randomNumber)(10, 250)),
            region: region.id,
            regionLabel: region.label,
        };
        (0, volumes_1.interceptCreateVolume)().as('createVolume');
        cy.visitWithLogin('/volumes/create', {
            localStorageOverrides: pageSizeOverride,
        });
        // Fill out and submit volume create form.
        cy.contains('Label').click().type(volume.label);
        cy.findByLabelText('Tags').click().type(cypress_1.entityTag);
        cy.contains('Size').click().type("{selectall}{backspace}".concat(volume.size));
        ui_1.ui.regionSelect.find().click().type("".concat(volume.region, "{enter}"));
        cy.findByText('Create Volume').click();
        cy.wait('@createVolume');
        // Validate volume configuration drawer opens, then close it.
        cy.findByText('Volume scheduled for creation.').should('be.visible');
        cy.get('[data-qa-close-drawer="true"]').click();
        // Confirm that volume is listed on landing page with expected configuration.
        cy.findByText(volume.label)
            .closest('tr')
            .within(function () {
            cy.findByText(volume.label).should('be.visible');
            cy.findByText("".concat(volume.size, " GB")).should('be.visible');
            cy.findByText(volume.regionLabel).should('be.visible');
            cy.findByText('Unattached');
        });
    });
    /*
     * - Creates a volume that is attached to an existing Linode.
     * - Confirms that volume is listed correctly on Volumes landing page.
     * - Confirms that volume is listed correctly on Linode 'Storage' details page.
     */
    it('creates an attached volume', function () {
        cy.tag('method:e2e', 'purpose:dcTesting');
        var region = (0, regions_1.chooseRegion)();
        var linodeRequest = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: region.id,
            root_pass: (0, random_1.randomString)(16),
            booted: false,
        });
        var volume = {
            label: (0, random_1.randomLabel)(),
            size: "".concat((0, random_1.randomNumber)(10, 250)),
            region: region.id,
            regionLabel: region.label,
        };
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeRequest); }, 'creating Linode').then(function (linode) {
            (0, volumes_1.interceptCreateVolume)().as('createVolume');
            cy.visitWithLogin('/volumes/create', {
                localStorageOverrides: pageSizeOverride,
            });
            // Fill out and submit volume create form.
            cy.contains('Label').click().type(volume.label);
            cy.contains('Size')
                .click()
                .type("{selectall}{backspace}".concat(volume.size));
            ui_1.ui.regionSelect.find().click().type("".concat(volume.region, "{enter}"));
            cy.findByLabelText('Linode')
                .should('be.visible')
                .click()
                .type(linode.label);
            ui_1.ui.autocompletePopper
                .findByTitle(linode.label)
                .should('be.visible')
                .click();
            // @TODO BSE: once BSE is fully rolled out, check for the notice (selected linode doesn't have
            // "Block Storage Encryption" capability + user checked "Encrypt Volume" checkbox) instead of the absence of it
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');
            cy.findByText('Create Volume').click();
            cy.wait('@createVolume');
            // Confirm volume configuration drawer opens, then close it.
            cy.findByText('Volume scheduled for creation.').should('be.visible');
            cy.get('[data-qa-close-drawer="true"]').click();
            // Confirm that volume is listed on landing page with expected configuration.
            cy.findByText(volume.label)
                .closest('tr')
                .within(function () {
                cy.findByText(volume.label).should('be.visible');
                cy.findByText("".concat(volume.size, " GB")).should('be.visible');
                cy.findByText(volume.regionLabel).should('be.visible');
                cy.findByText(linode.label).should('be.visible');
            });
            // Confirm that volume is listed on Linode 'Storage' details page.
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
            cy.findByText(volume.label)
                .closest('tr')
                .within(function () {
                cy.findByText(volume.label).should('be.visible');
                cy.findByText("".concat(volume.size, " GB")).should('be.visible');
            });
        });
    });
    /*
     * - Checks for Block Storage Encryption client library update notice on the Volume Create page.
     */
    it('displays a warning notice on Volume Create page re: rebooting for client library updates under the appropriate conditions', function () {
        // Conditions: Block Storage encryption feature flag is on; user has Block Storage Encryption capability; volume being created is encrypted and the
        // selected Linode does not support Block Storage Encryption
        // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            blockStorageEncryption: true,
        }).as('getFeatureFlags');
        // Mock account response
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes', 'Block Storage Encryption'],
        });
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        (0, regions_2.mockGetRegions)(mockRegions).as('getRegions');
        var linodeRequest = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            root_pass: (0, random_1.randomString)(16),
            region: mockRegions[0].id,
            booted: false,
        });
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeRequest); }, 'creating Linode').then(function (linode) {
            cy.visitWithLogin('/volumes/create');
            cy.wait(['@getFeatureFlags', '@getAccount']);
            // Select a linode without the BSE capability
            cy.findByLabelText('Linode')
                .should('be.visible')
                .click()
                .type(linode.label);
            ui_1.ui.autocompletePopper
                .findByTitle(linode.label)
                .should('be.visible')
                .click();
            // Check the "Encrypt Volume" checkbox
            cy.get('[data-qa-checked]').should('be.visible').click();
            // });
            // Ensure warning notice is displayed and "Create Volume" button is disabled
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
            ui_1.ui.button
                .findByTitle('Create Volume')
                .should('be.visible')
                .should('be.disabled');
        });
    });
    /*
     * - Checks for absence of Block Storage Encryption client library update notice on the Volume Create page
     *   when selected linode supports BSE
     */
    it('does not display a warning notice on Volume Create page re: rebooting for client library updates when selected linode supports BSE', function () {
        // Conditions: Block Storage encryption feature flag is on; user has Block Storage Encryption capability; volume being created is encrypted and the
        // selected Linode supports Block Storage Encryption
        // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            blockStorageEncryption: true,
        }).as('getFeatureFlags');
        // Mock account response
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes', 'Block Storage Encryption'],
        });
        // Mock linode
        var mockLinode = linodes_2.linodeFactory.build({
            region: mockRegions[0].id,
            id: 123456,
            capabilities: ['Block Storage Encryption'],
        });
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        (0, regions_2.mockGetRegions)(mockRegions).as('getRegions');
        (0, linodes_3.mockGetLinodes)([mockLinode]).as('getLinodes');
        (0, linodes_3.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin("/volumes/create");
        cy.wait(['@getAccount', '@getRegions', '@getLinodes']);
        // Select a linode without the BSE capability
        cy.findByLabelText('Linode')
            .should('be.visible')
            .click()
            .type(mockLinode.label);
        ui_1.ui.autocompletePopper
            .findByTitle(mockLinode.label)
            .should('be.visible')
            .click();
        // Check the "Encrypt Volume" checkbox
        cy.get('[data-qa-checked]').should('be.visible').click();
        // });
        // Ensure warning notice is not displayed and "Create Volume" button is enabled
        cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');
        ui_1.ui.button
            .findByTitle('Create Volume')
            .should('be.visible')
            .should('be.enabled');
    });
    /*
     * - Checks for Block Storage Encryption client library update notice in the Create/Attach Volume drawer from the
         'Storage' details page of an existing Linode.
     */
    it('displays a warning notice re: rebooting for client library updates under the appropriate conditions in Create/Attach Volume drawer', function () {
        // Conditions: Block Storage encryption feature flag is on; user has Block Storage Encryption capability; Linode does not support Block Storage Encryption and the user is trying to attach an encrypted volume
        // Mock feature flag -- @TODO BSE: Remove feature flag once BSE is fully rolled out
        (0, feature_flags_1.mockAppendFeatureFlags)({
            blockStorageEncryption: true,
        }).as('getFeatureFlags');
        // Mock account response
        var mockAccount = factories_1.accountFactory.build({
            capabilities: ['Linodes', 'Block Storage Encryption'],
        });
        (0, account_1.mockGetAccount)(mockAccount).as('getAccount');
        (0, regions_2.mockGetRegions)(mockRegions).as('getRegions');
        var volume = factories_1.volumeFactory.build({
            region: mockRegions[0].id,
            encryption: 'enabled',
        });
        var linodeRequest = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            root_pass: (0, random_1.randomString)(16),
            region: mockRegions[0].id,
            booted: false,
        });
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeRequest); }, 'creating Linode').then(function (linode) {
            (0, volumes_1.mockGetVolumes)([volume]).as('getVolumes');
            (0, volumes_1.mockGetVolume)(volume);
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
            cy.wait(['@getFeatureFlags', '@getAccount']);
            // Click "Add Volume" button
            cy.findByText('Add Volume').click();
            // Check "Encrypt Volume" checkbox
            cy.get('[data-qa-drawer="true"]').within(function () {
                cy.get('[data-qa-checked]').should('be.visible').click();
            });
            // Ensure client library update notice is displayed and the "Create Volume" button is disabled
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
            ui_1.ui.button.findByTitle('Create Volume').should('be.disabled');
            // Ensure notice is cleared when switching views in drawer
            cy.get('[data-qa-radio="Attach Existing Volume"]').click();
            cy.wait(['@getVolumes']);
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('not.exist');
            ui_1.ui.button
                .findByTitle('Attach Volume')
                .should('be.visible')
                .should('be.enabled');
            // Ensure notice is displayed in "Attach Existing Volume" view when an encrypted volume is selected, & that the "Attach Volume" button is disabled
            cy.findByPlaceholderText('Select a Volume')
                .should('be.visible')
                .click()
                .type("".concat(volume.label, "{downarrow}{enter}"));
            ui_1.ui.autocompletePopper
                .findByTitle(volume.label)
                .should('be.visible')
                .click();
            cy.findByText(CLIENT_LIBRARY_UPDATE_COPY).should('be.visible');
            ui_1.ui.button
                .findByTitle('Attach Volume')
                .should('be.visible')
                .should('be.disabled');
        });
    });
    /*
     * - Creates a volume from the 'Storage' details page of an existing Linode.
     * - Confirms that volume is listed correctly on Linode 'Storage' details page.
     * - Confirms that volume is listed correctly on Volumes landing page.
     */
    it('creates a volume from an existing Linode', function () {
        cy.tag('method:e2e');
        var linodeRequest = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            root_pass: (0, random_1.randomString)(16),
            region: (0, regions_1.chooseRegion)().id,
            booted: false,
        });
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeRequest); }, 'creating Linode').then(function (linode) {
            var volume = {
                label: (0, random_1.randomLabel)(),
                size: "".concat((0, random_1.randomNumber)(10, 250)),
            };
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"), {
                localStorageOverrides: pageSizeOverride,
            });
            // Click "Add Volume" button, fill out and submit volume create drawer form.
            cy.findByText('Add Volume').click();
            cy.get('[data-qa-drawer="true"]').within(function () {
                cy.findByText("Create Volume for ".concat(linode.label)).should('be.visible');
                cy.contains('Create and Attach Volume').click();
                cy.contains('Label').click().type(volume.label);
                cy.contains('Size').type("{selectall}{backspace}".concat(volume.size));
                cy.findByText('Create Volume').click();
            });
            // Confirm volume configuration drawer opens, then close it.
            cy.get('[data-qa-drawer="true"]').within(function () {
                cy.get('[data-qa-close-drawer="true"]').click();
            });
            // Confirm that volume is listed on Linode 'Storage' details page.
            cy.findByText(volume.label)
                .closest('tr')
                .within(function () {
                cy.findByText(volume.label).should('be.visible');
                cy.findByText("".concat(volume.size, " GB")).should('be.visible');
            });
            // Confirm that volume is listed on landing page with expected configuration.
            cy.visitWithLogin('/volumes', {
                localStorageOverrides: pageSizeOverride,
            });
            cy.findByText(volume.label)
                .closest('tr')
                .within(function () {
                cy.findByText(volume.label).should('be.visible');
                cy.findByText("".concat(volume.size, " GB")).should('be.visible');
                cy.findByText(linode.label).should('be.visible');
            });
        });
    });
});
