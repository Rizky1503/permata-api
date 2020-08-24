'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class ReportController {

	async profile ({params, response}) {

		const profile = await Database
			.query()
		  	.table('in_soal_examp')
		  	.innerJoin('in_pelanggan', 'in_soal_examp.id_user', 'in_pelanggan.id_pelanggan')
		  	.where('id_examp', params.id_user.replace(/%20/g, ' '))
		  	.where('status','Selesai')
		  	.first()

		return response.json(profile)
	}


	async start ({params, response}) {

		const soal = await Database
			.query()
		  	.table('in_soal_execute')
		  	.where('id_examp', params.id_examp.replace(/%20/g, ' '))
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.orderBy('id_soal_execute')

		return response.json(soal)
	}


	async soal ({params, response}) {

		const soal = await Database
			.table('in_soal_execute')
		  	.select('id_soal_execute','in_soal.id_soal','id_examp','soal','jawaban_user','in_soal.pembahasan','in_soal.jawaban')
		  	.innerJoin('in_soal', 'in_soal_execute.id_soal', 'in_soal.id_soal')
		  	.where('id_soal_execute', params.id_soal.replace(/%20/g, ' '))
		  	.first()

		return response.json(soal)
	}

	async soal_berbayar_pembahasan ({params, response}) {

		const soal = await Database
		  	.query()
			.table('in_soal_langganan')
		  	.where('id_soal', params.id_soal.replace(/%20/g, ' '))
		  	.first()

		return response.json(soal)
	}

}

module.exports = ReportController
