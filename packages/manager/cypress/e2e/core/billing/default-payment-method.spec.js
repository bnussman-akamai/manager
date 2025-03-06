"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var accountPayment_1 = require("@src/factories/accountPayment");
var account_1 = require("support/intercepts/account");
var ui_1 = require("support/ui");
var paymentMethodGpay = function (isDefault) {
    return accountPayment_1.paymentMethodFactory.build({
        data: { card_type: 'Visa', expiry: '07/2025', last_four: '2045' },
        id: 434357,
        is_default: isDefault,
        type: 'google_pay',
    });
};
var paymentMethodCC = function (isDefault) {
    return accountPayment_1.paymentMethodFactory.build({
        data: {
            card_type: 'American Express',
            expiry: '07/2025',
            last_four: '2222',
        },
        id: 420330,
        is_default: isDefault,
        type: 'credit_card',
    });
};
var gpayDefault = [paymentMethodCC(false), paymentMethodGpay(true)];
var ccDefault = [paymentMethodCC(true), paymentMethodGpay(false)];
var gpayIdCcDefault = ccDefault[1].id;
var ccIdGpayDefault = gpayDefault[0].id;
var gpayLastFourCcDefault = ccDefault[1].data.last_four;
var ccLastFourGpayDefault = gpayDefault[0].data.last_four;
describe('Default Payment Method', function () {
    it('makes google pay default', function () {
        (0, account_1.mockGetPaymentMethods)(ccDefault).as('getPaymentMethods');
        (0, account_1.mockSetDefaultPaymentMethod)(gpayIdCcDefault).as('changeDefault');
        cy.visitWithLogin('/account/billing');
        cy.wait('@getPaymentMethods');
        ui_1.ui.actionMenu
            .findByTitle("Action menu for card ending in ".concat(gpayLastFourCcDefault))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem.findByTitle('Make Default').should('be.visible').click();
        cy.wait(['@changeDefault']);
        cy.get('[data-qa-payment-row=google_pay]').within(function () {
            cy.findByText('DEFAULT').should('be.visible');
        });
    });
    it('makes cc default', function () {
        (0, account_1.mockGetPaymentMethods)(gpayDefault).as('getPaymentMethods');
        (0, account_1.mockSetDefaultPaymentMethod)(ccIdGpayDefault).as('changeDefault');
        cy.visitWithLogin('/account/billing');
        cy.wait('@getPaymentMethods');
        ui_1.ui.actionMenu
            .findByTitle("Action menu for card ending in ".concat(ccLastFourGpayDefault))
            .should('be.visible')
            .click();
        ui_1.ui.actionMenuItem.findByTitle('Make Default').should('be.visible').click();
        cy.wait(['@changeDefault']);
        cy.get('[data-qa-payment-row=credit_card]').within(function () {
            cy.findByText('DEFAULT').should('be.visible');
        });
    });
});
