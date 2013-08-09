'use strict';

var request = require('supertest'),
    app = require('../app.js');

describe("Init APIs endpoints", function () {
  describe("GET /init/connect", function () {    
    it("should redirect to Google", function (done) {
      var req = request(app).get('/init/connect')
        .expect(302)
        .expect('Location', /google\.com/)
        .end(done);
    });
  });
});
