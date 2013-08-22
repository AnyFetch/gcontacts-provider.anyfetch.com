// # config/configuration
// Defines application's settings

// Process some values
var node_env = process.env.NODE_ENV || "development";
var default_port = 8000;
if(node_env === "production") {
  default_port = 80;
}

// Exports configuration
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,
  mongo_url: process.env.MONGO_URL || ("mongodb://localhost/provider-google-contact-" + node_env),

  google_id: process.env.GOOGLE_CONTACTS_ID,
  google_secret: process.env.GOOGLE_CONTACTS_SECRET,
  google_callback: process.env.GOOGLE_CONTACTS_CALLBACK_URL,

  cluestr_id: process.env.GOOGLE_CONTACTS_CLUESTR_ID,
  cluestr_secret: process.env.GOOGLE_CONTACTS_CLUESTR_SECRET,
  cluestr_url: process.env.GOOGLE_CONTACTS_CLUESTR_URL,

  test_refresh_token: process.env.GOOGLE_CONTACTS_TEST_REFRESH_TOKEN
};
