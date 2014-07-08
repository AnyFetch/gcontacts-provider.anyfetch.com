'use strict';

var app = require('./app.js');
var readline = require('readline');
var request = require('request');
var googleapis = require('googleapis');
var config = require('./config/configuration.js');
var OAuth2Client = googleapis.OAuth2Client;


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Display access and refresh tokens.
var withLoggedClient = function(oauth2Client) {
  if(!oauth2Client.credentials.refresh_token) {
    console.log("You already have a refresh token, or something went amiss. Please go to your Google Acount and remove the authorization for your app.");
  } else {
    console.log("Set this value in your GCONTACTS_TEST_REFRESH_TOKEN environment: ", oauth2Client.credentials.refresh_token);
  }

  process.exit();
};

// Retrieve a set of tokens from Google
var getAccessToken = function(oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email',
    approval_prompt: 'force',
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function(code) {

    // request access token
    oauth2Client.getToken(code, function(err, tokens) {
      if(err) {
        console.log("ERROR: ", err);
        return;
      }
      // set tokens to the client
      oauth2Client.credentials = tokens;

      callback(oauth2Client);
    });
  });
};

googleapis.execute(function(err, client) {
  var oauth2Client =
    new OAuth2Client(config.googleId, config.googleSecret, "http://localhost:8000/init/callback");

  getAccessToken(oauth2Client, withLoggedClient);
});
