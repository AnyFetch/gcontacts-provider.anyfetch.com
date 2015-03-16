'use strict';

var googleapis = require('googleapis');
var async = require('async');
var TokenError = require('anyfetch-provider').TokenError;

var config = require('../config/configuration.js');
var retrieveContacts = require('./helpers/retrieve.js');

module.exports = function updateAccount(serviceData, cursor, queues, cb) {
  // Retrieve all contacts since last call
  var newCursor = new Date();
  // Cause Google use UTC time
  newCursor.setMinutes(newCursor.getMinutes() + newCursor.getTimezoneOffset());

  async.waterfall([
    function refreshTokens(cb) {
      var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, serviceData.callbackUrl);
      oauth2Client.refreshToken_(serviceData.tokens.refresh_token, function(err, tokens) {
        if(err) {
          if(err.toString().match(/token/i)) {
            return cb(new TokenError());
          }
          return cb(err);
        }

        if(typeof tokens !== 'object' || !tokens.access_token) {
          return cb(new TokenError());
        }

        tokens.refresh_token = serviceData.tokens.refresh_token;
        serviceData.tokens = tokens;
        retrieveContacts(serviceData.tokens.access_token, cursor, cb);
      });
    },
    function handleContacts(contacts, cb) {
      if(contacts) {
        contacts.forEach(function(contact) {
          contact.identifier = contact.url;
          contact.title = contact.url;
          if(!contact.deleted && contact.id) {
            queues.addition.push(contact);
          }
          else if(cursor && contact.id) {
            queues.deletion.push(contact);
          }
        });
      }

      cb(null, newCursor, serviceData);
    }
  ], cb);
};
