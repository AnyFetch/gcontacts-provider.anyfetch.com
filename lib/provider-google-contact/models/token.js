// # models/document-type
// Describes a document type in the database

// Imports
'use strict';
var mongoose = require('mongoose');

// Schema
var TokenSchema = new mongoose.Schema({
  // ## Fields
  
  // Tokens to communicate with Cluestr
  cluestrTokens: {},

  // Tokens to communicate with Google
  googleTokens: {}
});

// Register & export the model
module.exports = mongoose.model('TokenSchema', TokenSchema);
