'use strict';
/**
 * This object contains all the handlers to use for this providers
 */
var googleapis = require('googleapis');
var rarity = require('rarity');
var async = require('async');
var OAuth2Client = googleapis.OAuth2Client;

var config = require('../config/configuration.js');
var retrieveContacts = require('./helpers/retrieve.js');
var uploadContact = require('./helpers/upload.js');

var redirectToService = function(callbackUrl, cb) {
  googleapis.execute(function(err) {
    if(err) {
      return cb(err);
    }

    var oauth2Client = new OAuth2Client(config.googleId, config.googleSecret, callbackUrl);

    // generate consent page url for Google Contacts access, even when user is not connected (offline)
    var redirectUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email',
      approval_prompt: 'force', // Force resending a refresh_token
    });

    cb(null, redirectUrl, {redirectUrl: redirectUrl, callbackUrl: callbackUrl});
  });
};

var retrieveTokens = function(reqParams, storedParams, cb) {
  async.waterfall([
    function getClient(cb) {
      googleapis.discover('oauth2', 'v2').execute(cb);
    },
    function getToken(client, cb) {
      var oauth2Client = new OAuth2Client(config.googleId, config.googleSecret, storedParams.callbackUrl);
      oauth2Client.getToken(reqParams.code, rarity.carryAndSlice([oauth2Client, client], 4, cb));
    },
    function getUserInfo(oauth2Client, client, tokens, cb) {
      oauth2Client.credentials = tokens;
      client.oauth2.userinfo.get().withAuthClient(oauth2Client).execute(rarity.carryAndSlice([tokens], 3, cb));
    },
    function callFinalCb(tokens, data, cb) {
      cb(null, data.email, {tokens: tokens, callbackUrl: storedParams.callbackUrl});
    }
  ], cb);
};

var updateAccount = function(serviceData, cursor, queues, cb) {
  // Retrieve all contacts since last call
  if(!cursor) {
    cursor = new Date(1970);
  }
  var newCursor = new Date();

  async.waterfall([
    function refreshTokens(cb) {
      var oauth2Client = new OAuth2Client(config.googleId, config.googleSecret, serviceData.callbackUrl);
      oauth2Client.refreshToken_(serviceData.tokens.refresh_token, rarity.slice(2, cb));
    },
    function callRetrieveContact(tokens, cb) {
      serviceData.tokens = tokens;
      retrieveContacts(serviceData.tokens.access_token, cursor, cb);
    },
    function handleContacts(contacts, cb) {
      if(contacts) {
        contacts.forEach(function(contact) {
          if(contact.deleted) {
            queues.deletion.push(contact);
          }
          else {
            queues.addition.push(contact);
          }
        });
      }

      cb(null, newCursor, serviceData);
    }
  ], cb);
  /*retrieveContacts(serviceData.tokens.refresh_token, cursor, function(err, contacts) {
    if(contacts) {
      contacts.forEach(function(contact) {
        if(contact.deleted) {
          queues.deletion.push(contact);
        }
        else {
          queues.addition.push(contact);
        }
      });
    }

    var oauth2Client = new OAuth2Client(config.googleId, config.googleSecret, serviceData.callbackUrl);
    oauth2Client.refreshToken_(serviceData.tokens.refresh_token, function(err, tokens) {
      serviceData.tokens = tokens;
      cb(null, newCursor, serviceData);
    });
  });*/
};

var additionQueueWorker = function(job, cb) {
  uploadContact(job.task, job.anyfetchClient, job.serviceData.tokens.access_token, cb);
};

var deletionQueueWorker = function(job, cb) {
  job.anyfetchClient.deleteDocumentByIdentifier(job.task.url, rarity.slice(1, cb));
};

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },
  updateAccount: updateAccount,
  workers: {
    addition: additionQueueWorker,
    deletion: deletionQueueWorker
  },

  config: config
};
