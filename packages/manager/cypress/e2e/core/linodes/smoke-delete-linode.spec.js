"use strict";
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
var authentication_1 = require("support/api/authentication");
var linodes_1 = require("support/util/linodes");
var linodes_2 = require("@src/factories/linodes");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var accountSettings_1 = require("@src/factories/accountSettings");
var random_1 = require("support/util/random");
var linodes_3 = require("support/intercepts/linodes");
var account_1 = require("support/intercepts/account");
var confirmDeletion = function (linodeLabel) {
    cy.url().should('endWith', '/linodes');
    cy.findByText(linodeLabel).should('not.exist');
    // Confirm the linode instance is removed
    ui_1.ui.mainSearch.find().type("".concat(linodeLabel, "{enter}"));
    cy.findByText('You searched for ...').should('be.visible');
    cy.findByText('Sorry, no results for this one.').should('be.visible');
};
var deleteLinodeFromActionMenu = function (linodeLabel) {
    ui_1.ui.actionMenu
        .findByTitle("Action menu for Linode ".concat(linodeLabel))
        .should('be.visible')
        .click();
    ui_1.ui.actionMenuItem.findByTitle('Delete').should('be.visible').click();
    ui_1.ui.dialog
        .findByTitle("Delete ".concat(linodeLabel, "?"))
        .should('be.visible')
        .within(function () {
        cy.findByLabelText('Linode Label').should('be.visible').click();
        cy.focused().type(linodeLabel);
        ui_1.ui.buttonGroup
            .findButtonByTitle('Delete')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
    cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
    cy.findAllByText(linodeLabel).should('not.exist');
};
var preferenceOverrides = {
    linodes_view_style: 'list',
    linodes_group_by_tag: false,
    volumes_group_by_tag: false,
    desktop_sidebar_open: false,
    sortKeys: {
        'linodes-landing': { order: 'asc', orderBy: 'label' },
        volume: { order: 'asc', orderBy: 'label' },
    },
};
(0, authentication_1.authenticate)();
describe('delete linode', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'lke-clusters']);
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    it('deletes linode from linode details page', function () {
        var linodeCreatePayload = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeCreatePayload); }).then(function (linode) {
            // catch delete request
            (0, linodes_3.interceptDeleteLinode)(linode.id).as('deleteLinode');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            // Wait for content to load before performing actions via action menu.
            cy.findByText('Stats for this Linode are not available yet');
            // Delete linode
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem
                .findByTitle('Delete')
                .as('deleteButton')
                .should('be.visible');
            cy.get('@deleteButton').click();
            ui_1.ui.dialog
                .findByTitle("Delete ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                cy.findByLabelText('Linode Label').should('be.visible').click();
                cy.focused().type(linode.label);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm delete
            cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
            confirmDeletion(linode.label);
        });
    });
    it('deletes linode from setting tab in linode details page', function () {
        var linodeCreatePayload = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeCreatePayload); }).then(function (linode) {
            // catch delete request
            (0, linodes_3.interceptDeleteLinode)(linode.id).as('deleteLinode');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            // Wait for content to load before performing actions via action menu.
            cy.findByText('Stats for this Linode are not available yet');
            // Go to setting tab
            cy.findByText('Settings').should('be.visible').click();
            // Check elements in setting tab
            cy.findByText('Linode Label').should('be.visible');
            cy.findByText('Reset Root Password').should('be.visible');
            cy.findByText('Notification Thresholds').should('be.visible');
            cy.findByText('Shutdown Watchdog').should('be.visible');
            cy.findByText('Delete Linode').should('be.visible');
            // Delete linode
            ui_1.ui.button
                .findByTitle('Delete')
                .should('be.visible')
                .should('be.enabled')
                .click();
            ui_1.ui.dialog
                .findByTitle("Delete ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                cy.findByLabelText('Linode Label').should('be.visible').click();
                cy.focused().type(linode.label);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm delete
            cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
            confirmDeletion(linode.label);
        });
    });
    it('deletes linode from linode landing page', function () {
        var linodeCreatePayload = linodes_2.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
        });
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodeCreatePayload); }).then(function (linode) {
            // catch delete request
            (0, linodes_3.interceptDeleteLinode)(linode.id).as('deleteLinode');
            cy.visitWithLogin("/linodes");
            cy.findByText(linode.label).should('be.visible');
            ui_1.ui.actionMenu
                .findByTitle("Action menu for Linode ".concat(linode.label))
                .should('be.visible')
                .click();
            ui_1.ui.actionMenuItem
                .findByTitle('Delete')
                .as('deleteButton')
                .should('be.visible');
            cy.get('@deleteButton').click();
            ui_1.ui.dialog
                .findByTitle("Delete ".concat(linode.label, "?"))
                .should('be.visible')
                .within(function () {
                cy.findByLabelText('Linode Label').should('be.visible').click();
                cy.focused().type(linode.label);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm delete
            cy.wait('@deleteLinode').its('response.statusCode').should('eq', 200);
            confirmDeletion(linode.label);
        });
    });
    it('deleting multiple linodes with action menu', function () {
        var mockAccountSettings = accountSettings_1.accountSettingsFactory.build({
            managed: false,
        });
        var createTwoLinodes = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all([
                        (0, linodes_1.createTestLinode)(linodes_2.createLinodeRequestFactory.build({ label: (0, random_1.randomLabel)() })),
                        (0, linodes_1.createTestLinode)(linodes_2.createLinodeRequestFactory.build({ label: (0, random_1.randomLabel)() })),
                    ])];
            });
        }); };
        (0, account_1.mockGetAccountSettings)(mockAccountSettings).as('getAccountSettings');
        cy.defer(function () { return createTwoLinodes(); }).then(function (_a) {
            var linodeA = _a[0], linodeB = _a[1];
            (0, linodes_3.interceptDeleteLinode)(linodeA.id).as('deleteLinode');
            (0, linodes_3.interceptDeleteLinode)(linodeB.id).as('deleteLinode');
            cy.visitWithLogin('/linodes', { preferenceOverrides: preferenceOverrides });
            cy.wait('@getAccountSettings');
            cy.get('[data-qa-header="Linodes"]').should('be.visible');
            if (!cy.get('[data-qa-sort-label="asc"]')) {
                cy.get('[aria-label="Sort by label"]').click();
            }
            deleteLinodeFromActionMenu(linodeA.label);
            deleteLinodeFromActionMenu(linodeB.label);
            cy.findByText('Oh Snap!', { timeout: 1000 }).should('not.exist');
        });
    });
});
