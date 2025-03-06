"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDomainRecords = void 0;
/* eslint-disable sonarjs/no-duplicate-string */
var random_1 = require("support/util/random");
// Array of domain records for which to test creation.
var createDomainRecords = function () { return [
    {
        fields: [
            {
                name: '[data-qa-target="Hostname"]',
                skipCheck: false,
                value: (0, random_1.randomLabel)(),
            },
            {
                name: '[data-qa-target="IP Address"]',
                skipCheck: false,
                value: (0, random_1.randomIp)(),
            },
        ],
        name: 'Add an A/AAAA Record',
        tableAriaLabel: 'List of Domains A/AAAA Record',
    },
    {
        fields: [
            {
                name: '[data-qa-target="Hostname"]',
                skipCheck: false,
                value: (0, random_1.randomLabel)(),
            },
            {
                name: '[data-qa-target="Alias to"]',
                skipCheck: false,
                value: "".concat((0, random_1.randomLabel)(), ".net"),
            },
        ],
        name: 'Add a CNAME Record',
        tableAriaLabel: 'List of Domains CNAME Record',
    },
    {
        fields: [
            {
                name: '[data-qa-target="Hostname"]',
                skipCheck: false,
                value: (0, random_1.randomLabel)(),
            },
            {
                name: '[data-qa-target="Value"]',
                skipCheck: false,
                value: "".concat((0, random_1.randomLabel)(), "=").concat((0, random_1.randomString)()),
            },
        ],
        name: 'Add a TXT Record',
        tableAriaLabel: 'List of Domains TXT Record',
    },
    {
        fields: [
            {
                name: '[data-qa-target="Service"]',
                skipCheck: true,
                value: (0, random_1.randomLabel)(),
            },
            {
                approximate: true,
                name: '[data-qa-target="Target"]',
                value: (0, random_1.randomLabel)(),
            },
        ],
        name: 'Add an SRV Record',
        tableAriaLabel: 'List of Domains SRV Record',
    },
    {
        fields: [
            {
                name: '[data-qa-target="Name"]',
                skipCheck: false,
                value: (0, random_1.randomLabel)(),
            },
            {
                name: '[data-qa-target="Value"]',
                skipCheck: false,
                value: (0, random_1.randomDomainName)(),
            },
        ],
        name: 'Add a CAA Record',
        tableAriaLabel: 'List of Domains CAA Record',
    },
]; };
exports.createDomainRecords = createDomainRecords;
