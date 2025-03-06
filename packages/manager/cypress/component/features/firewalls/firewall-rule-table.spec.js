"use strict";
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
/* eslint-disable sonarjs/no-duplicate-string */
require("@4tw/cypress-drag-drop"); // Using this lib only for mouse drag-and-drop interactions
var React = require("react");
var ui_1 = require("support/ui");
var components_1 = require("support/util/components");
var random_1 = require("support/util/random");
var factories_1 = require("src/factories");
var FirewallRulesLanding_1 = require("src/features/Firewalls/FirewallDetail/Rules/FirewallRulesLanding");
var portPresetMap = {
    '22': 'SSH',
    '53': 'DNS',
    '80': 'HTTP',
    '443': 'HTTPS',
    '3306': 'MySQL',
};
var mockInboundRules = Array.from({ length: 3 }, function () {
    return factories_1.firewallRuleFactory.build({
        action: 'ACCEPT',
        description: (0, random_1.randomString)(),
        label: (0, random_1.randomLabel)(),
        ports: (0, random_1.randomItem)(Object.keys(portPresetMap)),
    });
});
var mockOutboundRules = Array.from({ length: 3 }, function () {
    return factories_1.firewallRuleFactory.build({
        action: 'DROP',
        description: (0, random_1.randomString)(),
        label: (0, random_1.randomLabel)(),
        ports: (0, random_1.randomItem)(Object.keys(portPresetMap)),
    });
});
var inboundRule1 = mockInboundRules[0];
var inboundRule2 = mockInboundRules[1];
var inboundRule3 = mockInboundRules[2];
var outboundRule1 = mockOutboundRules[0];
var outboundRule2 = mockOutboundRules[1];
var outboundRule3 = mockOutboundRules[2];
var inboundAriaLabel = 'inbound Rules List';
var outboundAriaLabel = 'outbound Rules List';
var buttonText = 'Save Changes';
/**
 * Returns the formatted label for the given firewall rule action.
 *
 * @param ruleAction
 */
var getRuleActionLabel = function (ruleAction) {
    return "".concat(ruleAction.charAt(0).toUpperCase()).concat(ruleAction
        .slice(1)
        .toLowerCase());
};
/**
 * Move the focused element either up or down, N times via Keyboard.
 *
 * note: Cypress automatically focuses the element when you use .type() or .type(' ').
 *
 * @param options.direction - Direction to move the element (row) "UP" or "DOWN".
 * @param options.times - Number of times to move the element.
 */
var moveFocusedElementViaKeyboard = function (_a) {
    var direction = _a.direction, times = _a.times;
    // `direction` is either "UP" or "DOWN"
    var arrowKey = direction === 'DOWN' ? '{downarrow}' : '{uparrow}';
    var repeatedArrowKey = arrowKey.repeat(times);
    // Focused element will receive the repeated arrow key presses
    cy.focused().type(repeatedArrowKey);
};
/**
 * Verifies that the firewall landing page correctly lists the specified inbound
 * and outbound rules in the firewall table, based on the provided options.
 *
 * @param options.includeInbound - Boolean flag to specify whether inbound rules should be included.
 * @param options.includeOutbound - Boolean flag to specify whether outbound rules should be included.
 * @param options.isSmallViewport - Boolean flag to specify whether the viewport is considered small (default is false).
 */
var verifyFirewallWithRules = function (_a) {
    var includeInbound = _a.includeInbound, includeOutbound = _a.includeOutbound, _b = _a.isSmallViewport, isSmallViewport = _b === void 0 ? false : _b;
    // Verify that the Firewall Landing page displays the "Inbound Rules" and "Outbound Rules" headers.
    cy.findByText('Inbound Rules').should('be.visible');
    cy.findByText('Outbound Rules').should('be.visible');
    var inboundRules = includeInbound ? mockInboundRules : [];
    var outboundRules = includeOutbound ? mockOutboundRules : [];
    // Confirm the appropriate rules are listed with correct details.
    __spreadArray(__spreadArray([], inboundRules, true), outboundRules, true).forEach(function (rule) {
        cy.findByText(rule.label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            if (isSmallViewport) {
                // Column 'Protocol' is not visible for smaller screens.
                cy.findByText(rule.protocol).should('not.exist');
            }
            else {
                cy.findByText(rule.protocol).should('be.visible');
            }
            cy.findByText(rule.ports).should('be.visible');
            cy.findByText(getRuleActionLabel(rule.action)).should('be.visible');
        });
    });
};
/**
 * Verifies that the rows in a table are in the expected order based on the
 * provided list of rules and the specified aria-label.
 *
 * @param ariaLabel - The `aria-label` of the table (either inbound or outbound rule table).
 * @param expectedOrder - The expected order of rules (Array of FirewallRuleType objects).
 *
 * @example
 * // Verifies that the inbound rule table rows are in the expected order of rule1, rule2, rule3.
 * verifyTableRowOrder('inbound Rules List', [rule1, rule2, rule3]);
 */
