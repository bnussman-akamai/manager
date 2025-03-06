"use strict";
/**
 * @file Tests for service transfer functionality between accounts.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceTransferErrorMessage = void 0;
var profile_1 = require("@linode/api-v4/lib/profile");
var authentication_1 = require("support/api/authentication");
var managed_1 = require("support/api/managed");
var account_1 = require("support/intercepts/account");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/util/linodes");
var polling_1 = require("support/util/polling");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var factories_1 = require("src/factories");
var entityTransfers_1 = require("src/factories/entityTransfers");
var linodes_3 = require("src/factories/linodes");
var formatDate_1 = require("src/utilities/formatDate");
// Service transfer empty state message.
var serviceTransferEmptyState = 'No data to display.';
// Service transfer error message.
exports.serviceTransferErrorMessage = 'An unknown error has occurred';
// Service transfer landing page URL.
var serviceTransferLandingUrl = '/account/service-transfers';
// Service transfer initiation page URL.
var serviceTransferCreateUrl = '/account/service-transfers/create';
// Possible status responses for service transfers.
var serviceTransferStatuses = [
    'pending',
    'completed',
    'failed',
    'accepted',
    'stale',
    'canceled',
];
/**
 * Initiates a service transfer for the Linode with the given label.
 *
 * This assumes that the user has already navigated to the service transfer
 * creation page.
 *
 * @param linodeLabel - Label for Linode for which to initiate transfer.
 */
var initiateLinodeTransfer = function (linodeLabel) {
    cy.findByText(linodeLabel)
        .should('be.visible')
        .closest('tr')
        .within(function () {
        cy.get('[data-qa-checked]').should('be.visible').click();
    });
    cy.findByText('1 Linode to be transferred').should('be.visible');
    ui_1.ui.button
        .findByTitle('Generate Token')
        .should('be.visible')
        .should('be.enabled')
        .click();
};
/**
 * Attempts to redeem the given token.
 *
 * This assumes the user has navigated to the Service Transfer landing page.
 *
 * @param token - Token to attempt to redeem.
 */
var redeemToken = function (token) {
    cy.findByLabelText('Receive a Service Transfer').should('be.visible').click();
    cy.focused().type(token);
    ui_1.ui.button
        .findByTitle('Review Details')
        .should('be.visible')
        .should('be.enabled')
        .click();
};
/**
 * Asserts that an error message is shown upon transfer token redemption attempt.
 *
 * @param errorMessage - Error message which is expected to be shown.
 */
