"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var account_1 = require("support/intercepts/account");
var ui_1 = require("support/ui");
var mockPaymentMethods = [
    {
        created: '2021-07-27T14:37:43',
        data: {
            card_type: 'American Express',
            expiry: '07/2025',
            last_four: '2222',
        },
        id: 420330,
        is_default: true,
        type: 'credit_card',
    },
    {
        created: '2021-08-04T18:29:01',
        data: { card_type: 'Visa', expiry: '07/2025', last_four: '2045' },
        id: 434357,
        is_default: false,
        type: 'google_pay',
    },
];
var mockPaymentMethodsData = mockPaymentMethods.map(function (paymentMethod) {
    return paymentMethod.data;
});
var mockPaymentMethodsExpired = [
    {
        created: '2021-07-27T14:37:43',
        data: {
            card_type: 'American Express',
            expiry: '07/2025',
            last_four: '2222',
        },
        id: 420330,
        is_default: true,
        type: 'credit_card',
    },
    {
        created: '2021-08-04T18:29:01',
        data: { card_type: 'Visa', expiry: '07/2020', last_four: '2045' },
        id: 434357,
        is_default: false,
        type: 'google_pay',
    },
];
var pastDueExpiry = 'Expired 07/20';
var braintreeURL = 'https://client-analytics.braintreegateway.com/*';
describe('Google Pay', function () {
    it('adds google pay method', function () {
        cy.intercept(braintreeURL).as('braintree');
        (0, account_1.mockGetPaymentMethods)(mockPaymentMethods).as('getPaymentMethods');
        cy.visitWithLogin('/account/billing');
        cy.wait('@getPaymentMethods');
        cy.findByText('Add Payment Method').should('be.visible').click();
        cy.get('[data-qa-button="gpayChip"]').should('be.visible').click();
        cy.wait('@braintree');
    });
    it('tests make payment flow - google pay', function () {
        cy.intercept(braintreeURL).as('braintree');
        (0, account_1.mockGetPaymentMethods)(mockPaymentMethods).as('getPaymentMethods');
        cy.visitWithLogin('/account/billing');
        cy.wait('@getPaymentMethods');
        ui_1.ui.actionMenu
            .findByTitle("Action menu for card ending in ".concat(mockPaymentMethodsData[1].last_four))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem
            .findByTitle('Make a Payment')
            .should('be.visible')
            .click();
        ui_1.ui.drawer
            .findByTitle('Make a Payment')
            .should('be.visible')
            .within(function () {
            cy.contains("".concat(mockPaymentMethodsData[0].card_type, " ****").concat(mockPaymentMethodsData[0].last_four)).should('be.visible');
            cy.contains("".concat(mockPaymentMethodsData[1].card_type, " ****").concat(mockPaymentMethodsData[1].last_four)).should('be.visible');
            cy.get('[data-qa-button="gpayButton"]').click();
        });
        cy.wait('@braintree');
    });
    it('tests payment flow with expired card - google pay', function () {
        cy.intercept(braintreeURL).as('braintree');
        (0, account_1.mockGetPaymentMethods)(mockPaymentMethodsExpired).as('getPaymentMethods');
        cy.visitWithLogin('/account/billing');
        cy.wait('@getPaymentMethods');
        cy.get('[data-qa-payment-row="google_pay"]').within(function () {
            cy.get('[data-qa-contact-cc-exp-date="true"]')
                .should('be.visible')
                .within(function () {
                cy.contains(pastDueExpiry).should('be.visible');
            });
        });
    });
    // TODO: add test with only gpay, no cc
});
