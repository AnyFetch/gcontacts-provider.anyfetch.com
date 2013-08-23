'use strict';
/**
 * @file Easy access to Cluestr API.
 *
 * @see http://cluestr.com
 */

var request = require('request');

// Root URL for the API. Can be updated for testing or VA purposes
var API_ROOT = 'http://cluestr.com';
// Url to retrieve an access_token
var ACCESSTOKEN_CREATION = '/oauth/token';
// Url to create a new document
var DOCUMENT_CREATION = '/providers/documents';

/**
 * Cluestr Oauth libraries
 * Tools for easy communication with Cluestr API.
 *
 * @param {string} your appId your application id, generated via Cluestr
 * @param {string} appSecret your application secret, generated via Cluestr
 */
module.exports = function(appId, appSecret) {

  this.API_ROOT = API_ROOT;
  this.ACCESSTOKEN_CREATION = ACCESSTOKEN_CREATION;
  this.DOCUMENT_CREATION = DOCUMENT_CREATION;

  /*************
  * CLASS ATTRIBUTES
  */

  // Closure for this item
  var self = this;
  // Store accessToken for this session
  var accessToken = null;

  /*************
  * HELPER FUNCTIONS
  */

  /**
   * Check an accessToken has been defined on this instance
   *
   * @throws{Error} accessToken has not been set
   */
  var _requireAccessToken = function() {
    if(!self.accessToken) {
      throw new Error("This method requires you to define an accessToken.");
    }
  };

  /**
   * Check err is null, undefined or evaluates to false
   * 
   * @param {Error|null} err The potentiel error.
   *
   * @throws{Error} err does not evaluate to false
   */
  var _requireNoErr = function(err) {
    if(err) {
      throw new Error(err);
    }
  };

  /**
   * Checks status code match with expected status code, or raises a (hopefully) helping error message
   * 
   * @param {int} expected Expected status code.
   * @param {actual} actual Actual status code.
   *
   * @throws{Error} expected != actual
   */
  var _requireStatus = function(expected, actual, body) {
    if(expected !== actual) {
      if(body && body.error) {
        throw new Error("Cluestr returned non-" + expected + "code: ", actual, '. ' + body.error);
      } else {
        throw new Error("Cluestr returned non-" + expected + " code: ", actual);
      }
    }
  };

  /**
   * Retrieve an access token from Cluestr
   * 
   * @param {string} code value to be traded for tokens
   * @param {function} cb callback to be called once token are retrieved, will take as params the new access_token. Additionnally, the access_token will be automatically set on this instance.
   *
   * @throws {Error} Cluestr replied with non 200 code.
   */
  this.getAccessToken = function(code, cb) {
    var params = {
      url: self.API_ROOT + self.ACCESSTOKEN_CREATION,
      form: {
        client_id: appId,
        client_secret: appSecret,
        code: code,
        grant_type: 'authorization_code',
      }
    };

    request.post(params, + code, function(err, resp) {
      _requireNoErr(err);

      _requireStatus(200, resp.statusCode, resp.body);

      cb(resp.body.access_token);
    });
  };

  /*
   * Define the access token to use for all authenticated requests to Cluestr API.
   *
   * @param {String} _accessToken Access token to use for subsequent requests.
   */
  this.setAccessToken = function(_accessToken) {
    self.accessToken = _accessToken;
  };

  /**
   * Send a document to cluestr
   *
   * @param {Object} datas to be sent to Cluestr, following the documentation for API_ROOT/providers/documents
   * @param {function} cb callback to be called once document has been created / updated. First parameter will be the return from the API.
   *
   * @throws {Error} a network error occurred while communicating with Cluestr.
   * @throws {Error} Cluestr replied with non 200 code.
   * This function will check no errors occurred or throws them.
   */
  this.sendDocument = function(datas, cb) {
    _requireAccessToken();

    if(!datas.identifier) {
      throw new Error("Document must include an identifier.");
    }

    var params = {
      url: self.API_ROOT + self.DOCUMENT_CREATION,
      form: datas,
      headers: {
        'Authorization': 'token ' + self._accessToken
      }
    };

    request.post(params, function(err, resp) {
      _requireNoErr(err);

      _requireStatus(200, resp.statusCode, resp.body);

      cb(resp.body);
    });
  };

  /**
   * Remove a document from cluestr
   * 
   * @param {string} identifier document identifier to be deleted
   * @param {Function} cb Callback post-delete
   * 
   * @throws {Error} Cluestr replied with non 204 code.
   *
   * This function will check no errors occurred or throws them.
   */
  this.deleteDocument = function(identifier, cb) {
    self._requireAccessToken();

    var params = {
      url: self.DOCUMENT_CREATION,
      form: {
        'identifier': identifier
      },
      headers: {
        'Authorization': 'token ' + self._accessToken
      }
    };

    request.del(params, function(err, resp) {
      _requireNoErr(err);

      _requireStatus(204, resp.statusCode, resp.body);

      cb();
    });
  };
};
