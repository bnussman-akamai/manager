"use strict";
/**
 * @file Integration tests for account invoice functionality.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var factories_1 = require("@src/factories");
var luxon_1 = require("luxon");
var dc_specific_pricing_1 = require("support/constants/dc-specific-pricing");
var account_1 = require("support/intercepts/account");
var ui_1 = require("support/ui");
var arrays_1 = require("support/util/arrays");
var currency_1 = require("support/util/currency");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
/**
 * Returns a string representation of a region, as shown on the invoice details page.
 *
 * @param regionId - ID of region for which to get label.
 *
 * @returns Region label in `<country>, <label> (<id>)` format.
 */
var getRegionLabel = function (regionId) {
    var region = (0, regions_1.getRegionById)(regionId);
    return "".concat(region.label, " (").concat(region.id, ")");
};
describe('Account invoices', function () {
    /*
     * - Confirms that invoice items are listed on invoice details page using mock API data.
     * - Confirms that each invoice item is displayed with correct accompanying info.
     * - Confirms that invoice total is shown in header and in summary.
     * - Confirms that subtotals and tax breakdowns are shown in summary.
     * - Confirms that download buttons are present and enabled.
     * - Confirms that clicking the "Back to Billing" button redirects to billing page.
     * - Confirms that the "Region" column is present after the MAGIC_DATE_THAT_DC_PRICING_WAS_IMPLEMENTED.
     * - Confirms that invoice items that do not have a region are displayed as expected.
     * - Confirms that outbound transfer overage items display the associated region when applicable.
     * - Confirms that outbound transfer overage items display "Global" when no region is applicable.
     */
    it('lists invoice items on invoice details page', function () {
        var mockInvoiceItemsWithRegions = (0, arrays_1.buildArray)(20, function (i) {
            var subtotal = (0, random_1.randomNumber)(101, 999);
            var tax = (0, random_1.randomNumber)(1, 100);
            var hours = (0, random_1.randomNumber)(1, 24);
            var quantity = (0, random_1.randomNumber)(1, 999);
            var itemType = (0, random_1.randomItem)([
                'Nanode',
                'Linode',
                'Storage Volume',
                'Dedicated',
            ]);
            return factories_1.invoiceItemFactory.build({
                amount: subtotal,
                from: luxon_1.DateTime.now().minus({ days: i }).toISO(),
                label: "".concat(itemType, " ").concat((0, random_1.randomNumber)(1, 24), "GB - ").concat((0, random_1.randomLabel)(), " (").concat((0, random_1.randomNumber)(10000, 99999), ")"),
                quantity: quantity,
                region: (0, regions_1.chooseRegion)().id,
                tax: tax,
                to: luxon_1.DateTime.now().minus({ days: i }).plus({ hours: hours }).toISO(),
                total: subtotal + tax,
                unit_price: "".concat((0, random_1.randomNumber)(5, 300) / 10000),
            });
        });
        // Regular (non-overage) invoice items.
        var mockInvoiceItemsWithAndWithoutRegions = __spreadArray(__spreadArray([], mockInvoiceItemsWithRegions, true), [
            factories_1.invoiceItemFactory.build({
                amount: 5,
                region: null,
                tax: 1,
                total: 6,
            }),
        ], false);
        // Outbound transfer overage items.
        var mockInvoiceItemsOverages = [
            factories_1.invoiceItemFactory.build({
                label: 'Outbound Transfer Overage',
                region: null,
            }),
            factories_1.invoiceItemFactory.build({
                label: 'Outbound Transfer Overage',
                region: (0, regions_1.chooseRegion)().id,
            }),
        ];
        // Calculate the sum of each item's tax and subtotal.
        var sumTax = mockInvoiceItemsWithAndWithoutRegions.reduce(function (acc, cur) {
            return acc + cur.tax;
        }, 0);
        var sumSubtotal = mockInvoiceItemsWithAndWithoutRegions.reduce(function (acc, cur) {
            return acc + cur.amount;
        }, 0);
        // Create an Invoice object to correspond with the Invoice Items and their
        // charges.
        var mockInvoice = factories_1.invoiceFactory.build({
            date: dc_specific_pricing_1.MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED,
            id: (0, random_1.randomNumber)(10000, 99999),
            subtotal: sumSubtotal,
            tax: sumTax,
            tax_summary: [
                {
                    name: 'PA STATE TAX',
                    tax: Math.floor(sumTax / 2),
                },
                {
                    name: 'PA COUNTY TAX',
                    tax: Math.ceil(sumTax / 2),
                },
            ],
            total: sumTax + sumSubtotal,
        });
        // All mocked invoice items.
        var mockInvoiceItems = __spreadArray(__spreadArray([], mockInvoiceItemsWithAndWithoutRegions, true), mockInvoiceItemsOverages, true);
        (0, account_1.mockGetInvoice)(mockInvoice).as('getInvoice');
        (0, account_1.mockGetInvoiceItems)(mockInvoice, mockInvoiceItems).as('getInvoiceItems');
        cy.visitWithLogin("/account/billing/invoices/".concat(mockInvoice.id));
        cy.wait(['@getInvoice', '@getInvoiceItems']);
        // Confirm that "Region" table column is not present; old invoices will not be backfilled and we don't want to display a blank column.
        cy.findByLabelText('Invoice Details').within(function () {
            // Confirm that 'Region' table column is present.
            cy.get('thead').findByText('Region').should('be.visible');
            // Confirm that each regular invoice item is shown, and that the region is
            // displayed as expected.
            mockInvoiceItemsWithAndWithoutRegions.forEach(function (invoiceItem) {
                cy.findByText(invoiceItem.label)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByText("".concat(invoiceItem.quantity)).should('be.visible');
                    cy.findByText("$".concat(invoiceItem.unit_price)).should('be.visible');
                    cy.findByText("".concat((0, currency_1.formatUsd)(invoiceItem.amount))).should('be.visible');
                    cy.findByText("".concat((0, currency_1.formatUsd)(invoiceItem.tax))).should('be.visible');
                    cy.findByText("".concat((0, currency_1.formatUsd)(invoiceItem.total))).should('be.visible');
                    // If the invoice item has a region, confirm that it is displayed
                    // in the table row. Otherwise, confirm that the table cell which
                    // would normally show the region is empty.
                    !!invoiceItem.region
                        ? cy
                            .findByText(getRegionLabel(invoiceItem.region))
                            .should('be.visible')
                        : cy
                            .get('[data-qa-region]')
                            .should('be.visible')
                            .should('be.empty');
                });
            });
            // Confirm that outbound transfer overages are listed as expected.
            mockInvoiceItemsOverages.forEach(function (invoiceItem, i) {
                // There will be multiple instances of the label "Outbound Transfer Overage".
                // Select them all, then select the individual item that corresponds to the
                // item being iterated upon in the array.
                //
                // This relies on the items being shown in the same order on-screen as
                // they are defined in the array. This may be fragile to breakage if
                // we ever change the way invoice items are sorted on this page.
                cy.findAllByText(invoiceItem.label)
                    .should('have.length', 2)
                    .eq(i)
                    .closest('tr')
                    .within(function () {
                    // If the invoice item has a region, confirm that it is displayed
                    // in the table row. Otherwise, confirm that "Global" is displayed
                    // in the region column.
                    !!invoiceItem.region
                        ? cy
                            .findByText(getRegionLabel(invoiceItem.region))
                            .should('be.visible')
                        : cy.findByText('Global').should('be.visible');
                });
            });
        });
        // Confirm that invoice header contains invoice label, total, and download buttons.
        cy.get('[data-qa-invoice-header]')
            .should('be.visible')
            .within(function () {
            cy.findByText("Invoice #".concat(mockInvoice.id)).should('be.visible');
            cy.findByText((0, currency_1.formatUsd)(sumSubtotal + sumTax)).should('be.visible');
            cy.findByText('Download CSV').should('be.visible');
            cy.findByText('Download PDF').should('be.visible');
        });
        // Confirm that invoice summary displays subtotal, tax subtotal, tax summary entries, and grand total.
        cy.get('[data-qa-invoice-summary]')
            .should('be.visible')
            .within(function () {
            cy.findByText('Subtotal:')
                .findByText((0, currency_1.formatUsd)(sumSubtotal))
                .should('be.visible');
            cy.findByText('Tax Subtotal:')
                .findByText((0, currency_1.formatUsd)(sumTax))
                .should('be.visible');
            cy.findByText('Total:')
                .findByText((0, currency_1.formatUsd)(sumSubtotal + sumTax))
                .should('be.visible');
            // Confirm each tax summary entry is shown.
            mockInvoice.tax_summary.forEach(function (taxSummary) {
                cy.findByText("".concat(taxSummary.name, ":"))
                    .findByText((0, currency_1.formatUsd)(taxSummary.tax))
                    .should('be.visible');
            });
        });
        // Confirm that clicking the "Back to Billing" button redirects the user to
        // the account billing page.
        cy.get('[data-qa-back-to-billing]').should('be.visible').click();
        cy.url().should('endWith', '/account/billing');
    });
    it('does not list the region on past invoices', function () {
        var mockInvoice = factories_1.invoiceFactory.build({
            date: '2023-09-30 00:00:00Z',
            id: (0, random_1.randomNumber)(),
        });
        // Regular invoice items.
        var mockInvoiceItems = __spreadArray([], (0, arrays_1.buildArray)(10, function () { return factories_1.invoiceItemFactory.build({ region: null }); }), true);
        (0, account_1.mockGetInvoice)(mockInvoice).as('getInvoice');
        (0, account_1.mockGetInvoiceItems)(mockInvoice, mockInvoiceItems).as('getInvoiceItems');
        // Visit invoice details page, wait for relevant requests to resolve.
        cy.visitWithLogin("/account/billing/invoices/".concat(mockInvoice.id));
        cy.wait(['@getInvoice', '@getInvoiceItems']);
        cy.findByLabelText('Invoice Details').within(function () {
            // Confirm that "Region" table column is not present in an invoice created before DC-specific pricing was released.
            cy.get('thead').findByText('Region').should('not.exist');
        });
        // Confirm that each regular invoice item is shown, and that the region cell is not displayed for each item.
        mockInvoiceItems.forEach(function (invoiceItem) {
            cy.findByText(invoiceItem.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.get('[data-qa-region]').should('not.exist');
            });
        });
    });
    /*
     * - Confirms that invoice item pagination works as expected using mock API data.
     * - Confirms that the expected number of pages are shown for invoice items.
     * - Confirms that the expected invoice items are shown for each page.
     * - Confirms that page updates to reflect changes to page size selection.
     */
    it('paginates the list of invoice items for large invoices', function () {
        var mockInvoice = factories_1.invoiceFactory.build();
        var mockInvoiceItems = factories_1.invoiceItemFactory.buildList(100);
        var pages = [1, 2, 3, 4];
        (0, account_1.mockGetInvoice)(mockInvoice).as('getInvoice');
        (0, account_1.mockGetInvoiceItems)(mockInvoice, mockInvoiceItems).as('getInvoiceItems');
        cy.visitWithLogin("/account/billing/invoices/".concat(mockInvoice.id));
        cy.wait(['@getInvoice', '@getInvoiceItems']);
        cy.findByLabelText('Invoice Details').within(function () {
            // Confirm that page size selection is set to "Show 25".
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
                    return cy.findByText("".concat(page)).should('be.visible');
                });
                cy.findByText('5').should('not.exist');
            });
            // Click through each page and confirm correct invoice items are displayed.
            pages.forEach(function (page) {
                var invoiceItemSubset = mockInvoiceItems.slice(25 * (page - 1), 25 * (page - 1) + 24);
                ui_1.ui.pagination.findControls().within(function () {
                    cy.findByText("".concat(page)).should('be.visible').click();
                });
                // Confirm that 25 invoice items are shown, and they correspond to the
                // expected items given the selected pagination page. There are two
                // additional table rows to account for: the table header, and the
                // table row containing pagination.
                cy.get('tr').should('have.length', 27);
                invoiceItemSubset.forEach(function (invoiceItem) {
                    cy.findByText(invoiceItem.label).should('be.visible');
                });
            });
            // Change pagination size selection from "Show 25" to "Show 100".
            ui_1.ui.pagination.findPageSizeSelect().click();
            cy.get('[data-qa-pagination-page-size-option="100"]')
                .should('exist')
                .click();
            // Confirm that all invoice items are listed.
            cy.get('tr').should('have.length', 102);
            mockInvoiceItems.forEach(function (invoiceItem) {
                cy.findByText(invoiceItem.label).should('be.visible');
            });
        });
    });
});
