'use strict'

const express = require('express')
const passport = require('passport')
const User = require('../db/models/lws_user')
const request = require('request')
const router = express()

router.get('/api/v1/selfkey', async (req, res) => {
	try {
		const options = {
			url: process.env.SK_SVS_URL,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		}
		request.get(options, (err, resp, body) => {
			if (err) return console.error(err)
			console.log(body)
			const pres = JSON.parse(resp.body)
			res.status(200).json({nonce: pres.nonce})
		})
	} catch (e) {
		return console.error(e)
	}
})

router.post('/api/v1/selfkey', passport.authenticate('selfkey'), async (req, res) => {
	User.findOne({selfkey_wallet: req.body.publicKey}, (err, user) => {
		res.status(201).json({redirectTo: 'http://localhost:3007/success/' + user.token})
	})
})

router.post('/api/v1/selfkey/login', (req, res) => res.status(201).json({redirectUrl: '/success'}))

router.get('/success/:url', passport.authenticate('url', {failRedirect: '/login'}), (req, res) => {
	res.redirect('/wallets')
})

module.exports = router
