const HEADLESS = process.env.GITHUB_ACTIONS || process.env.HEADLESS_E2E === '1' ? true : false
const DOCKER_COMPOSE = process.env.DOCKER_COMPOSE === '1'
module.exports =
{
  "src_folders": ["./test-build"],
  "output_folder": "./test/reports",
  "custom_assertions_path": "",
  // "globals_path": "test/globals",
  "test_settings": {
    "default": {
      "selbenium_port": 4444,
      "selenium_host": DOCKER_COMPOSE ? 'selenium-hub' : "localhost",
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
