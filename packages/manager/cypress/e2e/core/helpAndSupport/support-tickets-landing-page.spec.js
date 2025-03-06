"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configs_1 = require("support/intercepts/configs");
var feature_flags_1 = require("support/intercepts/feature-flags");
var linodes_1 = require("support/intercepts/linodes");
var profile_1 = require("support/intercepts/profile");
var support_1 = require("support/intercepts/support");
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
var constants_1 = require("src/features/Support/SupportTickets/constants");
describe('support tickets landing page', function () {
    /*
     * - Confirms that "No items to display" is shown when the user has no open support tickets.
     */
    it('shows the empty message when there are no tickets.', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            supportTicketSeverity: false,
        });
        (0, profile_1.interceptGetProfile)().as('getProfile');
        // intercept get ticket request, stub response.
        (0, support_1.mockGetSupportTickets)([]).as('getSupportTickets');
        cy.visitWithLogin('/support/tickets');
        cy.wait(['@getProfile', '@getSupportTickets']);
        cy.get('[data-qa-open-tickets-tab]').within(function () {
            // Confirm that "Severity" table column is not shown.
            cy.findByLabelText('Sort by severity').should('not.exist');
            // Confirm that other table columns are shown.
            cy.findByText('Subject').should('be.visible');
            cy.findByText('Ticket ID').should('be.visible');
            cy.findByText('Regarding').should('be.visible');
            cy.findByText('Date Created').should('be.visible');
            cy.findByText('Last Updated').should('be.visible');
            cy.findByText('Updated By').should('be.visible');
        });
        // Confirm that no ticket is listed.
        cy.findByText('No items to display.').should('be.visible');
    });
    /*
     * - Confirms that support tickets are listed in the table when the user has ones.
     */
    it('lists support tickets in the table as expected', function () {
        // TODO Integrate this test with the above test when feature flag goes away.
        var mockTicket = factories_1.supportTicketFactory.build({
            description: (0, random_1.randomPhrase)(),
            id: (0, random_1.randomNumber)(),
            severity: (0, random_1.randomItem)([1, 2, 3]),
            status: 'new',
            summary: (0, random_1.randomLabel)(),
        });
        var mockAnotherTicket = factories_1.supportTicketFactory.build({
            description: (0, random_1.randomPhrase)(),
            id: (0, random_1.randomNumber)(),
            severity: (0, random_1.randomItem)([1, 2, 3]),
            status: 'open',
            summary: (0, random_1.randomLabel)(),
        });
        var mockTickets = [mockTicket, mockAnotherTicket];
        (0, feature_flags_1.mockAppendFeatureFlags)({
            supportTicketSeverity: true,
        });
        (0, support_1.mockGetSupportTickets)(mockTickets);
        cy.visitWithLogin('/support/tickets');
        cy.get('[data-qa-open-tickets-tab]').within(function () {
            // Confirm that "Severity" table column is displayed.
            cy.findByLabelText('Sort by severity').should('be.visible');
            // Confirm that other table columns are shown.
            cy.findByText('Subject').should('be.visible');
            cy.findByText('Ticket ID').should('be.visible');
            cy.findByText('Regarding').should('be.visible');
            cy.findByText('Date Created').should('be.visible');
            cy.findByText('Last Updated').should('be.visible');
            cy.findByText('Updated By').should('be.visible');
        });
        mockTickets.forEach(function (ticket) {
            // Get severity label for numeric severity level.
            // Bail out if we're unable to get a valid label -- this indicates a mismatch between the test and source.
            var severityLabel = constants_1.SEVERITY_LABEL_MAP.get(ticket.severity);
            if (!severityLabel) {
                throw new Error("Unable to retrieve label for severity level '".concat(ticket.severity, "'. Is this a valid support severity level?"));
            }
            // Confirm that tickets are listed as expected.
            cy.findByText(ticket.summary)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(ticket.id).should('be.visible');
                cy.findByText(severityLabel).should('be.visible');
            });
        });
    });
    /*
     * - Confirms that clicking on the ticket subject navigates to the ticket's page.
     */
    it("can navigate to the ticket's page when clicking on the ticket subject", function () {
        // TODO Integrate this test with the above test when feature flag goes away.
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
    });
    /*
     * - Confirms that the entity is shown in the table when the support ticket is related to it.
     * - Confirms that clicking the entity's label redirects to that entity's page
     */
    it("can navigate to the entity's page when clicking the entity's label", function () {
        // TODO Integrate this test with the above test when feature flag goes away.
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: "".concat((0, random_1.randomLabel)(), "-linode"),
        });
        var mockVolume = factories_1.volumeFactory.build();
        var mockPublicConfigInterface = factories_1.LinodeConfigInterfaceFactory.build({
            ipam_address: null,
            purpose: 'public',
        });
        var mockConfig = factories_1.linodeConfigFactory.build({
            id: (0, random_1.randomNumber)(),
            interfaces: [
                // The order of this array is significant. Index 0 (eth0) should be public.
                mockPublicConfigInterface,
            ],
        });
        var mockDisks = [
            {
                created: '2020-08-21T17:26:14',
                filesystem: 'ext4',
                id: 44311273,
                label: 'Debian 10 Disk',
                size: 81408,
                status: 'ready',
                updated: '2020-08-21T17:26:30',
            },
            {
                created: '2020-08-21T17:26:14',
                filesystem: 'swap',
                id: 44311274,
                label: '512 MB Swap Image',
                size: 512,
                status: 'ready',
                updated: '2020-08-21T17:26:31',
            },
        ];
        var mockEntity = factories_1.entityFactory.build({
            id: mockLinode.id,
            label: "".concat((0, random_1.randomLabel)(), "-entity"),
            type: 'linode',
            url: 'https://www.example.com',
        });
        var mockTicket = factories_1.supportTicketFactory.build({
            description: (0, random_1.randomPhrase)(),
            entity: mockEntity,
            id: (0, random_1.randomNumber)(),
            severity: (0, random_1.randomItem)([1, 2, 3]),
            status: 'new',
            summary: "".concat((0, random_1.randomLabel)(), "-support-ticket"),
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
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, configs_1.mockGetLinodeConfigs)(mockLinode.id, [mockConfig]).as('getLinodeConfigs');
        (0, linodes_1.mockGetLinodeDisks)(mockLinode.id, mockDisks).as('getDisks');
        (0, linodes_1.mockGetLinodeVolumes)(mockLinode.id, [mockVolume]).as('getVolumes');
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
        // Clicking on the entity will redirect to the entity's page.
        cy.findByText("".concat(mockEntity.label)).should('be.visible').click();
        cy.url().should('endWith', "/linodes/".concat(mockLinode.id));
    });
});
