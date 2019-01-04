'use strict'

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const selfkey = require('selfkey.js')
const SelfKeyStrategy = require('passport-selfkey').Strategy
const UrlStrategy = require('passport-url').Strategy
const User = require('../db/models/lws_user')
const uuid = require('node-uuid')
const base64Img = require('base64-img')
const path = require('path')
const request = require('request')

passport.serializeUser((user, done) => {
	done(null, user.id)
})

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user)
	})
})

async function generateToken() {
	return (new String(uuid.v1() + uuid.v4())).replace(/-/g, '')
}

async function docSort(attributes, publicKey) {
	return new Promise((resolve,reject) => {
		try {
			let docs = []
			for (let item of attributes) {
				if (item.document == true) {
					docs.push(
					base64Img.img(item.data.value, path.join(__dirname, '../', '/public/uploads/', publicKey), item.key, (err, filepath) => {
						if (err) console.log(err)
						console.log('doc saved', filepath)
					}))
				} else {
					console.log('notdoc')
				}
			}
			resolve(Promise.all(docs))
		} catch (e) {
			reject(e)
		}
	})
}

async function verify(nonce, signature, publicKey) {
	return new Promise((resolve,reject) => {
		try {
			const form = {
				nonce,
				signature,
				publicKey
			}
			const options = {
				url: process.env.SK_SVS_URL,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				form: form
			}
			request.post(options, (err, resp, body) => {
				if (err) return console.error(err)
				const pres = JSON.parse(resp.body)
				resolve(pres.message)
			})
		} catch (e) {
			reject(e)
		}
	})
}

const loginMsg = {msg: 'Login with SelfKey ID successful'}
const tokenLoginMsg = {msg: 'Login with Auth Token successful'}
const newUserMsg = {msg: 'New account with SelfKey ID has successfully been created'}
const existingUserMsg = {msg: 'Login with SelfKey ID successful'}
const loginFailedMsg = {msg: 'Invalid Credentials'}

/**
 * Login with SelfKey Passport Config
 */
passport.use(new SelfKeyStrategy( async (req, nonce, signature, publicKey, done) => {
	
	const userToken = await generateToken()
	const userAttributes = await docSort(req.body.attributes, publicKey)
	const verified = await verify(nonce, signature, publicKey)
	console.log(userToken)
	console.log(userAttributes)
	console.log(verified)
	if (verified) {
		if (req.user) {
			User.findOne({selfkey_wallet: publicKey}, (err, existingUser) => {
				if (err) return done(err) 
				if (existingUser) {
					User.update({selfkey_wallet: publicKey}, {
						token: userToken
					}, (err, updateUser) => {
						if (err) return done(err)
						User.findOne({selfkey_wallet: publicKey}, (err, user) => {
							req.flash('info', loginMsg)
							return done(null, user, loginMsg)
						})
					})
				} else {
					User.findOne({_id: req.user.id}, (err, user) => {
						if (err) { return done(err) }
						User.update({_id: req.user.id}, {token: userToken}, (err, result) => {
							if (err) { return done(err) }
							User.findOne({_id: req.user.id}, (err, user) => {
								if (err) { return done(err) }
								req.flash('info', existingUserMsg)
								return done(err, user, existingUserMsg)
							})
						})	
					})
				}
			})
		} else {
			User.findOne({selfkey_wallet: publicKey}, (err, existingUser) => {
				if (err) return done(err)
				if (existingUser) {
					req.flash('info', loginMsg)
					return done(null, existingUser, loginMsg)
				} else {
					const newUser = {
						selfkey_wallet: publicKey, 
						token: userToken,
						attributes: req.body.attributes
					}
					User.create(newUser, (err, user) => {
						if (err) return done(err)
						req.flash('info', newUserMsg)
						return done(err, user, newUserMsg)
					})
				}
			})
		}
	}	else {
		req.flash('info', loginFailedMsg)
		return done(null, false, loginFailedMsg)
	}
}))

passport.use(new UrlStrategy((url, done) => {
	User.findOne({token: url}, (err, user) => {
		if (user) {
			return done(null, user)
		} else {
			return done(null, false)
		}
	})
}))

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
	User.findOne({ email: email.toLowerCase() }, (err, user) => {
		if (err) return done(err)
		if (!user) return done(null, false, { msg: `Email ${email} not found.` })
		user.comparePassword(password, (err, match) => {
			if (err) return done(err)
			if (match) return done(null, user)
			return done(null, false, { msg: 'Invalid email or password.' })
		})
	})
}))

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) return next()
	res.redirect('/')
}

function isAuthorized(req, res, next) {
	const provider = req.path.split('/').slice(-1)[0]
	const token = req.user.tokens.find(token => token.kind === provider)
	(token) ? next() : res.redirect(`/auth/${provider}`)
}

module.exports = {
	isAuthenticated,
	isAuthorized
}
