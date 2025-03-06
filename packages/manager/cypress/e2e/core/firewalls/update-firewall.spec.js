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
var api_v4_1 = require("@linode/api-v4");
var authentication_1 = require("support/api/authentication");
var firewalls_1 = require("support/intercepts/firewalls");
var ui_1 = require("support/ui");
var cleanup_1 = require("support/util/cleanup");
var random_1 = require("support/util/random");
var regions_1 = require("support/util/regions");
var factories_1 = require("src/factories");
var portPresetMap = {
    '22': 'SSH',
    '53': 'DNS',
    '80': 'HTTP',
    '443': 'HTTPS',
    '3306': 'MySQL',
};
var inboundRule = factories_1.firewallRuleFactory.build({
    action: 'ACCEPT',
    description: (0, random_1.randomString)(),
    label: (0, random_1.randomLabel)(),
    ports: (0, random_1.randomItem)(Object.keys(portPresetMap)),
});
var outboundRule = factories_1.firewallRuleFactory.build({
    action: 'DROP',
    description: (0, random_1.randomString)(),
    label: (0, random_1.randomLabel)(),
    ports: (0, random_1.randomItem)(Object.keys(portPresetMap)),
});
var getRuleActionLabel = function (ruleAction) {
    return "".concat(ruleAction.charAt(0).toUpperCase()).concat(ruleAction
        .slice(1)
        .toLowerCase());
};
/**
 * Adds an inbound / outbound firewall rule.
 *
 * No assertion is made on the result of the rule addition attempt.
 *
 * @param rule - the firewall rule to be added.
 * @param direction - the direction of the rule, inbound or outbound.
 */
var addFirewallRules = function (rule, direction) {
    var ruleTitle = direction && direction.toLowerCase() === 'outbound'
        ? 'Add an Outbound Rule'
        : 'Add an Inbound Rule';
    // Go to Rules tab
    ui_1.ui.tabList.findTabByTitle('Rules').should('be.visible').click();
    ui_1.ui.button.findByTitle(ruleTitle).should('be.visible').click();
    ui_1.ui.drawer
        .findByTitle(ruleTitle)
        .should('be.visible')
        .within(function () {
        var port = rule.ports ? rule.ports : '22';
        cy.findByPlaceholderText('Select a rule preset...').type(portPresetMap[port] + '{enter}');
        var label = rule.label ? rule.label : 'test-label';
        var description = rule.description
            ? rule.description
            : 'test-description';
        cy.contains('Label').click();
        cy.focused().type('{selectall}{backspace}' + label);
        cy.contains('Description').click();
        cy.focused().type(description);
        var action = rule.action ? getRuleActionLabel(rule.action) : 'Accept';
        cy.contains(action).click();
        ui_1.ui.button
            .findByTitle('Add Rule')
            .should('be.visible')
            .should('be.enabled')
            .click();
    });
};
/**
 * Removes an inbound / outbound firewall rule.
 *
 * No assertion is made on the result of the rule addition attempt.
 *
 * @param ruleLabel - the label of the firewall rule to be removed.
 */
var removeFirewallRules = function (ruleLabel) {
    // Go to Rules tab
    ui_1.ui.tabList.findTabByTitle('Rules').should('be.visible').click();
    cy.get("[aria-label=\"".concat(ruleLabel, "\"]"))
        .first()
        .should('be.visible')
        .within(function () {
        ui_1.ui.button.findByTitle('Delete').should('be.visible').click();
    });
};
/**
 * Adds a linode to the firewall.
 *
 * No assertion is made on the result of the rule addition attempt.
 *
 * @param firewall - the firewall that is modified.
 * @param linode - the linode that is added to the firewall.
 */
