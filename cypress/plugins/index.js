/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const APP_SECRET = process.env.APP_SECRET;
console.log({ APP_SECRET });
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  config.env.APP_SECRET = APP_SECRET;

  // do not forget to return the changed config object!
  return config;
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
};
