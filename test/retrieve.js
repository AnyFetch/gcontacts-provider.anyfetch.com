'use strict';

var should = require('should');
var config = require('../config/configuration.js');
var retrieve = require('../lib/provider-google-contact/helpers/retrieve.js');

describe("Retrieve code", function () {
  it("should list contacts", function (done) {
    retrieve(config.test_refresh_token, new Date(1970, 0, 1), function(users) {
      should.exist(users[0]);
      users[0].should.have.property('name');
      done();
    });
  });

  it("should list contacts modified after specified date", function (done) {
    retrieve(config.test_refresh_token, new Date(2020, 7, 22), function(users) {
      users.should.have.lengthOf(0);
      done();
    });
  });
});
