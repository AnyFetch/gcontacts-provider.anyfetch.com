'use strict';

var rarity = require('rarity');
var log = require('anyfetch-provider').log;

var uploadContact = require('./helpers/upload.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  log.info({
    name: 'addition',
    identifier: job.task.identifier
  }, "Uploading");
  uploadContact(job.task, job.anyfetchClient, job.serviceData.tokens.access_token, cb);
};

module.exports.deletion = function deletionQueueWorker(job, cb) {
  log.info({
    name: 'deletion',
    identifier: job.task.identifier
  }, "Deleting");
  job.anyfetchClient.deleteDocumentByIdentifier(job.task.identifier, rarity.slice(1, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  }));
};
