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
var random_1 = require("support/util/random");
var stackscripts_1 = require("support/intercepts/stackscripts");
var ui_1 = require("support/ui");
var factories_1 = require("@src/factories");
var api_v4_1 = require("@linode/api-v4");
var paginate_1 = require("support/util/paginate");
// StackScript fixture paths.
var stackscriptNoShebangPath = 'stackscripts/stackscript-no-shebang.sh';
var stackscriptUdfPath = 'stackscripts/stackscript-udf.sh';
var stackscriptUdfInvalidPath = 'stackscripts/stackscript-udf-invalid.sh';
// StackScript error that is expected to appear when script is missing a shebang.
var stackScriptErrorNoShebang = "Script must begin with a shebang (example: '#!/bin/bash').";
// StackScript error that is expected to appear when UDFs with non-alphanumeric names are supplied.
var stackScriptErrorUdfAlphanumeric = 'UDF names can only contain alphanumeric and underscore characters.';
/**
 * Sets the StackScript field's value programmatically rather than via simulated typing.
 *
 * Cypress's typing operation is slow for long strings, so we can save several
 * seconds by setting the value directly, then simulating a couple keystrokes.
 *
 * @param script - Script contents to input.
 */
var inputStackScript = function (script) {
    cy.get('[data-qa-textfield-label="Script"]').should('be.visible').click();
    cy.focused().invoke('val', script).type(' {backspace}');
};
/**
 * Fills out the StackScript edition form.
 *
 * This assumes that the user is already on the StackScript edition page. This
 * function does not attempt to submit the filled out form.
 *
 * @param label - StackScript label.
 * @param description - StackScript description. Optional.
 * @param targetImage - StackScript target image name.
 * @param script - StackScript contents.
 */