var verifyTableRowOrder = function (ariaLabel, expectedOrder) {
    cy.get("[aria-label=\"".concat(ariaLabel, "\"]")).within(function () {
        cy.get('tbody tr').then(function (rows) {
            expectedOrder.forEach(function (rule, index) {
                expect(rows[index]).to.contain(rule.label);
            });
        });
    });
};
/**
 * Drags a row from one position to another within a table using mouse interaction.
 *
 * Note: this utility uses '@4tw/cypress-drag-drop lib.
 *
 * @param ariaLabel - The `aria-label` of the table containing the rows.
 * @param sourceRowPosition - The position (1-based index) of the row to be moved.
 * @param targetRowPosition - The position (1-based index) to drop the moved row.
 *
 * @example
 * dragRowToPositionViaMouse('inbound Rules List', 1, 2); // Moves the first row to second position
 */
var dragRowToPositionViaMouse = function (ariaLabel, sourceRowPosition, targetRowPosition) {
    var sourceRow = "div[aria-label=\"".concat(ariaLabel, "\"] tbody tr:nth-child(").concat(sourceRowPosition, ")");
    var targetRow = "div[aria-label=\"".concat(ariaLabel, "\"] tbody tr:nth-child(").concat(targetRowPosition, ")");
    cy.get(sourceRow).drag(targetRow);
};
/**
 * Test scenario for moving inbound rule rows using keyboard interactions.
 *
 * This test verifies that the keyboard-based drag-and-drop functionality
 * works as expected for inbound rules:
 * - Ensuring the `Save Changes` button is initially disabled.
 * - Activating the row drag mode via `Space/Enter` key.
 * - Moving the rule rows up and down with arrow keys.
 * - Dropping the row and verifying the updated row order.
 * - Enabling the `Save Changes` button after the operation.
 */
var testMoveInboundRuleRowsViaKeyboard = function () {
    // Verify 'Save Changes' button is initially disabled.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'true');
    // Activate keyboard drag mode using `Space/Enter` key on the first row - inboundRule1.
    cy.findByText(inboundRule1.label).should('be.visible');
    cy.findByText(inboundRule1.label).closest('tr').type(' ');
    cy.findByText(inboundRule1.label)
        .closest('tr')
        .should('have.attr', 'aria-pressed', 'true');
    // Move `inboundRule1` down two rows.
    moveFocusedElementViaKeyboard({ direction: 'DOWN', times: 2 });
    // Drop row with the keyboard `Space/Enter` key.
    cy.focused().type(' ');
    // Verify that "inboundRule2" is in the 1st row,
    // "inboundRule3" is in the 2nd row, and "inboundRule1" is in the 3rd row.
    verifyTableRowOrder(inboundAriaLabel, [
        inboundRule2,
        inboundRule3,
        inboundRule1,
    ]);
    // Activate keyboard drag mode using `Space/Enter` key on the 2nd row - inboundRule3.
    cy.findByText(inboundRule3.label).should('be.visible');
    cy.findByText(inboundRule3.label).closest('tr').type(' ');
    cy.findByText(inboundRule3.label)
        .closest('tr')
        .should('have.attr', 'aria-pressed', 'true');
    // Move `inboundRule3` up one row.
    moveFocusedElementViaKeyboard({ direction: 'UP', times: 1 });
    // Drop row with the keyboard `Space/Enter` key.
    cy.focused().type(' ');
    // Verify that "inboundRule3" is in the 1st row,
    // "inboundRule2" is in the 2nd row, and "inboundRule1" is in the 3rd row.
    verifyTableRowOrder(inboundAriaLabel, [
        inboundRule3,
        inboundRule2,
        inboundRule1,
    ]);
    // Verify 'Save Changes' button is enabled after row is moved.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'false');
};
/**
 * Test scenario for canceling the inbound rule drag-and-drop operation using the keyboard `Esc` key.
 *
 * This test checks that when the `Esc` key is pressed during a row drag operation,
 * the row returns to its original position and the `Save Changes` button remains disabled.
 */
