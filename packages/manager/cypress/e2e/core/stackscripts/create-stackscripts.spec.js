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
var polling_1 = require("support/util/polling");
var random_1 = require("support/util/random");
var account_1 = require("support/intercepts/account");
var stackscripts_1 = require("support/intercepts/stackscripts");
var linodes_1 = require("support/intercepts/linodes");
var ui_1 = require("support/ui");
var factories_1 = require("src/factories");
var api_v4_1 = require("@linode/api-v4");
var regions_1 = require("support/util/regions");
var backoff_1 = require("support/util/backoff");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/util/linodes");
var images_1 = require("support/intercepts/images");
var utilities_1 = require("src/components/ImageSelect/utilities");
// StackScript fixture paths.
var stackscriptBasicPath = 'stackscripts/stackscript-basic.sh';
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
 * Fills out the StackScript creation form.
 *
 * This assumes that the user is already on the StackScript creation page. This
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
        .type(label);
    if (description) {
        cy.findByLabelText('Description')
            .should('be.visible')
            .click()
            .type(description);
    }
    ui_1.ui.autocomplete.findByLabel('Target Images').should('be.visible').click();
    ui_1.ui.autocompletePopper.findByTitle(targetImage).should('be.visible').click();
    ui_1.ui.autocomplete.findByLabel('Target Images').click(); // Close autocomplete popper
    // Insert a script.
    inputStackScript(script);
};
/**
 * Fills out the Linode creation form.
 *
 * This assumes that the user is already on the Linode creation page. This
 * function does not attempt to submit the filled out form.
 *
 * @param label - Linode label.
 * @param regionName - Linode region name.
 */
var fillOutLinodeForm = function (label, regionName) {
    var password = (0, random_1.randomString)(32);
    var region = (0, regions_1.getRegionByLabel)(regionName);
    ui_1.ui.regionSelect.find().click();
    ui_1.ui.regionSelect
        .findItemByRegionLabel(regionName)
        .should('be.visible')
        .click();
    ui_1.ui.regionSelect.find().should('have.value', "".concat(region.label, " (").concat(region.id, ")"));
    cy.findByText('Linode Label')
        .should('be.visible')
        .click()
        .type('{selectall}{backspace}')
        .type(label);
    cy.findByText('Dedicated CPU').should('be.visible').click();
    cy.get('[id="g6-dedicated-2"]').click();
    cy.findByLabelText('Root Password').should('be.visible').type(password);
};
/**
 * Creates a private image from a Linode.
 *
 * This can take a few minutes since we have to wait for the Linode to
 * boot and then wait for the private image to be processed.
 *
 * @returns Promise that resolves to the new Image.
 */
