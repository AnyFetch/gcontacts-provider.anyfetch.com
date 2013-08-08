'use strict';

var restify = require('restify');

exports.test = function (req, res, next) {
  res.send("HI");
  next();
};
