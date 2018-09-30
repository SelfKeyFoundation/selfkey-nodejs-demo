'use strict'

const passport = require('passport')
const User = require('../db/models/lws_user')

function getLogin(req, res) {
	res.render('account/login', {
		title: 'Login'
	})
}

function getLogout(req, res) {
	req.logout()
	res.redirect('/')
}

function getSignup(req, res) {
	res.render(req, res, 'account/signup', {
		title: 'Create Account'
	})
}

function getAccount(req, res) {
	res.render('account/profile', {
		title: 'Account Management'
	})
}

function getWallets(req, res) {
	res.render('account/wallets', {
		user: req.user,
		address: req.user.pubKey,
		attributes: req.user.attributes,
		imagebase: process.env.SK_URL + '/uploads/'
	})
}

function postLogin(req, res, next) {
	req.assert('email', 'Email is not valid').isEmail()
	req.assert('password', 'Password cannot be blank').notEmpty()
	req.sanitize('email').normalizeEmail({ remove_dots: false })

	const errors = req.validationErrors()

	if (errors) {
		req.flash('errors', errors)
		return res.redirect('/login')
	}

	passport.authenticate('local', (err, user, info) => {
		if (err) { return next(err); }
		if (!user) {
			req.flash('errors', info)
			return res.redirect('/login')
		}
		req.logIn(user, err => {
			if (err) { return next(err) }
			req.flash('success', { msg: 'Success! You are logged in.' })
			res.redirect(req.session.returnTo || '/account')
		});
	})(req, res, next)
}

function postSignup(req, res, next) {
	req.assert('email', 'Email is not valid').isEmail()
	req.assert('password', 'Password must be at least 4 characters long').len(4)
	req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)
	req.sanitize('email').normalizeEmail({ remove_dots: false })

	const errors = req.validationErrors()

	if (errors) {
		req.flash('errors', errors)
		return res.redirect('/signup')
	}

	const user = new User({
		email: req.body.email,
		password: req.body.password
	})

	User.findOne({ email: req.body.email }, (err, existingUser) => {
		if (err) { return next(err) }
		if (existingUser) {
			req.flash('errors', { msg: 'Account with that email address already exists.' })
			return res.redirect('/signup')
		}
		user.save(err => {
			if (err) { return next(err) }
			req.logIn(user, err => {
				if (err) {
					return next(err)
				}			
				req.flash('success', { msg: 'Success! You have created a new account.' })
				res.redirect('/')
			})
		})
	})
}

function postUpdateProfile(req, res, next) {
	req.assert('email', 'Please enter a valid email address.').isEmail()
	req.sanitize('email').normalizeEmail({ remove_dots: false })

	const errors = req.validationErrors()

	if (errors) {
		req.flash('errors', errors)
		return res.redirect('/account')
	}

	User.findById(req.user.id, (err, user) => {
		if (err) { return next(err) }
		user.email = req.body.email
		user.profile.name = req.body.name
		user.profile.phone = req.body.phone
		user.profile.address = req.body.address
		user.profile.location = req.body.location
		user.profile.website = req.body.website

		user.save(err => {
			if (err) {
				if (err.code === 11000) {
					req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' })
					return res.redirect('/account')
				}
				return next(err)
			}
			req.flash('success', { msg: 'Profile information has been updated.' })
			res.redirect('/account')
		})
	})
}

function postUpdatePassword(req, res, next) {
	req.assert('password', 'Password must be at least 4 characters long').len(4)
	req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

	const errors = req.validationErrors()

	if (errors) {
		req.flash('errors', errors)
		return res.redirect('/account')
	}

	User.findById(req.user.id, (err, user) => {
		if (err) { return next(err) }
		user.password = req.body.password
		user.save(err => {
			if (err) { return next(err); }
			req.flash('success', { msg: 'Password has been changed.' })
			res.redirect('/account')
		})
	})
}

function postDeleteAccount(req, res, next) {
	User.remove({ _id: req.user.id }, err => {
		if (err) { return next(err) }
		req.logout();
		req.flash('info', { msg: 'Your account has been deleted.' })
		res.redirect('/')
	})
}

module.exports = {
	getLogin,
	getLogout,
	getSignup,
	getAccount,
	getWallets,
	postLogin,
	postSignup,
	postUpdateProfile,
	postUpdatePassword,
	postDeleteAccount
}
