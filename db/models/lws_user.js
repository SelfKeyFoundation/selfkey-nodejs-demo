'use strict'

const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const lws_userSchema = new mongoose.Schema({
	
	email: String,
	username: String,
	password: String,

	token: String,

	profile: {
		name: String,
		gender: String,
		location: String,
		website: String,
		picture: String
	},
	
	selfkey_wallet: String,
	nonce: String,
	attributes: Array

}, { timestamps: true })

lws_userSchema.pre('save', function save(next) {
	const user = this
	if (!user.isModified('password')) return next()
	bcrypt.genSalt(10, (err, salt) => {
		if (err) return next(err)
		bcrypt.hash(user.password, salt, null, (err, hash) => {
			if (err) return next(err)
			user.password = hash
			next()
		})
	})
})

lws_userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => cb(err, isMatch))
}

const lws_user = mongoose.model('lws_user', lws_userSchema)

module.exports = lws_user
