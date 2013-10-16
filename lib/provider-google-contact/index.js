'use strict';
/**
 * This object contains all the handlers to use for this providers
 */
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;

var config = require('../../config/configuration.js');
var retrieveContacts = require('./helpers/retrieve.js');

var initAccount = function(req, next) {
  googleapis.execute(function(err) {
    if(err) {
      return next(err);
    }

    var oauth2Client = new OAuth2Client(config.google_id, config.google_secret, config.google_callback);

    // generate consent page url for Google Contacts access, even when user is not connected (offline)
    var redirectUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.google.com/m8/feeds'
    });

    redirectUrl += '&state=' + req.params.code;

    next(null, {code: req.params.code}, redirectUrl);
  });
};

var connectAccountRetrievePreDatasIdentifier = function(req, next) {
  if(!req.params.state) {
    return next("State parameter left out of query.");
  }

  next(null, {'datas.code': req.params.state});
};

var connectAccountRetrieveAuthDatas = function(req, preDatas, next) {

  console.log("1", config);
  var oauth2Client = new OAuth2Client(config.google_id, config.google_secret, config.google_callback);
  console.log("2");
  // request tokens set
  oauth2Client.getToken(preDatas.code, function(err, tokens) {
    console.log("3", err);
    if(err) {
      return next(new Error(err));
    }

    // Set tokens to the client
    // Not really useful in our case.
    oauth2Client.credentials = tokens;

    console.log("4");
    next(null, tokens.refresh_token);
  });
};

var updateAccount = function(datas, cursor, next) {
  // Retrieve all contacts since last call
  //retrieveContacts
  next();
};

var queueWorker = function(task, cb) {
  // Upload document
  cb();
};

module.exports = {
  initAccount: initAccount,
  connectAccountRetrievePreDatasIdentifier: connectAccountRetrievePreDatasIdentifier,
  connectAccountRetrieveAuthDatas: connectAccountRetrieveAuthDatas,
  updateAccount: updateAccount,
  queueWorker: queueWorker,

  cluestrAppId: config.cluestr_id,
  cluestrAppSecret: config.cluestr_secret,
  connectUrl: 'http://localhost:8000/init/connect'
};
