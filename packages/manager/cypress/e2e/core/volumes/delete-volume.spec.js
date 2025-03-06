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
var volumes_1 = require("@linode/api-v4/lib/volumes");
var volume_1 = require("src/factories/volume");
var authentication_1 = require("support/api/authentication");
var volumes_2 = require("support/intercepts/volumes");
var random_1 = require("support/util/random");
var ui_1 = require("support/ui");
var regions_1 = require("support/util/regions");
var cleanup_1 = require("support/util/cleanup");
var backoff_1 = require("support/util/backoff");
var polling_1 = require("support/util/polling");
// Local storage override to force volume table to list up to 100 items.
// This is a workaround while we wait to get stuck volumes removed.
// @TODO Remove local storage override when stuck volumes are removed from test accounts.
var pageSizeOverride = {
    PAGE_SIZE: 100,
};
/**
 * Creates a Volume and waits for it to become active.
 *
 * @param volumeRequest - Volume create request payload.
 *
 * @returns Promise that resolves to created Volume.
 */
var createActiveVolume = function (volumeRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var volume;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, volumes_1.createVolume)(volumeRequest)];
            case 1:
                volume = _a.sent();
                return [4 /*yield*/, (0, polling_1.pollVolumeStatus)(volume.id, 'active', new backoff_1.SimpleBackoffMethod(10000))];
            case 2:
                _a.sent();
                return [2 /*return*/, volume];
        }
    });
}); };
(0, authentication_1.authenticate)();
describe('volume delete flow', function () {
    before(function () {
        (0, cleanup_1.cleanUp)('volumes');
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Clicks "Delete" action menu item for volume but cancels operation.
     * - Clicks "Delete" action menu item for volume and confirms operation.
     * - Confirms that volume is still in landing page list after canceled operation.
     * - Confirms that volume is removed from landing page list after confirmed operation.
     * - Confirms that volume deletion toast is displayed.
     */
    it('deletes a volume', function () {
        var volumeRequest = volume_1.volumeRequestPayloadFactory.build({
            label: (0, random_1.randomLabel)(),
            region: (0, regions_1.chooseRegion)().id,
        });
        cy.defer(function () { return createActiveVolume(volumeRequest); }, 'creating volume').then(function (volume) {
            (0, volumes_2.interceptDeleteVolume)(volume.id).as('deleteVolume');
            cy.visitWithLogin('/volumes', {
                localStorageOverrides: pageSizeOverride,
            });
            // Confirm that volume is listed and initiate deletion.
            cy.findByText(volume.label).should('be.visible');
            cy.findByLabelText("Action menu for Volume ".concat(volume.label)).click();
            cy.get('[data-qa-action-menu-item="Delete"]:visible')
                .should('be.visible')
                .click();
            // Cancel deletion when prompted to confirm.
            ui_1.ui.dialog
                .findByTitle("Delete Volume ".concat(volume.label, "?"))
                .should('be.visible')
                .within(function () {
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Cancel')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that volume is still listed and initiate deletion again.
            cy.findByText(volume.label).should('be.visible');
            cy.findByLabelText("Action menu for Volume ".concat(volume.label)).click();
            cy.get('[data-qa-action-menu-item="Delete"]:visible')
                .should('be.visible')
                .click();
            // Confirm deletion.
            ui_1.ui.dialog
                .findByTitle("Delete Volume ".concat(volume.label, "?"))
                .should('be.visible')
                .within(function () {
                cy.findByLabelText('Volume Label')
                    .should('be.visible')
                    .click()
                    .type(volume.label);
                ui_1.ui.buttonGroup
                    .findButtonByTitle('Delete')
                    .should('be.visible')
                    .should('be.enabled')
                    .click();
            });
            // Confirm that volume is deleted.
            cy.wait('@deleteVolume').its('response.statusCode').should('eq', 200);
            cy.findByText(volume.label).should('not.exist');
            ui_1.ui.toast.assertMessage("Volume ".concat(volume.label, " has been deleted."));
        });
    });
});
