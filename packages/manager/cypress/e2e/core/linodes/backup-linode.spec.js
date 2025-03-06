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
var factories_1 = require("@src/factories");
var authentication_1 = require("support/api/authentication");
var account_1 = require("support/intercepts/account");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var regions_1 = require("support/util/regions");
var managed_1 = require("support/api/managed");
var linodes_2 = require("support/util/linodes");
var linodes_3 = require("support/constants/linodes");
var BackupsCancellationNote = 'Once backups for this Linode have been canceled, you cannot re-enable them for 24 hours.';
var ReenableBackupsFailureNote = 'Please wait 24 hours before reactivating backups for this Linode.';
(0, authentication_1.authenticate)();
describe('linode backups', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('linodes');
    });
    /*
     * - Confirms that backups can be enabled for a Linode using real API data.
     * - Confirms that enable backup prompt is shown when backups are not enabled.
     * - Confirms that user is warned of additional backups charges before enabling.
     * - Confirms that Linode details page updates to reflect that backups are enabled.
     * - Confirms that user can cancel Linode backups.
     * - Confirms that user cannot re-enable Linode backups after canceling.
     */
    it('can enable backups', function () {
        cy.tag('method:e2e');
        // Skip or optionally fail if test account has Managed enabled.
        // This is necessary because Managed accounts have backups enabled implicitly.
        (0, managed_1.expectManagedDisabled)();
        // Create a Linode that is not booted and which does not have backups enabled.
        var createLinodeRequest = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
            backups_enabled: false,
            booted: false,
        });
        cy.defer(function () { return (0, linodes_2.createTestLinode)(createLinodeRequest); }, 'creating Linode').then(function (linode) {
            (0, linodes_1.interceptGetLinode)(linode.id).as('getLinode');
            (0, linodes_1.interceptEnableLinodeBackups)(linode.id).as('enableBackups');
            (0, linodes_1.interceptCancelLinodeBackups)(linode.id).as('cancelBackups');
            // Navigate to Linode details page "Backups" tab.
            cy.visitWithLogin("linodes/".concat(linode.id));
            cy.findAllByText('Backups').should('be.visible').click();
            cy.wait('@getLinode');
            // Wait for Linode to finish provisioning.
            cy.findByText('OFFLINE', { timeout: linodes_3.LINODE_CREATE_TIMEOUT }).should('be.visible');
            // Confirm that enable backups prompt is shown.
            cy.contains('Three backup slots are executed and rotated automatically').should('be.visible');
            ui_1.ui.button
                .findByTitle('Enable Backups')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle('Enable backups?')
                .should('be.visible')
                .within(function () {
                // Confirm that user is warned of additional backup charges.
                cy.contains(/.* This will add .* to your monthly bill\./).should('be.visible');
                ui_1.ui.button
                    .findByTitle('Enable Backups')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that toast notification appears and UI updates to reflect enabled backups.
            cy.wait('@enableBackups');
            ui_1.ui.toast.assertMessage('Backups are being enabled for this Linode.');
            cy.findByText('Automatic and manual backups will be listed here').should('be.visible');
            // Confirm Backups Cancellation Note is visible when cancel Linode backups.
            ui_1.ui.button
                .findByTitle('Cancel Backups')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle('Confirm Cancellation')
                .should('be.visible')
                .within(function () {
                cy.contains(BackupsCancellationNote).should('be.visible');
                ui_1.ui.button
                    .findByTitle('Cancel Backups')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm toast notification appears and UI updates to reflect cancel backups.
            cy.wait('@cancelBackups');
            ui_1.ui.toast.assertMessage('Backups are being canceled for this Linode');
            // Confirm that user is warned when attempting to re-enable Linode backups after canceling.
            ui_1.ui.button
                .findByTitle('Enable Backups')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle('Enable backups?')
                .should('be.visible')
                .within(function () {
                ui_1.ui.button
                    .findByTitle('Enable Backups')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Confirm that users cannot re-enable backups without first waiting 24 hrs.
                cy.contains(ReenableBackupsFailureNote).should('be.visible');
            });
        });
    });
    /*
     * - Confirms that users can create Linode snapshots using real API data.
     * - Confirms that backups page content updates to reflect new snapshot.
     */
    it('can capture a manual snapshot', function () {
        cy.tag('method:e2e');
        // Create a Linode that is not booted and which has backups enabled.
        var createLinodeRequest = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
            backups_enabled: true,
            booted: false,
        });
        var snapshotName = (0, random_1.randomLabel)();
        cy.defer(function () { return (0, linodes_2.createTestLinode)(createLinodeRequest); }, 'creating Linode').then(function (linode) {
            (0, linodes_1.interceptGetLinode)(linode.id).as('getLinode');
            (0, linodes_1.interceptCreateLinodeSnapshot)(linode.id).as('createSnapshot');
            // Navigate to Linode details page "Backups" tab.
            cy.visitWithLogin("linodes/".concat(linode.id));
            cy.findAllByText('Backups').should('be.visible').click();
            cy.wait('@getLinode');
            // Wait for the Linode to finish provisioning.
            cy.findByText('OFFLINE', { timeout: linodes_3.LINODE_CREATE_TIMEOUT }).should('be.visible');
            cy.findByText('Manual Snapshot')
                .should('be.visible')
                .parent()
                .within(function () {
                // Confirm that "Take Snapshot" button is disabled until a name is entered.
                ui_1.ui.button
                    .findByTitle('Take Snapshot')
                    .should('be.visible')
                    .should('be.disabled');
                // Enter a snapshot name, click "Take Snapshot".
                cy.findByLabelText('Name Snapshot').should('be.visible').clear();
                cy.focused().type(snapshotName);
                ui_1.ui.button
                    .findByTitle('Take Snapshot')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Submit confirmation, confirm that toast message appears.
            ui_1.ui.dialog
                .findByTitle('Take a snapshot?')
                .should('be.visible')
                .within(function () {
                // Confirm user is warned that previous snapshot will be replaced.
                cy.contains('overriding your previous snapshot').should('be.visible');
                cy.contains('Are you sure?').should('be.visible');
                ui_1.ui.button
                    .findByTitle('Take Snapshot')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            cy.wait('@createSnapshot');
            ui_1.ui.toast.assertMessage('Starting to capture snapshot');
            // Confirm that new snapshot is listed in backups table.
            cy.findByText(snapshotName)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('Pending').should('be.visible');
            });
        });
    });
});
describe('"Enable Linode Backups" banner', function () {
    /**
     * - Uses mock API data to confirm that "Enable Linode Backups" notice appears.
     * - Confirms notice appears when not dismissed and when Linodes do not have backups enabled.
     * - Confirms notice does not appear once dismissed.
     * - Confirms notice does not appear when all Linodes have backups enabled.
     * - Confirms notice can be dismissed.
     */
    it('shows "Enable Linode Backups" banner', function () {
        var enableBackupsMessage = 'Enable Linode Backups to protect your data and recover quickly in an emergency.';
        var mockAccountSettings = factories_1.accountSettingsFactory.build({
            backups_enabled: false,
            managed: false,
        });
        // Mock Linodes that do not have backups enabled.
        var mockLinodes = factories_1.linodeFactory.buildList(2, {
            backups: { enabled: false },
        });
        // Mock Linodes which do have backups enabled.
        var mockLinodesWithBackups = factories_1.linodeFactory.buildList(2, {
            backups: factories_1.linodeBackupsFactory.build({
                enabled: true,
            }),
        });
        // Navigate to Linodes landing page with backups notice not dismissed.
        // Confirm notice appears when Linodes do not have backups enabled,
        // and confirm that the notice can be dismissed.
        (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
        (0, account_1.mockGetAccountSettings)(mockAccountSettings).as('getAccountSettings');
        cy.visitWithLogin('/linodes', {
            preferenceOverrides: {
                backups_cta_dismissed: false,
            },
        });
        cy.wait(['@getLinodes', '@getAccountSettings']);
        cy.contains(enableBackupsMessage).should('be.visible');
        // Click dismiss button.
        cy.findByLabelText('Dismiss notice enabling Linode backups')
            .should('be.visible')
            .click();
        cy.contains(enableBackupsMessage).should('not.exist');
        // Navigate to Linodes landing page with backups notice dismissed.
        // Confirm notice does not appear when it has already been dismissed.
        cy.visitWithLogin('/linodes', {
            preferenceOverrides: {
                backups_cta_dismissed: true,
            },
        });
        cy.wait('@getLinodes');
        cy.contains(enableBackupsMessage).should('not.exist');
        // Navigate to Linodes landing page with backups notice not dismissed.
        // Confirm notice does not appear when Linodes already have backups enabled.
        (0, linodes_1.mockGetLinodes)(mockLinodesWithBackups).as('getLinodes');
        cy.visitWithLogin('/linodes', {
            perferenceOverrides: {
                backups_cta_dismissed: false,
            },
        });
        cy.wait('@getLinodes');
        cy.contains(enableBackupsMessage).should('not.exist');
    });
    /*
     * - Confirms that Linode backups can be enabled via "Enable Linode Backups" notice.
     * - Confirms that backup auto-enrollment settings are shown when auto-enrollment is disabled.
     * - Confirms that backups drawer lists each Linode which does not have backups enabled.
     * - Confirms that backups drawer does not list Linodes which already have backups enabled.
     * - Confirms toast notification appears upon updating Linode backup settings.
     */
    it('can enable Linode backups via "Enable Linode Backups" notice', function () {
        var mockLinodesNoBackups = [
            // `us-central` has a normal pricing structure, whereas `us-east` and `us-west`
            // are mocked to have special pricing structures.
            //
            // See `dcPricingMockLinodeTypes` exported from `support/constants/dc-specific-pricing.ts`.
            factories_1.linodeFactory.build({
                label: (0, random_1.randomLabel)(),
                region: 'us-ord',
                backups: { enabled: false },
                type: dc_specific_pricing_1.dcPricingMockLinodeTypesForBackups[0].id,
            }),
            factories_1.linodeFactory.build({
                label: (0, random_1.randomLabel)(),
                region: 'us-east',
                backups: { enabled: false },
                type: dc_specific_pricing_1.dcPricingMockLinodeTypesForBackups[1].id,
            }),
            factories_1.linodeFactory.build({
                label: (0, random_1.randomLabel)(),
                region: 'us-west',
                backups: { enabled: false },
                type: dc_specific_pricing_1.dcPricingMockLinodeTypesForBackups[2].id,
            }),
            factories_1.linodeFactory.build({
                label: (0, random_1.randomLabel)(),
                region: 'us-central',
                backups: { enabled: false },
                type: 'g6-nanode-1',
            }),
        ];
        var mockLinodesBackups = factories_1.linodeFactory.buildList(2, {
            backups: factories_1.linodeBackupsFactory.build(),
        });
        // Combined list of Linodes, some with backups enabled and others without.
        var mockLinodes = __spreadArray(__spreadArray([], mockLinodesNoBackups, true), mockLinodesBackups, true);
        // Mock account settings before and after enabling auto backup enrollment.
        var mockInitialAccountSettings = factories_1.accountSettingsFactory.build({
            backups_enabled: false,
            managed: false,
        });
        var mockUpdatedAccountSettings = __assign(__assign({}, mockInitialAccountSettings), { backups_enabled: true });
        // Mock each API request to enable backups, and return an array of aliases for each request.
        var enableBackupAliases = mockLinodesNoBackups.map(function (linode) {
            var alias = "enableLinodeBackups-".concat(linode.label);
            (0, linodes_1.mockEnableLinodeBackups)(linode.id).as(alias);
            return "@".concat(alias);
        });
        // The expected backup price for each Linode, as shown in backups drawer table.
        var expectedPrices = [
            '$0.00/mo', // us-ord mocked price.
            '$3.57/mo', // us-east mocked price.
            '$4.17/mo', // us-west mocked price.
            '$2.00/mo', // regular price.
        ];
        // The expected total cost of enabling backups, as shown in backups drawer.
        var expectedTotal = '$9.74/mo';
        (0, linodes_1.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypesForBackups[0]);
        (0, linodes_1.mockGetLinodeType)(dc_specific_pricing_1.dcPricingMockLinodeTypesForBackups[1]);
        (0, linodes_1.mockGetLinodeTypes)(dc_specific_pricing_1.dcPricingMockLinodeTypesForBackups);
        (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
        (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
        (0, account_1.mockGetAccountSettings)(mockInitialAccountSettings).as('getAccountSettings');
        (0, account_1.mockUpdateAccountSettings)(mockUpdatedAccountSettings).as('updateAccountSettings');
        cy.visitWithLogin('/linodes', {
            preferenceOverrides: {
                backups_cta_dismissed: false,
            },
        });
        cy.wait(['@getAccountSettings', '@getLinodes']);
        // Click "Enable Linode Backups" link within backups notice.
        cy.findByText('Enable Linode Backups').should('be.visible').click();
        ui_1.ui.drawer
            .findByTitle('Enable All Backups')
            .should('be.visible')
            .within(function () {
            // Confirm that auto-enroll setting section is shown.
            cy.findByText('Auto Enroll All New Linodes in Backups').should('be.visible');
            // Confirm that expected total cost is shown.
            cy.contains("Total for 4 Linodes: ".concat(expectedTotal)).should('be.visible');
            // Confirm that "Region" column is shown.
            cy.findByLabelText('List of Linodes without backups')
                .should('be.visible')
                .within(function () {
                cy.findByText('Region').should('be.visible');
            });
            // Confirm that each Linode without backups enabled is listed alongside its DC-specific price.
            mockLinodesNoBackups.forEach(function (linode, i) {
                var expectedPrice = expectedPrices[i];
                cy.findByText(linode.label)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByText(expectedPrice).should('be.visible');
                    // Confirm no error indicator appears for $0.00 prices.
                    cy.findByLabelText('There was an error loading the price.').should('not.exist');
                });
            });
            // Confirm that Linodes with backups already enabled are not listed.
            mockLinodesBackups.forEach(function (linode) {
                cy.findByText(linode.label).should('not.exist');
            });
            // Confirm backup changes.
            ui_1.ui.button
                .findByTitle('Confirm')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Wait for backups to be enabled and settings to be updated, then confirm
        // that toast notification appears in order to confirm the changes.
        cy.wait(__spreadArray(__spreadArray([], enableBackupAliases, true), ['@updateAccountSettings'], false));
        ui_1.ui.toast.assertMessage('4 Linodes have been enrolled in automatic backups, and all new Linodes will automatically be backed up.');
    });
});
