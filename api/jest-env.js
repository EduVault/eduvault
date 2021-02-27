const Environment = require('jest-environment-node');
// const fetch = require('isomorphic-fetch');
/**
 * A custom environment to set the TextEncoder that is required by Textile js.
 * add --env=./jest-env.js to jest call in package.json script
 */
module.exports = class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup();
    // this.global.fetch = fetch;
    if (typeof this.global.TextEncoder === 'undefined') {
      const { TextEncoder } = require('util');
      this.global.TextEncoder = TextEncoder;
    }
    if (typeof this.global.TextDecoder === 'undefined') {
      const { TextDecoder } = require('util');
      this.global.TextDecoder = TextDecoder;
    }
  }
};
