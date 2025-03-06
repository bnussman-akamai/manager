"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable sonarjs/no-duplicate-string */
var factories_1 = require("@src/factories");
var linodes_1 = require("support/intercepts/linodes");
var volumes_1 = require("support/intercepts/volumes");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var constants_1 = require("src/utilities/pricing/constants");
var region = 'US, Newark, NJ';
/**
 * Asserts that a volume is listed and has the expected config information.
 *
 * The "Volume Configuration" drawer should be open before this function is
 * called.
 *
 * @param volumeLabel - Label of Volume to validate.
 * @param attachedLinodeLabel - Label of attached Linode if applicable.
 */
var validateBasicVolume = function (volumeLabel, attachedLinodeLabel) {
    var attached = attachedLinodeLabel !== null && attachedLinodeLabel !== void 0 ? attachedLinodeLabel : 'Unattached';
    ui_1.ui.drawer
        .findByTitle('Volume Configuration')
        .should('be.visible')
        .within(function () {
        cy.findByDisplayValue("mkdir \"/mnt/".concat(volumeLabel, "\"")).should('be.visible');
        ui_1.ui.drawerCloseButton.find().should('be.visible').click();
    });
    cy.findByText(volumeLabel)
        .closest('tr')
        .within(function () {
        cy.findByText(region).should('be.visible');
        cy.findByText(attached).should('be.visible');
    });
};
// Force Volume table to be organized and sorted in a specific way to reduce flake.
// This is a workaround for accounts that have volumes unrelated to tests.
// @TODO Remove preference override when volumes are removed from test accounts.
var preferenceOverrides = {
    linodes_view_style: 'list',
    linodes_group_by_tag: false,
    volumes_group_by_tag: false,
    desktop_sidebar_open: false,
    sortKeys: {
        'linodes-landing': { order: 'asc', orderBy: 'label' },
        volume: { order: 'desc', orderBy: 'label' },
    },
};
// Local storage override to force volume table to list up to 100 items.
// This is a workaround for accounts that have volumes unrelated to tests.
// @TODO Remove local storage override when volumes are removed from test accounts.
var localStorageOverrides = {
    PAGE_SIZE: 100,
};
describe('volumes', function () {
    it('creates a volume without linode from volumes page', function () {
        var mockVolume = factories_1.volumeFactory.build({ label: (0, random_1.randomLabel)() });
        var mockVolumeTypes = factories_1.volumeTypeFactory.buildList(1);
        (0, volumes_1.mockGetVolumes)([]).as('getVolumes');
        (0, volumes_1.mockCreateVolume)(mockVolume).as('createVolume');
        (0, volumes_1.mockGetVolume)(mockVolume).as('getVolume');
        (0, volumes_1.mockGetVolumeTypes)(mockVolumeTypes).as('getVolumeTypes');
        cy.visitWithLogin('/volumes', {
            preferenceOverrides: preferenceOverrides,
            localStorageOverrides: localStorageOverrides,
        });
        ui_1.ui.button.findByTitle('Create Volume').should('be.visible').click();
        cy.url().should('endWith', 'volumes/create');
        cy.wait('@getVolumeTypes');
        ui_1.ui.button.findByTitle('Create Volume').should('be.visible').click();
        cy.findByText('Label is required.').should('be.visible');
        cy.findByLabelText('Label', { exact: false })
            .should('be.visible')
            .click()
            .type(mockVolume.label);
        ui_1.ui.button.findByTitle('Create Volume').should('be.visible').click();
        cy.findByText('Must provide a region or a Linode ID.').should('be.visible');
        ui_1.ui.regionSelect.find().click().type('newark{enter}');
        (0, volumes_1.mockGetVolumes)([mockVolume]).as('getVolumes');
        ui_1.ui.button.findByTitle('Create Volume').should('be.visible').click();
        cy.wait(['@createVolume', '@getVolume', '@getVolumes']);
        validateBasicVolume(mockVolume.label);
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Volume ".concat(mockVolume.label))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible');
    });
    it('creates volume from linode details', function () {
        var mockLinode = factories_1.linodeFactory.build({
            label: (0, random_1.randomLabel)(),
            id: (0, random_1.randomNumber)(),
        });
        var newVolume = factories_1.volumeFactory.build({
            linode_id: mockLinode.id,
            label: (0, random_1.randomLabel)(),
        });
        (0, volumes_1.mockCreateVolume)(newVolume).as('createVolume');
        (0, linodes_1.mockGetLinodes)([mockLinode]).as('getLinodes');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinodeDetail');
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, []).as('getVolumes');
        cy.visitWithLogin('/linodes', {
            preferenceOverrides: preferenceOverrides,
            localStorageOverrides: localStorageOverrides,
        });
        // Visit a Linode's details page.
        cy.wait('@getLinodes');
        cy.findByText(mockLinode.label).should('be.visible').click();
        cy.wait('@getVolumes');
        cy.wait('@getLinodeDetail');
        // Create a new volume.
        cy.get('main').within(function () {
            cy.findByText('Storage').should('be.visible').click();
        });
        ui_1.ui.button.findByTitle('Add Volume').should('be.visible').click();
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, [newVolume]).as('getVolumes');
        ui_1.ui.drawer
            .findByTitle("Create Volume for ".concat(mockLinode.label))
            .should('be.visible')
            .within(function () {
            cy.findByText('Create and Attach Volume').should('be.visible').click();
            cy.get('[data-qa-volume-label]').click().type(newVolume.label);
            ui_1.ui.button.findByTitle('Create Volume').should('be.visible').click();
        });
        cy.wait(['@createVolume', '@getVolumes']);
        ui_1.ui.drawer
            .findByTitle('Volume Configuration')
            .should('be.visible')
            .within(function () {
            cy.findByDisplayValue("mkdir \"/mnt/".concat(newVolume.label, "\"")).should('be.visible');
            ui_1.ui.drawerCloseButton.find().click();
        });
        // Confirm that new volume is shown.
        cy.findByText('1 Volume').should('be.visible');
    });
    it('detaches attached volume', function () {
        var mockLinode = factories_1.linodeFactory.build({ label: (0, random_1.randomLabel)() });
        var mockAttachedVolume = factories_1.volumeFactory.build({
            label: (0, random_1.randomLabel)(),
            linode_id: mockLinode.id,
            linode_label: mockLinode.label,
        });
        (0, volumes_1.mockDetachVolume)(mockAttachedVolume.id).as('detachVolume');
        (0, volumes_1.mockGetVolumes)([mockAttachedVolume]).as('getAttachedVolumes');
        (0, volumes_1.mockGetVolume)(mockAttachedVolume).as('getVolume');
        cy.visitWithLogin('/volumes', {
            preferenceOverrides: preferenceOverrides,
            localStorageOverrides: localStorageOverrides,
        });
        cy.wait('@getAttachedVolumes');
        cy.findByText(mockAttachedVolume.label).should('be.visible');
        cy.findByText(mockLinode.label).should('be.visible');
        ui_1.ui.actionMenu
            .findByTitle("Action menu for Volume ".concat(mockAttachedVolume.label))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem.findByTitle('Detach').click();
        cy.wait('@getVolume');
        ui_1.ui.dialog
            .findByTitle("Detach Volume ".concat(mockAttachedVolume.label, "?"))
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Volume Label')
                .should('be.visible')
                .click()
                .type(mockAttachedVolume.label);
            ui_1.ui.button
                .findByTitle('Detach')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait('@detachVolume').its('response.statusCode').should('eq', 200);
        ui_1.ui.toast.assertMessage('Volume detachment started');
    });
    it('does not allow creation of a volume with invalid pricing from volumes landing', function () {
        var mockVolume = factories_1.volumeFactory.build({ label: (0, random_1.randomLabel)() });
        (0, volumes_1.mockGetVolumes)([]).as('getVolumes');
        (0, volumes_1.mockCreateVolume)(mockVolume).as('createVolume');
        // Mock an error response to the /types endpoint so prices cannot be calculated.
        (0, volumes_1.mockGetVolumeTypesError)().as('getVolumeTypesError');
        cy.visitWithLogin('/volumes', {
            preferenceOverrides: preferenceOverrides,
            localStorageOverrides: localStorageOverrides,
        });
        ui_1.ui.button.findByTitle('Create Volume').should('be.visible').click();
        cy.url().should('endWith', 'volumes/create');
        ui_1.ui.regionSelect.find().click().type('newark{enter}');
        cy.wait(['@getVolumeTypesError']);
        // Confirm that unknown pricing placeholder text displays, create button is disabled, and error tooltip displays.
        cy.findByText("$".concat(constants_1.UNKNOWN_PRICE, "/month")).should('be.visible');
        ui_1.ui.button
            .findByTitle('Create Volume')
            .should('be.visible')
            .should('be.disabled')
            .trigger('mouseover');
        ui_1.ui.tooltip.findByText(constants_1.PRICES_RELOAD_ERROR_NOTICE_TEXT).should('be.visible');
    });
    it('does not allow creation of a volume with invalid pricing from linode details', function () {
        var mockLinode = factories_1.linodeFactory.build({
            label: (0, random_1.randomLabel)(),
            id: (0, random_1.randomNumber)(),
        });
        var newVolume = factories_1.volumeFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        (0, volumes_1.mockCreateVolume)(newVolume).as('createVolume');
        (0, linodes_1.mockGetLinodes)([mockLinode]).as('getLinodes');
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinodeDetail');
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, []).as('getVolumes');
        // Mock an error response to the /types endpoint so prices cannot be calculated.
        (0, volumes_1.mockGetVolumeTypesError)().as('getVolumeTypesError');
        cy.visitWithLogin('/linodes', {
            preferenceOverrides: preferenceOverrides,
            localStorageOverrides: localStorageOverrides,
        });
        // Visit a Linode's details page.
        cy.wait('@getLinodes');
        cy.findByText(mockLinode.label).should('be.visible').click();
        cy.wait(['@getVolumes', '@getLinodeDetail']);
        // Open the Add Volume drawer.
        cy.get('main').within(function () {
            cy.findByText('Storage').should('be.visible').click();
        });
        ui_1.ui.button.findByTitle('Add Volume').should('be.visible').click();
        cy.wait(['@getVolumeTypesError']);
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, [newVolume]).as('getVolumes');
        ui_1.ui.drawer
            .findByTitle("Create Volume for ".concat(mockLinode.label))
            .should('be.visible')
            .within(function () {
            cy.findByText('Create and Attach Volume').should('be.visible').click();
            // Confirm that unknown pricing placeholder text displays, create button is disabled, and error tooltip displays.
            cy.contains("$".concat(constants_1.UNKNOWN_PRICE, "/mo")).should('be.visible');
            ui_1.ui.button
                .findByTitle('Create Volume')
                .should('be.visible')
                .should('be.disabled')
                .trigger('mouseover');
            ui_1.ui.tooltip
                .findByText(constants_1.PRICES_RELOAD_ERROR_NOTICE_TEXT)
                .should('be.visible');
        });
    });
});
