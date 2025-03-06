"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var accessibility_1 = require("support/util/accessibility");
var components_1 = require("support/util/components");
var PasswordInput_1 = require("src/components/PasswordInput/PasswordInput");
var fakePassword = 'this is a password';
var props = {
    label: 'Password Input',
    value: fakePassword,
};
(0, components_1.componentTests)('PasswordInput', function (mount) {
    describe('PasswordInput interactions', function () {
        /**
         * - Confirms password text starts hidden
         * - Confirms password text can be revealed or hidden when toggling visibility icon
         */
        it('can show and hide password text', function () {
            mount(<PasswordInput_1.PasswordInput {...props}/>);
            // Password textfield starts off as 'password' type
            cy.get('[type="password"]').should('be.visible');
            cy.findByTestId('VisibilityIcon').should('be.visible').click();
            cy.findByTestId('VisibilityIcon').should('not.exist');
            // After clicking the visibility icon, textfield becomes a normal textfield
            cy.get('[type="password"]').should('not.exist');
            cy.get('[type="text"]').should('be.visible');
            // Clicking VisibilityOffIcon changes input type to password again
            cy.findByTestId('VisibilityOffIcon').should('be.visible').click();
            cy.findByTestId('VisibilityOffIcon').should('not.exist');
            cy.findByTestId('VisibilityIcon').should('be.visible');
            cy.get('[type="password"]').should('be.visible');
            cy.get('[type="text"]').should('not.exist');
        });
        /**
         * - Confirms password input displays when a weak password is entered
         */
        it('displays an indicator for a weak password', function () {
            var TestWeakStrength = function () {
                var _a = React.useState(''), password = _a[0], setPassword = _a[1];
                return (<PasswordInput_1.PasswordInput {...props} onChange={function (e) { return setPassword(e.target.value); }} value={password}/>);
            };
            mount(<TestWeakStrength />);
            // Starts off as 'Weak' if no password entered
            cy.findByText('Weak').should('be.visible');
            cy.findByTestId('textfield-input').should('be.visible').type('weak');
            cy.findByText('Weak').should('be.visible');
        });
        /**
         * - Confirm password indicator can update when a password is entered
         * - Confirms password input can display indicator for a fair password
         */
        it('displays an indicator for a fair password', function () {
            var TestMediumStrength = function () {
                var _a = React.useState(''), password = _a[0], setPassword = _a[1];
                return (<PasswordInput_1.PasswordInput {...props} onChange={function (e) { return setPassword(e.target.value); }} value={password}/>);
            };
            mount(<TestMediumStrength />);
            // Starts off as 'Weak' when no password entered
            cy.findByText('Weak').should('be.visible');
            cy.findByTestId('textfield-input')
                .should('be.visible')
                .type('fair-pass1');
            // After typing in a fair password, the strength indicator updates
            cy.findByText('Fair').should('be.visible');
            cy.findByText('Weak').should('not.exist');
        });
        /**
         * - Confirm password indicator can update when a password is entered
         * - Confirms password input can display indicator for a good password
         */
        it('displays an indicator for a "good" password', function () {
            var TestGoodStrength = function () {
                var _a = React.useState(''), password = _a[0], setPassword = _a[1];
                return (<PasswordInput_1.PasswordInput {...props} onChange={function (e) { return setPassword(e.target.value); }} value={password}/>);
            };
            mount(<TestGoodStrength />);
            // Starts off as 'Weak' when no password entered
            cy.findByText('Weak').should('be.visible');
            cy.findByTestId('textfield-input')
                .should('be.visible')
                .type('str0ng!!-password1!!');
            // After typing in a strong password, the strength indicator updates
            cy.findByText('Good').should('be.visible');
            cy.findByText('Weak').should('not.exist');
        });
    });
    (0, components_1.visualTests)(function (mount) {
        describe('Accessibility checks', function () {
            it('passes aXe check when password input is visible', function () {
                mount(<PasswordInput_1.PasswordInput {...props}/>);
                cy.findByTestId('VisibilityIcon').should('be.visible').click();
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check when password input is not visible', function () {
                mount(<PasswordInput_1.PasswordInput {...props}/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check for a weak password', function () {
                mount(<PasswordInput_1.PasswordInput {...props} value=""/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check for a fair password', function () {
                mount(<PasswordInput_1.PasswordInput {...props} value="fair-pass1"/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check for a "good" password', function () {
                mount(<PasswordInput_1.PasswordInput {...props} value="st0ng!!-password1!!"/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check when password input is designated as required', function () {
                mount(<PasswordInput_1.PasswordInput {...props} required/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check when strength value is hidden', function () {
                mount(<PasswordInput_1.PasswordInput {...props} hideValidation/>);
                (0, accessibility_1.checkComponentA11y)();
            });
            it('passes aXe check when strength label is shown', function () {
                mount(<PasswordInput_1.PasswordInput {...props} hideStrengthLabel={false}/>);
                (0, accessibility_1.checkComponentA11y)();
            });
        });
    });
});
