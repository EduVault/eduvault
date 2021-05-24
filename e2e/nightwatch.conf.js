const HEADLESS = process.env.GITHUB_ACTIONS || process.env.HEADLESS_E2E ? true : false
module.exports =
{
  "src_folders": ["./test-build"],
  "output_folder": "./test/reports",
  "custom_assertions_path": "",
  // "globals_path": "test/globals",
  "test_settings": {
    "default": {
      "selbenium_port": 4444,
      "selenium_host": "localhost",
      "silent": false,
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
