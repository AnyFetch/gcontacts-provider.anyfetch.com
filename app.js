"use strict";

// Load configuration and initialize server
var cluestrProvider = require('cluestr-provider');

var providerGoogleContact = require('./lib/provider-google-contact');

var serverConfig = providerGoogleContact;

var server = cluestrProvider.createServer(serverConfig);

// Expose the server
module.exports = server;
