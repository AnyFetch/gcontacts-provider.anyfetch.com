'use strict';

var request = require('supertest');
require('should');

var app = require('../app.js');

describe("GET /init/connect", function () {
  it("should redirect to Google", function (done) {
    request(app).get('/init/connect?code=123')
      .expect(302)
      .expect('Location', /google\.com/)
      .end(done);
  });

  it("should redirect to Google with callback URL", function (done) {
    request(app).get('/init/connect?code=123')
      .expect(302)
      .expect('Location', /localhost%3A8000%2Finit%2Fcallback%3Fcode%3D/)
      .end(done);
  });
});
