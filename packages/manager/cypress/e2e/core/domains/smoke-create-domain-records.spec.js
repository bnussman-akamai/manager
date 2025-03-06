"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authentication_1 = require("support/api/authentication");
var domains_1 = require("support/api/domains");
var domains_2 = require("support/constants/domains");
var domains_3 = require("support/intercepts/domains");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var createCaaRecord = function (name, tag, value, ttl) {
    cy.findByText('Add a CAA Record').click();
    // Fill in the form fields
    cy.findByLabelText('Name').type(name);
    ui_1.ui.autocomplete.findByLabel('Tag').click();
    ui_1.ui.autocompletePopper.findByTitle(tag).click();
    cy.findByLabelText('Value').type(value);
    ui_1.ui.autocomplete.findByLabel('TTL').click();
    ui_1.ui.autocompletePopper.findByTitle(ttl).click();
    // Save the record
    ui_1.ui.button
        .findByTitle('Save')
        .should('be.visible')
        .should('be.enabled')
        .click();
};
// Reusable function to edit a CAA record
var editCaaRecord = function (name, newValue) {
    ui_1.ui.actionMenu
        .findByTitle("Action menu for Record ".concat(name))
        .should('be.visible')
        .click();
    ui_1.ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();
    // Edit the value field
    cy.findByLabelText('Value').clear();
    cy.focused().type(newValue);
    ui_1.ui.button.findByTitle('Save').click();
};
// Reusable function to verify record details in the table
var verifyRecordInTable = function (name, tag, value, ttl) {
    cy.get('[aria-label="List of Domains CAA Record"]') // Target table by aria-label
        .should('contain', name)
        .and('contain', tag)
        .and('contain', value)
        .and('contain', ttl);
};
(0, authentication_1.authenticate)();
before(function () {
    (0, cleanup_1.cleanUp)('domains');
});
beforeEach(function () {
    cy.tag('method:e2e');
    (0, domains_1.createDomain)().then(function (domain) {
        // intercept create API record request
        (0, domains_3.interceptCreateDomainRecord)().as('apiCreateRecord');
        var url = "/domains/".concat(domain.id);
        cy.visitWithLogin(url);
        cy.url().should('contain', url);
    });
});
describe('Creates Domains records with Form', function () {
    it('Adds domain records to a newly created Domain', function () {
        (0, domains_2.createDomainRecords)().forEach(function (rec) {
            cy.findByText(rec.name).click();
            rec.fields.forEach(function (field) {
                cy.get(field.name).type(field.value);
            });
            cy.findByText('Save').click();
            cy.wait('@apiCreateRecord').its('response.statusCode').should('eq', 200);
            cy.get("[aria-label=\"".concat(rec.tableAriaLabel, "\"]")).within(function (_table) {
                rec.fields.forEach(function (field) {
                    if (field.skipCheck) {
                        return;
                    }
                    cy.findByText(field.value, { exact: !field.approximate });
                });
            });
        });
    });
});
describe('Tests for Editable Domain CAA Records', function () {
    beforeEach(function () {
        // Create the initial record with a valid email
        createCaaRecord('securitytest', 'iodef', 'mailto:security@example.com', '5 minutes');
        // Verify the initial record is in the table
        verifyRecordInTable('securitytest', 'iodef', 'mailto:security@example.com', '5 minutes');
    });
    it('Validates that "iodef" domain records can be edited with valid record', function () {
        // Edit the record with a valid email and verify the updated record
        editCaaRecord('securitytest', 'mailto:secdef@example.com');
        cy.get('table').should('contain', 'mailto:secdef@example.com');
    });
    it('Validates that "iodef" domain records returns error with invalid record', function () {
        // Edit the record with invalid email and validate form validation
        editCaaRecord('securitytest', 'invalid-email-format');
        cy.get('p[role="alert"][data-qa-textfield-error-text="Value"]')
            .should('exist')
            .and('have.text', 'You have entered an invalid target');
    });
});
