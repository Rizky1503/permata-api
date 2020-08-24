'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const fs = require('fs');


class LogController {

	async index ({request, response, view}) {

		const dir = './logs/';
		const files = fs.readdirSync(dir);


	    return view.render('log.index', {tahun : files})
	}

	async bulan ({params, response, view}) {

		const dir = './logs/'+params.tahun;
		const files = fs.readdirSync(dir);


	    return view.render('log.bulan', {tahun: params.tahun, bulan : files})
	}

	async hari ({params, response, view}) {

		const dir = './logs/'+params.tahun+'/'+params.bulan;
		const files = fs.readdirSync(dir);


	    return view.render('log.hari', {tahun: params.tahun, bulan : params.bulan, hari : files})
	}

	async view ({params, response, view}) {

		const dir = './logs/'+params.tahun+'/'+params.bulan+'/'+params.hari;
		const files = fs.readFileSync(dir);
		const student = JSON.parse(files);
		return files
	}
	
}

module.exports = LogController
