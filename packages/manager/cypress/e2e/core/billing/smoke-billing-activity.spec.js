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
var api_v4_1 = require("@linode/api-v4");
var factories_1 = require("@src/factories");
var formatDate_1 = require("@src/utilities/formatDate");
var luxon_1 = require("luxon");
var authentication_1 = require("support/api/authentication");
var account_1 = require("support/intercepts/account");
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var arrays_1 = require("support/util/arrays");
var random_1 = require("support/util/random");
var billing_1 = require("src/factories/billing");
/**
 * Uses the user menu to navigate to the Profile Display page.
 *
 * Assumes the user menu is not already open.
 */
var navigateToProfileDisplay = function () {
    ui_1.ui.userMenuButton.find().click();
    ui_1.ui.userMenu
        .find()
        .should('be.visible')
        .within(function () {
        cy.findByText('Display').should('be.visible').click();
    });
    cy.url().should('endWith', '/profile/display');
};
/**
 * Uses the user menu to navigate to the Billing & Contact Information page.
 *
 * Assumes the user menu is not already open.
 */
var navigateToBilling = function () {
    ui_1.ui.userMenuButton.find().click();
    ui_1.ui.userMenu
        .find()
        .should('be.visible')
        .within(function () {
        cy.findByText('Billing & Contact Information')
            .should('be.visible')
            .click();
    });
    cy.url().should('endWith', '/account/billing');
};
/**
 * Confirms that an invoice is listed in the billing activity section.
 *
 * Confirms that the invoice label, date, total, and PDF download button are
 * displayed as expected.
 *
 * Assumes that the user has already navigated to the Billing & Contact Info
 * page.
 *
 * @param invoice - Invoice that should be displayed.
 * @param timezone - Current user's timezone.
 */
var assertInvoiceInfo = function (invoice, timezone) {
    var invoiceDate = (0, formatDate_1.formatDate)(invoice.date, {
        displayTime: true,
        timezone: timezone,
    });
    cy.findByText(invoice.label)
        .should('be.visible')
        .closest('tr')
        .within(function () {
        cy.findByText(invoiceDate).should('be.visible');
        cy.findByText("$".concat(invoice.total, ".00")).should('be.visible');
        ui_1.ui.button
            .findByTitle('Download PDF')
            .should('be.visible')
            .should('be.enabled');
    });
};
/**
 * Confirms that a payment is listed in the billing activity section.
 *
 * Confirms that the payment label, date, total, and PDF download button are
 * displayed as expected.
 *
 * Assumes that the user has already navigated to the Billing & Contact Info
 * page.
 *
 * @param payment - Payment that should be displayed.
 * @param timezone - Current user's timezone.
 */
