'use strict';

var Token = require('../models/token.js');
var keys = require('../../../keys.js');
var mapper = require('../helpers/mapper.js');
var request = require('request');
var async = require('async');

var refreshAccessToken = function(refresh_token, cb) {
  var params = {
    url: 'https://accounts.google.com/o/oauth2/token',
    form: {
      'refresh_token': refresh_token,
      'client_id': keys.GOOGLE_ID,
      'client_secret': keys.GOOGLE_SECRET,
      'grant_type': 'refresh_token'
    },
    json: true
  }

  request.post(params, function (err, resp, body) {
    if(err){
      throw new Error(err);
    }
    if(resp.statusCode === 401){
      throw new Error("Access to this refresh_token has been revoked.");
    }

    cb(resp.body.access_token);
  });
}

var retrieveContacts = function(access_token, since, cb) {
  var pad = function(n, width) {
    width = width || 2;
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(0) + n;
  }

  // Date, formatted as 2007-03-16T00:00:00
  var formattedDate = since.getFullYear() + '-' + pad(since.getMonth() + 1) + '-' + pad(since.getDate()) + 'T' + pad(since.getHours()) + ':' + pad(since.getMinutes()) + ':' + pad(since.getSeconds())

  var params = {
    url: 'https://www.google.com/m8/feeds/contacts/default/full',
    qs: {
      alt: 'json',
      'max-results': 100000,
      'orderby': 'lastmodified',
      'updated-min': formattedDate
    },
    headers: {
      'Authorization': 'OAuth ' + access_token,
      'GData-Version': '3.0'
    }
  }

  request.get(params, function (err, resp, body) {
    if(resp.statusCode === 401){
      throw new Error("Wrong Authorization provided.");
    }

    var feed = JSON.parse(body);
    var users = feed.feed.entry.map(mapper);

    // Users is now full!
    cb(users);
  });
}

// Download all contacts
module.exports = function(tokens, since, cb) {
  refreshAccessToken(tokens.refresh_token, function(access_token) {
    retrieveContacts(access_token, since, cb);
  })
}
