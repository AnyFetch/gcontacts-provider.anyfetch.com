'use strict';

var googleapis = require('googleapis');
var rarity = require('rarity');
var async = require('async');

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
      oauth2Client.refreshToken_(serviceData.tokens.refresh_token, rarity.slice(2, cb));
    },
    function callRetrieveContact(tokens, cb) {
      if(typeof tokens !== 'object' || !tokens.access_token) {
        return cb(new Error("Can't refresh tokens"));
      }

      tokens.refresh_token = serviceData.tokens.refresh_token;
      serviceData.tokens = tokens;
      retrieveContacts(serviceData.tokens.access_token, cursor, cb);
    },
    function handleContacts(contacts, cb) {
      if(contacts) {
        contacts.forEach(function(contact) {
          contact.identifier = contact.url;
          contact.title = contact.url;
          if(!contact.deleted) {
            queues.addition.push(contact);
          }
          else if(cursor) {
            queues.deletion.push(contact);
          }
        });
      }

      cb(null, newCursor, serviceData);
    }
  ], cb);
};
