"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var feature_flags_1 = require("support/intercepts/feature-flags");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var account_2 = require("src/factories/account");
var constants_1 = require("src/features/Billing/constants");
/* eslint-disable sonarjs/no-duplicate-string */
var accountData = account_2.accountFactory.build({
    active_promotions: [],
    address_1: 'terrible address address for test',
    address_2: 'Very long address for test Very long address for test Ve ',
    balance: 0,
    balance_uninvoiced: 0,
    capabilities: [
        'Linodes',
        'NodeBalancers',
        'Block Storage',
        'Object Storage',
        'Kubernetes',
    ],
    city: 'philadelphia',
    company: 'company_name',
    country: 'US',
    credit_card: { expiry: '01/2090', last_four: '4000' },
    email: 'test_email@linode.com',
    euuid: '7C1E3EE8-2F65-418A-95EF12E477XXXXXX',
    first_name: 'First name',
    last_name: 'Last Name',
    phone: '2154444444',
    state: 'Pennsylvania',
    tax_id: '1234567890',
    zip: '19109',
});
var newAccountData = account_2.accountFactory.build({
    address_1: 'new terrible address address for test',
    address_2: 'new Very long address for test Very long address for test Ve ',
    city: 'New Philadelphia',
    company: 'New company_name',
    country: 'FR',
    email: 'new_test_email@linode.com',
    first_name: 'NewFirstName',
    last_name: 'New Last Name',
    phone: '6104444444',
    state: 'Pennsylvania',
    tax_id: '9234567890',
    zip: '19108',
});
var newAccountAgreement = factories_1.accountAgreementsFactory.build({
    billing_agreement: true,
});
var checkAccountContactDisplay = function (accountInfo) {
    cy.findByText('Billing Contact').should('be.visible');
    cy.findByText(accountInfo['company']).should('be.visible');
    cy.get('[data-qa-contact-name]').should('be.visible');
    cy.findByText(accountInfo['first_name'], { exact: false });
    cy.findByText(accountInfo['last_name'], { exact: false });
    cy.contains(accountInfo['address_1']);
    cy.contains(accountInfo['address_2']);
    cy.findByText(accountInfo['state'], { exact: false });
    cy.findByText(accountInfo['zip'], { exact: false });
    cy.get('[data-qa-contact-email="true"]').within(function () {
        cy.findByText(accountInfo['email']);
    });
    cy.findByText(accountInfo['phone']);
};
describe('Billing Contact', function () {
    beforeEach(function () {
        (0, feature_flags_1.mockAppendFeatureFlags)({
            taxId: {
                enabled: true,
            },
        });
    });
    it('Mask Contact Info', function () {
        (0, profile_1.mockGetUserPreferences)({ maskSensitiveData: true }).as('getUserPreferences');
        (0, account_1.mockGetAccount)(accountData).as('getAccount');
        cy.visitWithLogin('/account/billing');
        cy.contains('This data is sensitive and hidden for privacy.');
        // Confirm edit button and contact info is hidden when setting is enabled.
        cy.findByText('Edit').should('not.exist');
        cy.get('[data-qa-contact-name]').should('not.exist');
        cy.findByRole('button', { name: 'Show' }).should('be.visible').click();
        // Confirm edit button and contact info is visible when setting is disabled.
        cy.findByText('Edit').should('be.visible');
        cy.get('[data-qa-contact-name]').should('be.visible');
        cy.findByRole('button', { name: 'Hide' }).should('be.visible').click();
    });
    it('Edit Contact Info', function () {
        (0, profile_1.mockGetUserPreferences)({ maskSensitiveData: false }).as('getUserPreferences');
        // mock the user's account data and confirm that it is displayed correctly upon page load
        (0, account_1.mockGetAccount)(accountData).as('getAccount');
        cy.visitWithLogin('/account/billing');
        // edit the billing contact information
        (0, account_1.mockUpdateAccount)(newAccountData).as('updateAccount');
        cy.get('[data-qa-contact-summary]').within(function (_contact) {
            checkAccountContactDisplay(accountData);
            cy.findByText('Edit').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle('Edit Billing Contact Info')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('First Name').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['first_name']);
            cy.findByLabelText('Last Name').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['last_name']);
            cy.findByLabelText('Company Name').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['company']);
            cy.findByLabelText('Address').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['address_1']);
            cy.findByLabelText('Address 2').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['address_2']);
            cy.findByLabelText('Email (required)').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['email']);
            cy.findByLabelText('City').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['city']);
            cy.findByLabelText('Postal Code').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['zip']);
            cy.findByLabelText('Phone').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['phone']);
            // need alias to be able to switch focus to modal popup
            ui_1.ui.autocomplete.findByLabel('State').should('be.visible').click();
            cy.focused().type("".concat(newAccountData['state']));
            ui_1.ui.autocompletePopper
                .findByTitle(newAccountData['state'])
                .should('be.visible')
                .click();
            cy.findByLabelText('Tax ID').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['tax_id']);
            cy.findByText(constants_1.TAX_ID_HELPER_TEXT).should('not.exist');
            cy.get('[data-qa-save-contact-info="true"]').click();
            cy.wait('@updateAccount').then(function (xhr) {
                var _a;
                expect((_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body).to.eql(newAccountData);
            });
        });
    });
    it('Edit Contact Info: Tax ID Agreement', function () {
        (0, profile_1.mockGetUserPreferences)({ maskSensitiveData: false }).as('getUserPreferences');
        // mock the user's account data and confirm that it is displayed correctly upon page load
        (0, account_1.mockGetAccount)(accountData).as('getAccount');
        cy.visitWithLogin('/account/billing');
        // edit the billing contact information
        (0, account_1.mockUpdateAccount)(newAccountData).as('updateAccount');
        (0, account_1.mockUpdateAccountAgreements)(newAccountAgreement).as('updateAccountAgreements');
        cy.get('[data-qa-contact-summary]').within(function (_contact) {
            checkAccountContactDisplay(accountData);
            cy.findByText('Edit').should('be.visible').click();
        });
        ui_1.ui.drawer
            .findByTitle('Edit Billing Contact Info')
            .should('be.visible')
            .within(function () {
            cy.findByLabelText('City').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['city']);
            cy.findByLabelText('Postal Code').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['zip']);
            ui_1.ui.autocomplete.findByLabel('Country').should('be.visible').click();
            cy.focused().type('Afghanistan');
            ui_1.ui.autocompletePopper
                .findByTitle('Afghanistan')
                .should('be.visible')
                .click();
            cy.findByLabelText('Tax ID').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(newAccountData['tax_id']);
            cy.findByText(constants_1.TAX_ID_HELPER_TEXT).should('be.visible');
            cy.findByText(constants_1.TAX_ID_AGREEMENT_TEXT).scrollIntoView();
            cy.findByText(constants_1.TAX_ID_AGREEMENT_TEXT).should('be.visible');
            cy.findByText('Akamai Privacy Statement.').should('be.visible');
            cy.get('[data-qa-save-contact-info="true"]').should('be.disabled');
            cy.get('[data-testid="tax-id-checkbox"]').click();
            cy.get('[data-qa-save-contact-info="true"]')
                .should('be.enabled')
                .click();
            cy.wait('@updateAccount').then(function (xhr) {
                var _a;
                expect((_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body).to.eql(newAccountData);
            });
            cy.wait('@updateAccountAgreements').then(function (xhr) {
                var _a;
                expect((_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body).to.eql(newAccountAgreement);
            });
        });
        // check the page updates to reflect the edits
        cy.get('[data-qa-contact-summary]').within(function () {
            checkAccountContactDisplay(newAccountData);
        });
    });
});
