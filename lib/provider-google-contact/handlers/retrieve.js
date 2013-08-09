'use strict';

var Token = require('../models/token.js');
var mapping = require('../helpers/mapping.js');
var async = require('async');

// Download all contacts from specified access_token
function downloadContacts(accessToken, cb) {
  
  console.log(accessToken);

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
    var users = feed.feed.entry.map(googleJsonToPojo);

    // Users is now full!
    cb(users);
  });
}


exports.download = function (cb) {
  Token.find({}, function(err, tokens) {
    // Will hold all functions to be called
    var stack = []

    for(var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      stack.push(function(cb) {
        downloadContacts(tokens.googleTokens.access_token, function(users) {
          console.log(users);
          cb();
        });
      });
    };

    async.parallel(stack, cb)
  });
}
