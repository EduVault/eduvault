/// <reference types="cypress" />

export const exampleURL = 'localhost:8082';
const dummyEmail = 'person@email.com';
const dummyPassword = 'Password123';
const exampleLoginButton = 'a[href*="app_id"]';
const emailInput = 'input[type="email"]';
const passwordInput = 'input[type="password"]';
const pwSignupSubmit = '.btn__login-signup';
const APP_SECRET = Cypress.env('APP_SECRET');
// add app signup stuff here.

// we want app to have been registered before calls
// testing registering on api unit tests check for double register
//

import { config } from '../../shared';

import { appRegister, devVerify, clearCollections } from '../../sdk/js';

console.log('E2E test', APP_SECRET);
const appSetup = () => {
  devVerify();
};

export const loginSignup = () => {
  cy.get(exampleLoginButton).click();
  cy.get(emailInput).type(dummyEmail);
  cy.get(passwordInput).type(dummyPassword);
  cy.get(pwSignupSubmit).click();
  cy.get('h2', { timeout: 10000 }).contains('Deck');
  cy.getCookies('koa.sess').then((cookie) => {
    console.log('cookie');
    cy.setCookie('koa.sess', cookie[0].value);
  });
};

describe('Password Login', async () => {
  clearCollections(APP_SECRET);
  localStorage.clear();
  indexedDB.deleteDatabase('eduvault');
  it('loads components', () => {
    cy.visit('/');

    cy.get('.landing-img').should('exist');
  });
  it('login', () => {
    loginSignup();
  });
  // it('can log back in', () => {
  //   loginSignup();
  //   loginSignup();
  // });
});
