export const exampleURL = 'localhost:8082';
import { loginSignup } from './login';
import { dropCollections } from '../../sdk/js';
const APP_SECRET = Cypress.env('APP_SECRET');

describe('Flashcards Suite', async () => {
  dropCollections(APP_SECRET);

  it('logs in', () => {
    cy.visit(exampleURL);

    loginSignup();
  });

  it('contains the basic components', () => {
    cy.contains('h2', 'Deck');
    cy.contains('h2', 'Card');
    cy.contains('.deck-display__title', 'Animal facts');
  });
  it('loaded default deck JSON', () => {
    cy.get('.deck-display__card-container').should('have.length', '4');
    cy.contains('A zeal');
  });
  it('can create a deck', () => {
    cy.get('.new-deck-btn').click();
    cy.get('.form__text-input').type('Test Deck');
    cy.get('.form__button--confirm').click();
    cy.contains('.deck-display__title', 'Test Deck');
  });
  it('can create a card', () => {
    cy.get('.new-card-btn').click();
    cy.get('.ql-editor > p').first().focus();
    cy.get('.form__text-input').type('Test Deck');

    cy.get('.form__text-input[name=card-front-input]').type('Test card front');
    cy.get('.form__text-input[name=card-back-input]').type('Test card back');
    cy.get('.card-input__add-icon').click();

    cy.contains('.flashcard__front > .flashcard__content', 'Test card front');
    cy.contains('.flashcard__back > .flashcard__content', 'Test card back');
  });
  it('can edit a card', () => {
    cy.get('.deck-display__buttons-col > .buttons-col__button--edit').eq(0).click();
    cy.get('.card-editor .form__text-input[name=card-front-input]').type('Test card edit front');
    cy.get('.card-editor .form__text-input[name=card-back-input]').type('Test card edit back');
    cy.get('.card-editor .form__button--confirm').click();
    cy.contains('.flashcard__front > .flashcard__content', 'Test card edit front');
    cy.contains('.flashcard__back > .flashcard__content', 'Test card edit back');
  });
  it('cancels edit when cancel is clicked', () => {
    cy.get('.deck-display__buttons-col > .buttons-col__button--edit').eq(0).click();
    cy.get('.card-editor .form__text-input[name=card-front-input]').type('Test card edit front');
    cy.get('.card-editor .form__text-input[name=card-back-input]').type('Test card edit back');
    cy.get('.card-editor .form__button--cancel').click();
    cy.contains('.flashcard__front', 'What is a group of zebra').should(
      'not.contain.text',
      'Test card edit front',
    );
    cy.contains('.flashcard__back', 'A zeal').should('not.contain.text', 'Test card edit back');
  });
  it('can delete a card', () => {
    cy.get('.deck-display__buttons-col > .buttons-col__button--delete').eq(0).click();
    cy.contains('.flashcard__front', 'What is a group of zebra').should('not.exist');
  });
  it('can flip a card when clicked', () => {
    cy.contains('.flashcard__front', 'What is a group of zebra').should('be.visible');
    cy.get('.flashcard__front').eq(0).click();
    cy.contains('.flashcard__front', 'What is a group of zebra').should('not.be.visible');
    cy.contains('.flashcard__back', 'A zeal').should('be.visible');
    cy.get('.flashcard__back').eq(0).click();
    cy.contains('.flashcard__back', 'A zeal').should('not.be.visible');
  });
  it('saves state on page reload', () => {
    cy.contains('.flashcard__front', 'What is a group of zebra').should('exist');
    cy.get('.deck-display__buttons-col > .buttons-col__button--delete').eq(0).click();
    cy.contains('.flashcard__front', 'What is a group of zebra').should('not.exist');
    cy.reload();
    cy.contains('.flashcard__front', 'What is a group of zebra').should('not.exist');
  });
});