var testDiscardInboundRuleDragViaKeyboard = function () {
    // Verify 'Save Changes' button is initially disabled.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'true');
    // Activate keyboard drag mode using `Space/Enter` key on the first row - inboundRule1.
    cy.findByText(inboundRule1.label).should('be.visible');
    cy.findByText(inboundRule1.label).closest('tr').type(' ');
    cy.findByText(inboundRule1.label)
        .closest('tr')
        .should('have.attr', 'aria-pressed', 'true');
    // Move `inboundRule1` down two rows.
    moveFocusedElementViaKeyboard({ direction: 'DOWN', times: 2 });
    // Cancel with the keyboard `Esc` key.
    cy.focused().type('{esc}');
    // Ensure row remains in its original position.
    verifyTableRowOrder(inboundAriaLabel, [
        inboundRule1,
        inboundRule2,
        inboundRule3,
    ]);
    // Verify 'Save Changes' button remains disabled after discarding with the keyboard `Esc` key.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'true');
};
/**
 * Test scenario for moving outbound rule rows using keyboard interactions.
 *
 * This test verifies that the keyboard-based drag-and-drop functionality
 * works as expected for outbound rules:
 * - Ensuring the `Save Changes` button is initially disabled.
 * - Activating the row drag mode via `Space/Enter` key.
 * - Moving the rule rows up and down with arrow keys.
 * - Dropping the row and verifying the updated row order.
 * - Enabling the `Save Changes` button after the operation.
 */
var testMoveOutboundRulesViaKeyboard = function () {
    // Verify 'Save Changes' button is initially disabled.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'true');
    // Activate keyboard drag mode using `Space/Enter` key on the first row - outboundRule1.
    cy.findByText(outboundRule1.label).should('be.visible');
    cy.findByText(outboundRule1.label).closest('tr').type(' ');
    cy.findByText(outboundRule1.label)
        .closest('tr')
        .should('have.attr', 'aria-pressed', 'true');
    // Move `outboundRule1` down two rows
    moveFocusedElementViaKeyboard({ direction: 'DOWN', times: 2 });
    // Drop row with the keyboard `Space/Enter` key
    cy.focused().type(' ');
    // Verify that "outboundRule2" is in the 1st row,
    // "outboundRule3" is in the 2nd row, and "outboundRule1" is in the 3rd row.
    verifyTableRowOrder(outboundAriaLabel, [
        outboundRule2,
        outboundRule3,
        outboundRule1,
    ]);
    // Activate keyboard drag mode using `Space/Enter` key on the 2nd row - outboundRule3.
    cy.findByText(outboundRule3.label).should('be.visible');
    cy.findByText(outboundRule3.label).closest('tr').type(' ');
    cy.findByText(outboundRule3.label)
        .closest('tr')
        .should('have.attr', 'aria-pressed', 'true');
    // Move `outboundRule3` up one row.
    moveFocusedElementViaKeyboard({ direction: 'UP', times: 1 });
    // Drop row with the keyboard `Space/Enter` key.
    cy.focused().type(' ');
    // Verify that "outboundRule3" is in the 1st row,
    // "outboundRule2" is in the 2nd row, and "outboundRule1" is in the 3rd row.
    verifyTableRowOrder(outboundAriaLabel, [
        outboundRule3,
        outboundRule2,
        outboundRule1,
    ]);
    // Verify 'Save Changes' button is enabled after row is moved.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'false');
};
/**
 * Test scenario for canceling the outbound rule drag-and-drop operation using the keyboard `Esc` key.
 *
 * This test checks that when the `Esc` key is pressed during a row drag operation,
 * the row returns to its original position and the `Save Changes` button remains disabled.
 */
