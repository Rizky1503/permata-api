'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class PaketController {

	async list_paket_terbaru ({params, response}) {
		const data_transaksi = await Database
			.query()
		  	.table('in_paket_bimbel_online')
		  	.where('mobile_display',1)
		  	.orderBy('id_paket','DESC')
		  	

		return response.json({
			status : 'true',
			responses : '200',
			data:data_transaksi			
		})
	}

	async list_paket_terbaru_home ({params, response}) {
		const data_transaksi = await Database
			.query()
		  	.table('in_paket_bimbel_online')
		  	.where('mobile_display',1)
		  	.orderBy('id_paket','DESC')
		  	.limit(5)
		  	

		return response.json({
			status : 'true',
			responses : '200',
			data:data_transaksi			
		})
	}
}

module.exports = PaketController
