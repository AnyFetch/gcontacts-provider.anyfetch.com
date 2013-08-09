'use strict';

var mapping = require('../helpers/mapping.js');
var retrieve = require('../helpers/retrieve.js');
var Token = require('../models/token.js');
var keys = require('../../../keys.js');
var request = require('request');
var async = require('async');

var account_upload = function(users, cb) {
  var stack = [];
  for(var i = 0; i < users.length; i += 1) {
    var user = users[i];

    stack.push(function(cb) {
      var params = {
        url: keys.CLUESTR_URL,
        form: {
          identifier:'---',
          source:'---',
          metadatas: user
        },
        headers: {
          'Authorization': 'OAuth TODO',
          'GData-Version': '3.0'
        }
      }

      if(keys.CLUESTR_URL == 'http://test/') {
        // We're running test, let's do things a little faster.
        return cb();
      }

      request.post(params, function (err, resp, body) {
        if(resp.statusCode === 401) {
          throw new Error("Wrong Authorization provided.");
        }
        cb();
      });
    });
  }

  async.parallel(stack, cb)
}

module.exports = function (cb) {
  Token.find({}, function(err, tokens) {

    var stack = [];
    for(var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];

      stack.push(function(cb) {
        // Download contacts datas, and upload them
        retrieve(token.googleTokens.access_token, function(users) {
          account_upload(users, cb);
        });
      });
    }

    async.parallel(stack, cb);
  });
}
