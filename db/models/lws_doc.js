'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const lws_docSchema = new mongoose.Schema({
	
	file: String

}, { timestamps: true })

const lws_doc = mongoose.model('lws_doc', lws_docSchema)

module.exports = lws_doc
