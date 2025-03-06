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
Object.defineProperty(exports, "__esModule", { value: true });
require("cypress-file-upload");
var help_and_support_1 = require("support/constants/help-and-support");
var feature_flags_1 = require("support/intercepts/feature-flags");
var support_1 = require("support/intercepts/support");
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
var constants_1 = require("src/features/Support/SupportTickets/constants");
describe('close support tickets', function () {
    /*
     * - Opens a Help & Support ticket with mocked ticket data.
     * - Confirms that there is no "close ticket" button showing up for the default support ticket.
     */
    it('cannot close a default support ticket by customers', function () {
        var mockTicket = factories_1.supportTicketFactory.build({
            description: (0, random_1.randomPhrase)(),
            id: (0, random_1.randomNumber)(),
            severity: (0, random_1.randomItem)([1, 2, 3]),
            status: 'new',
            summary: (0, random_1.randomLabel)(),
        });
        // Get severity label for numeric severity level.
        // Bail out if we're unable to get a valid label -- this indicates a mismatch between the test and source.
        var severityLabel = constants_1.SEVERITY_LABEL_MAP.get(mockTicket.severity);
        if (!severityLabel) {
            throw new Error("Unable to retrieve label for severity level '".concat(mockTicket.severity, "'. Is this a valid support severity level?"));
        }
        (0, feature_flags_1.mockAppendFeatureFlags)({
            supportTicketSeverity: true,
        });
        (0, support_1.mockGetSupportTickets)([mockTicket]);
        (0, support_1.mockGetSupportTicket)(mockTicket).as('getSupportTicket');
        (0, support_1.mockGetSupportTicketReplies)(mockTicket.id, []).as('getReplies');
        cy.visitWithLogin('/support/tickets');
        // Confirm that tickets are listed as expected.
        cy.findByText(mockTicket.summary).should('be.visible').click();
        cy.wait(['@getSupportTicket', '@getReplies']);
        cy.url().should('endWith', "/tickets/".concat(mockTicket.id));
        cy.findByText(mockTicket.status.substring(0, 1).toUpperCase() +
            mockTicket.status.substring(1)).should('be.visible');
        cy.findByText("#".concat(mockTicket.id, ": ").concat(mockTicket.summary)).should('be.visible');
        cy.findByText(mockTicket.description).should('be.visible');
        cy.findByText(severityLabel).should('be.visible');
        // Confirm that the support ticket is not closable by default.
        cy.findByText(help_and_support_1.closableMessage, { exact: false }).should('not.exist');
    });
    /*
     * - Opens a Help & Support ticket with mocked ticket data.
     * - Confirms that the closable support ticket can be closed by customers successfully.
     */
    it('can close a closable support ticket', function () {
        var mockTicket = factories_1.supportTicketFactory.build({
            closable: true,
            description: (0, random_1.randomPhrase)(),
            id: (0, random_1.randomNumber)(),
            severity: (0, random_1.randomItem)([1, 2, 3]),
            status: 'new',
            summary: (0, random_1.randomLabel)(),
        });
        var mockClosedTicket = factories_1.supportTicketFactory.build(__assign(__assign({}, mockTicket), { closed: 'close by customers', status: 'closed' }));
        // Get severity label for numeric severity level.
        // Bail out if we're unable to get a valid label -- this indicates a mismatch between the test and source.
        var severityLabel = constants_1.SEVERITY_LABEL_MAP.get(mockTicket.severity);
        if (!severityLabel) {
            throw new Error("Unable to retrieve label for severity level '".concat(mockTicket.severity, "'. Is this a valid support severity level?"));
        }
        (0, feature_flags_1.mockAppendFeatureFlags)({
            supportTicketSeverity: true,
        });
        (0, support_1.mockGetSupportTickets)([mockTicket]);
        (0, support_1.mockGetSupportTicket)(mockTicket).as('getSupportTicket');
        (0, support_1.mockGetSupportTicketReplies)(mockTicket.id, []).as('getReplies');
        (0, support_1.mockCloseSupportTicket)(mockTicket.id).as('closeSupportTicket');
        cy.visitWithLogin('/support/tickets');
        // Confirm that tickets are listed as expected.
        cy.findByText(mockTicket.summary).should('be.visible').click();
        cy.wait(['@getSupportTicket', '@getReplies']);
        // Confirm that the closable message shows up.
        cy.findByText(help_and_support_1.closableMessage, { exact: false }).should('be.visible');
        // Confirm that the "close the ticket" button can be clicked.
        ui_1.ui.button.findByTitle(help_and_support_1.closeButtonText).should('be.visible').click();
        ui_1.ui.dialog
            .findByTitle('Confirm Ticket Close')
            .should('be.visible')
            .within(function () {
            cy.findByText('Are you sure you want to close this ticket?').should('be.visible');
            ui_1.ui.button
                .findByTitle('Confirm')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@closeSupportTicket');
        });
        (0, support_1.mockGetSupportTickets)([mockClosedTicket]);
        (0, support_1.mockGetSupportTicket)(mockClosedTicket).as('getClosedSupportTicket');
        cy.visit('/support/tickets');
        // Confirm that the ticket is closed.
        cy.findByText(mockClosedTicket.summary).should('be.visible').click();
        cy.wait('@getClosedSupportTicket');
        cy.get('[aria-label="Ticket status is closed"]').should('be.visible');
        cy.findByText('Closed');
    });
});
