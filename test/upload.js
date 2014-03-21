'use strict';

var request = require('supertest');
var AnyFetchProvider = require('anyfetch-provider');
require('should');

var config = require('../config/configuration.js');
var serverConfig = require('../lib/');



describe("Workflow", function () {
  before(AnyFetchProvider.debug.cleanTokens);

  // Create a fake HTTP server
  var apiServer = AnyFetchProvider.debug.createTestApiServer();
  apiServer.listen(1337);
  after(function() {
    apiServer.close();
  });

  before(function(done) {
    AnyFetchProvider.debug.createToken({
      anyfetchToken: 'fake_gc_access_token',
      datas: config.test_refresh_token,
      cursor: new Date(1970)
    }, done);
  });

  it("should upload datas to AnyFetch", function(done) {
    var originalQueueWorker = serverConfig.queueWorker;
    serverConfig.queueWorker = function(task, anyfetchClient, refreshToken, cb) {
      console.log(task.url);
      task.should.have.property('url');
      task.should.have.property('id');

      originalQueueWorker(task, anyfetchClient, refreshToken, cb);
    };
    var server = AnyFetchProvider.createServer(serverConfig);

    server.queue.drain = function() {
      done();
    };

    request(server)
      .post('/update')
      .send({
        access_token: 'fake_gc_access_token',
        api_url: 'http://localhost:1337'
      })
      .expect(202)
      .end(function(err) {
        if(err) {
          throw err;
        }
      });
  });
});
