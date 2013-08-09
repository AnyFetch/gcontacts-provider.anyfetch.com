'use strict';

var request = require('supertest')
var should = require('should')
var async = require('async')
var providerGoogleContact = require('../lib/provider-google-contact/index.js');

describe("Retrieve code", function () {
  it("should list contacts", function (done) {
    this.timeout(5000);
    providerGoogleContact.handlers.retrieve.download(done);
  });
});
