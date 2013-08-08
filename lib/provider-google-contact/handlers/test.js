'use strict';

var restify = require('restify');
var googleapis = require('googleapis');


exports.test = function (req, res, next) {
  var googleapis = require('googleapis');


googleapis.discover('urlshortener', 'v1').execute(function(err, client) {
  client.urlshortener.url.get({ shortUrl: 'http://goo.gl/DdUKX' })
      .execute(function(err, result) {
        res.send(result.longUrl);
        next();
      });
  });
};
