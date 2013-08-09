'use strict';

var request = require('supertest')
var should = require('should')
var keys = require('../keys.js')
var providerGoogleContact = require('../lib/provider-google-contact/index.js');

describe("Retrieve code", function () {
  it("should list contacts", function (done) {

    var token = new providerGoogleContact.models.Token({googleTokens: {access_token: keys.ACCESS_TOKEN}});

    token.save(function(err) {
      if(err) {
        throw new Error(err);
      }

      providerGoogleContact.handlers.retrieve(function() {}, function(accounts) {
        accounts.should.have.lengthOf(1);
        should.exist(accounts[0][0]);
        accounts[0][0].should.have.property('name');
        done();
      });
    })
  });
});
