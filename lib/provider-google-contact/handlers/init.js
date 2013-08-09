'use strict';

var restify = require('restify');
var googleapis = require('googleapis');
var keys = require('../../../keys');
var Token = require('../models/token.js');
var OAuth2Client = googleapis.OAuth2Client;

exports.connect = function (req, res, next) {
  // This handler generates the appropriate URL and redirects the user to Google consentment page.
  googleapis.execute(function(err, client) {

    var oauth2Client = new OAuth2Client(keys.GOOGLE_ID, keys.GOOGLE_SECRET, keys.GOOGLE_URL);

    // generate consent page url
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.google.com/m8/feeds'
    });

    // Redirect to Google page
     res.send(302, null, {
      Location: url
    });

    next();
  });
};

exports.callback = function (req, res, next) {
  if(!req.params.code) {
    next(new restify.InternalServerError("Missing code parameter."));
  }

  var code = req.params.code;
  var oauth2Client = new OAuth2Client(keys.GOOGLE_ID, keys.GOOGLE_SECRET, keys.GOOGLE_URL);

  // request access token
  oauth2Client.getToken(code, function(err, tokens) {
    // Set tokens to the client
    // TODO: remove?
    oauth2Client.credentials = tokens;

    // Save for future access
    var token = new Token({ googleTokens: tokens });
    token.save(function(err) {
      if(err) {
        next(err);
      }

      next();
    });
  });
}
