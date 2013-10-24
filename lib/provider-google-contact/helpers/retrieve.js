'use strict';
/**
 * @file Retrieve contacts for the account
 */

var config = require('../../../config/configuration.js');
var mapper = require('../helpers/mapper.js');
var request = require('request');

/**
 * Use the Google refresh token to get a new accessToken,
 *
 * @param {String} refreshToken Refresh token issued by Google
 * @param {Function} cb First parameter is the error (if any), then the new accessToken (valid for one hour)
 */
var refreshAccessToken = function(refreshToken, cb) {

  // See https://developers.google.com/accounts/docs/OAuth2WebServer#refresh for details
  var params = {
    url: 'https://accounts.google.com/o/oauth2/token',
    form: {
      'refresh_token': refreshToken,
      'client_id': config.google_id,
      'client_secret': config.google_secret,
      'grant_type': 'refresh_token'
    },
    json: true
  };

  request.post(params, function (err, res) {
    if(err){
      return cb(err);
    }

    if(res.statusCode === 401){
      return cb(new Error("Access to this refresh_token has been revoked."));
    }

    cb(null, res.body.access_token);
  });
};

/**
 * Retrieve all contacts associated with this user account,
 *
 * @param {String} accessToken AccessToken to identify the account
 * @param {Date} since Retrieve contacts updated since this date
 * @param {Function} cb Callback. First parameter is the error (if any), then an array of all the contacts.
 */
var retrieveContacts = function(accessToken, since, cb) {

  // Pad n to have a length of width,
  // pad(1, 3) == 001
  var pad = function(n, width) {
    width = width || 2;
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(0) + n;
  };

  // Date, formatted as 2007-03-16T00:00:00
  var formattedDate = since.getFullYear() + '-' + pad(since.getMonth() + 1) + '-' + pad(since.getDate()) + 'T' + pad(since.getHours()) + ':' + pad(since.getMinutes()) + ':' + pad(since.getSeconds());

  // See https://developers.google.com/google-apps/contacts/v3/?csw=1#retrieving_contacts_using_query_parameters for details
  var params = {
    url: 'https://www.google.com/m8/feeds/contacts/default/full',
    qs: {
      alt: 'json',
      'max-results': 100000,
      'showdeleted': true,
      'orderby': 'lastmodified',
      'updated-min': formattedDate
    },
    headers: {
      'Authorization': 'OAuth ' + accessToken,
      'GData-Version': '3.0'
    },
    json: true
  };

  request.get(params, function (err, resp, body) {
    if(err) {
      return cb(err);
    }
    if(resp.statusCode === 401){
      return cb (new Error("Wrong Google Authorization provided."));
    }

    var contacts = body.feed.entry ? body.feed.entry.map(mapper):[];

    // Add google accessToken
    contacts.forEach(function(contact) {
      contact.accessToken = accessToken;
    });

    // Contacts is now full!
    cb(null, contacts);
  });
};

/**
 * Download all contacts from the specified Google Account.
 *
 * @param {String} refreshToken Refresh_token to identify the account
 * @param {Date} since Retrieve contacts updated since this date
 * @param {Function} cb Callback. First parameter is the error (if any), second an array of all the contacts.
 */
module.exports = function(refreshToken, since, cb) {
  refreshAccessToken(refreshToken, function(err, accessToken) {
    if(err) {
      cb(err);
    }
    
    retrieveContacts(accessToken, since, cb);
  });
};