var assertPaymentInfo = function (payment, timezone) {
    var paymentDate = (0, formatDate_1.formatDate)(payment.date, {
        displayTime: true,
        timezone: timezone,
    });
    cy.findByText("Payment #".concat(payment.id))
        .should('be.visible')
        .closest('tr')
        .within(function () {
        cy.findByText(paymentDate).should('be.visible');
        cy.findByText("$".concat(payment.usd, ".00")).should('be.visible');
        ui_1.ui.button
            .findByTitle('Download PDF')
            .should('be.visible')
            .should('be.enabled');
    });
};
(0, authentication_1.authenticate)();
describe('Billing Activity Feed', function () {
    /*
     * - Uses mocked API data to confirm that invoices and payments are listed on billing page.
     * - Confirms that invoice and payment labels, dates, and totals are displayed as expected.
     * - Confirms that Billing Activity section updates to reflect changes to time period selection.
     * - Confirms that Billing Activity section updates to reflect changes to transaction type selection.
     * - Confirms that clicking on an invoice's label directs the user to the invoice details page.
     */
    it('lists invoices and payments', function () {
        var invoiceMocks = (0, arrays_1.buildArray)(10, function (i) {
            var id = (0, random_1.randomNumber)(1, 999999);
            var date = luxon_1.DateTime.now().minus({ days: 2, months: i }).toISO();
            var subtotal = (0, random_1.randomNumber)(25, 949);
            var tax = (0, random_1.randomNumber)(5, 50);
            return billing_1.invoiceFactory.build({
                date: date,
                id: id,
                label: "Invoice #".concat(id),
                subtotal: subtotal,
                tax: tax,
                total: subtotal + tax,
            });
        });
        var paymentMocks = invoiceMocks.map(function (invoice, i) {
            var id = (0, random_1.randomNumber)(1, 999999);
            var date = luxon_1.DateTime.now().minus({ months: i }).toISO();
            return billing_1.paymentFactory.build({
                date: date,
                id: id,
                usd: invoice.total,
            });
        });
        var invoiceMocks6Months = invoiceMocks.slice(0, 5);
        var paymentMocks6Months = paymentMocks.slice(0, 5);
        (0, account_1.mockGetInvoices)(invoiceMocks6Months).as('getInvoices');
        (0, account_1.mockGetPayments)(paymentMocks6Months).as('getPayments');
        (0, account_1.mockGetPaymentMethods)([]);
        cy.defer(function () { return (0, api_v4_1.getProfile)(); }).then(function (profile) {
            var timezone = profile.timezone;
            cy.visitWithLogin('/account/billing');
            cy.wait(['@getInvoices', '@getPayments']);
            cy.findByText('Billing & Payment History')
                .as('qaBilling')
                .scrollIntoView();
            cy.get('@qaBilling').should('be.visible');
            // Confirm that payments and invoices from the past 6 months are displayed,
            // and that payments and invoices beyond 6 months are not displayed.
            invoiceMocks6Months.forEach(function (invoice) {
                return assertInvoiceInfo(invoice, timezone);
            });
            paymentMocks6Months.forEach(function (payment) {
                return assertPaymentInfo(payment, timezone);
            });
            invoiceMocks
                .filter(function (invoice) { return !invoiceMocks6Months.includes(invoice); })
                .forEach(function (invoice) {
                cy.findByText(invoice.label).should('not.exist');
            });
            paymentMocks
                .filter(function (payment) { return !paymentMocks6Months.includes(payment); })
                .forEach(function (payment) {
                cy.findByText("Payment #".concat(payment.id)).should('not.exist');
            });
            // Change drop-down value from "6 Months" to "All Time", and mock subsequent
            // invoice and payment requests to include older transactions.
            (0, account_1.mockGetInvoices)(invoiceMocks).as('getInvoices');
            (0, account_1.mockGetPayments)(paymentMocks).as('getPayments');
            cy.findByText('Transaction Dates').click();
            cy.focused().type("All Time");
            ui_1.ui.autocompletePopper
                .findByTitle("All Time")
                .should('be.visible')
                .click();
            cy.wait(['@getInvoices', '@getPayments']);
            // Confirm that all invoices and payments are displayed.
            invoiceMocks.forEach(function (invoice) {
                cy.findByText(invoice.label).should('be.visible');
            });
            paymentMocks.forEach(function (payment) {
                cy.findByText("Payment #".concat(payment.id)).should('be.visible');
            });
            // Change transaction type drop-down to "Payments" only.
            cy.findByText('Transaction Types').click();
            cy.focused().type("Payments");
            ui_1.ui.autocompletePopper
                .findByTitle("Payments")
                .should('be.visible')
                .click();
            // Confirm that all payments are shown and that all invoices are hidden.
            paymentMocks.forEach(function (payment) {
                return cy.findByText("Payment #".concat(payment.id)).should('be.visible');
            });
            invoiceMocks.forEach(function (invoice) {
                return cy.findByText(invoice.label).should('not.exist');
            });
            // Change transaction type drop-down to "Invoices" only.
            cy.findByText('Transaction Types').should('be.visible').focused().click();
            ui_1.ui.autocompletePopper
                .findByTitle('Invoices')
                .should('be.visible')
                .click();
            // Confirm that all invoices are shown and that all payments are hidden.
            invoiceMocks6Months.forEach(function (invoice) {
                cy.findByText(invoice.label).should('be.visible');
            });
            paymentMocks.forEach(function (payment) {
                cy.findByText("Payment #".concat(payment.id)).should('not.exist');
            });
            // Click on the first invoice and confirm that it redirects the user to
            // the corresponding invoice details page.
            cy.findByText(invoiceMocks[0].label).should('be.visible').click();
            cy.url().should('endWith', "/billing/invoices/".concat(invoiceMocks[0].id));
        });
    });
    /*
     * - Confirms that invoice pagination works as expected using mock API data.
     * - Confirms that the expected number of pages are shown for invoices.
     * - Confirms that the expected invoices are shown for each page.
     * - Confirms that invoice list updates to reflect changes to page size selection.
     */
    it('paginates the list of invoices', function () {
        var mockInvoices = billing_1.invoiceFactory.buildList(100);
        var pages = [1, 2, 3, 4];
        (0, account_1.mockGetInvoices)(mockInvoices).as('getInvoices');
        (0, account_1.mockGetPayments)([]).as('getPayments');
        (0, account_1.mockGetPaymentMethods)([]).as('getPaymentMethods');
        cy.visitWithLogin('/account/billing');
        cy.wait(['@getInvoices', '@getPayments', '@getPaymentMethods']);
        // Change invoice date selection from "6 Months" to "All Time".
        cy.findByText('Transaction Dates').click();
        cy.focused().type('All Time');
        ui_1.ui.autocompletePopper.findByTitle('All Time').should('be.visible').click();
        cy.get('[data-qa-billing-activity-panel]')
            .should('be.visible')
            .within(function () {
            // Confirm that pagination page size selection is set to "Show 25".
            ui_1.ui.pagination.findPageSizeSelect().click();
            cy.get('[data-qa-pagination-page-size-option="25"]')
                .should('exist')
                .click();
            // Confirm that pagination controls list exactly 4 pages.
            ui_1.ui.pagination
                .findControls()
                .should('be.visible')
                .within(function () {
                pages.forEach(function (page) {
                    cy.findByText("".concat(page)).should('be.visible');
                });
                cy.findByText('5').should('not.exist');
            });
            // Click each page, and confirm that the expected 25 invoices are shown.
            pages.forEach(function (page) {
                var invoiceSubset = mockInvoices.slice(25 * (page - 1), 25 * (page - 1) + 24);
                ui_1.ui.pagination.findControls().within(function () {
                    cy.findByText("".concat(page)).should('be.visible').click();
                });
                // We have to account for the table header row when counting the number
                // of <tr /> elements.
                cy.get('tr').should('have.length', 26);
                invoiceSubset.forEach(function (invoice) {
                    cy.findByText(invoice.label).should('be.visible');
                });
            });
            // Change page size selection from "Show 25" to "Show 100".
            ui_1.ui.pagination.findPageSizeSelect().click();
            cy.get('[data-qa-pagination-page-size-option="100"]')
                .should('exist')
                .click();
            // Confirm that all 100 invoices are shown.
            cy.get('tr').should('have.length', 101);
            mockInvoices.forEach(function (invoice) {
                cy.findByText(invoice.label).should('be.visible');
            });
        });
    });
    /*
     * - Uses mocked API data to confirm that invoice and payment dates reflect user's chosen timezone.
     */
    it('displays correct timezone for invoice and payment dates', function () {
        // Time zones against which to verify invoice and payment dates.
        var timeZonesList = [
            { human: 'Eastern Time - New York', key: 'America/New_York' },
            { human: 'Coordinated Universal Time', key: 'UTC' },
            { human: 'Hong Kong Standard Time', key: 'Asia/Hong_Kong' },
        ];
        var mockProfile = factories_1.profileFactory.build({
            timezone: 'Pacific/Honolulu',
        });
        var mockInvoice = billing_1.invoiceFactory.build({
            date: luxon_1.DateTime.now().minus({ days: 2 }).toISO(),
        });
        var mockPayment = billing_1.paymentFactory.build({
            date: luxon_1.DateTime.now().toISO(),
        });
        (0, account_1.mockGetInvoices)([mockInvoice]).as('getInvoices');
        (0, account_1.mockGetPayments)([mockPayment]).as('getPayments');
        (0, profile_1.mockGetProfile)(mockProfile).as('getProfile');
        // Navigate initially to Profile Display page where timezone can be selected.
        cy.visitWithLogin('/profile/display');
        cy.wait('@getProfile');
        // Verify the user's initial timezone is selected by default
        cy.findByLabelText('Timezone')
            .should('be.visible')
            .should('contain.value', 'Hawaii-Aleutian Standard Time');
        // Iterate through each timezone and confirm that payment and invoice dates
        // reflect each timezone.
        timeZonesList.forEach(function (timezone) {
            var timezoneId = timezone.key;
            var timezoneLabel = timezone.human;
            (0, profile_1.mockUpdateProfile)(__assign(__assign({}, mockProfile), { timezone: timezoneId })).as('updateProfile');
            // Update the mock user's profile.
            // This isn't strictly necessary, but is the most straightforward way to
            // get Cloud to re-fetch the user's profile data with the new timezone
            // applied.
            cy.findByText('Timezone').should('be.visible').click();
            cy.focused().type("".concat(timezoneLabel, "{enter}"));
            ui_1.ui.button
                .findByTitle('Update Timezone')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@updateProfile');
            // Verify the new timezone remains selected after clicking "Update Timezone"
            cy.findByLabelText('Timezone')
                .should('be.visible')
                .should('contain.value', timezoneLabel);
            // Navigate back to Billing & Contact Information page to confirm that
            // invoice and payment data correctly reflects updated timezone.
            navigateToBilling();
            cy.findByText(mockInvoice.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                assertInvoiceInfo(mockInvoice, timezoneId);
            });
            cy.findByText("Payment #".concat(mockPayment.id))
                .should('be.visible')
                .closest('tr')
                .within(function () {
                assertPaymentInfo(mockPayment, timezoneId);
            });
            // Navigate back to Profile Display page for next iteration.
            navigateToProfileDisplay();
        });
    });
});
