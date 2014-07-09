'use strict';

var request = require('supertest');
var AnyFetchProvider = require('anyfetch-provider');
var Anyfetch = require('anyfetch');
var sinon = require('sinon');
require('should');

var config = require('../config/configuration.js');
var serverConfig = require('../lib/');

describe("Workflow", function () {
  before(AnyFetchProvider.debug.cleanTokens);

  // Create a fake HTTP server
  Anyfetch.setApiUrl('http://localhost:1337');
  var apiServer = Anyfetch.createMockServer();
  apiServer.listen(1337);

  before(function(done) {
    AnyFetchProvider.debug.createToken({
      anyfetchToken: 'fake_gc_access_token',
      data: {refresh_token: config.testRefreshToken},
      cursor: new Date(1970)
    }, done);
  });

  it("should upload data to AnyFetch", function(done) {
    var spyPost = null;

    var originalQueueWorker = serverConfig.workers.addition;
    serverConfig.workers.addition = function(job, cb) {
      function checkSpy() {
        if(spyPost && spyPost.callCount === 1) {
          spyPost.callCount.should.eql(1);
          spyPost.restore();
          done();
        }
        else {
          setTimeout(checkSpy, 100);
        }
      }

      if(job.task._special) {
        setTimeout(checkSpy, 500);
        return cb(null);
      }

      spyPost = sinon.spy(job.anyfetchClient, "postDocument");

      job.task.should.have.property('url');
      job.task.should.have.property('id');

      originalQueueWorker(job, cb);
    };
    var server = AnyFetchProvider.createServer(serverConfig.connectFunctions, serverConfig.updateAccount, serverConfig.workers, serverConfig.config);

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

        server.queue.create('addition', {_special: true, _anyfetchToken: 'fake_gc_access_token'}).priority('low').save();
      });
  });
});
