"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// must turn off sort-objects rule in this file bc mockTicket.description is set by formatDescription fn in which attribute order is nonalphabetical and affects test result
/* eslint-disable perfectionist/sort-objects */
/* eslint-disable sonarjs/no-duplicate-string */
require("cypress-file-upload");
var account_1 = require("support/intercepts/account");
var domains_1 = require("support/intercepts/domains");
var feature_flags_1 = require("support/intercepts/feature-flags");
var linodes_1 = require("support/intercepts/linodes");
var lke_1 = require("support/intercepts/lke");
var profile_1 = require("support/intercepts/profile");
var support_1 = require("support/intercepts/support");
var ui_1 = require("support/ui");
var pages_1 = require("support/ui/pages");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var factories_1 = require("src/factories");
var constants_1 = require("src/features/Support/SupportTickets/constants");
var ticketUtils_1 = require("src/features/Support/SupportTickets/ticketUtils");
describe('open support tickets', function () {
    /*
     * - Opens a Help & Support ticket using mock API data.
     * - Confirms that "Severity" field is not present when feature flag is disabled.
     */
    it('can open a support ticket', function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            supportTicketSeverity: false,
        });
        var image = 'test_screenshot.png';
        var ticketDescription = 'this is a test ticket';
        var ticketLabel = 'cy-test ticket';
        var ticketId = Math.floor(Math.random() * 99999999 + 10000000);
        var ts = new Date();
        (0, profile_1.interceptGetProfile)().as('getProfile');
        cy.visitWithLogin('/support/tickets');
        // Confirm that "Severity" table column is not shown.
        cy.get('[data-qa-open-tickets-tab]').within(function () {
            cy.findByLabelText('Sort by severity').should('not.exist');
        });
        cy.wait('@getProfile').then(function (xhr) {
            var _a;
            var user = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body['username'];
            var mockTicketData = factories_1.supportTicketFactory.build({
                attachments: [image],
                closable: false,
                closed: null,
                description: 'this is a test ticket',
                entity: null,
                id: ticketId,
                opened: ts.toISOString(),
                opened_by: user,
                status: 'new',
                summary: 'cy-test ticket',
                updated: ts.toISOString(),
                updated_by: user,
            });
            // intercept create ticket request, stub response.
            (0, support_1.mockCreateSupportTicket)(mockTicketData).as('createTicket');
            (0, support_1.mockGetSupportTicketReplies)(ticketId, []).as('getReplies');
            (0, support_1.mockAttachSupportTicketFile)(ticketId).as('attachmentPost');
            cy.contains('Open New Ticket').click();
            cy.get('input[placeholder="Enter a title for your ticket."]').click({
                scrollBehavior: false,
            });
            cy.focused().type(ticketLabel);
            cy.findByLabelText('Severity').should('not.exist');
            ui_1.ui.autocomplete
                .findByLabel('What is this regarding?')
                .type('General/Account/Billing');
            ui_1.ui.autocompletePopper
                .findByTitle('General/Account/Billing')
                .should('be.visible')
                .click();
            cy.get('[data-qa-ticket-description="true"]').click();
            cy.focused().type(ticketDescription);
            cy.get('[id="attach-file"]').attachFile(image);
            cy.get('[value="test_screenshot.png"]').should('be.visible');
            cy.get('[data-qa-submit="true"]').click();
            cy.wait('@createTicket').its('response.statusCode').should('eq', 200);
            cy.wait('@attachmentPost').its('response.statusCode').should('eq', 200);
            cy.wait('@getReplies').its('response.statusCode').should('eq', 200);
            cy.contains("#".concat(ticketId, ": ").concat(ticketLabel)).should('be.visible');
            cy.contains(ticketDescription).should('be.visible');
            cy.contains(image).should('be.visible');
        });
    });
    /*
     * - Opens a Help & Support ticket with a severity level specified using mock API data.
     * - Confirms that outgoing API request includes the expected severity level in its payload.
     * - Confirms that specified severity level is displayed on the created ticket.
     */
    it('can create a ticket with a severity level specified', function () {
        // TODO Integrate this test with the above test when feature flag goes away.
        var mockTicket = factories_1.supportTicketFactory.build({
            id: (0, random_1.randomNumber)(),
            summary: (0, random_1.randomLabel)(),
            description: (0, random_1.randomPhrase)(),
            severity: (0, random_1.randomItem)([1, 2, 3]),
            status: 'new',
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
        (0, support_1.mockCreateSupportTicket)(mockTicket).as('createTicket');
        (0, support_1.mockGetSupportTickets)([]);
        (0, support_1.mockGetSupportTicket)(mockTicket);
        (0, support_1.mockGetSupportTicketReplies)(mockTicket.id, []);
        cy.visitWithLogin('/support/tickets');
        // Confirm that "Severity" table column is displayed.
        cy.get('[data-qa-open-tickets-tab]').within(function () {
            cy.findByLabelText('Sort by severity').should('be.visible');
        });
        ui_1.ui.button
            .findByTitle('Open New Ticket')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out ticket form.
        ui_1.ui.dialog
            .findByTitle('Open a Support Ticket')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Title', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().type(mockTicket.summary);
            cy.findByLabelText('Severity').should('be.visible').click();
            cy.focused().type("".concat(mockTicket.severity, "{downarrow}{enter}"));
            cy.get('[data-qa-ticket-description]').should('be.visible').click();
            cy.focused().type(mockTicket.description);
            ui_1.ui.button
                .findByTitle('Open Ticket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that ticket create payload contains the expected data.
        cy.wait('@createTicket').then(function (xhr) {
            var _a, _b, _c;
            expect((_a = xhr.request.body) === null || _a === void 0 ? void 0 : _a.summary).to.eq(mockTicket.summary);
            expect((_b = xhr.request.body) === null || _b === void 0 ? void 0 : _b.description).to.eq(mockTicket.description);
            expect((_c = xhr.request.body) === null || _c === void 0 ? void 0 : _c.severity).to.eq(mockTicket.severity);
        });
        // Confirm redirect to details page and that severity level is displayed.
        cy.url().should('endWith', "support/tickets/".concat(mockTicket.id));
        cy.get('[data-qa-ticket-status]')
            .should('be.visible')
            .within(function () {
            cy.findByText(severityLabel).should('be.visible');
        });
    });
    /*
     * - Opens an SMTP Restriction Removal ticket using mock API data.
     * - Creates a new linode that will have SMTP restrictions and navigates to a SMTP support ticket via notice link.
     * - Confirms that the SMTP-specific fields are displayed and handled correctly.
     */
    it('can create an SMTP support ticket', function () {
        var mockAccount = factories_1.accountFactory.build({
            first_name: 'Jane',
            last_name: 'Doe',
            company: 'Acme Co.',
        });
        var mockFormFields = {
            description: '',
            entityId: '',
            entityInputValue: '',
            entityType: 'general',
            selectedSeverity: undefined,
            summary: 'SMTP Restriction Removal on ',
            ticketType: 'smtp',
            companyName: mockAccount.company,
            customerName: "".concat(mockAccount.first_name, " ").concat(mockAccount.last_name),
            useCase: (0, random_1.randomString)(),
            emailDomains: (0, random_1.randomString)(),
            publicInfo: (0, random_1.randomString)(),
        };
        var mockSMTPTicket = factories_1.supportTicketFactory.build({
            summary: mockFormFields.summary,
            id: (0, random_1.randomNumber)(),
            description: (0, ticketUtils_1.formatDescription)(mockFormFields, 'smtp'),
            status: 'new',
        });
        // Mock a Linode instance that is lacking the `SMTP Enabled` capability.
        var mockLinode = factories_1.linodeFactory.build({
            id: (0, random_1.randomNumber)(),
            label: (0, random_1.randomLabel)(),
            capabilities: [],
        });
        (0, account_1.mockGetAccount)(mockAccount);
        (0, support_1.mockCreateSupportTicket)(mockSMTPTicket).as('createTicket');
        (0, support_1.mockGetSupportTickets)([]);
        (0, support_1.mockGetSupportTicket)(mockSMTPTicket);
        (0, support_1.mockGetSupportTicketReplies)(mockSMTPTicket.id, []);
        (0, linodes_1.mockGetLinodes)([mockLinode]);
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode);
        cy.visitWithLogin("/linodes/".concat(mockLinode.id));
        cy.findByText('open a support ticket').should('be.visible').click();
        // Fill out ticket form.
        ui_1.ui.dialog
            .findByTitle('Contact Support: SMTP Restriction Removal')
            .should('be.visible')
            .within(function () {
            cy.findByText(constants_1.SMTP_DIALOG_TITLE).should('be.visible');
            cy.findByText(constants_1.SMTP_HELPER_TEXT).should('be.visible');
            // Confirm summary, customer name, and company name fields are pre-populated with user account data.
            cy.findByLabelText('Title', { exact: false })
                .should('be.visible')
                .should('have.value', mockFormFields.summary + mockLinode.label);
            cy.findByLabelText('First and last name', { exact: false })
                .should('be.visible')
                .should('have.value', mockFormFields.customerName);
            cy.findByLabelText('Business or company name', { exact: false })
                .should('be.visible')
                .should('have.value', mockFormFields.companyName);
            ui_1.ui.button
                .findByTitle('Open Ticket')
                .scrollIntoView()
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm validation errors display when trying to submit without required fields.
            cy.findByText('Use case is required.');
            cy.findByText('Email domains are required.');
            cy.findByText('Links to public information are required.');
            // Complete the rest of the form.
            cy.get('[data-qa-ticket-use-case]').should('be.visible').click();
            cy.focused().type(mockFormFields.useCase);
            cy.get('[data-qa-ticket-email-domains]').should('be.visible').click();
            cy.focused().type(mockFormFields.emailDomains);
            cy.get('[data-qa-ticket-public-info]').should('be.visible').click();
            cy.focused().type(mockFormFields.publicInfo);
            // Confirm there is no description field or file upload section.
            cy.findByText('Description').should('not.exist');
            cy.findByText('Attach a File').should('not.exist');
            ui_1.ui.button
                .findByTitle('Open Ticket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that ticket create payload contains the expected data.
        cy.wait('@createTicket').then(function (xhr) {
            var _a, _b;
            expect((_a = xhr.request.body) === null || _a === void 0 ? void 0 : _a.summary).to.eq(mockSMTPTicket.summary + mockLinode.label);
            expect((_b = xhr.request.body) === null || _b === void 0 ? void 0 : _b.description).to.eq(mockSMTPTicket.description);
        });
        // Confirm the new ticket is listed with the expected information upon redirecting to the details page.
        cy.url().should('endWith', "support/tickets/".concat(mockSMTPTicket.id));
        cy.contains("#".concat(mockSMTPTicket.id, ": SMTP Restriction Removal")).should('be.visible');
        Object.values(constants_1.SMTP_FIELD_NAME_TO_LABEL_MAP).forEach(function (fieldLabel) {
            cy.findByText(fieldLabel).should('be.visible');
        });
    });
    /*
     * - Opens an Account Limit ticket using mock API data.
     * - Mocks an account limit API error and navigates to the support ticket via notice link.
     * - Confirms that the Account-Limit-specific fields are pre-populated, displayed, and handled correctly.
     */
    it('can create an Account Limit support ticket', function () {
        var mockAccount = factories_1.accountFactory.build({
            first_name: 'Jane',
            last_name: 'Doe',
            company: 'Acme Co.',
        });
        var mockFormFields = {
            description: '',
            entityId: '',
            entityInputValue: '',
            entityType: 'linode_id',
            selectedSeverity: undefined,
            summary: 'Account Limit Increase',
            ticketType: 'accountLimit',
            customerName: "".concat(mockAccount.first_name, " ").concat(mockAccount.last_name),
            companyName: mockAccount.company,
            numberOfEntities: '2',
            linodePlan: 'Nanode 1GB',
            useCase: (0, random_1.randomString)(),
            publicInfo: (0, random_1.randomString)(),
        };
        var mockAccountLimitTicket = factories_1.supportTicketFactory.build({
            summary: mockFormFields.summary,
            id: (0, random_1.randomNumber)(),
            description: (0, ticketUtils_1.formatDescription)(mockFormFields, 'accountLimit'),
            status: 'new',
        });
        var mockRegion = (0, regions_1.chooseRegion)();
        var mockPlan = {
            planType: 'Shared CPU',
            planLabel: 'Nanode 1 GB',
            planId: 'g6-nanode-1',
        };
        var mockLinode = factories_1.linodeFactory.build();
        var ACCOUNT_THING_LIMIT_ERROR = 'A limit on your account is preventing the deployment of the selected Linode plan. To request access to the plan, please contact Support and provide the Linode plan name.';
        (0, account_1.mockGetAccount)(mockAccount);
        (0, linodes_1.mockCreateLinodeAccountLimitError)(ACCOUNT_THING_LIMIT_ERROR, 400).as('createLinode');
        (0, support_1.mockCreateSupportTicket)(mockAccountLimitTicket).as('createTicket');
        (0, support_1.mockGetSupportTickets)([]);
        (0, support_1.mockGetSupportTicket)(mockAccountLimitTicket);
        (0, support_1.mockGetSupportTicketReplies)(mockAccountLimitTicket.id, []);
        (0, linodes_1.mockGetLinodes)([mockLinode]);
        cy.visitWithLogin('/linodes/create');
        // Set Linode label, distribution, plan type, password, etc.
        // linodeCreatePage.setLabel(linodeLabel);
        pages_1.linodeCreatePage.selectRegionById(mockRegion.id);
        pages_1.linodeCreatePage.selectPlan(mockPlan.planType, mockPlan.planLabel);
        pages_1.linodeCreatePage.setRootPassword((0, random_1.randomString)(32));
        // Attempt to create Linode and confirm mocked account limit error with support link is present.
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode');
        cy.get('[data-qa-error="true"]').first().scrollIntoView();
        cy.contains(ACCOUNT_THING_LIMIT_ERROR);
        // Navigate to the account limit ticket form.
        cy.findByText('contact Support').should('be.visible').click();
        // Fill out ticket form.
        ui_1.ui.dialog
            .findByTitle("Contact Support: ".concat(mockFormFields.summary))
            .should('be.visible')
            .within(function () {
            cy.findByText(constants_1.ACCOUNT_LIMIT_DIALOG_TITLE).should('be.visible');
            cy.findByText(constants_1.ACCOUNT_LIMIT_HELPER_TEXT).should('be.visible');
            // Confirm summary, customer name, and company name fields are pre-populated with user account data.
            cy.findByLabelText('Title', { exact: false })
                .should('be.visible')
                .should('have.value', mockFormFields.summary);
            cy.findByLabelText('First and last name', { exact: false })
                .should('be.visible')
                .should('have.value', mockFormFields.customerName);
            cy.findByLabelText('Business or company name', { exact: false })
                .should('be.visible')
                .should('have.value', mockFormFields.companyName);
            // Confirm plan pre-populates from form payload data.
            cy.findByLabelText('Which Linode plan do you need access to?', {
                exact: false,
            })
                .should('be.visible')
                .should('have.value', mockFormFields.linodePlan);
            // Confirm helper text and link.
            cy.findByText('Current number of Linodes: 1').should('be.visible');
            cy.findByText('View types of plans')
                .should('be.visible')
                .should('have.attr', 'href', 'https://www.linode.com/pricing/');
            ui_1.ui.button
                .findByTitle('Open Ticket')
                .scrollIntoView()
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm validation errors display when trying to submit without required fields.
            cy.findByText('Use case is required.');
            cy.findByText('Links to public information are required.');
            // Complete the rest of the form.
            cy.findByLabelText('Total number of Linodes you need?')
                .should('be.visible')
                .click();
            cy.focused().type(mockFormFields.numberOfEntities);
            cy.get('[data-qa-ticket-use-case]').should('be.visible').click();
            cy.focused().type(mockFormFields.useCase);
            cy.get('[data-qa-ticket-public-info]').should('be.visible').click();
            cy.focused().type(mockFormFields.publicInfo);
            // Confirm there is no description field or file upload section.
            cy.findByText('Description').should('not.exist');
            cy.findByText('Attach a File').should('not.exist');
            ui_1.ui.button
                .findByTitle('Open Ticket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that ticket create payload contains the expected data.
        cy.wait('@createTicket').then(function (xhr) {
            var _a, _b;
            expect((_a = xhr.request.body) === null || _a === void 0 ? void 0 : _a.summary).to.eq(mockAccountLimitTicket.summary);
            expect((_b = xhr.request.body) === null || _b === void 0 ? void 0 : _b.description).to.eq(mockAccountLimitTicket.description);
        });
        // Confirm the new ticket is listed with the expected information upon redirecting to the details page.
        cy.url().should('endWith', "support/tickets/".concat(mockAccountLimitTicket.id));
        cy.contains("#".concat(mockAccountLimitTicket.id, ": ").concat(mockAccountLimitTicket.summary)).should('be.visible');
        Object.entries(constants_1.ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP).forEach(function (_a) {
            var key = _a[0], fieldLabel = _a[1];
            var _fieldLabel = fieldLabel;
            if (key === 'useCase' || key === 'numberOfEntities') {
                _fieldLabel = _fieldLabel.replace('entities', 'Linodes');
            }
            cy.findByText(_fieldLabel).should('be.visible');
        });
    });
    /*
     * - Opens a general support ticket with a selected entity using mock API data.
     * - Confirms that the entity fields are populated, displayed, and validated correctly.
     */
    it('can create a support ticket with an entity', function () {
        var mockLinodes = factories_1.linodeFactory.buildList(2);
        var mockDomain = factories_1.domainFactory.build();
        var mockTicket = factories_1.supportTicketFactory.build({
            id: (0, random_1.randomNumber)(),
            summary: (0, random_1.randomLabel)(),
            description: (0, random_1.randomPhrase)(),
            status: 'new',
        });
        (0, support_1.mockCreateSupportTicket)(mockTicket).as('createTicket');
        (0, lke_1.mockGetClusters)([]);
        (0, support_1.mockGetSupportTickets)([]);
        (0, support_1.mockGetSupportTicket)(mockTicket);
        (0, support_1.mockGetSupportTicketReplies)(mockTicket.id, []);
        (0, linodes_1.mockGetLinodes)(mockLinodes);
        (0, domains_1.mockGetDomains)([mockDomain]);
        cy.visitWithLogin('/support/tickets');
        ui_1.ui.button
            .findByTitle('Open New Ticket')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Fill out ticket form.
        ui_1.ui.dialog
            .findByTitle('Open a Support Ticket')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('Title', { exact: false })
                .should('be.visible')
                .click();
            cy.focused().type(mockTicket.summary);
            cy.get('[data-qa-ticket-description]').should('be.visible').click();
            cy.focused().type(mockTicket.description);
            cy.get('[data-qa-ticket-entity-type]').click();
            cy.focused().type("Linodes{downarrow}{enter}");
            // Attempt to submit the form without an entity selected and confirm validation error.
            ui_1.ui.button
                .findByTitle('Open Ticket')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Please select a Linode.').should('be.visible');
            // Select an entity type for which there are no entities.
            cy.get('[data-qa-ticket-entity-type]').click();
            cy.focused().type("Kubernetes{downarrow}{enter}");
            // Confirm the validation error clears when a new entity type is selected.
            cy.findByText('Please select a Linode.').should('not.exist');
            // Confirm helper text appears and entity id field is disabled.
            cy.findByText('You don’t have any Kubernetes Clusters on your account.').should('be.visible');
            cy.get('[data-qa-ticket-entity-id]')
                .find('input')
                .should('be.disabled');
            // Select another entity type.
            cy.get('[data-qa-ticket-entity-type]').click();
            cy.focused().type("{selectall}{del}Domains{uparrow}{enter}");
            // Select an entity.
            cy.get('[data-qa-ticket-entity-id]').should('be.visible').click();
            cy.focused().type("".concat(mockDomain.domain, "{downarrow}{enter}"));
            ui_1.ui.button
                .findByTitle('Open Ticket')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        // Confirm that ticket create payload contains the expected data.
        cy.wait('@createTicket').then(function (xhr) {
            var _a, _b;
            expect((_a = xhr.request.body) === null || _a === void 0 ? void 0 : _a.summary).to.eq(mockTicket.summary);
            expect((_b = xhr.request.body) === null || _b === void 0 ? void 0 : _b.description).to.eq(mockTicket.description);
        });
        // Confirm redirect to details page and that severity level is displayed.
        cy.url().should('endWith', "support/tickets/".concat(mockTicket.id));
    });
});
