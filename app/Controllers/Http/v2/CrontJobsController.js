'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')
const moment = require('moment');


class CrontJobsController {

	async expired ({request, response}) {

		const ChangeStatusOrder = await Database.raw(`
			UPDATE v2.tscn_order 
				SET tab_order = 'Selesai', 
				status_order='Expired' 
			WHERE tab_order = 'Selesai' 
			AND status_order = 'Approved' 
			AND expired <= '`+moment().format('M/D/Y')+`'`
		)

		return response.status(200).json({
			status: 201,
			message: 'crontjob has been running '+ChangeStatusOrder.rowCount+' data success update',
	  	})
	}
	
}

module.exports = CrontJobsController
