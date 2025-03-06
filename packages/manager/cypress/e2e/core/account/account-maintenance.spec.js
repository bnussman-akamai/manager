"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var csv_1 = require("support/util/csv");
var factories_1 = require("src/factories");
describe('Maintenance', function () {
    /*
     * - Confirm user can navigate to account maintenance page via user menu.
     * - When there is no pending maintenance, "No pending maintenance." is shown in the table.
     * - When there is no completed maintenance, "No completed maintenance." is shown in the table.
     */
    beforeEach(function () {
        var downloadsFolder = Cypress.config('downloadsFolder');
        var filePatterns = '{pending-maintenance*,completed-maintenance*}';
        // Delete the file before the test
        cy.exec("rm -f ".concat(downloadsFolder, "/").concat(filePatterns), {
            failOnNonZeroExit: false,
        }).then(function (result) {
            if (result.code === 0) {
                cy.log("Deleted file: ".concat(filePatterns));
            }
            else {
                cy.log("Failed to delete file: ".concat(filePatterns));
            }
        });
    });
    it('table empty when no maintenance', function () {
        (0, account_1.mockGetMaintenance)([], []).as('getMaintenance');
        cy.visitWithLogin('/linodes');
        // user can navigate to account maintenance page via user menu.
        cy.findByTestId('nav-group-profile').click();
        cy.findByTestId('menu-item-Maintenance')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.url().should('endWith', '/account/maintenance');
        cy.wait('@getMaintenance');
        // Confirm correct messages shown in the table when no maintenance.
        cy.contains('No pending maintenance').should('be.visible');
        cy.contains('No completed maintenance').should('be.visible');
    });
    /*
     * - Uses mock API data to confirm maintenance details.
     * - When there is pending maintenance, it is shown in the table with expected details.
     * - When there is completed maintenance, it is shown in the table with expected details.
     * - Confirm "Download CSV" button for pending maintenance visible and enabled.
     * - Confirm "Download CSV" button for completed maintenance visible and enabled.
     */
    it('confirm maintenance details in the tables', function () {
        var pendingMaintenanceNumber = 2;
        var completedMaintenanceNumber = 5;
        var accountpendingMaintenance = factories_1.accountMaintenanceFactory.buildList(pendingMaintenanceNumber);
        var accountcompletedMaintenance = factories_1.accountMaintenanceFactory.buildList(completedMaintenanceNumber, { status: 'completed' });
        (0, account_1.mockGetMaintenance)(accountpendingMaintenance, accountcompletedMaintenance).as('getMaintenance');
        cy.visitWithLogin('/account/maintenance');
        cy.wait('@getMaintenance');
        cy.contains('No pending maintenance').should('not.exist');
        cy.contains('No completed maintenance').should('not.exist');
        // Confirm Pending table is not empty and contains exact number of pending maintenances
        cy.findByLabelText('List of pending maintenance')
            .should('be.visible')
            .find('tbody')
            .within(function () {
            accountpendingMaintenance.forEach(function () {
                cy.get('tr')
                    .should('have.length', accountpendingMaintenance.length)
                    .each(function (row, index) {
                    var pendingMaintenance = accountpendingMaintenance[index];
                    cy.wrap(row).within(function () {
                        cy.contains(pendingMaintenance.entity.label).should('be.visible');
                        // Confirm that the first 90 characters of each reason string are rendered on screen
                        var truncatedReason = pendingMaintenance.reason.substring(0, 90);
                        cy.findByText(truncatedReason, { exact: false }).should('be.visible');
                        // Check the content of each <td> element
                        cy.get('td').each(function ($cell, idx, $cells) {
                            cy.wrap($cell).should('not.be.empty');
                        });
                    });
                });
            });
        });
        // Confirm Completed table is not empty and contains exact number of completed maintenances
        cy.findByLabelText('List of completed maintenance')
            .should('be.visible')
            .find('tbody')
            .within(function () {
            accountcompletedMaintenance.forEach(function () {
                cy.get('tr')
                    .should('have.length', accountcompletedMaintenance.length)
                    .each(function (row, index) {
                    var completedMaintenance = accountcompletedMaintenance[index];
                    cy.wrap(row).within(function () {
                        cy.contains(completedMaintenance.entity.label).should('be.visible');
                        // Confirm that the first 90 characters of each reason string are rendered on screen
                        var truncatedReason = completedMaintenance.reason.substring(0, 90);
                        cy.findByText(truncatedReason, { exact: false }).should('be.visible');
                        // Check the content of each <td> element
                        cy.get('td').each(function ($cell, idx, $cells) {
                            cy.wrap($cell).should('not.be.empty');
                        });
                    });
                });
            });
        });
        // Validate content of the downloaded CSV for pending maintenance
        cy.get('a[download*="pending-maintenance"]')
            .invoke('attr', 'download')
            .then(function (fileName) {
            var downloadsFolder = Cypress.config('downloadsFolder');
            // Locate the <a> element for pending-maintenance and then find its sibling <button> element
            cy.get('a[download*="pending-maintenance"]')
                .siblings('button')
                .should('be.visible')
                .and('contain', 'Download CSV')
                .click();
            // Map the expected CSV content to match the structure of the downloaded CSV
            var expectedPendingMigrationContent = accountpendingMaintenance.map(function (maintenance) { return ({
                entity_label: maintenance.entity.label,
                entity_type: maintenance.entity.type,
                reason: maintenance.reason,
                status: maintenance.status,
                type: maintenance.type,
            }); });
            // Read the downloaded CSV and compare its content to the expected CSV content
            cy.readFile("".concat(downloadsFolder, "/").concat(fileName))
                .should('not.eq', null)
                .should('not.eq', '')
                .then(function (csvContent) {
                var parsedCsvPendingMigration = (0, csv_1.parseCsv)(csvContent);
                expect(parsedCsvPendingMigration.length).to.equal(expectedPendingMigrationContent.length);
                // Map the parsedCsv to match the structure of expectedCsvContent
                var actualPendingMigrationCsvContent = parsedCsvPendingMigration.map(function (entry) { return ({
                    entity_label: entry['Entity Label'],
                    entity_type: entry['Entity Type'],
                    reason: entry['Reason'],
                    status: entry['Status'],
                    type: entry['Type'],
                }); });
                expect(actualPendingMigrationCsvContent).to.deep.equal(expectedPendingMigrationContent);
            });
        });
        // Validate content of the downloaded CSV for completed maintenance
        cy.get('a[download*="completed-maintenance"]')
            .invoke('attr', 'download')
            .then(function (fileName) {
            var downloadsFolder = Cypress.config('downloadsFolder');
            // Locate the <a> element for completed-maintenance and then find its sibling <button> element
            cy.get('a[download*="completed-maintenance"]')
                .siblings('button')
                .should('be.visible')
                .and('contain', 'Download CSV')
                .click();
            // Map the expected CSV content to match the structure of the downloaded CSV
            var expectedCompletedMigrationContent = accountcompletedMaintenance.map(function (maintenance) { return ({
                entity_label: maintenance.entity.label,
                entity_type: maintenance.entity.type,
                reason: maintenance.reason,
                status: maintenance.status,
                type: maintenance.type,
            }); });
            // Read the downloaded CSV and compare its content to the expected CSV content
            cy.readFile("".concat(downloadsFolder, "/").concat(fileName))
                .should('not.eq', null)
                .should('not.eq', '')
                .then(function (csvContent) {
                var parsedCsvCompletedMigration = (0, csv_1.parseCsv)(csvContent);
                expect(parsedCsvCompletedMigration.length).to.equal(expectedCompletedMigrationContent.length);
                // Map the parsedCsv to match the structure of expectedCsvContent
                var actualCompletedMigrationCsvContent = parsedCsvCompletedMigration.map(function (entry) { return ({
                    entity_label: entry['Entity Label'],
                    entity_type: entry['Entity Type'],
                    reason: entry['Reason'],
                    status: entry['Status'],
                    type: entry['Type'],
                }); });
                expect(actualCompletedMigrationCsvContent).to.deep.equal(expectedCompletedMigrationContent);
            });
        });
    });
});
