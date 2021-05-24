const HEADLESS = process.env.GITHUB_ACTIONS || process.env.HEADLESS_E2E ? true : false
module.exports =
{
  "src_folders": ["./test-build"],
  "output_folder": "./test/reports",
  "custom_assertions_path": "",
  // "globals_path": "test/globals",
  "selenium": {
    "start_process": false,
    "server_path": "/opt/selenium/selenium-server-standalone.jar",
    "log_path": "test/reports",
    "host": "127.0.0.1",
    "port": 4444,
    "cli_args": {
      "webdriver.chrome.driver": "/opt/selenium/chromedriver-2.29"
    }
  },
  "test_settings": {
    "default": {
      "selenium_port": 4444,
      "selenium_host": "localhost",
      "silent": true,
      "desiredCapabilities": {
        "javascriptEnabled": true,
        "acceptSslCerts": true,
        "browserName": "chrome",
        "chromeOptions": {
          "args": HEADLESS ? ["headless", "no-sandbox", "disable-gpu"] : []
        }
      }
    }
  }
}