var testDiscardOutboundRuleDragViaKeyboard = function () {
    // Verify 'Save Changes' button is initially disabled.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'true');
    // Activate keyboard drag mode using `Space/Enter` key on the first row - outboundRule1.
    cy.findByText(outboundRule1.label).should('be.visible');
    cy.findByText(outboundRule1.label).closest('tr').type(' ');
    cy.findByText(outboundRule1.label)
        .closest('tr')
        .should('have.attr', 'aria-pressed', 'true');
    // Move `outboundRule1` down two rows.
    moveFocusedElementViaKeyboard({ direction: 'DOWN', times: 2 });
    // Cancel with the keyboard `Esc` key.
    cy.focused().type('{esc}');
    // Ensure row remains in its original position.
    verifyTableRowOrder(outboundAriaLabel, [
        outboundRule1,
        outboundRule2,
        outboundRule3,
    ]);
    // Verify 'Save Changes' button remains disabled after discarding with the keyboard `Esc` key.
    ui_1.ui.button
        .findByTitle(buttonText)
        .should('be.visible')
        .should('have.attr', 'aria-disabled', 'true');
};
(0, components_1.componentTests)('Firewall Rules Table', function (mount) {
    /**
     * Keyboard keys used to perform interactions with rows in the Firewall Rules table:
     * - Press `Space/Enter` key once to activate keyboard sensor on the selected row.
     * - Use `Up/Down` arrow keys to move the row up or down.
     * - Press `Space/Enter` key again to drop the focused row.
     * - Press `Esc` key to discard drag and drop operation.
     *
     * Confirms:
     * - All keyboard interactions on Firewall Rules table rows work as expected for
     *   both normal (no vertical scrollbar) and smaller window sizes (with vertical scrollbar).
     * - `CustomKeyboardSensor` works as expected.
     * - All Mouse interactions on Firewall Rules table rows work as expected.
     */
    describe('Keyboard and Mouse Drag and Drop Interactions', function () {
        describe('Normal window (no vertical scrollbar)', function () {
            beforeEach(function () {
                cy.viewport(1536, 960);
            });
            describe('Inbound Rules:', function () {
                beforeEach(function () {
                    mount(<FirewallRulesLanding_1.FirewallRulesLanding rules={{
                            fingerprint: '8a545843',
                            inbound: mockInboundRules,
                            inbound_policy: 'ACCEPT',
                            outbound_policy: 'DROP',
                            version: 1,
                        }} disabled={false} firewallID={(0, random_1.randomNumber)()}/>);
                    verifyFirewallWithRules({
                        includeInbound: true,
                        includeOutbound: false,
                    });
                });
                it('should move Inbound rule rows using keyboard interaction', function () {
                    testMoveInboundRuleRowsViaKeyboard();
                });
                it('should cancel the Inbound rules drag operation with the keyboard `Esc` key', function () {
                    testDiscardInboundRuleDragViaKeyboard();
                });
                it('should move Inbound rules rows using mouse interaction', function () {
                    // Drag the 1st row rule to 2nd row position.
                    dragRowToPositionViaMouse(inboundAriaLabel, 1, 2);
                    // Verify the order and labels in the 1st, 2nd, and 3rd rows.
                    verifyTableRowOrder(inboundAriaLabel, [
                        inboundRule2,
                        inboundRule1,
                        inboundRule3,
                    ]);
                    // Drag the 3rd row rule to 2nd row position.
                    dragRowToPositionViaMouse(inboundAriaLabel, 3, 2);
                    // Verify the order and labels in the 1st, 2nd, and 3rd rows.
                    verifyTableRowOrder(inboundAriaLabel, [
                        inboundRule2,
                        inboundRule3,
                        inboundRule1,
                    ]);
                    // Drag the 3rd row rule to 1st position.
                    dragRowToPositionViaMouse(inboundAriaLabel, 3, 1);
                    // Verify the order and labels in the 1st, 2nd, and 3rd rows.
                    verifyTableRowOrder(inboundAriaLabel, [
                        inboundRule1,
                        inboundRule2,
                        inboundRule3,
                    ]);
                });
            });
            describe('Outbound Rules:', function () {
                beforeEach(function () {
                    mount(<FirewallRulesLanding_1.FirewallRulesLanding rules={{
                            fingerprint: '8a545843',
                            inbound_policy: 'ACCEPT',
                            outbound: mockOutboundRules,
                            outbound_policy: 'DROP',
                            version: 1,
                        }} disabled={false} firewallID={(0, random_1.randomNumber)()}/>);
                    verifyFirewallWithRules({
                        includeInbound: false,
                        includeOutbound: true,
                    });
                });
                it('should move Outbound rule rows using keyboard interaction', function () {
                    testMoveOutboundRulesViaKeyboard();
                });
                it('should cancel the Outbound rules drag operation with the keyboard `Esc` key', function () {
                    testDiscardOutboundRuleDragViaKeyboard();
                });
                it('should move Outbound rules rows using mouse interaction', function () {
                    // Drag the 1st row rule to 2nd row position.
                    dragRowToPositionViaMouse(outboundAriaLabel, 1, 2);
                    // Verify the labels in the 1st, 2nd, and 3rd rows.
                    verifyTableRowOrder(outboundAriaLabel, [
                        outboundRule2,
                        outboundRule1,
                        outboundRule3,
                    ]);
                    // Drag the 3rd row rule to 2nd row position.
                    dragRowToPositionViaMouse(outboundAriaLabel, 3, 2);
                    // Verify the order and labels in the 1st, 2nd, and 3rd rows.
                    verifyTableRowOrder(outboundAriaLabel, [
                        outboundRule2,
                        outboundRule3,
                        outboundRule1,
                    ]);
                    // Drag the 3rd row rule to 1st position.
                    dragRowToPositionViaMouse(outboundAriaLabel, 3, 1);
                    // Verify the order and labels in the 1st, 2nd, and 3rd rows.
                    verifyTableRowOrder(outboundAriaLabel, [
                        outboundRule1,
                        outboundRule2,
                        outboundRule3,
                    ]);
                });
            });
        });
        describe('Window with vertical scrollbar', function () {
            beforeEach(function () {
                // Browser window with vertical scroll bar enabled (smaller screens).
                cy.viewport(800, 400);
                cy.window().should('have.property', 'innerWidth', 800);
                cy.window().should('have.property', 'innerHeight', 400);
            });
            describe('Inbound Rules:', function () {
                beforeEach(function () {
                    mount(<FirewallRulesLanding_1.FirewallRulesLanding rules={{
                            fingerprint: '8a545843',
                            inbound: mockInboundRules,
                            inbound_policy: 'ACCEPT',
                            outbound_policy: 'DROP',
                            version: 1,
                        }} disabled={false} firewallID={(0, random_1.randomNumber)()}/>);
                    verifyFirewallWithRules({
                        includeInbound: true,
                        includeOutbound: false,
                        isSmallViewport: true,
                    });
                });
                it('should move Inbound rule rows using keyboard interaction', function () {
                    testMoveInboundRuleRowsViaKeyboard();
                });
                it('should cancel the Inbound rules drag operation with the keyboard `Esc` key', function () {
                    testDiscardInboundRuleDragViaKeyboard();
                });
            });
            describe('Outbound Rules:', function () {
                beforeEach(function () {
                    mount(<FirewallRulesLanding_1.FirewallRulesLanding rules={{
                            fingerprint: '8a545843',
                            inbound_policy: 'ACCEPT',
                            outbound: mockOutboundRules,
                            outbound_policy: 'DROP',
                            version: 1,
                        }} disabled={false} firewallID={(0, random_1.randomNumber)()}/>);
                    verifyFirewallWithRules({
                        includeInbound: false,
                        includeOutbound: true,
                        isSmallViewport: true,
                    });
                });
                it('should move Outbound rule rows using keyboard interaction', function () {
                    testMoveOutboundRulesViaKeyboard();
                });
                it('should cancel the Outbound rules drag operation with the keyboard `Esc` key', function () {
                    testDiscardOutboundRuleDragViaKeyboard();
                });
            });
        });
    });
}, {
    useTanstackRouter: true,
});
