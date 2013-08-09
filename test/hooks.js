'use strict';
var mongoose = require('mongoose'),
	configuration = require('../config/configuration.js'),
	clearDB  = require('mocha-mongoose')(configuration.mongo_url, {noClear: true});

before(function(done) {
	clearDB(function() {
		console.log("DB cleared!");
		done();
	});
});
