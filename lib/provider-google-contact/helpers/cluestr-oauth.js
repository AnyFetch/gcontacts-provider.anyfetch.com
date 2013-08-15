'use strict';
// # lib/cluestr-oauth
// Easy access to Cluestr API, wrapping helpers functions.

var API_ROOT
module.exports = function(appId, appSecret) {

   // Retrieve a set of access tokens from Cluestr
   // @param {string} code value to be traded for tokens
   // @param {function} cb callback to be called once token are retrieved, will take as params the tokens
  this.getAccessToken = function(code, cb) {

  };

  // Store accessToken for this session
  var accessToken = null;

  // Define the access token to use for all authenticated requests to Cluestr API.
  this.setAccessToken = function(_accessToken) {
    accessToken = _accessToken;
  }

};
