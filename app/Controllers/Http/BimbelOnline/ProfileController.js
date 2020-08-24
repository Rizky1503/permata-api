'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class ProfileController {

	async profile ({params, response}) {

		const profile = await Database
			.query()
		  	.table('in_soal_examp')
		  	.innerJoin('in_pelanggan', 'in_soal_examp.id_user', 'in_pelanggan.id_pelanggan')
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.orderBy('id_examp','DESC')
		  	.first()

		return response.json(profile)
	}

}

module.exports = ProfileController
