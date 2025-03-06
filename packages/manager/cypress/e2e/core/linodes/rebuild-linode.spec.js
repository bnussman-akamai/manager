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
var ui_1 = require("support/ui");
var random_1 = require("support/util/random");
var authentication_1 = require("support/api/authentication");
var lib_1 = require("@linode/api-v4/lib");
var stackscripts_1 = require("support/intercepts/stackscripts");
var factories_1 = require("@src/factories");
var cleanup_1 = require("support/util/cleanup");
var regions_1 = require("support/util/regions");
var linodes_1 = require("support/intercepts/linodes");
var linodes_2 = require("support/util/linodes");
var linodes_3 = require("support/constants/linodes");
/**
 * Creates a Linode and StackScript.
 *
 * @param stackScriptRequestPayload - StackScript create request payload.
 * @param linodeRequestPayload - Linode create request payload.
 *
 * @returns Promise that resolves when Linode and StackScript are created.
 */
var createStackScriptAndLinode = function (stackScriptRequestPayload, linodeRequestPayload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Promise.all([
                (0, lib_1.createStackScript)(stackScriptRequestPayload),
                (0, linodes_2.createTestLinode)(linodeRequestPayload),
            ])];
    });
}); };
/**
 * Opens the Rebuild Linode dialog by selecting it from the Linode's action menu.
 *
 * Assumes that the user has first navigated to the Linode's details page.
 *
 * @param linodeLabel - Label of the Linode being rebuilt.
 */
var openRebuildDialog = function (linodeLabel) {
    ui_1.ui.actionMenu
        .findByTitle("Action menu for Linode ".concat(linodeLabel))
        .should('be.visible')
        .click();
    ui_1.ui.actionMenuItem.findByTitle('Rebuild').should('be.visible').click();
};
/**
 * Finds the Rebuild Linode dialog.
 *
 * @param linodeLabel - Label of the Linode being rebuilt.
 *
 * @returns Cypress chainable.
 */
var findRebuildDialog = function (linodeLabel) {
    return ui_1.ui.dialog
        .findByTitle("Rebuild Linode ".concat(linodeLabel))
        .should('be.visible');
};
/**
 * Enters a password into the "Root Password" field and confirms it is rated a given strength.
 *
 * @param desiredPassword - Password whose strength should be tested.
 * @param passwordStrength - Expected strength for `desiredPassword`.
 */
var assertPasswordComplexity = function (desiredPassword, passwordStrength) {
    cy.findByLabelText('Root Password').should('be.visible').clear();
    cy.focused().type(desiredPassword);
    cy.contains("Strength: ".concat(passwordStrength)).should('be.visible');
};
/**
 * Submits rebuild dialog.
 */
