export const exampleURL = 'localhost:8082';
const dummyEmail = 'person@email.com';
const dummyPassword = 'password123';
const exampleLoginButton = '.oauth-login-button';
const emailInput = 'input[type="email"]';
const passwordInput = 'input[type="password"]';
const pwSignupSubmit = 'button[type=submit]';
describe('Password Login', () => {
  beforeEach(() => {
    cy.visit(exampleURL + '/login');
  });
  it('loads components', () => {
    cy.get('.landing-img').should('exist');
  });
  it('clicks login', () => {
    cy.get(exampleLoginButton).click();
    cy.get(emailInput).type(dummyEmail);
    cy.get(passwordInput).type(dummyPassword);
    cy.get(pwSignupSubmit).click();
  });
});
