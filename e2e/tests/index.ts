import { NightwatchAPI, NightwatchBrowser, NightwatchCallbackResult } from 'nightwatch';
const serverTestEnv = process.env.TEST === '1';
console.log({ serverTestEnv, 'process.env.TEST': process.env.TEST });
export const HappyPath = (browser: NightwatchBrowser) => {
  // check nightwatch is working
  // browser.url('https://google.com').waitForElementPresent('body').assert.titleContains('Google');
  // check base url working
  // .assert.containsText('h1', 'EDUVAULT');
  if (!serverTestEnv) {
    browser
      .url('https://localhost')
      .waitForElementPresent('body')
      .waitForElementPresent('h1[data-testid="eduvault-title"]', 10000, false);
    browser
      .url('https://home.localhost')
      .waitForElementPresent('body')
      .waitForElementPresent('h1[data-testid="eduvault-title"]', 10000, false);
  }
  // first call need to wait, cause app might be booting up
  browser
    .url('http://localhost')
    .waitForElementPresent('body', 120000, false)
    .waitForElementPresent('h1[data-testid="eduvault-title"]', 120000, false);
  browser.url('http://localhost').waitForElementPresent('body').waitForElementPresent(
    'h1[data-testid="eduvault-title"]',
    120000,
    false,
    // function (this: NightwatchAPI, result: NightwatchCallbackResult<void>) {
    //   console.log({ browser: this, result });
    //   this.getText('body', function (result) {
    //     console.log({ result });
    //   });
    // },
  );
  browser
    .url('http://home.localhost')
    .waitForElementPresent('body', 120000, false)
    .waitForElementPresent('h1[data-testid="eduvault-title"]', 120000, false)
    .assert.containsText('h1', 'EDUVAULT')
    .click('button[data-testid="button-try-now"]');
  browser.expect.element('a[data-testid="link-example"]').is.visible;
  browser.click('a[data-testid="link-example"]');
  // navigates to example
  browser.waitForElementVisible('img.eduvault-button', 50000);
  browser.click('img.eduvault-button');
  // navigates to app
  browser.waitForElementPresent('input[type=email]', 50000);
  browser.setValue('input[type=email]', 'example@somewhere.com');
  browser.setValue('input[type=password]', 'Password123');
  browser.click('button[type=submit]');
  // logs in
  browser.waitForElementPresent('h2[data-testid="deck-title"]', 50000);
  // starts DB and shows default deck
  browser.expect.element('h2[data-testid="deck-title"]').text.to.contain('Default Deck');
};
