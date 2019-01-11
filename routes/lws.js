'use strict'

const HOST = `http://localhost:${process.env.PORT}`
const express = require('express')
const router = express.Router()
const passport = require('passport')
const cors = require('cors')
const multer = require('multer')
const upload = multer({ dest: 'public/uploads/' })
const User = require('../db/models/lws_user')
const Document = require('../db/models/lws_doc')
const jwt = require('jsonwebtoken')
const uuid = require('node-uuid')
const path = require('path')
const JWT_SECRET = process.env.SK_JWT_SECRET

// development sourced library
const selfkey = require('../../selfkey-lib/lib/selfkey.js')

async function generateToken() {
	return (new String(uuid.v1() + uuid.v4())).replace(/-/g, '')
}

// API
const login = async (req, res) => {
	const { body } = req
	if (!body.token) {
		return res.status(400).json({ redirectTo: '/login' })
	}	
	try {
		let decoded = await jwt.verify(body.token, JWT_SECRET)
		let user = await User.findOne({selfkey_wallet: decoded.sub})
		if (!user) {
			return res.status(404).json({ redirectTo: '/login' })
		}
		return res.json({ redirectTo: '/success/' + user.token })
	} catch (error) {
		return res.satus(401).json({ redirectTo: `/login` })
	}
}

// API
const createUser = async (req, res) => {
	let publicKey = req.decodedAuth.sub
	let attributes = req.body.attributes
	try {
		attributes = JSON.parse(attributes)
	} catch (error) {
		return res.status(400).json({
			code: 'invalid_attributes',
			message: 'Attributes field must be a json string'
		})
	}
	if (!attributes || !attributes.length) {
		return res.status(400).json({ code: 'no_attributes', message: 'No attributes provided' })
	}
	let documents = req.files.map(f => {
		let id = f.fieldname.match(/^\$document-([0-9]*)$/) || Math.Random(1,3).toString()
		let doc = {
			mimeType: f.mimetype,
			size: f.size,
			content: f.buffer,
			link: path.join(__dirname, '../', '/public/uploads/', publicKey),
			id: +id[1]
		}
		return doc
	})
	documents = documents.map(doc => {
		let newDoc = Document.create(doc)
		return doc
	})
	attributes = attributes.map(attr => {
		let attrDocs = attr.documents
			.map(id => {
				let found = documents.filter(doc => doc.id === id)
				return found.length ? found[0] : null
			})
			.filter(doc => !!doc)
		attr = { ...attr, documents: attrDocs }
		let { value } = selfkey.denormalizeDocumentsSchema(attr.schema, attr.data, attrDocs)
		return { id: attr.id, value }
	})
	let user = await User.findOne({selfkey_wallet: publicKey})
	let realToken = await generateToken()
	if (user) {
		user = await User.update({selfkey_wallet: publicKey}, { token: realToken, attributes: attributes })
	} else {
		user = await User.create({selfkey_wallet: publicKey, token: realToken, attributes: attributes})
	}
	if (!user) {
		return res.status(400).json({
			code: 'could_not_create',
			message: 'Could not create user'
		})
	}
	return res.status(201).json()
}

// API
const getUserPayload = async (req, res) => {
	let publicKey = req.decodedAuth.sub
	let user = await User.findOne({selfkey_wallet: publicKey})
	if (!user) {
		return res.status(404).json({
			code: 'user_does_not_exist',
			message: 'User with provided public key does not exist'
		})
	}
	let userToken = jwt.sign({}, 'SHHH', { subject: '' + user.selfkey_wallet })
	return res.status(200).json({ token: userToken })
}

// ROUTES

router.get('/selfkey/v2/auth/challenge/:publicKey', async (req, res) => {
	let cr = await selfkey.newJWT(req.params.publicKey)
	return res.status(cr.status).json(cr)
})

router.post('/selfkey/v2/auth/challenge', selfkey.jwtAuthMiddleware, async (req, res) => {
	let challenge = req.decodedAuth.challenge
	let publicKey = req.decodedAuth.sub
	let { signature } = req.body || {}
	let cr = await selfkey.handleChallengeResponse(challenge, signature, publicKey)
	return res.status(cr.status).json(cr)
})

router.post('/selfkey/v2/users', selfkey.jwtAuthMiddleware, selfkey.serviceAuthMiddleware, upload.any(), createUser)

router.get('/selfkey/v2/auth/token', selfkey.jwtAuthMiddleware, selfkey.serviceAuthMiddleware, getUserPayload)

router.options('/selfkey/v2/login', cors())

router.post('/selfkey/v2/login', cors(), login)

router.get('/success/:url', passport.authenticate('url', {failRedirect: '/login'}), (req, res) => {
	res.redirect('/wallets')
})

module.exports = router
