'use strict';

var mapping = require('../helpers/mapping.js');
var retrieve = require('../helpers/retrieve.js');
var keys = require('../../keys.js');
var request = require('request');
var async = require('async');

account_upload = function(users, cb) {
  var stack = [];
  for(var i = 0; i < users.length; i += 1) {
    var user = users[i];

    stack.push(function(cb) {
      var params = {
        form: {
          identifier:'---',
          source:'---',
          metadatas: user
        },
        headers: {
          'Authorization': 'OAuth ' + accessToken,
          'GData-Version': '3.0'
        }
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
        retrieve(accessToken, function(users) {
          account_upload(users, cb);
        });
      });
    }

    async.parallel(stack, cb);
  });
}
