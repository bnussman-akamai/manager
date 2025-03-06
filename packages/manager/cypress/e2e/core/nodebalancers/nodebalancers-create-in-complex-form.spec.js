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
var cypress_1 = require("support/constants/cypress");
var linodes_1 = require("support/util/linodes");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var authentication_1 = require("support/api/authentication");
var factories_1 = require("src/factories");
var nodebalancers_1 = require("support/intercepts/nodebalancers");
(0, authentication_1.authenticate)();
describe('create NodeBalancer to test the submission of multiple nodes and multiple configs', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['tags', 'node-balancers', 'linodes']);
    });
    /*
     * - Confirms NodeBalancer create flow when adding multiple Backend Nodes.
     * - Confirms Summary field displays correct Node number.
     */
    it('creates a NodeBalancer with multiple Backend Nodes', function () {
        var region = (0, regions_1.chooseRegion)();
        var linodePayload = {
            region: region.id,
            // NodeBalancers require Linodes with private IPs.
            private_ip: true,
        };
        var linodePayload_2 = {
            region: region.id,
            private_ip: true,
        };
        var createTestLinodes = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all([
                        (0, linodes_1.createTestLinode)(linodePayload),
                        (0, linodes_1.createTestLinode)(linodePayload_2),
                    ])];
            });
        }); };
        cy.defer(createTestLinodes, 'Creating 2 test Linodes').then(function (_a) {
            var linode = _a[0], linode2 = _a[1];
            var nodeBal = factories_1.nodeBalancerFactory.build({
                label: (0, random_1.randomLabel)(),
                region: region.id,
                ipv4: linode.ipv4[1],
            });
            var nodeBal_2 = factories_1.nodeBalancerFactory.build({
                label: (0, random_1.randomLabel)(),
                region: region.id,
                ipv4: linode2.ipv4[1],
            });
            (0, nodebalancers_1.interceptCreateNodeBalancer)().as('createNodeBalancer');
            cy.visitWithLogin('/nodebalancers/create');
            cy.get('[id="nodebalancer-label"]').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(nodeBal.label);
            cy.findByPlaceholderText(/create a tag/i).click();
            cy.focused().type(cypress_1.entityTag);
            // this will create the NB in newark, where the default Linode was created
            ui_1.ui.regionSelect.find().click().clear().type("".concat(region.label, "{enter}"));
            // node backend config
            cy.findByText('Label').click();
            cy.focused().type((0, random_1.randomLabel)());
            cy.findByLabelText('IP Address').should('be.visible').click();
            cy.focused().type(nodeBal.ipv4);
            ui_1.ui.autocompletePopper
                .findByTitle(nodeBal.ipv4)
                .should('be.visible')
                .click();
            cy.findByLabelText('Weight').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type('50');
            // Add a backend node
            cy.get('[data-testid="button"]').contains('Add a Node').click();
            cy.findAllByText('Label').last().click();
            cy.focused().type((0, random_1.randomLabel)());
            cy.findAllByText('IP Address').last().should('be.visible').click();
            cy.focused().type(nodeBal_2.ipv4);
            ui_1.ui.autocompletePopper
                .findByTitle(nodeBal_2.ipv4)
                .should('be.visible')
                .click();
            cy.get('[data-testid="textfield-input"]')
                .last()
                .should('be.visible')
                .click();
            cy.focused().clear();
            cy.focused().type('50');
            // Confirm Summary info
            cy.get('[data-qa-summary="true"]').within(function () {
                cy.contains("Nodes 2").should('be.visible');
            });
            cy.get('[data-qa-deploy-nodebalancer]').click();
            cy.wait('@createNodeBalancer')
                .its('response.statusCode')
                .should('eq', 200);
        });
    });
    /*
     * - Confirms NodeBalancer create flow when adding additional config.
     * - Confirms Summary field displays correct Config number.
     */
    it('creates a NodeBalancer with an additional config', function () {
        var region = (0, regions_1.chooseRegion)();
        var linodePayload = {
            region: region.id,
            // NodeBalancers require Linodes with private IPs.
            private_ip: true,
        };
        var linodePayload_2 = {
            region: region.id,
            private_ip: true,
        };
        var createTestLinodes = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all([
                        (0, linodes_1.createTestLinode)(linodePayload),
                        (0, linodes_1.createTestLinode)(linodePayload_2),
                    ])];
            });
        }); };
        cy.defer(createTestLinodes, 'Creating 2 test Linodes').then(function (_a) {
            var linode = _a[0], linode2 = _a[1];
            var nodeBal = factories_1.nodeBalancerFactory.build({
                label: (0, random_1.randomLabel)(),
                region: region.id,
                ipv4: linode.ipv4[1],
            });
            var nodeBal_2 = factories_1.nodeBalancerFactory.build({
                label: (0, random_1.randomLabel)(),
                region: region.id,
                ipv4: linode2.ipv4[1],
            });
            (0, nodebalancers_1.interceptCreateNodeBalancer)().as('createNodeBalancer');
            cy.visitWithLogin('/nodebalancers/create');
            cy.get('[id="nodebalancer-label"]').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(nodeBal.label);
            cy.findByPlaceholderText(/create a tag/i).click();
            cy.focused().type(cypress_1.entityTag);
            // This will create the NB in newark, where the default Linode was created
            ui_1.ui.regionSelect.find().click().clear().type("".concat(region.label, "{enter}"));
            // Node backend config
            cy.findByText('Label').click();
            cy.focused().type((0, random_1.randomLabel)());
            cy.findByLabelText('IP Address').should('be.visible').click();
            cy.focused().type(nodeBal.ipv4);
            ui_1.ui.autocompletePopper
                .findByTitle(nodeBal.ipv4)
                .should('be.visible')
                .click();
            // Add another configuration
            cy.get('[data-testid="button"]')
                .contains('Add another Configuration')
                .click();
            cy.get('[data-qa-panel="Configuration - Port "]').within(function () {
                cy.get('[data-testid="textfield-input"]').first().click();
                cy.focused().type('8080');
            });
            cy.findAllByText('Label').last().click();
            cy.focused().type((0, random_1.randomLabel)());
            cy.findAllByText('IP Address').last().should('be.visible').click();
            cy.focused().type(nodeBal_2.ipv4);
            ui_1.ui.autocompletePopper
                .findByTitle(nodeBal_2.ipv4)
                .should('be.visible')
                .click();
            // Confirm Summary info
            cy.get('[data-qa-summary="true"]').within(function () {
                cy.contains('Configs 2').should('be.visible');
            });
            cy.get('[data-qa-deploy-nodebalancer]').click();
            cy.wait('@createNodeBalancer')
                .its('response.statusCode')
                .should('eq', 200);
        });
    });
    /*
     * - Confirms Port field displays error if same port number used in additional config.
     * - Confirms Label field displays error if label is empty in additional config.
     * - Confirms IP field displays error if ip is empty in additional config.
     */
    it('displays errors during adding new config', function () {
        var region = (0, regions_1.chooseRegion)();
        var linodePayload = {
            region: region.id,
            // NodeBalancers require Linodes with private IPs.
            private_ip: true,
        };
        cy.defer(function () { return (0, linodes_1.createTestLinode)(linodePayload); }, 'Creating test Linode').then(function (linode) {
            var nodeBal = factories_1.nodeBalancerFactory.build({
                label: (0, random_1.randomLabel)(),
                region: region.id,
                ipv4: linode.ipv4[1],
            });
            cy.visitWithLogin('/nodebalancers/create');
            cy.get('[id="nodebalancer-label"]').should('be.visible').click();
            cy.focused().clear();
            cy.focused().type(nodeBal.label);
            cy.findByPlaceholderText(/create a tag/i).click();
            cy.focused().type(cypress_1.entityTag);
            // This will create the NB in newark, where the default Linode was created
            ui_1.ui.regionSelect.find().click().clear().type("".concat(region.label, "{enter}"));
            // Node backend config
            cy.findByText('Label').click();
            cy.focused().type((0, random_1.randomLabel)());
            cy.findByLabelText('IP Address').should('be.visible').click();
            cy.focused().type(nodeBal.ipv4);
            ui_1.ui.autocompletePopper
                .findByTitle(nodeBal.ipv4)
                .should('be.visible')
                .click();
            // Add another configuration
            cy.get('[data-testid="button"]')
                .contains('Add another Configuration')
                .click();
            cy.get('[data-qa-panel="Configuration - Port "]').within(function () {
                cy.get('[data-testid="textfield-input"]').first().click();
                cy.focused().type('80');
            });
            cy.get('[data-qa-deploy-nodebalancer]').click();
            // Confirm error displays
            cy.contains('Port must be unique').as('qaPort').scrollIntoView();
            cy.get('@qaPort').should('be.visible');
            cy.contains('Label is required').as('qaLabelIs').scrollIntoView();
            cy.get('@qaLabelIs').should('be.visible');
            cy.contains('Must be a valid private IPv4 address.')
                .as('qaMustbe')
                .scrollIntoView();
            cy.get('@qaMustbe').should('be.visible');
        });
    });
});
