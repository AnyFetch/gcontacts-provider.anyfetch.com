'use strict';

var restify = require('restify');
var googleapis = require('googleapis');
var config = require('../../../config/configuration.js');
var Token = require('../models/token.js');
var OAuth2Client = googleapis.OAuth2Client;

// This handler generates the appropriate URL and redirects the user to Google consentment page.
exports.connect = function (req, res, next) {
  googleapis.execute(function(err) {
    if(err) {
      throw err;
    }

    if(!req.params.code) {
      return next(new Error("Missing code parameter."));
    }

    var oauth2Client = new OAuth2Client(config.google_id, config.google_secret, config.google_callback);

    // generate consent page url for Google Contacts access, even when user is not connected (offline)
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.google.com/m8/feeds'
    });

    // Add cluestr code token
    url += '&state=' + req.params.code;

    // Redirect to Google page
    res.send(302, null, {
      Location: url
    });

    next();
  });
};

// The user is redirected to this handler after giving consent.
// The GET parameter code will allow us to retrieve access_token and refresh_token for the user.
exports.callback = function (req, res, next) {
  if(!req.params.code) {
    return next(new restify.InternalServerError("Missing code parameter."));
  }

  var oauth2Client = new OAuth2Client(config.google_id, config.google_secret, config.google_callback);
  // request tokens set
  oauth2Client.getToken(req.params.code, function(err, tokens) {
    if(err) {
      console.log("err", err, req.params.code);
      return next(err);
    }

    // Set tokens to the client
    oauth2Client.credentials = tokens;

    // Save for future access
    var token = new Token({
      cluestrToken: req.params.state,
      googleToken: tokens.refresh_token
    });

    token.save(function(err) {
      if(err) {
        return next(err);
      }

      // Redirect to Cluestr page
      res.send(302, null, {
        Location: 'http://cluestr.com/app'
      });

      next();
    });
  });
};
