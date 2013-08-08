'use strict';

var request = require('supertest'),
    app = require('../app.js');

describe("A test", function () {
  describe("GET /", function () {    
    it("should pass test", function (done) {
      var req = request(app).get('/test')
        .expect(200)
        .end(function(err, response) {
          console.log(response.body);
          done();
        });
    });
  });
});
