'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const lws_docSchema = new mongoose.Schema({
	
	id: String,
	content: String,
	size: String,
	mimeType: String,
	link: String

}, { timestamps: true })

const lws_doc = mongoose.model('lws_doc', lws_docSchema)

module.exports = lws_doc
