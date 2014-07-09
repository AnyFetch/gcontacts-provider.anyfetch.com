/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();

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
  mongoUrl: process.env.MONGOLAB_URI,
  redisUrl: process.env.REDISCLOUD_URL,

  googleId: process.env.GCONTACTS_ID,
  googleSecret: process.env.GCONTACTS_SECRET,
  
  appId: process.env.GCONTACTS_ANYFETCH_ID,
  appSecret: process.env.GCONTACTS_ANYFETCH_SECRET,

  providerUrl: process.env.PROVIDER_URL,

  testRefreshToken: process.env.GCONTACTS_TEST_REFRESH_TOKEN
};
