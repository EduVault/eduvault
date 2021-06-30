// eslint-disable-next-line camelcase
const src_folders = ["./test-build"];
const webdriver = {
  start_process: true,
  server_path: "node_modules/.bin/chromedriver",
  port: 9515
};

const desiredCapabilities = {
  browserName: "chrome",
  acceptSslCerts: true,
  acceptInsecureCerts: true,
  javascriptEnabled: true,
}

const headed = {
  src_folders,
  webdriver,
  test_settings: {
    default: {
      desiredCapabilities
    }
  }
};

const headless = {
  src_folders,
  webdriver,
  test_settings: {
    default: {
      desiredCapabilities: {
        ...desiredCapabilities,
        chromeOptions: {
          args: ["--headless", "--no-sandbox", "--ignore-certificate-errors"]
        }
      }
    }
  }
};

const config = !!process.env.GITHUB_ACTIONS || process.env.HEADLESS_E2E === '1' ? headless : headed;
module.exports = config;