var fillOutStackscriptForm = function (label, description, targetImage, script) {
    // Fill out "StackScript Label", "Description", "Target Images", and "Script" fields.
    cy.findByLabelText(/^StackScript Label.*/)
        .should('be.visible')
        .click()
        .clear()
        .type(label);
    if (description) {
        cy.findByLabelText('Description')
            .should('be.visible')
            .click()
            .clear()
            .type(description);
    }
    ui_1.ui.autocomplete.findByLabel('Target Images').should('be.visible').click();
    ui_1.ui.autocompletePopper.findByTitle(targetImage).should('be.visible').click();
    ui_1.ui.autocomplete.findByLabel('Target Images').click(); // Close autocomplete popper
    // Insert a script with invalid UDF data.
    inputStackScript(script);
};
(0, authentication_1.authenticate)();
describe('Update stackscripts', function () {
    /*
     * - Updates a StackScript with user-defined fields.
     * - Confirms that an error message appears upon submitting script without a shebang.
     * - Confirms that an error message appears upon submitting invalid user-defined fields.
     * - Confirms that the StackScript is updated successfully.
     */
    it('updates a StackScript', function () {
        var stackscriptLabel = (0, random_1.randomLabel)();
        var stackscriptDesc = (0, random_1.randomPhrase)();
        /**
         * Returns a Promise that resolves to the first non-deprecated Alpine Image found.
         */
        var getAlpineImage = function () { return __awaiter(void 0, void 0, void 0, function () {
            var allPublicImages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, paginate_1.depaginate)(function (page) {
                            return (0, api_v4_1.getImages)({ page: page }, { is_public: true });
                        })];
                    case 1:
                        allPublicImages = _a.sent();
                        return [2 /*return*/, allPublicImages.find(function (image) { return image.vendor === 'Alpine' && image.deprecated === false; })];
                }
            });
        }); };
        var stackScripts = factories_1.stackScriptFactory.buildList(2);
        // Import StackScript type from Linode API package.
        var updatedStackScripts = [
            __assign(__assign({}, stackScripts[0]), { label: stackscriptLabel, description: stackscriptDesc }),
            __assign({}, stackScripts[1]),
        ];
        (0, stackscripts_1.mockGetStackScripts)(stackScripts).as('getStackScripts');
        cy.visitWithLogin('/stackscripts/account');
        cy.wait('@getStackScripts');
        cy.get("[data-qa-table-row=\"".concat(stackScripts[0].label, "\"]")).within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for StackScript ".concat(stackScripts[0].label))
                .should('be.visible')
                .click();
        });
        (0, stackscripts_1.mockGetStackScript)(stackScripts[0].id, stackScripts[0]).as('getStackScript');
        ui_1.ui.actionMenuItem.findByTitle('Edit').should('be.visible').click();
        cy.wait('@getStackScript');
        cy.url().should('endWith', "/stackscripts/".concat(stackScripts[0].id, "/edit"));
        ui_1.ui.buttonGroup
            .findButtonByTitle('Save Changes')
            .should('be.visible')
            .should('be.disabled');
        // Submit StackScript edit form with invalid contents, confirm error messages.
        cy.defer(getAlpineImage).then(function (alpineImage) {
            cy.fixture(stackscriptNoShebangPath).then(function (stackscriptWithNoShebang) {
                fillOutStackscriptForm(stackscriptLabel, stackscriptDesc, alpineImage.label, stackscriptWithNoShebang);
            });
        });
        (0, stackscripts_1.mockUpdateStackScriptError)(stackScripts[0].id, 'script', stackScriptErrorNoShebang).as('updateStackScript');
        ui_1.ui.buttonGroup
            .findButtonByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@updateStackScript');
        cy.findByText(stackScriptErrorNoShebang).should('be.visible');
        // Insert a script with valid UDF data and submit StackScript edit form.
        cy.fixture(stackscriptUdfInvalidPath).then(function (stackScriptUdfInvalid) {
            inputStackScript(stackScriptUdfInvalid);
        });
        (0, stackscripts_1.mockUpdateStackScriptError)(stackScripts[0].id, 'script', stackScriptErrorUdfAlphanumeric).as('updateStackScript');
        ui_1.ui.buttonGroup
            .findButtonByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@updateStackScript');
        cy.findByText(stackScriptErrorUdfAlphanumeric).should('be.visible');
        // Insert a script with valid UDF data and submit StackScript edit form.
        cy.fixture(stackscriptUdfPath).then(function (stackScriptUdf) {
            inputStackScript(stackScriptUdf);
        });
        updatedStackScripts[0].label = stackscriptLabel;
        updatedStackScripts[0].description = stackscriptDesc;
        (0, stackscripts_1.mockGetStackScripts)(updatedStackScripts).as('getStackScripts');
        (0, stackscripts_1.mockUpdateStackScript)(updatedStackScripts[0].id, updatedStackScripts[0]).as('updateStackScript');
        ui_1.ui.buttonGroup
            .findButtonByTitle('Save Changes')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@updateStackScript');
        ui_1.ui.toast.assertMessage("Successfully updated StackScript ".concat(updatedStackScripts[0].label));
        cy.url().should('endWith', "/stackscripts/".concat(updatedStackScripts[0].id));
    });
    /*
     * - Updates a StackScript to public.
     * - Confirms that the StackScript is updated to public successfully.
     */
    it('makes a StackScript public', function () {
        var stackScripts = factories_1.stackScriptFactory.buildList(2, {
            is_public: false,
        });
        (0, stackscripts_1.mockGetStackScripts)(stackScripts).as('getStackScripts');
        cy.visitWithLogin('/stackscripts/account');
        cy.wait('@getStackScripts');
        // Do nothing when cancelling
        cy.get("[data-qa-table-row=\"".concat(stackScripts[0].label, "\"]")).within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for StackScript ".concat(stackScripts[0].label))
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem
            .findByTitle('Make StackScript Public')
            .should('be.visible')
            .click();
        ui_1.ui.dialog
            .findByTitle("Make StackScript ".concat(stackScripts[0].label, " Public?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button.findByTitle('Cancel').should('be.visible').click();
        });
        cy.findByText(stackScripts[0].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(stackScripts[0].description).should('be.visible');
            cy.findByText('Public').should('not.exist');
            cy.findByText('Private').should('be.visible');
        });
        // The status of the StackScript will become public
        cy.get("[data-qa-table-row=\"".concat(stackScripts[0].label, "\"]")).within(function () {
            ui_1.ui.actionMenu
                .findByTitle("Action menu for StackScript ".concat(stackScripts[0].label))
                .should('be.visible')
                .click();
        });
        ui_1.ui.actionMenuItem
            .findByTitle('Make StackScript Public')
            .should('be.visible')
            .click();
        var updatedStackScript = __assign({}, stackScripts[0]);
        updatedStackScript.is_public = true;
        (0, stackscripts_1.mockUpdateStackScript)(updatedStackScript.id, updatedStackScript).as('mockUpdateStackScript');
        (0, stackscripts_1.mockGetStackScripts)([updatedStackScript, stackScripts[1]]).as('mockGetStackScripts');
        ui_1.ui.dialog
            .findByTitle("Make StackScript ".concat(stackScripts[0].label, " Public?"))
            .should('be.visible')
            .within(function () {
            ui_1.ui.button.findByTitle('Confirm').should('be.visible').click();
        });
        cy.wait('@mockUpdateStackScript');
        cy.wait('@mockGetStackScripts');
        cy.findByText(stackScripts[0].label)
            .should('be.visible')
            .closest('tr')
            .within(function () {
            cy.findByText(stackScripts[0].description).should('be.visible');
            cy.findByText('Private').should('not.exist');
            cy.findByText('Public').should('be.visible');
        });
    });
});
