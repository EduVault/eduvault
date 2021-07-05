import { NightwatchAPI, NightwatchBrowser, NightwatchCallbackResult } from 'nightwatch';
const serverTestEnv = process.env.TEST === '1';
console.log({ serverTestEnv, 'process.env.TEST': process.env.TEST });

export const Base = (browser: NightwatchBrowser)=>{
  // check nightwatch is working
  // browser.url('https://google.com').waitForElementPresent('body').assert.titleContains('Google');
  // check base url working

  // first call need to wait, cause app might be booting up
  // browser
  // seems that on the CI headless browser they don't like URLs with one dot?
  //   .url('http://localhost')
  //   .waitForElementPresent('body', 120000, false)
  //   .waitForElementPresent('h1[data-testid="eduvault-title"]', 120000, false, () =>
  //     console.log('checking root'),
  //   )

  browser
    .url('http://home.localhost')
    .waitForElementPresent('body')
    .waitForElementPresent('h1[data-testid="eduvault-title"]', 120000, false, () =>
      console.log('checking home'),
    );
  // function (this: NightwatchAPI, result: NightwatchCallbackResult<void>) {
  //   console.log({ browser: this, result });
  //   this.getText('body', function (result) {
  //     console.log({ result });
  //   });
  // },
  // navigate to app, example, and api.

  browser
    .url('http://example.localhost')
    .waitForElementVisible('img.eduvault-button', 50000, false, () =>
      console.log('checking example'),
    )
    .waitForElementPresent('a[href^="http://app.localhost"]', 50000, false);
  browser
    .url('http://app.localhost')
    .waitForElementPresent('input[type=email]', 50000, false, () => console.log('checking app'));
}

export const HappyPath = (browser: NightwatchBrowser) => {

  browser
    .url('http://home.localhost')
    .waitForElementPresent('body', 120000, false)
    .waitForElementPresent('h1[data-testid="eduvault-title"]', 120000, false)
    .assert.containsText('h1', 'EDUVAULT')
    .click('button[data-testid="button-try-now"]')
  .expect.element('a[data-testid="link-example"]').is.visible
  browser.click('a[data-testid="link-example"]')  // navigates to example
  .waitForElementVisible('img.eduvault-button', 50000)
  .waitForElementPresent('a[href^="http://app.localhost"]', 100000);

  // renavigate manually to avoid ERR_TOO_MANY_REDIRECTS
  browser
    .url('http://example.localhost')
    .waitForElementPresent('a[href^="http://app.localhost"]', 100000)
  .click('img.eduvault-button')

  // navigates to app
  .waitForElementPresent('input[type=email]', 200000)
  .setValue('input[type=email]', 'example@somewhere.com')
  .setValue('input[type=password]', 'Password123')
  .click('button[type=submit]')
  // logs in
  .waitForElementPresent('h2[data-testid="deck-title"]', 200000)
  // starts DB and shows default deck
  .expect.element('h2[data-testid="deck-title"]').text.to.contain('Default Deck')
};