var addLinodesToFirewall = function (firewall, linode) {
    // Go to Linodes tab
    ui_1.ui.tabList
        .findTabByTitle('Linodes', { exact: false })
        .should('be.visible')
        .click();
    ui_1.ui.button.findByTitle('Add Linodes to Firewall').should('be.visible').click();
    ui_1.ui.drawer
        .findByTitle("Add Linode to Firewall: ".concat(firewall.label))
        .should('be.visible')
        .within(function () {
        // Fill out and submit firewall edit form.
        cy.findByLabelText('Linodes').should('be.visible').click();
        cy.focused().type(linode.label);
        ui_1.ui.autocompletePopper
            .findByTitle(linode.label)
            .should('be.visible')
            .click();
        cy.findByLabelText('Linodes').should('be.visible').click();
        ui_1.ui.button.findByTitle('Add').should('be.visible').click();
    });
};
var createLinodeAndFirewall = function (linodeRequestPayload, firewallRequestPayload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Promise.all([
                // eslint-disable-next-line @linode/cloud-manager/no-createLinode
                (0, api_v4_1.createLinode)(linodeRequestPayload),
                (0, api_v4_1.createFirewall)(firewallRequestPayload),
            ])];
    });
}); };
(0, authentication_1.authenticate)();
describe('update firewall', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('firewalls');
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Confirms that a linode can be added and removed from a firewall.
     * - Confirms that inbound rules can be added and removed from a firewall.
     * - Confirms that outbound rules can be added and removed from a firewall.
     * - Confirms that a firewall can be enabled and disabled, and their status is reflected on the landing page.
     */
    it("updates a firewall's linodes and rules", function () {
        var region = (0, regions_1.chooseRegion)();
        var linodeRequest = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: region.id,
            root_pass: (0, random_1.randomString)(16),
        });
        var firewallRequest = factories_1.firewallFactory.build({
            label: (0, random_1.randomLabel)(),
            rules: factories_1.firewallRulesFactory.build({
                inbound: [],
                outbound: [],
            }),
        });
        cy.defer(function () { return createLinodeAndFirewall(linodeRequest, firewallRequest); }, 'creating Linode and firewall').then(function (_a) {
            var linode = _a[0], firewall = _a[1];
            cy.visitWithLogin('/firewalls');
            // Confirm that firewall is listed on landing page with expected configuration.
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText(firewall.label).should('be.visible');
                cy.findByText('Enabled').should('be.visible');
                cy.findByText('No rules').should('be.visible');
                cy.findByText('None assigned').should('be.visible');
            });
            // Go to the firewalls edit page
            cy.findByText(firewall.label).click();
            // In Rules tab, add inbound rules
            addFirewallRules(inboundRule, 'inbound');
            // Confirm that the inbound rules are listed on edit page with expected configuration
            cy.findByText(inboundRule.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(inboundRule.protocol).should('be.visible');
                cy.findByText(inboundRule.ports).should('be.visible');
                cy.findByText(getRuleActionLabel(inboundRule.action)).should('be.visible');
            });
            // Add outbound rules
            addFirewallRules(outboundRule, 'outbound');
            // Confirm that the outbound rules are listed on edit page with expected configuration
            cy.findByText(outboundRule.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText(outboundRule.protocol).should('be.visible');
                cy.findByText(outboundRule.ports).should('be.visible');
                cy.findByText(getRuleActionLabel(outboundRule.action)).should('be.visible');
            });
            // Save configuration
            (0, firewalls_1.interceptUpdateFirewallRules)(firewall.id).as('updateFirewallRules');
            ui_1.ui.button
                .findByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Go back to landing page and check rules are added to the firewall
            cy.wait('@updateFirewallRules');
            cy.visitWithLogin('/firewalls');
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText('1 Inbound / 1 Outbound').should('be.visible');
            });
            // Go to the firewalls edit page
            cy.findByText(firewall.label).click();
            // Remove inbound rules
            removeFirewallRules(inboundRule.label);
            // Remove outbound rules
            removeFirewallRules(outboundRule.label);
            // Save configuration
            (0, firewalls_1.interceptUpdateFirewallRules)(firewall.id).as('updateFirewallRules');
            ui_1.ui.button
                .findByTitle('Save Changes')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Go back to landing page and check rules are removed to the firewall
            cy.wait('@updateFirewallRules');
            cy.visitWithLogin('/firewalls');
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText('No rules').should('be.visible');
            });
            // Go to the firewalls edit page
            cy.findByText(firewall.label).click();
            // Confirm that the firewall can be assigned to the linode
            (0, firewalls_1.interceptUpdateFirewallLinodes)(firewall.id).as('updateFirewallLinodes');
            addLinodesToFirewall(firewall, linode);
            cy.wait('@updateFirewallLinodes');
            cy.visitWithLogin('/firewalls');
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText(linode.label).should('be.visible');
            });
        });
    });
    /*
     * - Confirms that firewall shows the correct status when it is disabled.
     */
    it("updates a firewall's status", function () {
        var region = (0, regions_1.chooseRegion)();
        var linodeRequest = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: region.id,
            root_pass: (0, random_1.randomString)(16),
        });
        var firewallRequest = factories_1.firewallFactory.build({
            label: (0, random_1.randomLabel)(),
            rules: {
                inbound: [],
                outbound: [],
            },
        });
        cy.defer(function () { return createLinodeAndFirewall(linodeRequest, firewallRequest); }, 'creating Linode and firewall').then(function (_a) {
            var _linode = _a[0], firewall = _a[1];
            cy.visitWithLogin('/firewalls');
            // Confirm that firewall is listed on landing page with expected configuration.
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText(firewall.label).should('be.visible');
                cy.findByText('Enabled').should('be.visible');
                cy.findByText('No rules').should('be.visible');
                cy.findByText('None assigned').should('be.visible');
            });
            // Click 'Disable' button and confirm action.
            cy.findByText(firewall.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('Disable').should('be.visible');
                cy.findByText('Disable').click();
            });
            ui_1.ui.dialog
                .findByTitle("Disable Firewall ".concat(firewall.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Disable Firewall')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm status is updated on landing page.
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText('Disabled').should('be.visible');
            });
            cy.visitWithLogin('/firewalls');
            // Click 'Enable' button and confirm action.
            cy.findByText(firewall.label)
                .should('be.visible')
                .closest('tr')
                .within(function () {
                cy.findByText('Enable').should('be.visible');
                cy.findByText('Enable').click();
            });
            ui_1.ui.dialog
                .findByTitle("Enable Firewall ".concat(firewall.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Enable Firewall')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm status is updated on landing page.
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText('Enabled').should('be.visible');
            });
        });
    });
    /*
     * - Confirms that firewall's label can be updated on landing page.
     */
    it("updates a firewall's label", function () {
        var region = (0, regions_1.chooseRegion)();
        var linodeRequest = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: region.id,
            root_pass: (0, random_1.randomString)(16),
        });
        var firewallRequest = factories_1.firewallFactory.build({
            label: (0, random_1.randomLabel)(),
            rules: {
                inbound: [],
                outbound: [],
            },
        });
        var newFirewallLabel = (0, random_1.randomLabel)();
        cy.defer(function () { return createLinodeAndFirewall(linodeRequest, firewallRequest); }, 'creating Linode and firewall').then(function (_a) {
            var _linode = _a[0], firewall = _a[1];
            cy.visitWithLogin('/firewalls');
            // Confirm that firewall is listed on landing page with expected configuration.
            cy.findByText(firewall.label)
                .closest('tr')
                .within(function () {
                cy.findByText(firewall.label).should('be.visible');
                cy.findByText('Enabled').should('be.visible');
                cy.findByText('No rules').should('be.visible');
                cy.findByText('None assigned').should('be.visible');
            });
            cy.visitWithLogin("/firewalls/".concat(firewall.id));
            cy.findByLabelText("Edit ".concat(firewall.label)).click();
            cy.get("[id=\"edit-".concat(firewall.label, "-label\"]")).click();
            cy.focused().clear();
            cy.focused().type("".concat(newFirewallLabel, "{enter}"));
            // Confirm Firewall label updates in breadcrumbs.
            ui_1.ui.entityHeader.find().within(function () {
                cy.findByText(newFirewallLabel).should('be.visible');
                cy.findByText('firewalls').click();
            });
            // Confirm firewall label is updated on landing page without refresh.
            cy.findByText(newFirewallLabel).should('be.visible');
            // Confirm firewall label is updated on landing page after refresh.
            cy.reload();
            cy.findByText(newFirewallLabel).should('be.visible');
        });
    });
});
