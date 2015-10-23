'use strict';
var https = require('https');
var fs = require('fs');

var app = require('./app'),
	db = require('./db');

var options = {
  key: fs.readFileSync('./key.pem'),  // only './' because it's from the directory from which we run node
  cert: fs.readFileSync('./cert.pem')
};

var port = 8080;
// var server = https.createServer(options, app).listen(port, function () {
// 	console.log('HTTP server patiently listening on port', port);
// });

// var server = https.createServer(options, function (req, res) {
// 	console.log('HTTP server patiently listening on port', port);
// }).listen(8080);

// var port = 8080;
var server = app.listen(port, function () {
	console.log('HTTP server patiently listening on port', port);
});

module.exports = server;