"use strict";
/**
 * @file Cypress integration tests for OBJ enrollment and cancellation.
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
var factories_1 = require("@src/factories");
var account_1 = require("support/intercepts/account");
var object_storage_1 = require("support/intercepts/object-storage");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var regions_1 = require("support/intercepts/regions");
var object_storage_2 = require("support/intercepts/object-storage");
var feature_flags_1 = require("support/intercepts/feature-flags");
// Various messages, notes, and warnings that may be shown when enabling Object Storage
// under different circumstances.
var objNotes = {
    // When enabling OBJ, in both the Access Key flow and Create Bucket flow, when OBJ DC-specific pricing is enabled.
    objDCPricing: 'Object Storage costs a flat rate of $5/month, and includes 250 GB of storage. When you enable Object Storage, 1 TB of outbound data transfer will be added to your global network transfer pool.',
    // Link to further DC-specific pricing information.
    dcPricingLearnMoreNote: 'Learn more about pricing and specifications.',
    // Information regarding the Object Storage cancellation process.
    cancellationExplanation: /To discontinue billing, you.*ll need to cancel Object Storage in your Account Settings./,
};
describe('Object Storage enrollment', function () {
    /*
     * - Confirms that Object Storage can be enabled using mock API data.
     * - Confirms that pricing information link is present in enrollment dialog.
     * - Confirms that cancellation explanation is present in enrollment dialog.
     * - Confirms that DC-specific overage pricing is explained for regions in the Create Bucket drawer.
     * - Confirms that consistent pricing information is shown for all regions in the enable modal.
     */
    it('can enroll in Object Storage', function () {
        (0, account_1.mockGetAccount)(factories_1.accountFactory.build({ capabilities: ['Object Storage'] }));
        (0, feature_flags_1.mockAppendFeatureFlags)({
            objMultiCluster: false,
            objectStorageGen2: { enabled: false },
        });
        var mockAccountSettings = factories_1.accountSettingsFactory.build({
            managed: false,
            object_storage: 'disabled',
        });
        var mockAccountSettingsEnabled = __assign(__assign({}, mockAccountSettings), { object_storage: 'active' });
        var mockRegions = [
            factories_1.regionFactory.build({
                capabilities: ['Object Storage'],
                label: 'Newark, NJ',
                id: 'us-east',
            }),
            factories_1.regionFactory.build({
                capabilities: ['Object Storage'],
                label: 'Sao Paulo, BR',
                id: 'br-gru',
            }),
            factories_1.regionFactory.build({
                capabilities: ['Object Storage'],
                label: 'Jakarta, ID',
                id: 'id-cgk',
            }),
        ];
        // Clusters with special pricing are currently hardcoded rather than
        // retrieved via API, so we have to mock the cluster API request to correspond
        // with that hardcoded data.
        //
        // Because the IDs used in the mocks don't correspond with any actual clusters,
        // we have to cast them as `ObjectStorageClusterID` to satisfy TypeScript.
        var mockClusters = [
            // Regions with special pricing.
            factories_1.objectStorageClusterFactory.build({
                id: 'br-gru-0',
                region: 'br-gru',
            }),
            factories_1.objectStorageClusterFactory.build({
                id: 'id-cgk-1',
                region: 'id-cgk',
            }),
            // A region that does not have special pricing.
            factories_1.objectStorageClusterFactory.build({
                id: 'us-east-1',
                region: 'us-east',
            }),
        ];
        var mockAccessKey = factories_1.objectStorageKeyFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        (0, account_1.mockGetAccountSettings)(mockAccountSettings).as('getAccountSettings');
        (0, object_storage_1.mockGetClusters)(mockClusters).as('getClusters');
        (0, object_storage_1.mockGetBuckets)([]).as('getBuckets');
        (0, regions_1.mockGetRegions)(mockRegions).as('getRegions');
        (0, object_storage_2.mockGetAccessKeys)([]);
        cy.visitWithLogin('/object-storage/buckets');
        cy.wait([
            '@getAccountSettings',
            '@getClusters',
            '@getBuckets',
            '@getRegions',
        ]);
        // Confirm that empty-state message is shown before proceeding.
        cy.findByText('S3-compatible storage solution').should('be.visible');
        // Click create button, select a region with special pricing, and submit.
        ui_1.ui.button
            .findByTitle('Create Bucket')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.drawer
            .findByTitle('Create Bucket')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label (required)')
                .should('be.visible')
                .type((0, random_1.randomLabel)());
            // Select a region with special pricing structure.
            ui_1.ui.regionSelect.find().click().type('Jakarta, ID{enter}');
            // Confirm DC-specific overage prices are shown in the drawer.
            cy.contains('For this region, additional storage costs $0.024 per GB.').should('be.visible');
            cy.contains('Outbound transfer will cost $0.015 per GB if it exceeds the network transfer pool for this region.').should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm dialog contents shows the expected information, then cancel.
        ui_1.ui.dialog
            .findByTitle('Enable Object Storage')
            .should('be.visible')
            .within(function () {
            // Confirm that regular pricing and DC-specific OBJ pricing notes are shown, as well as
            // additional pricing explanation link and cancellation information.
            cy.contains('To create your first bucket, you need to enable Object Storage.');
            cy.contains(objNotes.objDCPricing).should('be.visible');
            cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
            cy.contains(objNotes.cancellationExplanation).should('be.visible');
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Initiate bucket create flow again, and this time select a region with
        // regular pricing structure.
        ui_1.ui.drawer.findByTitle('Create Bucket').within(function () {
            // Select a region with regular pricing structure.
            ui_1.ui.regionSelect.find().click().type('Newark, NJ{enter}');
            // Confirm regular overage prices are shown in the drawer.
            cy.contains('For this region, additional storage costs $0.02 per GB.').should('be.visible');
            cy.contains('Outbound transfer will cost $0.005 per GB if it exceeds your global network transfer pool.').should('be.visible');
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Bucket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.dialog
            .findByTitle('Enable Object Storage')
            .should('be.visible')
            .within(function () {
            // Confirm that regular pricing information is shown, as well as
            // additional pricing explanation link and cancellation information.
            cy.contains(objNotes.objDCPricing).should('be.visible');
            cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
            cy.contains(objNotes.cancellationExplanation).should('be.visible');
            ui_1.ui.button
                .findByTitle('Cancel')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Close the "Create Bucket" drawer, and navigate to the "Access Keys" tab.
        ui_1.ui.drawer.findByTitle('Create Bucket').within(function () {
            ui_1.ui.drawerCloseButton.find().should('be.visible').click();
        });
        ui_1.ui.tabList.findTabByTitle('Access Keys').should('be.visible').click();
        ui_1.ui.button
            .findByTitle('Create Access Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out "Create Access Key" form, then submit.
        ui_1.ui.drawer
            .findByTitle('Create Access Key')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label')
                .should('be.visible')
                .type(mockAccessKey.label);
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Access Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm dialog contents shows the expected information.
        (0, object_storage_1.mockCreateAccessKey)(mockAccessKey).as('createAccessKey');
        (0, object_storage_2.mockGetAccessKeys)([mockAccessKey]).as('getAccessKey');
        (0, account_1.mockGetAccountSettings)(mockAccountSettingsEnabled).as('getAccountSettings');
        ui_1.ui.dialog
            .findByTitle('Enable Object Storage')
            .should('be.visible')
            .within(function () {
            // Confirm that DC-specific generic pricing notes are shown, as well as
            // additional pricing explanation link and cancellation information.
            cy.contains('To create your first access key, you need to enable Object Storage.');
            cy.contains(objNotes.objDCPricing).should('be.visible');
            cy.contains(objNotes.dcPricingLearnMoreNote).should('be.visible');
            cy.contains(objNotes.cancellationExplanation).should('be.visible');
            // Click "Enable Object Storage".
            ui_1.ui.button
                .findByAttribute('data-qa-enable-obj', 'true')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@createAccessKey', '@getAccessKey', '@getAccountSettings']);
        cy.findByText(mockAccessKey.label).should('be.visible');
        // Click through the "Access Keys" dialog which displays the new access key.
        ui_1.ui.dialog
            .findByTitle('Access Keys')
            .should('be.visible')
            .within(function () {
            ui_1.ui.button
                .findByTitle('I Have Saved My Secret Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.button
            .findByTitle('Create Access Key')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out "Create Access Key" form, then submit.
        ui_1.ui.drawer
            .findByTitle('Create Access Key')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Label').should('be.visible').type((0, random_1.randomLabel)());
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create Access Key')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.findByText('Enable Object Storage').should('not.exist');
    });
    /*
     * - Confirms that users can cancel Object Storage using mock API data.
     * - Confirms that users are warned of Object Storage cancellation data loss.
     * - Confirms that Account Settings page updates to reflect cancellation.
     */
    it('can cancel Object Storage', function () {
        var mockProfile = factories_1.profileFactory.build({
            username: (0, random_1.randomLabel)(),
        });
        var mockAccountSettings = factories_1.accountSettingsFactory.build({
            managed: false,
            object_storage: 'active',
        });
        // Cancellation notice is shown before cancelling OBJ, and the warning is
        // shown in the Type-to-Confirm when proceeding with cancellation.
        var cancellationNotice = 'Upon cancellation, all Object Storage Access Keys will be revoked, all buckets will be removed, and their objects deleted.';
        var cancellationWarning = 'Canceling Object Storage will permanently delete all buckets and their objects. Object Storage Access Keys will be revoked.';
        // Shown on the settings page when Object Storage is not enabled.
        var getStartedNote = 'To get started with Object Storage, create a Bucket or an Access Key.';
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        (0, account_1.mockGetAccountSettings)(mockAccountSettings).as('getAccountSettings');
        (0, object_storage_1.mockCancelObjectStorage)().as('cancelObjectStorage');
        cy.visitWithLogin('/account/settings');
        cy.wait(['@getProfile', '@getAccountSettings']);
        ui_1.ui.accordion
            .findByTitle('Object Storage')
            .should('be.visible')
            .within(function () {
            // Confirm that the user is informed that cancelling OBJ will delete their buckets and keys.
            cy.contains(cancellationNotice).should('be.visible');
            ui_1.ui.button
                .findByTitle('Cancel Object Storage')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        ui_1.ui.dialog
            .findByTitle('Cancel Object Storage')
            .should('be.visible')
            .within(function () {
            // Confirm that the user is once again warned of cancellation consequences.
            cy.contains(cancellationWarning).should('be.visible');
            cy.findByLabelText('Username')
                .should('be.visible')
                .type(mockProfile.username);
            ui_1.ui.button
                .findByTitle('Confirm Cancellation')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@cancelObjectStorage');
        ui_1.ui.toast.assertMessage('Object Storage successfully canceled.');
        // Confirm that settings page updates to reflect that Object Storage is disabled.
        cy.contains(getStartedNote).should('be.visible');
    });
});
