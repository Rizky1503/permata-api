'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const CatLog = require('cat-log')
const log = new CatLog()

class VersionController {

	async version_pelanggan ({request, response}) {

		const data = request.only(['version'])
		return response.status(200).json({
			version_app: 4194325,
			version_app_name: '1.1.7',
	  	})
	}

	async version_mitra ({request, response}) {

		const data = request.only(['version'])
		return response.status(200).json({
			version_app: 2,
			version_app_name: '1.1.7',
	  	})
	}

	async survey_check ({request, response}) {
		return response.status(200).json({
			status: 200,
			message: 'data already',
			voucherCount: 0
	  	})
		// const data = request.only(['id_pelanggan'])
		// const store_survey = await Database
		//   .table('in_survey')
		//   .where('id_pelanggan', data.id_pelanggan)

		// const store_surveyVoucher = await Database
		//   .table('in_voucher_already')
		//   .where('active', 1)
		//   .count()
		//   .fisrt()		  

		// if (store_survey.length > 0) {
		// 	return response.status(200).json({
		// 		status: 200,
		// 		message: 'data already',
		// 		voucherCount: store_surveyVoucher.count
		//   	})
		// }else{
		// 	return response.status(201).json({
		// 		status: 201,
		// 		message: 'data not found',
		// 		voucherCount: store_surveyVoucher.count
		//   	})
		// }
				
	}

	async survey_sumber ({request, response}) {
		const data = request.only(['id_pelanggan', 'sumber'])
		try{
			const store_survey = await Database
			  .table('in_survey')
			  .insert({
			  	id_pelanggan: data.id_pelanggan, 
			  	sumber: data.sumber,
			  	created_at: new Date(),
			  	updated_at: new Date(),
			})

			return response.status(200).json({
				status: 200,
				message: 'survey has been saved',
		  	})
		}catch(e){			

			return response.status(201).json({
				status: 201,
				message: e,
		  	})
		}		
	}

	async log_error_mobile ({request, response}) {
		log.info('some important information')
		return 'Log test complete ' + new Date().toISOString()
	}
	
}

module.exports = VersionController
