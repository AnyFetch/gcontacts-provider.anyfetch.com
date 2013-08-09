'use strict';

var Token = require('../models/token.js');
var mapping = require('../helpers/mapping.js');
var request = require('request');
var async = require('async');

// Download all contacts from specified access_token
function downloadContacts(accessToken, cb) {
  var params = {
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
    var users = feed.feed.entry.map(mapping.googleJsonToPojo);

    // Users is now full!
    cb(users);
  });
}


// account_cb will be called with each user contacts
// final_cb will be called with all accounts.
exports.download = function (account_cb, final_cb) {
  Token.find({}, function(err, tokens) {
    // Will hold all functions to be called
    var stack = []
    var accounts = []

    for(var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      stack.push(function(cb) {
        downloadContacts(token.googleTokens.access_token, function(users) {
          accounts.push(users);
          account_cb(users);
          cb();
        });
      });
    };

    async.parallel(stack, function() {
      final_cb(accounts);
    });
  });
}
