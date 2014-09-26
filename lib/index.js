'use strict';
/**
 * This object contains all the handlers to use for this providers
 */
var googleapis = require('googleapis');
var rarity = require('rarity');
var async = require('async');
var CancelError = require('anyfetch-provider').CancelError;

var config = require('../config/configuration.js');
var retrieveContacts = require('./helpers/retrieve.js');
var uploadContact = require('./helpers/upload.js');

var redirectToService = function(callbackUrl, cb) {
  var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, callbackUrl);

  // generate consent page url for Google Contacts access, even when user is not connected (offline)
  var redirectUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/contacts.readonly', 'https://www.googleapis.com/auth/userinfo.email'],
    approval_prompt: 'force', // Force resending a refresh_token
  });

  cb(null, redirectUrl, {redirectUrl: redirectUrl, callbackUrl: callbackUrl});
};

var retrieveTokens = function(reqParams, storedParams, cb) {
  if(reqParams.error === "access_denied") {
    return cb(new CancelError());
  }

  async.waterfall([
    function getToken(cb) {
      var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, storedParams.callbackUrl);
      oauth2Client.getToken(reqParams.code, rarity.carryAndSlice([oauth2Client], 3, cb));
    },
    function getUserInfo(oauth2Client, tokens, cb) {
      oauth2Client.credentials = tokens;
      googleapis.oauth2('v2').userinfo.get({auth: oauth2Client}, rarity.carryAndSlice([tokens], 3, cb));
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
  // Cause Google use UTC time
  newCursor.setMinutes(newCursor.getMinutes() + newCursor.getTimezoneOffset());

  async.waterfall([
    function refreshTokens(cb) {
      var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, serviceData.callbackUrl);
      oauth2Client.refreshToken_(serviceData.tokens.refresh_token, rarity.slice(2, cb));
    },
    function callRetrieveContact(tokens, cb) {
      tokens.refresh_token = serviceData.tokens.refresh_token;
      serviceData.tokens = tokens;
      retrieveContacts(serviceData.tokens.access_token, cursor, cb);
    },
    function handleContacts(contacts, cb) {
      if(contacts) {
        contacts.forEach(function(contact) {
          contact.identifier = contact.url;
          contact.title = contact.url;
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
};

var additionQueueWorker = function(job, cb) {
  uploadContact(job.task, job.anyfetchClient, job.serviceData.tokens.access_token, cb);
};

var deletionQueueWorker = function(job, cb) {
  job.anyfetchClient.deleteDocumentByIdentifier(job.task.url, rarity.slice(1, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  }));
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