var createLinodeAndImage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var resizedDiskSize, linode, diskId, image;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resizedDiskSize = 2048;
                return [4 /*yield*/, (0, linodes_2.createTestLinode)(factories_1.createLinodeRequestFactory.build({
                        label: (0, random_1.randomLabel)(),
                        region: (0, regions_1.chooseRegion)().id,
                        root_pass: (0, random_1.randomString)(32),
                        type: 'g6-nanode-1',
                        booted: false,
                    }))];
            case 1:
                linode = _a.sent();
                return [4 /*yield*/, (0, polling_1.pollLinodeStatus)(linode.id, 'offline', {
                        initialDelay: 15000,
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, api_v4_1.getLinodeDisks)(linode.id)];
            case 3:
                diskId = (_a.sent()).data[0].id;
                return [4 /*yield*/, (0, api_v4_1.resizeLinodeDisk)(linode.id, diskId, resizedDiskSize)];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, polling_1.pollLinodeDiskSize)(linode.id, diskId, resizedDiskSize)];
            case 5:
                _a.sent();
                return [4 /*yield*/, (0, api_v4_1.createImage)({
                        disk_id: diskId,
                        label: (0, random_1.randomLabel)(),
                    })];
            case 6:
                image = _a.sent();
                return [4 /*yield*/, (0, polling_1.pollImageStatus)(image.id, 'available', new backoff_1.SimpleBackoffMethod(10000, {
                        initialDelay: 45000,
                        maxAttempts: 30,
                    }))];
            case 7:
                _a.sent();
                return [2 /*return*/, image];
        }
    });
}); };
(0, authentication_1.authenticate)();
describe('Create stackscripts', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'images', 'stackscripts']);
    });
    beforeEach(function () {
        cy.tag('method:e2e', 'purpose:dcTesting');
    });
    /*
     * - Creates a StackScript with user-defined fields.
     * - Confirms that an error message appears upon submitting script without a shebang.
     * - Confirms that an error message appears upon submitting invalid user-defined fields.
     * - Deploys a new Linode using the StackScript.
     * - Confirms that user-defined fields are displayed as expected during Linode creation.
     * - Confirms that Linode created using StackScript boots.
     */
    it('creates a StackScript and deploys a Linode with it', function () {
        var stackscriptLabel = (0, random_1.randomLabel)();
        var stackscriptDesc = (0, random_1.randomPhrase)();
        var stackscriptImage = 'Alpine 3.19';
        var linodeLabel = (0, random_1.randomLabel)();
        var linodeRegion = (0, regions_1.chooseRegion)({ capabilities: ['Vlans'] });
        (0, stackscripts_1.interceptCreateStackScript)().as('createStackScript');
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        (0, linodes_1.interceptCreateLinode)().as('createLinode');
        (0, account_1.interceptGetAccountAvailability)().as('getAvailability');
        cy.visitWithLogin('/stackscripts/create');
        // Submit StackScript creation form with invalid contents, confirm error messages.
        cy.fixture(stackscriptNoShebangPath).then(function (stackscriptWithNoShebang) {
            fillOutStackscriptForm(stackscriptLabel, stackscriptDesc, stackscriptImage, stackscriptWithNoShebang);
        });
        ui_1.ui.buttonGroup
            .findButtonByTitle('Create StackScript')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createStackScript');
        cy.findByText(stackScriptErrorNoShebang).should('be.visible');
        cy.fixture(stackscriptUdfInvalidPath).then(function (stackScriptUdfInvalid) {
            inputStackScript(stackScriptUdfInvalid);
        });
        ui_1.ui.buttonGroup
            .findButtonByTitle('Create StackScript')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createStackScript');
        cy.findByText(stackScriptErrorUdfAlphanumeric).should('be.visible');
        // Insert a script with valid UDF data and submit StackScript create form.
        cy.fixture(stackscriptUdfPath).then(function (stackScriptUdf) {
            inputStackScript(stackScriptUdf);
        });
        ui_1.ui.buttonGroup
            .findButtonByTitle('Create StackScript')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createStackScript').then(function (intercept) {
            var _a, _b;
            // Confirm the user is redirected to the StackScript details page
            cy.url().should('endWith', "/stackscripts/".concat((_a = intercept.response) === null || _a === void 0 ? void 0 : _a.body.id));
            // Confirm a success toast shows
            ui_1.ui.toast.assertMessage("Successfully created StackScript ".concat((_b = intercept.response) === null || _b === void 0 ? void 0 : _b.body.label));
        });
        ui_1.ui.button
            .findByTitle('Deploy New Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        // Wait for availability to be retrieved before interacting with form.
        cy.wait('@getAvailability');
        // Fill out Linode creation form, confirm UDF fields behave as expected.
        fillOutLinodeForm(linodeLabel, linodeRegion.label);
        cy.findByLabelText('Example Password')
            .should('be.visible')
            .click()
            .type((0, random_1.randomString)(32));
        cy.findByLabelText('Example Title')
            .should('be.visible')
            .click()
            .type('{selectall}{backspace}')
            .type((0, random_1.randomString)(12));
        ui_1.ui.button
            .findByTitle('Create Linode')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@createLinode');
        // Confirm that Linode has been created and is provisioning.
        cy.findByText(linodeLabel).should('be.visible');
        // In rare cases, the Linode can provision quicker than this assertion happens,
        // so we want to account for cases where it's already booting or even running.
        cy.findByText(/(PROVISIONING|BOOTING|RUNNING)/).should('be.visible');
    });
    /*
     * - Creates a StackScript with "Any/All" image.
     * - Confirms that any default image can be selected when deploying with "Any/All" StackScripts.
     * - Confirms that private images can be selected when deploying with "Any/All" StackScripts.
     * - Confirms that a Linode can be deployed using StackScript with private image.
     */
    it('creates a StackScript with Any/All target image', function () {
        var stackscriptLabel = (0, random_1.randomLabel)();
        var stackscriptDesc = (0, random_1.randomPhrase)();
        var stackscriptImage = 'Any/All';
        var linodeLabel = (0, random_1.randomLabel)();
        (0, stackscripts_1.interceptCreateStackScript)().as('createStackScript');
        (0, stackscripts_1.interceptGetStackScripts)().as('getStackScripts');
        (0, linodes_1.interceptCreateLinode)().as('createLinode');
        (0, images_1.interceptGetAllImages)().as('getAllImages');
        cy.defer(createLinodeAndImage, {
            label: 'creating Linode and Image',
            timeout: 360000,
        }).then(function (privateImage) {
            cy.visitWithLogin('/stackscripts/create');
            cy.fixture(stackscriptBasicPath).then(function (stackscriptBasic) {
                fillOutStackscriptForm(stackscriptLabel, stackscriptDesc, stackscriptImage, stackscriptBasic);
            });
            ui_1.ui.buttonGroup
                .findButtonByTitle('Create StackScript')
                .should('be.visible')
                .should('be.enabled')
                .click();
            // Confirm the user is redirected to the StackScript details page
            cy.wait('@createStackScript').then(function (intercept) {
                var _a;
                cy.url().should('endWith', "/stackscripts/".concat((_a = intercept.response) === null || _a === void 0 ? void 0 : _a.body.id));
            });
            cy.wait('@getAllImages').then(function (res) {
                var _a;
                // Fetch Images from response data and filter out Kubernetes images.
                var imageData = (_a = res.response) === null || _a === void 0 ? void 0 : _a.body.data;
                var filteredImageData = (0, utilities_1.getFilteredImagesForImageSelect)(imageData, 'public');
                ui_1.ui.button
                    .findByTitle('Deploy New Linode')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
                // Confirm that expected images are present in "Choose an image" drop-down.
                cy.findByPlaceholderText('Choose an image')
                    .should('be.visible')
                    .click();
                /*
                 * Arbitrarily-chosen images to check in order to confirm that "Any/All"
                 * StackScripts allow any image to be selected.
                 *
                 */
                filteredImageData === null || filteredImageData === void 0 ? void 0 : filteredImageData.forEach(function (imageSample) {
                    var imageLabel = imageSample.label;
                    cy.findAllByText(imageLabel, { exact: false })
                        .last()
                        .scrollIntoView()
                        .should('exist')
                        .should('be.visible');
                });
            });
            // Select private image.
            cy.findByText(privateImage.label)
                .scrollIntoView()
                .should('be.visible')
                .click();
            (0, linodes_1.interceptCreateLinode)().as('createLinode');
            fillOutLinodeForm(linodeLabel, (0, regions_1.chooseRegion)({ capabilities: ['Vlans'] }).label);
            ui_1.ui.button
                .findByTitle('Create Linode')
                .should('be.visible')
                .should('be.enabled')
                .click();
            cy.wait('@createLinode');
            cy.findByText(linodeLabel).should('be.visible');
            cy.findByText('PROVISIONING').should('be.visible');
        });
    });
});
