'use strict'

const chalk = require('chalk')
const osUser = require('os').userInfo().username
const numCPUs = require('os').cpus().length
const pj = require('../package.json')

function consoleNotes(port) {
	const note = 
		'Node Environment: ' + process.env.NODE_ENV + '\n' +
		'Working Dir: ' + process.cwd() + '\n'  +
		'Platform: ' + process.platform + '\n' +
		'OS Username: ' + osUser + '\n' +
		'CPUs Running: ' + numCPUs + '\n' +
		'Port: ' + port + '\n' +
		'Product Name: ' + pj.name + '\n' +
		'Build Version: ' + pj.version + '\n' +
		'NodeJS Version: ' + process.version + '\n'

	console.log(chalk.green('B*Trade - Advanced Cryptocurrency Exchange'))
	console.log(chalk.green('************************************'))
	console.log(chalk.green(`
    _______   _______   __       _______  ___ ___ _________ ____   ___
   /       | |   ____| |  |     |   ____||  |/  / |   ____| \\   \\  /  / 
   |   (---- |  |__    |  |     |  |__   |     /  |  |__    \\   \\/  /  
   \\   \\     |   __|   |  |     |   __|  |   <    |   __|    \\_   _/   
.----)   |   |  |____  |  -----||  |     |     \\  |  |____    |  |     
|_______/    |_______| |_______||__|     |__|\\__\\ |_______|   |__|     
                                                                      `))
	console.log(chalk.yellow(note))
}

module.exports = consoleNotes
