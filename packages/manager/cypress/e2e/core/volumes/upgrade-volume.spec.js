"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var events_1 = require("support/intercepts/events");
var linodes_1 = require("support/intercepts/linodes");
var volumes_1 = require("support/intercepts/volumes");
var ui_1 = require("support/ui");
describe('volume upgrade/migration', function () {
    it('can upgrade an unattached volume to NVMe', function () {
        var volume = factories_1.volumeFactory.build();
        var migrationScheduledNotification = factories_1.notificationFactory.build({
            type: 'volume_migration_scheduled',
            entity: { type: 'volume', id: volume.id },
        });
        (0, volumes_1.mockGetVolumes)([volume]).as('getVolumes');
        (0, volumes_1.mockGetVolume)(volume).as('getVolume');
        (0, volumes_1.mockMigrateVolumes)().as('migrateVolumes');
        (0, events_1.mockGetNotifications)([migrationScheduledNotification]).as('getNotifications');
        cy.visitWithLogin('/volumes');
        cy.wait(['@getVolumes', '@getNotifications']);
        cy.findByText('UPGRADE TO NVMe')
            .should('be.visible')
            .should('be.enabled')
            .click();
        var migrationImminentNotification = factories_1.notificationFactory.build({
            type: 'volume_migration_imminent',
            entity: { type: 'volume', id: volume.id },
        });
        (0, events_1.mockGetNotifications)([migrationImminentNotification]).as('getNotifications');
        ui_1.ui.dialog.findByTitle("Upgrade Volume ".concat(volume.label)).within(function () {
            ui_1.ui.button
                .findByTitle('Enter Upgrade Queue')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@migrateVolumes', '@getVolume', '@getNotifications']);
        cy.findByText('UPGRADE PENDING').should('be.visible');
        for (var _i = 0, _a = [10, 20, 50, 75]; _i < _a.length; _i++) {
            var percentage = _a[_i];
            var mockStartedMigrationEvent = factories_1.eventFactory.build({
                action: 'volume_migrate',
                entity: { id: volume.id, type: 'volume' },
                status: 'started',
                percent_complete: percentage,
            });
            (0, events_1.mockGetEvents)([mockStartedMigrationEvent]).as('getEvents');
            cy.wait('@getEvents');
            cy.findByText("migrating (".concat(percentage, "%)")).should('be.visible');
        }
        var mockFinishedMigrationEvent = factories_1.eventFactory.build({
            action: 'volume_migrate',
            entity: { id: volume.id, type: 'volume', label: volume.label },
            status: 'finished',
        });
        (0, events_1.mockGetEvents)([mockFinishedMigrationEvent]).as('getEvents');
        (0, events_1.mockGetNotifications)([]).as('getNotifications');
        cy.wait(['@getEvents', '@getVolumes', '@getNotifications']);
        (0, events_1.mockGetEvents)([]);
        cy.findByText('active').should('be.visible');
        ui_1.ui.toast.assertMessage("Volume ".concat(volume.label, " has been migrated to NVMe."));
    });
    it('can upgrade an attached volume from the volumes landing page', function () {
        var linode = factories_1.linodeFactory.build();
        var volume = factories_1.volumeFactory.build({
            linode_id: linode.id,
            linode_label: linode.label,
        });
        var migrationScheduledNotification = factories_1.notificationFactory.build({
            type: 'volume_migration_scheduled',
            entity: { type: 'volume', id: volume.id },
        });
        (0, volumes_1.mockGetVolumes)([volume]).as('getVolumes');
        (0, volumes_1.mockMigrateVolumes)().as('migrateVolumes');
        (0, linodes_1.mockGetLinodeDetails)(linode.id, linode).as('getLinode');
        (0, linodes_1.mockGetLinodeDisks)(linode.id, []);
        (0, events_1.mockGetNotifications)([migrationScheduledNotification]).as('getNotifications');
        (0, linodes_1.mockGetLinodeVolumes)(linode.id, [volume]).as('getLinodeVolumes');
        cy.visitWithLogin('/volumes');
        cy.wait(['@getVolumes', '@getNotifications']);
        cy.findByText('UPGRADE TO NVMe')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('contain', "/linodes/".concat(linode.id, "/storage?upgrade=true"));
        cy.wait(['@getLinode', '@getLinodeVolumes']);
        var migrationImminentNotification = factories_1.notificationFactory.build({
            type: 'volume_migration_imminent',
            entity: { type: 'volume', id: volume.id },
        });
        (0, events_1.mockGetNotifications)([migrationImminentNotification]).as('getNotifications');
        ui_1.ui.dialog.findByTitle('Upgrade Volume').within(function () {
            cy.findByText("A Volume attached to Linode ".concat(linode.label, " will be upgraded to high-performance NVMe Block Storage."), { exact: false }).should('be.visible');
            ui_1.ui.button
                .findByTitle('Enter Upgrade Queue')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@migrateVolumes', '@getNotifications']);
        cy.findByText('UPGRADE PENDING').should('be.visible');
        for (var _i = 0, _a = [10, 20, 50, 75]; _i < _a.length; _i++) {
            var percentage = _a[_i];
            var mockStartedMigrationEvent = factories_1.eventFactory.build({
                action: 'volume_migrate',
                entity: { id: volume.id, type: 'volume' },
                status: 'started',
                percent_complete: percentage,
            });
            (0, events_1.mockGetEvents)([mockStartedMigrationEvent]).as('getEvents');
            cy.wait('@getEvents');
            cy.findByText("migrating (".concat(percentage, "%)")).should('be.visible');
        }
        var mockFinishedMigrationEvent = factories_1.eventFactory.build({
            action: 'volume_migrate',
            entity: { id: volume.id, type: 'volume', label: volume.label },
            status: 'finished',
        });
        (0, events_1.mockGetEvents)([mockFinishedMigrationEvent]).as('getEvents');
        (0, events_1.mockGetNotifications)([]).as('getNotifications');
        cy.wait(['@getEvents', '@getLinodeVolumes', '@getNotifications']);
        (0, events_1.mockGetEvents)([]);
        cy.findByText('active').should('be.visible');
        ui_1.ui.toast.assertMessage("Volume ".concat(volume.label, " has been migrated to NVMe."));
    });
    it('can upgrade an attached volume from the linode details page', function () {
        var linode = factories_1.linodeFactory.build();
        var volume = factories_1.volumeFactory.build({
            linode_id: linode.id,
            linode_label: linode.label,
        });
        var migrationScheduledNotification = factories_1.notificationFactory.build({
            type: 'volume_migration_scheduled',
            entity: { type: 'volume', id: volume.id },
        });
        (0, volumes_1.mockMigrateVolumes)().as('migrateVolumes');
        (0, linodes_1.mockGetLinodeDetails)(linode.id, linode).as('getLinode');
        (0, linodes_1.mockGetLinodeDisks)(linode.id, []);
        (0, events_1.mockGetNotifications)([migrationScheduledNotification]).as('getNotifications');
        (0, linodes_1.mockGetLinodeVolumes)(linode.id, [volume]).as('getLinodeVolumes');
        cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
        cy.wait(['@getLinode', '@getLinodeVolumes', '@getNotifications']);
        ui_1.ui.button
            .findByTitle('Upgrade Volume')
            .should('be.visible')
            .should('be.enabled')
            .click();
        var migrationImminentNotification = factories_1.notificationFactory.build({
            type: 'volume_migration_imminent',
            entity: { type: 'volume', id: volume.id },
        });
        (0, events_1.mockGetNotifications)([migrationImminentNotification]).as('getNotifications');
        ui_1.ui.dialog.findByTitle('Upgrade Volume').within(function () {
            cy.findByText("A Volume attached to Linode ".concat(linode.label, " will be upgraded to high-performance NVMe Block Storage."), { exact: false }).should('be.visible');
            ui_1.ui.button
                .findByTitle('Enter Upgrade Queue')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@migrateVolumes', '@getNotifications']);
        cy.findByText('UPGRADE PENDING').should('be.visible');
        for (var _i = 0, _a = [10, 20, 50, 75]; _i < _a.length; _i++) {
            var percentage = _a[_i];
            var mockStartedMigrationEvent = factories_1.eventFactory.build({
                action: 'volume_migrate',
                entity: { id: volume.id, type: 'volume' },
                status: 'started',
                percent_complete: percentage,
            });
            (0, events_1.mockGetEvents)([mockStartedMigrationEvent]).as('getEvents');
            cy.wait('@getEvents');
            cy.findByText("migrating (".concat(percentage, "%)")).should('be.visible');
        }
        var mockFinishedMigrationEvent = factories_1.eventFactory.build({
            action: 'volume_migrate',
            entity: { id: volume.id, type: 'volume', label: volume.label },
            status: 'finished',
        });
        (0, events_1.mockGetEvents)([mockFinishedMigrationEvent]).as('getEvents');
        (0, events_1.mockGetNotifications)([]).as('getNotifications');
        cy.wait(['@getEvents', '@getLinodeVolumes', '@getNotifications']);
        (0, events_1.mockGetEvents)([]);
        cy.findByText('active').should('be.visible');
        ui_1.ui.toast.assertMessage("Volume ".concat(volume.label, " has been migrated to NVMe."));
    });
});
