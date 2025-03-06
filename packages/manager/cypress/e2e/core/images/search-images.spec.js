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
var images_1 = require("@linode/api-v4/lib/images");
var linodes_1 = require("support/util/linodes");
var ui_1 = require("support/ui");
var authentication_1 = require("support/api/authentication");
var random_1 = require("support/util/random");
var cleanup_1 = require("support/util/cleanup");
var linodes_2 = require("support/intercepts/linodes");
(0, authentication_1.authenticate)();
describe('Search Images', function () {
    before(function () {
        (0, cleanup_1.cleanUp)(['linodes', 'images']);
    });
    beforeEach(function () {
        cy.tag('method:e2e');
    });
    /*
     * - Confirm that images are API searchable and filtered in the UI.
     */
    it('creates two images and make sure they show up in the table and are searchable', function () {
        cy.defer(function () {
            return (0, linodes_1.createTestLinode)({ image: 'linode/debian12', region: 'us-east' }, { waitForDisks: true });
        }, 'create linode').then(function (linode) {
            (0, linodes_2.interceptGetLinodeDisks)(linode.id).as('getLinodeDisks');
            cy.visitWithLogin("/linodes/".concat(linode.id, "/storage"));
            cy.wait('@getLinodeDisks').then(function (xhr) {
                var _a;
                var disks = (_a = xhr.response) === null || _a === void 0 ? void 0 : _a.body.data;
                var disk_id = disks[0].id;
                var createTwoImages = function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, Promise.all([
                                (0, images_1.createImage)({
                                    disk_id: disk_id,
                                    label: (0, random_1.randomLabel)(),
                                }),
                                (0, images_1.createImage)({
                                    disk_id: disk_id,
                                    label: (0, random_1.randomLabel)(),
                                }),
                            ])];
                    });
                }); };
                cy.defer(function () { return createTwoImages(); }, 'creating images').then(function (_a) {
                    var image1 = _a[0], image2 = _a[1];
                    cy.visitWithLogin('/images');
                    // Confirm that both images are listed on the landing page.
                    cy.contains(image1.label).should('be.visible');
                    cy.contains(image2.label).should('be.visible');
                    // Search for the first image by label, confirm it's the only one shown.
                    cy.findByPlaceholderText('Search Images').type(image1.label);
                    expect(cy.contains(image1.label).should('be.visible'));
                    expect(cy.contains(image2.label).should('not.exist'));
                    // Clear search, confirm both images are shown.
                    cy.findByTestId('clear-images-search').click();
                    cy.contains(image1.label).should('be.visible');
                    cy.contains(image2.label).should('be.visible');
                    // Use the main search bar to search and filter images
                    ui_1.ui.mainSearch.find().type(image2.label);
                    ui_1.ui.autocompletePopper.findByTitle(image2.label).click();
                    // Confirm that only the second image is shown.
                    cy.contains(image1.label).should('not.exist');
                    cy.contains(image2.label).should('be.visible');
                });
            });
        });
    });
});
