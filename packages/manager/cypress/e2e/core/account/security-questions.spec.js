"use strict";
/**
 * @file Integration tests for account security questions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var profile_1 = require("support/intercepts/profile");
var ui_1 = require("support/ui");
var profile_2 = require("src/factories/profile");
var profile_3 = require("src/factories/profile");
/**
 * Finds the "Security Questions" section on the profile auth page.
 *
 * @returns Cypress chainable.
 */
var getSecurityQuestionsSection = function () {
    return cy.contains('h3', 'Security Questions').parent();
};
/**
 * Finds the element containing the given security question's question field.
 *
 * @param questionNumber - Security question number (1-3) for which to retrieve question element.
 *
 * @returns Cypress chainable.
 */
var getSecurityQuestion = function (questionNumber) {
    return cy.contains('label', "Question ".concat(questionNumber)).parent().parent();
};
/**
 * Finds the element containing the given security question's answer field.
 *
 * @param questionNumber - Security question number (1-3) for which to retrieve answer element.
 *
 * @returns Cypress chainable.
 */
var getSecurityQuestionAnswer = function (questionNumber) {
    return cy.contains('label', "Answer ".concat(questionNumber)).parent().parent();
};
/**
 * Clicks the "Edit" button next to a security question.
 *
 * @param questionNumber - Security question number (1-3) to edit.
 */
var editQuestion = function (questionNumber) {
    getSecurityQuestion(questionNumber).within(function () {
        ui_1.ui.button
            .findByTitle('Edit')
            .as('editbtn')
            .should('be.visible')
            .should('be.enabled');
        cy.get('@editbtn').click({ scrollBehavior: 'center' });
    });
};
/**
 * Asserts that a security question answer matches the given value.
 *
 * This assumes that the security question is already in its 'Edit' state.
 *
 * @param questionNumber - Security question number (1-3) with value to assert.
 * @param answer - Security question answer value to assert.
 */
var assertSecurityQuestionAnswer = function (questionNumber, answer) {
    getSecurityQuestionAnswer(questionNumber).within(function () {
        cy.get('[data-testid="textfield-input"]').should('have.value', answer);
    });
};
/**
 * Sets the question and answer for the given security question.
 *
 * This assumes that the security question is already in its 'Edit' state.
 *
 * @param questionNumber - Security question number (1-3) to set.
 * @param question - String containing contents of question to set.
 * @param answer - Answer to assign for question.
 */
