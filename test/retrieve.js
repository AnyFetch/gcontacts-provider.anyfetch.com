'use strict';

var request = require('supertest')
var should = require('should')
var keys = require('../keys.js')
var providerGoogleContact = require('../lib/provider-google-contact/index.js');

describe("Retrieve code", function () {
  it("should list contacts", function (done) {
    providerGoogleContact.handlers.retrieve(keys.ACCESS_TOKEN, function(users) {
      should.exist(users[0]);
      users[0].should.have.property('name');
      done();
    });
  });
});
