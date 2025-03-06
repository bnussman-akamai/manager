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
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureBrowser = void 0;
/**
 * Displays a table of information about the browser being used for the tests.
 */
var displayBrowserInfo = function (browser, launchOptions) {
    var browserBasicInfo = {
        Browser: "".concat(browser.displayName, " v").concat(browser.version),
        Family: browser.family,
        Headless: browser.isHeadless ? 'Yes' : 'No',
    };
    var browserChromeSpecificInfo = browser.name === 'chrome'
        ? {
            // Show whether we're using the new or old Chrome headless implementation.
            'Chrome Headless': (function () {
                if (!browser.isHeadless) {
                    return 'N/A';
                }
                if (launchOptions.args.includes('--headless=old')) {
                    return 'Old';
                }
                return 'New';
            })(),
        }
        : {};
    console.log('Browser information:');
    console.table(__assign(__assign({}, browserBasicInfo), browserChromeSpecificInfo));
};
/**
 * Configures the browser instance for Cypress testing.
 */
var configureBrowser = function (on, _config) {
    on('before:browser:launch', function (browser, launchOptions) {
        var originalPreferences = launchOptions.preferences.default;
        // Disable requests to Google's safe browsing API.
        // We opt to disable these requests because they can be slow and have
        // contributed to test timeouts in the past.
        launchOptions.preferences.default = __assign(__assign({}, originalPreferences), { safebrowsing: {
                enabled: false,
            } });
        // Explicitly set Chrome pointer type.
        //
        // This is useful to for webpages/components that attempt to detect if a
        // user is using a desktop device or a mobile device.
        //
        // MUI's date/time picker uses the `@media (pointer: fine)` media query
        // to accomplish this, which does not match on headless CI environments,
        // prompting the component to behave as if it were running on a mobile
        // device.
        //
        // See also:
        // - https://mui.com/x/react-date-pickers/date-time-picker/
        // - https://mui.com/x/react-date-pickers/base-concepts/#testing-caveats
        if (browser.name === 'chrome' && browser.isHeadless) {
            launchOptions.args.push('--blink-settings=primaryPointerType=4');
        }
        displayBrowserInfo(browser, launchOptions);
        return launchOptions;
    });
};
exports.configureBrowser = configureBrowser;
