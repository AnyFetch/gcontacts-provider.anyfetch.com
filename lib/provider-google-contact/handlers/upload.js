'use strict';

var request = require('request');
var async = require('async');

var retrieve = require('../helpers/retrieve.js');
var Token = require('../models/token.js');
var keys = require('../../../keys.js');
var CluestrOauth = require('../helpers/cluestr-oauth.js');
var cluestrOauth = new CluestrOauth(keys.CLUESTR_ID, keys.CLUESTR_SECRET);


// Upload `contacts` onto cluestr, then call `cb`.
var account_upload = function(contacts, accessToken, cb) {
  cluestrOauth.setAccessToken(accessToken);

  var stack = contacts.map(function(contact) {
    return async.apply(cluestrOauth.sendDocument, contact);
  });

  async.parallel(stack, cb);
};


// Sync all contacts from all users to Cluestr.
// Note: only the contacts modified since last run will be uploaded
module.exports = function (cb) {
  var updateTokenAccess = function(token, date, cb) {
    token.lastAccess = date;
    token.save(function(err) {
      if(err) {
        throw err;
      }

      cb();
    });
  };

  Token.find({}, function(err, tokens) {
    if(err) {
      throw err;
    }

    // Build query stack
    var stack = [];
    tokens.forEach(function(token) {
      stack.push(function(cb) {
        // Download contacts datas, and upload them
        retrieve(token.googleTokens, token.lastAccess, function(users) {
          // Once the users have been retrieved,
          // Store the current date -- we'll write this onto token.lastAccess if the upload runs smoothly.
          var currentDate = new Date();
          account_upload(users, function() {
            updateTokenAccess(token, currentDate, cb);
          });
        });
      });
    });

    // Real run
    async.parallel(stack, cb);
  });
};
