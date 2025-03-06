"use strict";
/**
 * @file Utilities for component testing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpy = exports.visualTests = exports.componentTests = exports.defaultTheme = exports.componentThemes = void 0;
/**
 * Array of themes for which to test components.
 */
exports.componentThemes = ['light', 'dark'];
/**
 * Default theme to use for non-visual component tests.
 *
 * Sorry dark theme users.
 */
// TODO Look into allowing this to be overridden via `.env`.
exports.defaultTheme = 'light';
var capitalize = function (uncapitalizedString) {
    return "".concat(uncapitalizedString[0].toUpperCase()).concat(uncapitalizedString.slice(1));
};
/**
 * Describes a group of tests for a component.
 *
 * Passes a `mount` command to the given `callback` that can be used to
 * mount any component using the default theme.
 *
 * @param componentName - Name of component being tested.
 * @param callback - Test scope callback.
 */
var componentTests = function (componentName, callback, options) {
    if (options === void 0) { options = {}; }
    var mountCommand = function (jsx, flags) {
        return cy.mountWithTheme(jsx, exports.defaultTheme, flags, options.useTanstackRouter);
    };
    describe("".concat(componentName, " component tests"), function () {
        callback(mountCommand);
    });
};
exports.componentTests = componentTests;
/**
 * Describes a group of visual tests for a component.
 *
 * Tests defined inside the given `callback` will be parameterized against
 * every theme. This makes `visualTests` useful for tests focused on accessibility
 * and visual regression.
 *
 * Passes a `mount` command to the given `callback` that can be used to mount
 * any component with the parameterized theme.
 *
 * @param callback - Test scope callback.
 */
var visualTests = function (callback) {
    describe('Visual tests', function () {
        exports.componentThemes.forEach(function (themeName) {
            var mountCommand = function (jsx, flags) {
                return cy.mountWithTheme(jsx, themeName, flags);
            };
            describe("".concat(capitalize(themeName), " theme"), function () {
                callback(mountCommand);
            });
        });
    });
};
exports.visualTests = visualTests;
/**
 * Creates a spy for the given function and assigns it an alias.
 *
 * @example
 * const spyFn = createSpy(() => {}, 'mySpyFunction');
 * mount(<MyComponent onChange={spyFn} />);
 * // ...Later, after interacting with `<MyComponent />`.
 * cy.get('@mySpyFunction').should('have.been.calledOnce');
 *
 * @param fn - Function for which to create spy.
 * @param alias - Alias to assign for later examination into spy.
 *
 * @returns The given function `fn`.
 */
// TODO Find a better place for this util.
var createSpy = function (fn, alias) {
    var callback = {
        fn: fn,
    };
    cy.spy(callback, 'fn').as(alias);
    return callback.fn;
};
exports.createSpy = createSpy;
