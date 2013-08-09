var app = require('./app.js');
var readline = require('readline');
var request = require('request');
var googleapis = require('googleapis');
var keys = require('./keys');
var OAuth2Client = googleapis.OAuth2Client;


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var withLoggedClient = function(oauth2Client) {
  console.log("Access token to use: ", oauth2Client.credentials.access_token);
}

var getAccessToken = function(oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.google.com/m8/feeds'
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function(code) {

    // request access token
    oauth2Client.getToken(code, function(err, tokens) {
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      oauth2Client.credentials = tokens;

      callback(oauth2Client);
    });
  });
}

googleapis.execute(function(err, client) {
  var oauth2Client =
    new OAuth2Client(keys.CLIENT_ID, keys.CLIENT_SECRET, keys.REDIRECT_URL);

  getAccessToken(oauth2Client, withLoggedClient);
});