var assertReceiptError = function (errorMessage) {
    ui_1.ui.dialog
        .findByTitle('Receive a Service Transfer')
        .should('be.visible')
        .within(function () {
        cy.findByText(errorMessage).should('be.visible');
        ui_1.ui.buttonGroup
            .findButtonByTitle('Cancel')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
};
(0, authentication_1.authenticate)();
describe('Account service transfers', function () {
    before(function () {
        /*
         * Clean up Linodes and LKE Clusters so that they do not interfere when
         * selecting Linodes from the list during service transfer initiation.
         */
        (0, cleanup_1.cleanUp)(['service-transfers', 'linodes', 'lke-clusters']);
    });
    /*
     * - Confirms user can navigate to service transfer page via user menu.
     */
    it('can navigate to service transfers landing page', function () {
        cy.tag('method:e2e');
        cy.visitWithLogin('/');
        cy.findByLabelText('Profile & Account').should('be.visible').click();
        cy.get('[data-qa-user-menu]')
            .should('be.visible')
            .within(function () {
            cy.findByText('Service Transfers').should('be.visible').click();
        });
        cy.findByText('Received Service Transfers').should('be.visible');
        cy.findByText('Sent Service Transfers').should('be.visible');
        cy.url().should('endWith', serviceTransferLandingUrl);
    });
    /*
     * - Confirms the Service Transfers empty state when no service transfers exist on the account.
     */
    it('can display empty state when no service transfer exists', function () {
        // Mock empty array for all three service transfers.
        var pendingTransfers = [];
        var receivedTransfers = [];
        var sentTransfers = [];
        (0, account_1.mockGetEntityTransfers)(pendingTransfers, receivedTransfers, sentTransfers).as('getTransfers');
        cy.visitWithLogin(serviceTransferLandingUrl);
        // Wait for 3 requests to transfers endpoint -- each section loads transfers separately.
        cy.wait(['@getTransfers', '@getTransfers', '@getTransfers']);
        // Confirm that the "Pending Service Transfers" panel does not exist.
        cy.get('[data-qa-panel="Pending Service Transfers"]').should('not.exist');
        // Confirm that text "No data to display" is in "Received Service Transfers" panel.
        cy.findByText('Received Service Transfers').should('be.visible').click();
        cy.get('[data-qa-panel="Received Service Transfers"]').within(function () {
            cy.findByText(serviceTransferEmptyState, { exact: false }).should('be.visible');
        });
        // Confirm that text "No data to display" is in "Sent Service Transfers" panel.
        cy.findByText('Sent Service Transfers').should('be.visible').click();
        cy.get('[data-qa-panel="Sent Service Transfers"]')
            .should('be.visible')
            .within(function () {
            cy.findByText(serviceTransferEmptyState, { exact: false }).should('be.visible');
        });
    });
    /*
     * - Confirms that pending, received, and sent transfers are shown on landing page.
     */
    it('lists service transfers on landing page', function () {
        var pendingTransfers = entityTransfers_1.entityTransferFactory.buildList(3, {
            entities: {
                linodes: [0, 1, 2, 3, 4],
            },
            status: 'pending',
        });
        var receivedTransfers = entityTransfers_1.entityTransferFactory.buildList(4, {
            entities: {
                linodes: [0],
            },
            is_sender: false,
        });
        var sentTransfers = serviceTransferStatuses.map(function (status) {
            return entityTransfers_1.entityTransferFactory.build({
                entities: {
                    linodes: [0, 1],
                },
                is_sender: true,
                status: status,
            });
        });
        (0, account_1.mockGetEntityTransfers)(pendingTransfers, receivedTransfers, sentTransfers).as('getTransfers');
        cy.visitWithLogin(serviceTransferLandingUrl);
        // Wait for 3 requests to transfers endpoint -- each section loads transfers separately.
        cy.wait(['@getTransfers', '@getTransfers', '@getTransfers']);
        // Confirm that pending transfers are displayed in "Pending Service Transfers" panel.
        cy.defer(function () { return (0, profile_1.getProfile)(); }, 'getting profile').then(function (profile) {
            var dateFormatOptions = { timezone: profile.timezone };
            cy.get('[data-qa-panel="Pending Service Transfers"]')
                .should('be.visible')
                .within(function () {
                pendingTransfers.forEach(function (pendingTransfer) {
                    cy.findByText(pendingTransfer.token)
                        .should('be.visible')
                        .closest('tr')
                        .within(function () {
                        cy.findByText('5 Linodes').should('be.visible');
                        cy.findByText((0, formatDate_1.formatDate)(pendingTransfer.created, dateFormatOptions)).should('be.visible');
                        cy.findByText((0, formatDate_1.formatDate)(pendingTransfer.expiry, dateFormatOptions)).should('be.visible');
                    });
                });
            });
            cy.get('[data-qa-panel="Received Service Transfers"]')
                .should('be.visible')
                .within(function () {
                receivedTransfers.forEach(function (receivedTransfer) {
                    cy.findByText(receivedTransfer.token)
                        .should('be.visible')
                        .closest('tr')
                        .within(function () {
                        cy.findByText('1 Linode').should('be.visible');
                        cy.findByText((0, formatDate_1.formatDate)(receivedTransfer.created, dateFormatOptions)).should('be.visible');
                    });
                });
            });
            cy.get('[data-qa-panel="Sent Service Transfers"]')
                .should('be.visible')
                .within(function () {
                sentTransfers.forEach(function (sentTransfer) {
                    cy.findByText(sentTransfer.token)
                        .should('be.visible')
                        .closest('tr')
                        .within(function () {
                        cy.findByText('2 Linodes').should('be.visible');
                        cy.findByText(sentTransfer.token).should('be.visible');
                        cy.findByText((0, formatDate_1.formatDate)(sentTransfer.created, dateFormatOptions)).should('be.visible');
                        cy.findByText(sentTransfer.status, { exact: false }).should('be.visible');
                    });
                });
            });
        });
    });
    /*
     * - Confirms that users can initiate a transfer of 1 Linode by generating a transfer token
     * - Confirms that users are shown the generated token
     * - Confirms that pending transfers are listed in the landing page table
     * - Confirms that users cannot receive a transfer using an invalid token
     * - Confirms that users cannot receive a transfer using a token they generated themselves
     * - Confirms that users cannot generate a new token for a Linode with a pending transfer
     * - Confirms that users can cancel a service transfer
     */
    it('can initiate and cancel a service transfer', function () {
        cy.tag('method:e2e');
        // Create a Linode to transfer.
        var setupLinode = function () { return __awaiter(void 0, void 0, void 0, function () {
            var payload, linode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = linodes_3.createLinodeRequestFactory.build({
                            label: (0, random_1.randomLabel)(),
                            region: (0, regions_1.chooseRegion)().id,
                        });
                        return [4 /*yield*/, (0, linodes_2.createTestLinode)(payload, {
                                securityMethod: 'powered_off',
                            })];
                    case 1:
                        linode = _a.sent();
                        return [4 /*yield*/, (0, polling_1.pollLinodeStatus)(linode.id, 'offline', {
                                initialDelay: 15000,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, linode];
                }
            });
        }); };
        cy.defer(function () { return setupLinode(); }, 'creating and booting Linode').then(function (linode) {
            (0, account_1.interceptInitiateEntityTransfer)().as('initiateTransfer');
            // Navigate to Service Transfer landing page, initiate transfer.
            cy.visitWithLogin(serviceTransferLandingUrl);
            ui_1.ui.button
                .findByTitle('Make a Service Transfer')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.findByText('Make a Service Transfer').should('be.visible');
            cy.url().should('endWith', serviceTransferCreateUrl);
            initiateLinodeTransfer(linode.label);
            cy.wait('@initiateTransfer').then(function (response) {
                var _a;
                var token = (_a = response === null || response === void 0 ? void 0 : response.response) === null || _a === void 0 ? void 0 : _a.body.token;
                if (!token) {
                    throw new Error('Failed to retrieve generated transfer token from API response.');
                }
                ui_1.ui.dialog
                    .findByTitle('Service Transfer Token')
                    .should('be.visible')
                    .within(function () {
                    // Confirm that user is advised to transfer token using a secure means,
                    // and that they are informed that the transfer may take up to an hour.
                    cy.findByText('secure delivery method', { exact: false }).should('be.visible');
                    cy.findByText('may take up to an hour', { exact: false }).should('be.visible');
                    cy.findByDisplayValue(token).should('be.visible');
                    // Close dialog.
                    cy.findByLabelText('Close').should('be.visible').click();
                });
                // Confirm token is listed on landing page and that correct information
                // is shown in modal when token is clicked.
                cy.findByText(token)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    cy.findByText(token).should('be.visible').click();
                });
                ui_1.ui.dialog
                    .findByTitle('Service Transfer Details')
                    .should('be.visible')
                    .within(function () {
                    cy.findByText(token).should('be.visible');
                    cy.findByText(linode.id).should('be.visible');
                    cy.get('[data-qa-close-drawer]').should('be.visible').click();
                });
                // Attempt to receive an invalid token.
                redeemToken((0, random_1.randomUuid)());
                assertReceiptError('Not found');
                // Attempt to receive previously generated token.
                redeemToken(token);
                assertReceiptError('You cannot initiate a transfer to another user on your account.');
                // Attempt to generate a new token for the same Linode.
                ui_1.ui.button
                    .findByTitle('Make a Service Transfer')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                initiateLinodeTransfer(linode.label);
                var errorMessage = "Cannot transfer Linode(s) with ID(s) ".concat(linode.id, ": Already pending another transfer request.");
                cy.findByText(errorMessage).should('be.visible');
                // Navigate back to landing page and cancel transfer.
                cy.contains('a', 'Service Transfers').should('be.visible').click();
                cy.url().should('endWith', serviceTransferLandingUrl);
                cy.findByText(token)
                    .should('be.visible')
                    .closest('tr')
                    .within(function () {
                    ui_1.ui.button
                        .findByTitle('Cancel')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                ui_1.ui.dialog
                    .findByTitle('Cancel this Service Transfer?')
                    .should('be.visible')
                    .within(function () {
                    ui_1.ui.buttonGroup
                        .findButtonByTitle('Cancel Service Transfer')
                        .should('be.visible')
                        .should('be.enabled')
                        .click();
                });
                ui_1.ui.toast.assertMessage('Service transfer canceled successfully.');
            });
        });
    });
    /*
     * - Confirms UI flow when accepting an entity transfer using mocked API data.
     * - Confirms that entity transfer is listed under "Received Service Transfers" after accepting.
     */
    it('can receive a service transfer', function () {
        var token = (0, random_1.randomUuid)();
        var transfer = entityTransfers_1.entityTransferFactory.build({
            entities: {
                linodes: [0],
            },
            is_sender: false,
            status: 'pending',
            token: token,
        });
        (0, account_1.mockGetEntityTransfers)([], [], []).as('getTransfers');
        (0, account_1.mockReceiveEntityTransfer)(token, transfer).as('receiveEntityTransfer');
        (0, account_1.mockAcceptEntityTransfer)(token).as('acceptEntityTransfer');
        cy.visitWithLogin(serviceTransferLandingUrl);
        cy.wait(['@getTransfers', '@getTransfers', '@getTransfers']);
        cy.get('[data-qa-panel="Pending Service Transfers"]').should('not.exist');
        redeemToken(token);
        cy.wait('@receiveEntityTransfer');
        (0, account_1.mockGetEntityTransfers)([], [transfer], []).as('getTransfers');
        ui_1.ui.dialog
            .findByTitle('Receive a Service Transfer')
            .should('be.visible')
            .within(function () {
            cy.findByText('1 Linode').should('be.visible');
            // Confirm that dialog button is disabled before clicking checkbox.
            ui_1.ui.buttonGroup
                .findButtonByTitle('Accept Transfer')
                .should('be.visible')
                .should('be.disabled');
            cy.findByText('I accept responsibility for the billing of services listed above.')
                .should('be.visible')
                .closest('label')
                .click();
            ui_1.ui.buttonGroup
                .findButtonByTitle('Accept Transfer')
                .should('be.visible')
                .should('be.enabled')
                .click();
        });
        cy.wait(['@acceptEntityTransfer', '@getTransfers']);
        ui_1.ui.toast.assertMessage('Transfer accepted successfully.');
        cy.get('[data-qa-panel="Received Service Transfers"]')
            .should('be.visible')
            .click();
        cy.findByText(token).should('be.visible');
    });
    /*
     * - Confirms that the managed users are not able to initiate service transfers.
     */
    it('can not initiate a service transfer by managed users', function () {
        // Mock Linodes to initiate a service transfer.
        var mockLinodes = new Array(5).fill(null).map(function (item, index) {
            return factories_1.linodeFactory.build({
                label: "Linode ".concat(index),
                region: (0, regions_1.chooseRegion)().id,
            });
        });
        (0, linodes_1.mockGetLinodes)(mockLinodes).as('getLinodes');
        var errorMessage = 'You cannot initiate transfers with Managed enabled.';
        (0, account_1.mockInitiateEntityTransferError)(errorMessage);
        // Navigate to Service Transfer landing page, initiate transfer.
        (0, managed_1.visitUrlWithManagedEnabled)(serviceTransferLandingUrl);
        ui_1.ui.button
            .findByTitle('Make a Service Transfer')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@getLinodes');
        cy.findByText('Make a Service Transfer').should('be.visible');
        cy.url().should('endWith', serviceTransferCreateUrl);
        initiateLinodeTransfer(mockLinodes[0].label);
        cy.findByText(errorMessage).should('be.visible');
    });
    /*
     * - Confirms that an error message is displayed in both the Received and Sent tables when the requests to fetch service transfers fail.
     */
    it('should display an error message when the request fails to fetch service transfer', function () {
        (0, account_1.mockGetEntityTransfersError)().as('getTransfersError');
        cy.visitWithLogin(serviceTransferLandingUrl);
        cy.wait('@getTransfersError');
        cy.get('[data-qa-panel="Pending Service Transfers"]').should('not.exist');
        // Confirm that an error message is displayed in both "Received Service Transfers" and "Sent Service Transfers" panels.
        ['Received Service Transfers', 'Sent Service Transfers'].forEach(function (transfer) {
            cy.get("[data-qa-panel=\"".concat(transfer, "\"]"))
                .should('be.visible')
                .within(function () {
                cy.get("[data-qa-panel-summary=\"".concat(transfer, "\"]")).click();
                // Error Icon should shows up.
                cy.findByTestId('ErrorOutlineIcon').should('be.visible');
                // Error message should be visible.
                cy.findByText(exports.serviceTransferErrorMessage, { exact: false }).should('be.visible');
            });
        });
    });
});
