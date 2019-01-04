'use strict'
 
const express = require('express')
const router = express()
const passport = require('../config/passport')
const user = require('../controllers/user')

	router.get('/login', user.getLogin)
	router.post('/login', user.postLogin)
	router.get('/logout', user.getLogout)
	router.get('/signup', user.getSignup)
	router.post('/signup', user.postSignup)

	router.get('/account', passport.isAuthenticated, user.getAccount)
	router.post('/account/profile', passport.isAuthenticated, user.postUpdateProfile)
	router.post('/account/password', passport.isAuthenticated, user.postUpdatePassword)
	router.post('/account/delete', passport.isAuthenticated, user.postDeleteAccount)

	router.get('/wallets', passport.isAuthenticated, user.getWallets)

	router.get('/dash-success', (req, res) => {
		res.render('success', {
			title: 'Success'
		})
	})

module.exports = router
