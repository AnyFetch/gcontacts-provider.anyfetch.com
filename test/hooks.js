'use strict';
var mongoose = require('mongoose');
var configuration = require('../config/configuration.js');
var clearDB  = require('mocha-mongoose')(configuration.mongo_url, {noClear: true});

// Empty MongoDB before each tests
beforeEach(function(done) {
	clearDB(function() {
		done();
	});
});
