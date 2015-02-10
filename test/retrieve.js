'use strict';

var should = require('should');

var config = require('../config/configuration.js');
var update = require('../lib/update.js');


describe("Retrieve contacts", function() {
  var connectionsPushed = [];

  var fakeQueue = {
    addition: {
      push: function(contact) {
        connectionsPushed.push(contact);
      },
      deletion: {
        push: function() {}
      },
    }
  };

  var fakeServiceData = {
    tokens: {
      refresh_token: config.testRefreshToken,
      access_token: config.testAccessToken,
    },
    callbackUrl: 'http://localhost:8000/init/callback',
  };

  it("should list contacts modified after specified date", function(done) {
    update(fakeServiceData, new Date(2022, 1, 1), fakeQueue, function(err) {
      connectionsPushed.length.should.equal(0);
      done(err);
    });
  });


  it('should list all contacts', function(done) {
    update(fakeServiceData, new Date(1970, 1, 1), fakeQueue, function(err) {
      connectionsPushed.length.should.be.above(0);
      connectionsPushed[0].should.have.property('id');
      done(err);
    });
  });
});
