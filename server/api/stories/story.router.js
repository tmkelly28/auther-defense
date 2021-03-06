'use strict';

var router = require('express').Router(),
	_ = require('lodash');

var HttpError = require('../../utils/HttpError');
var Story = require('./story.model');

router.param('id', function (req, res, next, id) {
	Story.findById(id + "").exec()
	.then(function (story) {
		if (!story) throw HttpError(404);
		req.story = story;
		next();
	})
	.then(null, next);
});

router.get('/', function (req, res, next) {
	Story.find({}).populate('author').exec()
	.then(function (storys) {
		res.json(storys);
	})
	.then(null, next);
});

router.post('/', function (req, res, next) {
	if (!req.session.passport) {
		res.status(403).end('Go away!')
		return;
	}
	if (!req.user) {
		res.status(403).end("Go away :(")
		return;
	}

	Story.create({author: req.body.author + "", title: req.body.title + "", paragraphs: req.body.paragraphs})
	.then(function (story) {
		return story.populateAsync('author');
	})
	.then(function (populated) {
		res.status(201).json(populated);
	})
	.then(null, next);
});

router.get('/:id', function (req, res, next) {
	req.story.populateAsync('author')
	.then(function (story) {
		res.json(story);
	})
	.then(null, next);
});

router.put('/:id', function (req, res, next) {
	if (!req.session.passport) {
		res.status(403).end('Go away!')
		return;
	}
	if (req.session.passport.user !== req.story.author) {
		res.status(403).end('Go away :(');
		return;
	}
	_.extend(req.story, req.body);
	req.story.save()
	.then(function (story) {
		res.json(story);
	})
	.then(null, next);
});

router.delete('/:id', function (req, res, next) {
	console.log(req.session);
	if (!req.session.passport) {
		res.status(403).end('Go away!')
		return;
	}
	if (req.session.passport.user !== req.story.author) {
		res.status(403).end('Go away :(');
		return;
	}
	req.story.remove()
	.then(function () {
		res.status(204).end();
	})
	.then(null, next);
});

module.exports = router;