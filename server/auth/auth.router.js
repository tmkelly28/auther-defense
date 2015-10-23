'use strict';

var router = require('express').Router();
var HttpError = require('../utils/HttpError');
var User = require('../api/users/user.model');
var crypto = require('crypto');

router.post('/login', function (req, res, next) {
	User.findOne({'email':req.body.email + ""}).exec()
	.then(function (user) {
		if (!user) throw HttpError(401);
		var salt = user.salt;
		var buffer = crypto.pbkdf2Sync(req.body.password, salt, 999, 64);
		var password = buffer.toString('base64');
		if (user.password === password) {
				req.login(user, function () {
				res.json(user);
			});
		} else {
			res.status(401).end('you\'re not real');
		}
	})
	.then(null, next);
});

router.post('/signup', function (req, res, next) {
	User.create({email: req.body.email + "", password: req.body.password + ""})
	.then(function (user) {
		req.login(user, function () {
			res.status(201).json(user);
		});
	})
	.then(null, next);
});

router.get('/me', function (req, res, next) {
	res.json(req.user);
});

router.delete('/me', function (req, res, next) {
	req.logout();
	res.status(204).end();
});

router.use('/google', require('./google.oauth'));

router.use('/twitter', require('./twitter.oauth'));

router.use('/github', require('./github.oauth'));

module.exports = router;