'use strict'

const fs = require('fs')
const express = require('express')
const cluster = require('express-cluster')
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const lusca = require('lusca')
const flash = require('express-flash')
const path = require('path')
const expressValidator = require('express-validator')
const env = process.env.NODE_ENV
const minify = require('express-minify')
const favicon = require('serve-favicon')
const consoleNotes = require('./config/config')

var server = () => {
	
	const app = express()
	
	require('./db/mongoose')
	
	app.set('port', process.env.SK_PORT || 3007)
	
	app.set('views', path.join(__dirname, 'views'))
	app.set('view engine', 'pug')
	
	app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
	
	app.use(logger('dev'))
	
	app.use(bodyParser.json({limit: '50mb'}))
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true }))
	
	app.use(expressValidator())
	
	app.set('trust proxy', 1)
	
	app.use(session({
		resave: true,
		saveUninitialized: true,
		secret: process.env.SK_SESSION_SECRET,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			autoReconnect: true
		})
	}))
	
	app.use(passport.initialize())
	app.use(passport.session())
	
	app.use(flash())
	
	app.use(lusca.xframe('SAMEORIGIN'))
	app.use(lusca.xssProtection(true))
	
	app.use((req, res, next) => {
		res.locals.user = req.user
		next()
	})
	
	app.use(minify())
	
	app.use((req, res, next) => {
		if (!req.user 
			&& req.path !== '/login' 
			&& req.path !== '/signup' 
			&& !req.path.match(/^\/auth/) 
			&& !req.path.match(/\./)) {
			req.session.returnTo = req.path
		} else if (req.user && req.path == '/account') {
			req.session.returnTo = req.path
		}
		next()
	})
	
	app.use(express.static(path.join(__dirname, 'public')))
	app.use(express.static(path.join(__dirname, 'public/uploads')))
	
	app.get('/', (req, res) => res.render('index'))

    app.use('/docs', (req, res) => {
        const url = req.protocol + '://' + req.get('host') + '/swagger.yaml'
        res.redirect('/swagger/?url=' + url)
    })
    app.use('/swagger', express.static(__dirname + '/swagger-ui-3/dist'))
	
	app.use(require('./routes/lws'))
	app.use(require('./routes/account'))
	
	app.use(errorHandler())
	
	app.listen(app.get('port'), () => consoleNotes(app.get('port')))
	
	module.exports = app
}

(env === 'production') ? cluster(server) : server()
