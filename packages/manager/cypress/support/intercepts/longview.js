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
exports.mockUpdateLongviewClient = exports.mockDeleteLongviewClient = exports.mockCreateLongviewPlan = exports.mockUpdateLongviewPlan = exports.mockGetLongviewPlan = exports.mockCreateLongviewClient = exports.mockGetLongviewClients = exports.interceptGetLongviewClients = exports.mockFetchLongviewStatus = exports.interceptFetchLongviewStatus = void 0;
var intercepts_1 = require("support/util/intercepts");
var paginate_1 = require("support/util/paginate");
var response_1 = require("support/util/response");
/**
 * Intercepts request to retrieve Longview status for a Longview client.
 *
 * @returns Cypress chainable.
 */
var interceptFetchLongviewStatus = function () {
    return cy.intercept('POST', 'https://longview.linode.com/fetch');
};
exports.interceptFetchLongviewStatus = interceptFetchLongviewStatus;
/**
 * Mocks request to retrieve Longview status for a Longview client.
 *
 * @param client - Longview Client for which to intercept Longview fetch request.
 * @param apiAction - Longview API action to intercept.
 * @param mockStatus -
 *
 * @returns Cypress chainable.
 */
var mockFetchLongviewStatus = function (client, apiAction, mockStatus) {
    return cy.intercept({
        url: 'https://longview.linode.com/fetch',
        method: 'POST',
    }, function (req) { return __awaiter(void 0, void 0, void 0, function () {
        var payload, response, formData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = req.body;
                    response = new Response(payload, {
                        headers: {
                            'content-type': req.headers['content-type'],
                        },
                    });
                    return [4 /*yield*/, response.formData()];
                case 1:
                    formData = _a.sent();
                    if (formData.get('api_key') === client.api_key &&
                        formData.get('api_action') === apiAction) {
                        req.reply((0, response_1.makeResponse)([mockStatus]));
                    }
                    return [2 /*return*/];
            }
        });
    }); });
};
exports.mockFetchLongviewStatus = mockFetchLongviewStatus;
/**
 * Intercepts GET request to fetch Longview clients.
 *
 * @returns Cypress chainable.
 */
var interceptGetLongviewClients = function () {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('longview/clients*'));
};
exports.interceptGetLongviewClients = interceptGetLongviewClients;
/**
 * Mocks GET request to fetch Longview clients.
 *
 * @returns Cypress chainable.
 */
var mockGetLongviewClients = function (clients) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('longview/clients*'), (0, paginate_1.paginateResponse)(clients));
};
exports.mockGetLongviewClients = mockGetLongviewClients;
/**
 * Mocks request to create a Longview client.
 *
 * @returns Cypress chainable.
 */
var mockCreateLongviewClient = function (client) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('longview/clients*'), (0, response_1.makeResponse)(client));
};
exports.mockCreateLongviewClient = mockCreateLongviewClient;
var mockGetLongviewPlan = function (plan) {
    return cy.intercept('GET', (0, intercepts_1.apiMatcher)('longview/plan'), (0, response_1.makeResponse)(plan));
};
exports.mockGetLongviewPlan = mockGetLongviewPlan;
var mockUpdateLongviewPlan = function (newPlan) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)('longview/plan'), (0, response_1.makeResponse)(newPlan));
};
exports.mockUpdateLongviewPlan = mockUpdateLongviewPlan;
var mockCreateLongviewPlan = function (plan) {
    return cy.intercept('POST', (0, intercepts_1.apiMatcher)('longview/plan'), (0, response_1.makeResponse)(plan));
};
exports.mockCreateLongviewPlan = mockCreateLongviewPlan;
/**
 * Mocks request to delete a Longview Client.
 *
 * @param clientID - ID of Longview Client for which to intercept delete request.
 *
 */
var mockDeleteLongviewClient = function (clientID) {
    return cy.intercept('DELETE', (0, intercepts_1.apiMatcher)("longview/clients/".concat(clientID)), {});
};
exports.mockDeleteLongviewClient = mockDeleteLongviewClient;
/**
 * Intercepts PUT request to update Longview Client and mocks response.
 *
 * @param clientID - ID of Longview Client for which to intercept update request.
 * @param newClient - new Longview Client object with which to mock response.
 *
 * @returns Cypress chainable.
 */
var mockUpdateLongviewClient = function (clientID, newClient) {
    return cy.intercept('PUT', (0, intercepts_1.apiMatcher)("longview/clients/".concat(clientID)), (0, response_1.makeResponse)(newClient));
};
exports.mockUpdateLongviewClient = mockUpdateLongviewClient;
