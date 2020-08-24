'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class PembahasanController {

	async index ({params, response}) {

		const profile = await Database
			.query()
		  	.table('in_soal_examp')
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.orderBy('id_examp','DESC')

		return response.json(profile)
	}


	async gratis_nolog_pembahasan ({params, response}) {

		const pembahasan = await Database
			.query()
		  	.table('in_soal_gratis_nolog_execute')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog_execute.id_soal', 'in_soal_gratis_nolog.id_soal')
		  	.where('id_examp', params.id_examp)
		  	.orderBy('id_soal_execute','ASC')
		return response.json(pembahasan)
	}


	async saran_berbayar ({request, response}) {
		const Inputs = request.only(['id_user','id_kelas'])
		
		const get_id_kelas = await Database
			.select('id_kelas')
			.from('in_soal_langganan_paket')
			.where('id_paket',Inputs.id_kelas)
			.first()

		const saran = await Database
			.query()
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', Inputs.id_user)
		  	.where('id_kelas', get_id_kelas.id_kelas)
		  	.orderBy('id_examp','DESC')

		return response.json(saran)
	}

	async pembahasan_berbayar_ ({request, response}) {
		const Inputs = request.only(['id_user','id_kelas'])
		const pembahasan = await Database
			.query()
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', Inputs.id_user)
		  	.where('id_kelas', Inputs.id_kelas)
		  	.orderBy('id_examp','DESC')

		return response.json(pembahasan)
	}

	async pembahasan_berbayar ({request, response}) {
		const Inputs = request.only(['id_kelas'])
		
		const get_id_kelas = await Database
			.select('id_kelas')
			.from('in_soal_langganan_paket')
			.where('id_paket',Inputs.id_kelas)
			.first()

		const pembahasan = await Database
			.select('jenis_paket')
		  	.table('in_soal_langganan')
		  	.where('id_kelas', get_id_kelas.id_kelas)
		  	.groupBy('jenis_paket')
		  	.orderBy('jenis_paket','ASC')
		for (var i = 0; i < pembahasan.length; i++) {
			const pembahasan_matpel = await Database
				.select('in_soal_langganan.nama_matpel','in_soal_langganan_kelas.kelas')
				.table('in_soal_langganan')
				.innerJoin('in_soal_langganan_kelas','in_soal_langganan.id_kelas','in_soal_langganan_kelas.id_kelas')
				.where('in_soal_langganan.jenis_paket',pembahasan[i].jenis_paket)
				.where('in_soal_langganan_kelas.id_kelas',get_id_kelas.id_kelas)
				.groupBy('in_soal_langganan.nama_matpel','in_soal_langganan_kelas.kelas')
			pembahasan[i]['pembahasan_matpel'] = pembahasan_matpel; 
		}

		return response.json(pembahasan)
	}

}

module.exports = PembahasanController
