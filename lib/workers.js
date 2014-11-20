'use strict';

var rarity = require('rarity');

var uploadContact = require('./helpers/upload.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  uploadContact(job.task, job.anyfetchClient, job.serviceData.tokens.access_token, cb);
};

module.exports.deletion = function deletionQueueWorker(job, cb) {
  job.anyfetchClient.deleteDocumentByIdentifier(job.task.url, rarity.slice(1, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  }));
};
