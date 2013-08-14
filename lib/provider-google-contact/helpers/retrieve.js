'use strict';

var Token = require('../models/token.js');
var mapper = require('../helpers/mapper.js');
var request = require('request');
var async = require('async');


// Download all contacts
module.exports = function(tokens, cb) {
  var params = {
    url: 'https://www.google.com/m8/feeds/contacts/default/full',
    qs: {
      alt: 'json',
      'max-results': 100000,
      'orderby': 'lastmodified'
    },
    headers: {
      'Authorization': 'OAuth ' + tokens.access_token,
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
