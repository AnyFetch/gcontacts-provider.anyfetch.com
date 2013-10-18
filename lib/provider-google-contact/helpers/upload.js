'use strict';


/**
 * Upload `contact` (containing contact data) onto Cluestr.
 *
 * 
 * @param {Object} contact Contact to upload, plus cluestrClient
 * @param {Function} cb Callback to call once contacts has been uploaded.
 */
module.exports = function(contact, cluestrClient, cb) {
  console.log("Uploading ", contact.url);
  var identifier = contact.url;
  
  if(contact.deleted) {
    return cluestrClient.deleteDocument(identifier, cb);
  }

  // Build contact "the right way"
  contact = {
    identifier: identifier,
    metadatas: contact,
    semantic_document_type: 'contact',
    actions: {
      'show': contact.url
    },
    user_access: [cluestrClient.accessToken]
  };
  delete contact.metadatas.url;
  delete contact.metadatas.id;

  cluestrClient.sendDocument(contact, cb);
};
