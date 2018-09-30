'use strict'

const mongoose = require('mongoose').set('debug', true)
const uri = process.env.SK_MONGO_URI
const options = {
	user: process.env.SK_MONGO_USER || '',
	pass: process.env.SK_MONGO_PASS || '',
	db: { safe: true }
}

console.info('Mongoose connecting to ' + uri + '...')

mongoose.set('debug', false)

let connection = mongoose.connect(uri, options)

mongoose.connection.on('connected', () =>  {
	console.info('Mongoose successfully connected to: ' + uri)
})

mongoose.connection.on('error', err =>  {
	console.error('Mongoose ERROR connecting to: ' + uri + ' - ' + err)
})

mongoose.connection.on('disconnected', () => {
	console.error('Mongoose connection disconnected')
})

module.exports = mongoose.connection