var setSecurityQuestionAnswer = function (questionNumber, question, answer) {
    getSecurityQuestion(questionNumber).within(function () {
        cy.findByLabelText("Question ".concat(questionNumber))
            .should('be.visible')
            .click();
        cy.focused().type("".concat(question, "{enter}"));
    });
    getSecurityQuestionAnswer(questionNumber).within(function () {
        cy.findByLabelText("Answer ".concat(questionNumber))
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.focused().type(answer);
    });
};
describe('Account security questions', function () {
    /*
     * - Validates first-time security question answer flow using mocked data.
     * - Confirms that user cannot enable TFA before answering security questions.
     * - Confirms that user cannot submit answers before answering all 3 questions.
     * - Confirms UI flow when user submits security questions and answers.
     */
    it('can set account security questions for the first time', function () {
        var securityQuestions = profile_2.securityQuestionsFactory.build();
        var securityQuestionAnswers = ['Answer 1', 'Answer 2', 'Answer 3'];
        var mockProfile = profile_3.profileFactory.build({
            two_factor_auth: false,
        });
        var securityQuestionsPayload = {
            security_questions: [
                { question_id: 1, response: securityQuestionAnswers[0] },
                { question_id: 2, response: securityQuestionAnswers[1] },
                { question_id: 3, response: securityQuestionAnswers[2] },
            ],
        };
        var tfaSecurityQuestionsWarning = 'To use two-factor authentication you must set up your security questions listed below.';
        (0, profile_1.mockGetProfile)(mockProfile);
        (0, profile_1.mockGetSecurityQuestions)(securityQuestions).as('getSecurityQuestions');
        (0, profile_1.mockUpdateSecurityQuestions)(securityQuestionsPayload).as('setSecurityQuestions');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getSecurityQuestions');
        // Confirm that user is informed that they must answer security questions to enable TFA.
        cy.findByText(tfaSecurityQuestionsWarning).should('be.visible');
        // Confirm that "Add Security Questions" button is initially disabled.
        ui_1.ui.button
            .findByTitle('Add Security Questions')
            .should('be.visible')
            .should('be.disabled');
        setSecurityQuestionAnswer(1, securityQuestions.security_questions[0].question, securityQuestionAnswers[0]);
        // Confirm that submission button is now enabled, but clicking it shows an error.
        ui_1.ui.button
            .findByTitle('Add Security Questions')
            .should('be.visible')
            .should('be.enabled')
            .click();
        ui_1.ui.toast.assertMessage('You must answer all 3 security questions.');
        setSecurityQuestionAnswer(2, securityQuestions.security_questions[1].question, securityQuestionAnswers[1]);
        setSecurityQuestionAnswer(3, securityQuestions.security_questions[2].question, securityQuestionAnswers[2]);
        ui_1.ui.button
            .findByTitle('Add Security Questions')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@setSecurityQuestions');
        ui_1.ui.toast.assertMessage('Successfully added your security questions');
        // Confirm that TFA security questions warning goes away after answering security questions.
        cy.contains(tfaSecurityQuestionsWarning).should('not.exist');
        // Confirm that security questions submit button changes to "Update Security Questions".
        ui_1.ui.button
            .findByTitle('Update Security Questions')
            .should('be.visible')
            .should('be.disabled');
        // Confirm that chosen security questions are displayed.
        getSecurityQuestionsSection().within(function () {
            securityQuestions.security_questions
                .map(function (securityQuestion) { return securityQuestion.question; })
                .slice(0, 3)
                .forEach(function (securityQuestion) {
                cy.findByText(securityQuestion).should('be.visible');
            });
        });
    });
    /**
     * - Validates security questinos update flow using mocked data.
     * - Confirms UI flow when user updates their security questions and answers.
     * - Confirms UI flow when user cancels while updating their security questions and answers.
     */
    it('can update account security questions', function () {
        var securityQuestions = profile_2.securityQuestionsFactory.build();
        // Pre-set answers for security questions.
        var securityQuestionAnswers = [
            'Original Answer 1',
            'Original Answer 2',
            'Original Answer 3',
        ];
        securityQuestions.security_questions[0].response =
            securityQuestionAnswers[0];
        securityQuestions.security_questions[1].response =
            securityQuestionAnswers[1];
        securityQuestions.security_questions[2].response =
            securityQuestionAnswers[2];
        // Newly-chosen questions for security questions.
        var newSecurityQuestions = [
            securityQuestions.security_questions[3].question,
            securityQuestions.security_questions[4].question,
            securityQuestions.security_questions[5].question,
        ];
        // New answers for newly-chosen security questions.
        var newSecurityQuestionAnswers = [
            'New Answer 1',
            'New Answer 2',
            'New Answer 3',
        ];
        // Payload containing updated security question data.
        var securityQuestionsPayload = {
            security_questions: [
                { question_id: 4, response: newSecurityQuestionAnswers[0] },
                { question_id: 5, response: newSecurityQuestionAnswers[1] },
                { question_id: 6, response: newSecurityQuestionAnswers[2] },
            ],
        };
        (0, profile_1.mockGetSecurityQuestions)(securityQuestions).as('getSecurityQuestions');
        (0, profile_1.mockUpdateSecurityQuestions)(securityQuestionsPayload).as('setSecurityQuestions');
        cy.visitWithLogin('/profile/auth');
        cy.wait('@getSecurityQuestions');
        ui_1.ui.button
            .findByTitle('Update Security Questions')
            .should('be.visible')
            .should('be.disabled');
        // Begin editing question 1, but cancel before saving changes.
        editQuestion(1);
        assertSecurityQuestionAnswer(1, securityQuestionAnswers[0]);
        setSecurityQuestionAnswer(1, newSecurityQuestions[0], newSecurityQuestionAnswers[0]);
        ui_1.ui.button
            .findByTitle('Cancel')
            .should('be.visible')
            .should('be.enabled')
            .click();
        editQuestion(1);
        assertSecurityQuestionAnswer(1, securityQuestionAnswers[0]);
        setSecurityQuestionAnswer(1, newSecurityQuestions[0], newSecurityQuestionAnswers[0]);
        editQuestion(2);
        assertSecurityQuestionAnswer(2, securityQuestionAnswers[1]);
        setSecurityQuestionAnswer(2, newSecurityQuestions[1], newSecurityQuestionAnswers[1]);
        editQuestion(3);
        assertSecurityQuestionAnswer(3, securityQuestionAnswers[2]);
        setSecurityQuestionAnswer(3, newSecurityQuestions[2], newSecurityQuestionAnswers[2]);
        ui_1.ui.button
            .findByTitle('Update Security Questions')
            .should('be.visible')
            .should('be.enabled')
            .click();
        cy.wait('@setSecurityQuestions');
        ui_1.ui.toast.assertMessage('Successfully updated your security questions');
        // Confirm that 'Update Security Questions' button is disabled again.
        ui_1.ui.button
            .findByTitle('Update Security Questions')
            .should('be.visible')
            .should('be.disabled');
        // Confirm that new security questions are displayed.
        getSecurityQuestionsSection().within(function () {
            newSecurityQuestions.forEach(function (securityQuestion) {
                cy.findByText(securityQuestion).should('be.visible');
            });
        });
    });
});
