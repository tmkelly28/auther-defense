'use strict';

var router = require('express').Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../api/users/user.model');

router.get('/', passport.authenticate('google', {
	scope: 'email'
}));

router.get('/callback', passport.authenticate('google', {
	successRedirect: '/stories',
	failureRedirect: '/signup'
}));

passport.use(new GoogleStrategy({
	clientID: '26195929018-mr0qrs0sjslkqcf0474mc98iii2o9mpc.apps.googleusercontent.com',
	clientSecret: 'lrKtyEKyXQ3_IuVyOFWK5mdH',
	callbackURL: 'http://127.0.0.1:8080/auth/google/callback'
}, function (token, refreshToken, profile, done) { 
	User.findOne({'google.id': profile.id }, function (err, user) {
		if (err) done(err);
		else if (user) done(null, user);
		else {
			var email = profile.emails[0].value;
			User.create({
				email: email,
				photo: profile.photos[0].value,
				name: profile.displayName,
				google: {
					id: profile.id,
					name: profile.displayName,
					email: email,
					token: token
				}
			}, done);
		}
	});
}));

module.exports = router;