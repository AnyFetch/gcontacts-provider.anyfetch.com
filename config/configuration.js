/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// node_env can either be "development" or "production"
var node_env = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var default_port = 8000;
if(node_env === "production") {
  default_port = 80;
}

// Exports configuration for use by app.js
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,
  workers: process.env.WORKERS || 1,

  google_id: process.env.GCONTACTS_ID,
  google_secret: process.env.GCONTACTS_SECRET,
  google_callback: process.env.GCONTACTS_CALLBACK_URL,

  connect_url: process.env.GCONTACTS_CONNECT_URL,
  anyfetch_id: process.env.GCONTACTS_ANYFETCH_ID,
  anyfetch_secret: process.env.GCONTACTS_ANYFETCH_SECRET,

  test_refresh_token: process.env.GCONTACTS_TEST_REFRESH_TOKEN
};
