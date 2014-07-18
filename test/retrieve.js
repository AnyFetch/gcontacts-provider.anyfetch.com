'use strict';

var should = require('should');
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;
var config = require('../config/configuration.js');
var retrieve = require('../lib/helpers/retrieve.js');

describe("Retrieve code", function () {
  it("should list contacts", function (done) {
    var oauth2Client = new OAuth2Client(config.googleId, config.googleSecret, config.providerUrl + "/init/callback");
    oauth2Client.refreshToken_(config.testRefreshToken, function(err, tokens) {
      if(err) {
        return done(err);
      }

      retrieve(tokens.access_token, new Date(1970, 0, 1), function(err, contacts) {
        if(err) {
          throw err;
        }

        should.exist(contacts[0]);
        contacts[0].should.have.property('id', 'http://www.google.com/m8/feeds/contacts/test.cluestr%40gmail.com/base/587c929509de3a0a');
        contacts[0].should.have.property('name', 'Matthieu Bacconnier');
        contacts[0].should.have.property('given_name', 'Matthieu');
        contacts[0].should.have.property('family_name', 'Bacconnier');
        contacts[0].should.have.property('address');

        done();
      });
    });
  });

  it("should list contacts modified after specified date", function (done) {
    var oauth2Client = new OAuth2Client(config.googleId, config.googleSecret, config.providerUrl + "/init/callback");
    oauth2Client.refreshToken_(config.testRefreshToken, function(err, tokens) {
      if(err) {
        return done(err);
      }

      retrieve(tokens.access_token, new Date(2020, 7, 22), function(err, contacts) {
        if(err) {
          throw err;
        }

        contacts.should.have.lengthOf(0);
        done();
      });
    });
  });
});
