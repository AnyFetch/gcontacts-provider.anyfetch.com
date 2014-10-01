'use strict';

var request = require('request');
var rarity = require('rarity');

/**
 * Upload `contact` (containing contact data) onto AnyFetch.
 *
 *
 * @param {Object} contact Contact to upload, plus anyfetchClient
 * @param {Object} anyfetchClient Client for upload
 * @param {Object} accessToken Access token of the current account
 * @param {Object} contact Contact to upload, plus anyfetchClient
 * @param {Function} cb Callback to call once contacts has been uploaded.
 */
module.exports = function(contact, anyfetchClient, accessToken, cb) {
  console.log("Uploading ", contact.url);

  // Download image (if any)
  var numericId = contact.id.substr(contact.id.lastIndexOf('/') + 1);
  var params = {
    encoding: null,
    url: 'https://www.google.com/m8/feeds/photos/media/default/' + numericId,
    headers: {
      'Authorization': 'OAuth ' + accessToken,
      'GData-Version': '3.0'
    },
  };

  request.get(params, function (err, resp, body) {
    if(err) {
      return cb(err);
    }

    var data = {};
    if(resp.statusCode === 200) {
      data.image = 'data:image/*;base64,' + body.toString('base64');
    }

    contact.starred = contact.groups ? contact.groups.some(function(group) {
      return group && group.match(/starred/i);
    }) : false;

    // Build contact "the right way"
    contact = {
      identifier: contact.identifier,
      creation_date: contact.modification_date,
      modification_date: contact.modification_date,
      metadata: contact,
      data: data,
      document_type: 'contact',
      actions: {
        'show': contact.url
      },
      user_access: [anyfetchClient.accessToken]
    };

    delete contact.metadata.identifier;
    delete contact.metadata.url;
    delete contact.metadata.title;
    delete contact.metadata.id;
    delete contact.metadata.accessToken;
    delete contact.metadata.modification_date;

    anyfetchClient.postDocument(contact, rarity.slice(1, cb));
  });
};
