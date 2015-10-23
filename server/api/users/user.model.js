'use strict'; 

var mongoose = require('mongoose'),
	shortid = require('shortid'),
	_ = require('lodash');

var db = require('../../db');
var Story = require('../stories/story.model');
var crypto = require('crypto');

var User = new mongoose.Schema({
	_id: {
		type: String,
		unique: true,
		default: shortid.generate
	},
	name: String,
	photo: {
		type: String,
		default: '/images/default-photo.jpg'
	},
	phone: String,
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: String,
	google: {
		id: String,
		name: String,
		email: String,
		token: String
	},
	twitter: {
		id: String,
		name: String,
		email: String,
		token: String
	},
	github: {
		id: String,
		name: String,
		email: String,
		token: String
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	salt: {type: Buffer}
});

User.pre('save', function(next) {
	this.salt = crypto.randomBytes(16);
	var buffer = crypto.pbkdf2Sync(this.password, this.salt, 999, 64);
	this.password = buffer.toString('base64');
	next();
});

User.methods.getStories = function () {
	return Story.find({author: this._id}).exec();
};

module.exports = db.model('User', User);