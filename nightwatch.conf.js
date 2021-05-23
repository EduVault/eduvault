// eslint-disable-next-line camelcase
const src_folders = ["test-build"];
const webdriver = {
  start_process: true,
  server_path: "node_modules/.bin/chromedriver",
  port: 9515
};

const headed = {
  src_folders,
  webdriver,
  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: "chrome"
      }
    }
  }
};

const headless = {
  src_folders,
  webdriver,
  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          args: ["--headless", "--no-sandbox"]
        }
      }
    }
  }
};

const config = process.env.GITHUB_ACTIONS ? headless : headed;
module.exports = config;
