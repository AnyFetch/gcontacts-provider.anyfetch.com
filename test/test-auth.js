/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var readline = require('readline');
var request = require('request');
var googleapis = require('googleapis');
var keys = require('../keys');
var OAuth2Client = googleapis.OAuth2Client;

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = keys.CLIENT_ID;
var CLIENT_SECRET = keys.CLIENT_SECRET;
var REDIRECT_URL = keys.REDIRECT_URL;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getAccessToken(oauth2Client, callback) {
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
      callback && callback();
    });
  });
}

function getUserContacts(accessToken) {
  params = {
    url: 'https://www.google.com/m8/feeds/contacts/default/full',
    qs: {
      alt: 'json',
      'max-results': 1000,
      'orderby': 'lastmodified'
    },
    headers: {
      'Authorization': 'OAuth ' + accessToken,
      'GData-Version': '3.0'
    }
  }

  request.get(params, function (err, resp, body) {
    if(resp.statusCode === 401){
      throw new Error("Wrong Authorization provided.");
    }

    var feed = JSON.parse(body);
    var users = feed.feed.entry.map(function (c) {
      var r = {};

      if(c['gd$name']){
        if(c['gd$name']['gd$fullName']) {
          r.name = c['gd$name']['gd$fullName']['$t'];
        }
        if(c['gd$name']['gd$givenName']) {
          r.given_name = c['gd$name']['gd$givenName']['$t'];
        }
        if(c['gd$name']['gd$familyName']) {
          r.family_name = c['gd$name']['gd$familyName']['$t'];
        }
      }

      if (c['gd$email']) {
        r.emails = c['gd$email'].map(function(m) {
          return m['address'];
        });
      }

      if(c['gd$phoneNumber']) {
        r.phones = c['gd$phoneNumber'].map(function(p) {
          return p['$t'];
        });
      }

      if(c['gd$im']) {
        r.im = c['gd$im'].map(function(p) {
          var hashIndex = p['protocol'].lastIndexOf('#')
          return {
            'address': p['address'],
            'protocol': p['protocol'].substr(hashIndex+1)
          };
        });
      }

      if (c['gContact$birthday']) {
        r.birthday = new Date(c['gContact$birthday']['when']);
      }

      return r;
    });

    // Users is now full!
    console.log(users);
  });
}

// load google plus v1 API resources and methods
googleapis.execute(function(err, client) {

  var oauth2Client =
    new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

  // retrieve an access token
  getAccessToken(oauth2Client, function() {
    getUserContacts(oauth2Client.credentials.access_token);
  });

});
