import { NightwatchBrowser } from 'nightwatch';

export const HappyPath = (browser: NightwatchBrowser) => {
  browser
    .url('http://localhost')
    .waitForElementPresent('h1[data-testid="eduvault-title"]', 1200000)
    .assert.containsText('h1', 'EDUVAULT')
    .url('https://home.localhost')
    .waitForElementPresent('h1[data-testid="eduvault-title"]', 1200000)
    .assert.containsText('h1', 'EDUVAULT')
    .click('button[data-testid="button-try-now"]');
  browser.expect.element('a[data-testid="link-example"]').is.visible;
  browser.click('a[data-testid="link-example"]');
  // navigates to example
  browser.waitForElementVisible('img.eduvault-button');
  browser.click('img.eduvault-button');
  browser.waitForElementPresent('input[type=email]');
  browser.setValue('input[type=email]', 'example@somewhere.com');
  browser.setValue('input[type=password]', 'Password123');
  browser.click('button[type=submit]');
  // logs in
  browser.waitForElementPresent('h2[data-testid="deck-title"]', 10000);
  // starts DB and shows default deck
  browser.expect.element('h2[data-testid="deck-title"]').text.to.contain('Default Deck');
};
