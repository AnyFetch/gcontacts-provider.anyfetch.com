'use strict';

var request = require('supertest')
var should = require('should')
var keys = require('../keys.js')
var retrieve = require('../lib/provider-google-contact/helpers/retrieve.js');

describe("Retrieve code", function () {
  it("should list contacts", function (done) {
    retrieve(keys.GOOGLE_TOKENS, new Date(1970, 0, 1), function(users) {
      should.exist(users[0]);
      users[0].should.have.property('name');
      done();
    });
  });
});
