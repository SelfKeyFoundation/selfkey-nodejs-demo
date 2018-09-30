'use strict'

const express = require('express')
const passport = require('passport')
const selfkey = require('selfkey.js')
const User = require('../db/models/lws_user')
const router = express()

router.get('/api/v1/selfkey', (req, res) => res.status(200).json({nonce: selfkey.createNonce(64)}))

router.post('/api/v1/selfkey', passport.authenticate('selfkey'), async (req, res) => {
	User.findOne({selfkey_wallet: req.body.publicKey}, (err, user) => {
		res.status(201).json({redirectTo: 'http://localhost:3000/success/' + user.token})
	})
})

router.post('/api/v1/selfkey/login', (req, res) => res.status(201).json({redirectUrl: '/success'}))

router.get('/success/:url', passport.authenticate('url', {failRedirect: '/login'}), (req, res) => {
	res.redirect('/wallets')
})

module.exports = router
