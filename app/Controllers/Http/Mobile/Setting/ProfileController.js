'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class ProfileController {

	async profile ({request, response}) {
		const input = request.only(['id_user'])
		const data_transaksi = await Database
			.query()
		  	.table('in_pelanggan')
		  	.where('id_pelanggan', input.id_user)
		  	.first()

		return response.json({
			status : 'true',
			responses : '200',
			data:data_transaksi			
		})
	}

	async change_profile ({request, response}) {
		const input = request.only(['id_user','nama_lengkap','no_telpon','alamat','image_name'])
		const data_profile = await Database
			.query()
		  	.table('in_pelanggan')
		  	.where('id_pelanggan', input.id_user)
		  	.update({
		  		nama: input.nama_lengkap,
		  		no_telpon: input.no_telpon,
		  		alamat: input.alamat,
		  		foto: input.image_name,
		  	})

		return response.json({
			status : 'true',
			responses : '200',
			data:data_profile			
		})
	}
}

module.exports = ProfileController
