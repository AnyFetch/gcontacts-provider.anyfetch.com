'use strict';
/**
 * @file Retrieve contacts for the account
 */

var mapper = require('./mapper.js');
var request = require('request');
var async = require('async');
var rarity = require('rarity');

/**
 * Retrieve all contacts associated with this user account,
 *
 * @param {String} accessToken AccessToken to identify the account
 * @param {Date} since Retrieve contacts updated since this date
 * @param {Function} cb Callback. First parameter is the error (if any), then an array of all the contacts.
 */
var retrieveContacts = function(accessToken, since, cb) {
  if(!since) {
    since = new Date(1970);
  }

  // Pad n to have a length of width,
  // pad(1, 3) == 001
  var pad = function(n, width) {
    width = width || 2;
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(0) + n;
  };

  // Date, formatted as 2007-03-16T00:00:00
  var formattedDate = since.getFullYear() + '-' + pad(since.getMonth() + 1) + '-' + pad(since.getDate()) + 'T' + pad(since.getHours()) + ':' + pad(since.getMinutes()) + ':' + pad(since.getSeconds());

  async.waterfall([
    function requestContacts(cb) {
      // See https://developers.google.com/google-apps/contacts/v3/?csw=1#retrieving_contacts_using_query_parameters for details
      var params = {
        url: 'https://www.google.com/m8/feeds/contacts/default/full',
        qs: {
          alt: 'json',
          'max-results': 100000,
          'showdeleted': true,
          'orderby': 'lastmodified',
          'sortorder': 'descending',
          'updated-min': formattedDate
        },
        headers: {
          'Authorization': 'OAuth ' + accessToken,
          'GData-Version': '3.0'
        },
        json: true
      };

      request.get(params, cb);
    },
    function getContacts(resp, body, cb) {
      if(resp.statusCode === 401){
        return cb(new Error("Wrong Google Authorization provided."));
      }

      cb(null, body.feed && body.feed.entry ? body.feed.entry.map(mapper) : []);
    },
    function requestGroups(contacts, cb) {
      var params = {
        url: 'https://www.google.com/m8/feeds/groups/default/full',

        qs: {
          alt: 'json'
        },
        headers: {
          'Authorization': 'OAuth ' + accessToken,
          'GData-Version': '3.0'
        },
        json: true
      };

      request.get(params, rarity.carry([contacts], cb));
    },
    function getGroups(contacts, resp, body, cb) {
      if(resp.statusCode === 401){
        return cb(new Error("Wrong Google Authorization provided."));
      }

      var groups = {};
      (body.feed && body.feed.entry ? body.feed.entry : []).forEach(function(r) {
        groups[r.id['$t']] = r.title['$t'];
      });

      cb(null, contacts, groups);
    },
    function associateContactsAndGroups(contacts, groups, cb) {
      contacts.forEach(function(contact) {
        if(contact.groups) {
          contact.groups = contact.groups.map(function(id) {
            return groups[id];
          });
        }
      });

      cb(null, contacts);
    }
  ], cb);
};

/**
 * Download all contacts from the specified Google Account.
 *
 * @param {String} refreshToken Refresh_token to identify the account
 * @param {Date} since Retrieve contacts updated since this date
 * @param {Function} cb Callback. First parameter is the error (if any), second an array of all the contacts.
 */
module.exports = retrieveContacts;
