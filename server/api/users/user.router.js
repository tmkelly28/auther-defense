'use strict';

var router = require('express').Router(),
	_ = require('lodash');

var HttpError = require('../../utils/HttpError');
var User = require('./user.model');

function isUserAdmin (id) {
	return User.findById(id)
	.then(function (user) {
		if (user.isAdmin) return true;
		else return false;
	})
	.then(null, function (err) {
		return false;
	})
}

function isUserSelf (sessionId, paramId) {
	return sessionId === paramId;
}


router.param('id', function (req, res, next, id) {
	User.findById(id).exec()
	.then(function (user) {
		if (!user) throw HttpError(404);
		req.requestedUser = user;
		next();
	})
	.then(null, next);
});

router.get('/', function (req, res, next) {
	User.find({}).exec()
	.then(function (users) {
		res.json(users);
	})
	.then(null, next);
});

router.post('/', function (req, res, next) {
	if (!req.session.passport) {
		res.status(403).end('Go away!')
		return;
	}
	isUserAdmin(req.session.passport.user)
	.then(function (bool) {
		if (!bool) {
			res.status(403).end('Go away!');
			return;
		}
		return true;
	})
	.then(function () {
		User.create(req.body)
		.then(function (user) {
			res.status(201).json(user);
		})
		.then(null, next);
	})
});

router.get('/:id', function (req, res, next) {
	req.requestedUser.getStories()
	.then(function (stories) {
		var obj = req.requestedUser.toObject();
		obj.stories = stories;
		res.json(obj);
	})
	.then(null, next);
});

router.put('/:id', function (req, res, next) {
	if (!req.session.passport) {
		res.status(403).end('Go away!')
		return;
	}
	var userIsSelf = isUserSelf(req.session.passport.user, req.params.id);

	isUserAdmin(req.session.passport.user)	
	.then(function (bool) {
		if (!bool && !userIsSelf) {
			res.status(403).end();
			return;
		} else {
			_.extend(req.requestedUser, req.body);
			req.requestedUser.save()
			.then(function (user) {
				res.json(user);
			})
			.then(null, next);		
		}
	})
});

router.delete('/:id', function (req, res, next) {
	if (!req.session.passport) {
		res.status(403).end('Go away!')
		return;
	}
	var userIsSelf = isUserSelf(req.session.passport.user, req.params.id);

	isUserAdmin(req.session.passport.user)	
	.then(function (bool) {
		if (!bool && !userIsSelf) {
			res.status(403).end('Go away!');
			return;
		} else {
			req.requestedUser.remove()
			.then(function () {
				res.status(204).end('Go away!');
			})
			.then(null, next);
		}
	})
});

module.exports = router;