var submitRebuild = function () {
    ui_1.ui.button
        .findByTitle('Rebuild Linode')
        .scrollIntoView()
        .should('be.visible')
        .should('be.enabled')
        .click();
};
// Error message that is displayed when desired password is not strong enough.
var passwordComplexityError = 'Password does not meet strength requirement.';
(0, authentication_1.authenticate)();
describe('rebuild linode', function () {
    var image = 'Alpine 3.18';
    var rootPassword = (0, random_1.randomString)(16);
    before(function () {
        (0, cleanup_1.cleanUp)(['lke-clusters', 'linodes', 'stackscripts', 'images']);
    });
    /*
     * - Confirms that Linode can be rebuilt using an image.
     * - Confirms that password complexity
     */
    it('rebuilds a linode from Image', function () {
        cy.tag('method:e2e');
        var weakPassword = 'abc123';
        var fairPassword = 'Akamai123';
        var linodeCreatePayload = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        });
        cy.defer(function () { return (0, linodes_2.createTestLinode)(linodeCreatePayload); }, 'creating Linode').then(function (linode) {
            (0, linodes_1.interceptRebuildLinode)(linode.id).as('linodeRebuild');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.findByText('RUNNING', { timeout: linodes_3.LINODE_CREATE_TIMEOUT }).should('be.visible');
            openRebuildDialog(linode.label);
            findRebuildDialog(linode.label).within(function () {
                // "From Image" should be selected by default; no need to change the value.
                ui_1.ui.autocomplete
                    .findByLabel('Rebuild From')
                    .should('be.visible')
                    .should('have.value', 'Image');
                ui_1.ui.autocomplete.findByLabel('Image').should('be.visible').click();
                ui_1.ui.autocompletePopper.findByTitle(image).should('be.visible').click();
                // Type to confirm.
                cy.findByLabelText('Linode Label').type(linode.label);
                // checkPasswordComplexity(rootPassword);
                assertPasswordComplexity(weakPassword, 'Weak');
                submitRebuild();
                cy.findByText(passwordComplexityError).should('be.visible');
                assertPasswordComplexity(fairPassword, 'Fair');
                submitRebuild();
                cy.findByText(passwordComplexityError).should('be.visible');
                assertPasswordComplexity(rootPassword, 'Good');
                submitRebuild();
                cy.findByText(passwordComplexityError).should('not.exist');
            });
            cy.wait('@linodeRebuild');
            cy.contains('REBUILDING').should('be.visible');
        });
    });
    /*
     * - Confirms that a Linode can be rebuilt using a Community StackScript.
     */
    it('rebuilds a linode from Community StackScript', function () {
        cy.tag('method:e2e');
        var stackScriptId = 443929;
        var stackScriptName = 'OpenLiteSpeed-WordPress';
        var image = 'AlmaLinux 9';
        var linodeCreatePayload = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        });
        cy.defer(function () { return (0, linodes_2.createTestLinode)(linodeCreatePayload); }, 'creating Linode').then(function (linode) {
            (0, linodes_1.interceptRebuildLinode)(linode.id).as('linodeRebuild');
            (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
            (0, stackscripts_1.interceptGetStackScript)(stackScriptId).as('getStackScript');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.findByText('RUNNING', { timeout: linodes_3.LINODE_CREATE_TIMEOUT }).should('be.visible');
            openRebuildDialog(linode.label);
            findRebuildDialog(linode.label).within(function () {
                ui_1.ui.autocomplete
                    .findByLabel('Rebuild From')
                    .should('be.visible')
                    .click();
                ui_1.ui.autocompletePopper
                    .findByTitle('Community StackScript')
                    .should('be.visible')
                    .click();
                cy.wait('@getStackScripts');
                cy.findByPlaceholderText('Search StackScripts').scrollIntoView();
                cy.findByPlaceholderText('Search StackScripts')
                    .should('be.visible')
                    .type(stackScriptName);
                cy.wait('@getStackScripts');
                cy.get("[id=\"stackscript-".concat(stackScriptId, "\"]")).click();
                cy.wait('@getStackScript');
                ui_1.ui.autocomplete.findByLabel('Image').should('be.visible').click();
                ui_1.ui.autocompletePopper.findByTitle(image).should('be.visible').click();
                cy.findByLabelText('Linode Label')
                    .should('be.visible')
                    .type(linode.label);
                assertPasswordComplexity(rootPassword, 'Good');
                submitRebuild();
            });
            cy.wait('@linodeRebuild');
            cy.contains('REBUILDING').should('be.visible');
        });
    });
    /*
     * - Confirms that a Linode can be rebuilt using an Account StackScript.
     */
    it('rebuilds a linode from Account StackScript', function () {
        cy.tag('method:e2e');
        var image = 'Alpine 3.18';
        var region = 'us-east';
        // Create a StackScript to rebuild a Linode.
        var linodeRequest = factories_1.createLinodeRequestFactory.build({
            label: (0, random_1.randomLabel)(),
            region: region,
            image: 'linode/alpine3.18',
            root_pass: (0, random_1.randomString)(16),
        });
        var stackScriptRequest = {
            label: (0, random_1.randomLabel)(),
            description: (0, random_1.randomString)(),
            ordinal: 0,
            logo_url: '',
            images: ['linode/alpine3.18'],
            deployments_total: 0,
            deployments_active: 0,
            is_public: false,
            mine: true,
            rev_note: '',
            script: '#!/bin/bash\n\necho "Hello, world!"',
            user_defined_fields: [],
        };
        cy.defer(function () { return createStackScriptAndLinode(stackScriptRequest, linodeRequest); }, 'creating stackScript and linode').then(function (_a) {
            var stackScript = _a[0], linode = _a[1];
            (0, linodes_1.interceptRebuildLinode)(linode.id).as('linodeRebuild');
            cy.visitWithLogin("/linodes/".concat(linode.id));
            cy.findByText('RUNNING', { timeout: linodes_3.LINODE_CREATE_TIMEOUT }).should('be.visible');
            openRebuildDialog(linode.label);
            findRebuildDialog(linode.label).within(function () {
                ui_1.ui.autocomplete
                    .findByLabel('Rebuild From')
                    .should('be.visible')
                    .click();
                ui_1.ui.autocompletePopper
                    .findByTitle('Account StackScript')
                    .should('be.visible')
                    .click();
                cy.findByPlaceholderText('Search StackScripts').scrollIntoView();
                cy.findByPlaceholderText('Search StackScripts')
                    .should('be.visible')
                    .type("".concat(stackScript.label));
                cy.get("[id=\"stackscript-".concat(stackScript.id, "\"]")).click();
                ui_1.ui.autocomplete.findByLabel('Image').should('be.visible').click();
                ui_1.ui.autocompletePopper.findByTitle(image).should('be.visible').click();
                cy.findByLabelText('Linode Label')
                    .should('be.visible')
                    .type(linode.label);
                assertPasswordComplexity(rootPassword, 'Good');
                submitRebuild();
            });
            cy.wait('@linodeRebuild');
            cy.contains('REBUILDING').should('be.visible');
        });
    });
    /*
     * - Confirms UI error flow when attempting to rebuild a Linode that is provisioning.
     * - Confirms that API error message is displayed in the rebuild dialog.
     */
    it('cannot rebuild a provisioning linode', function () {
        var mockLinode = factories_1.linodeFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
            status: 'provisioning',
        });
        var mockErrorMessage = 'Linode busy.';
        (0, linodes_1.mockGetLinodeDetails)(mockLinode.id, mockLinode).as('getLinode');
        (0, linodes_1.mockRebuildLinodeError)(mockLinode.id, mockErrorMessage).as('rebuildLinode');
        cy.visitWithLogin("/linodes/".concat(mockLinode.id, "?rebuild=true"));
        findRebuildDialog(mockLinode.label).within(function () {
            ui_1.ui.autocomplete.findByLabel('Rebuild From').should('be.visible');
            ui_1.ui.autocomplete
                .findByLabel('Image')
                .should('be.visible')
                .click()
                .type(image);
            ui_1.ui.autocompletePopper.findByTitle(image).should('be.visible').click();
            assertPasswordComplexity(rootPassword, 'Good');
            cy.findByLabelText('Linode Label').should('be.visible').click();
            cy.focused().type(mockLinode.label);
            submitRebuild();
            cy.wait('@rebuildLinode');
            cy.findByText(mockErrorMessage);
        });
    });
});
