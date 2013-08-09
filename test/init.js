'use strict';

var request = require('supertest')
var should = require('should')
var async = require('async')
var app = require('../app.js');
var keys = require('../keys.js');
var Browser = require('zombie');
var Token = require('../lib/provider-google-contact/models/token.js');

describe("Init APIs endpoints", function () {
  describe("GET /init/connect", function () {    
    it("should redirect to Google", function (done) {
      var req = request(app).get('/init/connect')
        .expect(302)
        .expect('Location', /google\.com/)
        .end(done);
    });
  });

  // describe("GET /init/callback", function () {    
  //   it("should be called after Google consentment page", function (done) {
  //     var browser = new Browser();
  //     var googleUrl;

  //     this.timeout(5000);
  //     async.auto({
  //       retrieveGoogleLocation: function(cb) {
  //         var req = request(app).get('/init/connect')
  //           .expect(302)
  //           .expect('Location', /google\.com/)
  //           .end(function(err, res) {
  //           googleUrl = res.headers.location;
  //           cb();
  //         });
  //       },
  //       downloadGooglePage: ['retrieveGoogleLocation', function(cb) {
  //         browser.visit(googleUrl, cb);
  //       }],
  //       loginToGoogle: ['downloadGooglePage', function(cb) {
  //         browser.success.should.equal(true);

  //         browser
  //           .fill("#Email", keys.GOOGLE_LOGIN)
  //           .fill("#Passwd", keys.GOOGLE_PASSWORD)
  //           .pressButton("#signIn", cb);
  //       }],
  //       consentToGoogle: ['loginToGoogle', function(cb) {
  //         browser.success.should.equal(true);
  //         browser.pressButton("#submit_approve_access", cb);
  //         cb();
  //       }],
  //       test: ['consentToGoogle', function(cb) {
  //         cb();
  //         // To this point, a token should have been created.
  //         Token.count({}, function(err, count) {
  //           console.log(count);
  //           cb();
  //         })
  //       }]
  //     }, done);
  //   });
  // });

});
