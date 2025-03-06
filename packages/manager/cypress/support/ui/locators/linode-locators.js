"use strict";
// This file contains locators for the Linode page in the Manager.
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOfLinodesTableTagsBody = exports.listOfLinodesTableBody = exports.listOfLinodesTableHeader = exports.nonEmptyLinodePage = exports.emptyLinodePage = void 0;
/** Empty Linode landing page. */
exports.emptyLinodePage = {
    /** Empty Linode landing page Resources container. */
    resourcesContainer: 'div[data-qa-placeholder-container="resources-section"]',
    /** Empty Linode landing page Resources Header(H1). */
    resourcesHeader1: 'h1[data-qa-header]',
};
/** Non-Empty Linode landing page. */
exports.nonEmptyLinodePage = {
    /** Non-Empty Linode landing page Docs link. */
    docsLink: 'a[aria-label="Docs - link opens in a new tab"]',
    /** Non-Empty Linode landing page Linodes label header. */
    linodesLabel: 'h1[data-qa-header="Linodes"]',
    /** Non-Empty Linode landing page Linodes table. */
    listOfLinodesTable: 'table[aria-label="List of Linodes"]',
};
/** Linode table header. */
exports.listOfLinodesTableHeader = {
    /** Linode table header sort by ip button. */
    ipv4SortButton: '[aria-label="Sort by ipv4[0]',
    /** Linode table header sort by label button. */
    labelSortButton: '[aria-label="Sort by label"]',
    /** Linode table header sort by region button. */
    regionSortButton: '[aria-label="Sort by region"]',
    /** Linode table header sort by _statusPriority button. */
    statusPrioritySortButton: '[aria-label="Sort by _statusPriority"]',
    /** Linode table header toggle display button. */
    toggleDisplayButton: '[aria-label="Toggle display"]',
    /** Linode table header toggle group by tag button. */
    toggleGroupByTagButton: '[aria-label="Toggle group by tag"]',
    /** Linode table header sort by type button. */
    typeSortButton: '[aria-label="Sort by type"]',
};
/** Linode table body. */
exports.listOfLinodesTableBody = {
    /** Linode table body ip copy button which takes ip as a parameter. */
    ipClipboardCopyButton: function (ip) {
        return "[aria-label=\"Copy ".concat(ip, " to clipboard\"]");
    },
    /** Linode table body action menu which takes label as a parameter. */
    linodeActionMenu: function (label) {
        return "[aria-label=\"Action menu for Linode ".concat(label, "\"]");
    },
    /** Linode table body get Row by label which takes label as a parameter. */
    rowByLabel: function (label) { return "tr[data-qa-linode=\"".concat(label, "\"]"); },
    /** Linode table body row. */
    rows: 'table[aria-label="List of Linodes"] tbody tr',
};
/** Linode table tags. */
exports.listOfLinodesTableTagsBody = {
    /** Linode table even tags. */
    evenTag: '[data-qa-tag-header="even"]',
    /** Linode table nums tags. */
    numTag: '[data-qa-tag-header="nums"]',
    /** Linode table odd tags. */
    oddTag: '[data-qa-tag-header="odd"]',
};
