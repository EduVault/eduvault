export const exampleURL = 'example.localhost';
import { loginSignup } from './login';
import { clearCollections } from '../../sdk/js';
const APP_SECRET = Cypress.env('APP_SECRET');

describe('Flashcards Suite', async () => {
  clearCollections(APP_SECRET);
  localStorage.clear();
  indexedDB.deleteDatabase('eduvault');
  it('logs in', () => {
    cy.visit('/');

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
    cy.get('.ql-editor > p').first().type('Test card front');
    cy.get('.ql-editor > p').last().type('Test card back');

    cy.get('.form__button--confirm').click();

    cy.contains('Test card front');
    cy.contains('Test card back');
  });
  it('can edit a card', () => {
    cy.get('.deck-display__buttons-col > .buttons-col__button--edit').eq(0).click();
    cy.get('.ql-editor').first().type('Test card edit front');
    cy.get('.ql-editor').last().type('Test card edit back');
    cy.get('.form__button--confirm').click();
    cy.contains('Test card edit front');
    cy.contains('Test card edit back');
  });
  it('cancels edit when cancel is clicked', () => {
    cy.get('.deck-display__buttons-col > .buttons-col__button--edit').eq(0).click();
    cy.get('.ql-editor').first().type('Test card cancel front');
    cy.get('.ql-editor').last().type('Test card cancel back');
    cy.get('.form__button--cancel').click();
    cy.contains('.flashcard__front', 'What is a group of zebra').should(
      'not.contain.text',
      'Test card cancel front',
    );
    cy.contains('.flashcard__back', 'A zeal').should('not.contain.text', 'Test card cancel back');
  });
  it('can delete a card', () => {
    cy.contains('.flashcard__front', 'What is a group of zebra');
    cy.get('.deck-display__buttons-col > .buttons-col__button--delete').eq(0).click();
    cy.contains('.flashcard__front', 'What is a group of zebra').should('not.exist');
  });
  it('can flip a card when clicked', () => {
    cy.contains('.flashcard__front', 'What is a group of slugs').should('be.visible');
    cy.get('.flashcard__front').eq(0).click();
    cy.contains('.flashcard__front', 'What is a group of slugs').should('not.be.visible');
    cy.contains('.flashcard__back', 'A cornucopia').should('be.visible');
    cy.get('.flashcard__back').eq(0).click();
    cy.contains('.flashcard__back', 'A cornucopia').should('not.be.visible');
  });
  it('saves state on page reload', () => {
    cy.contains('.flashcard__front', 'What is a group of slugs').should('exist');
    cy.get('.deck-display__buttons-col > .buttons-col__button--delete').eq(0).click();
    cy.contains('.flashcard__front', 'What is a group of slugs').should('not.exist');
    cy.reload();
    cy.contains('.flashcard__front', 'What is a group of slugs').should('not.exist');
  });
});
