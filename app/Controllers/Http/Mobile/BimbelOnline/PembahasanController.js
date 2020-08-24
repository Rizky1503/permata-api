'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class PembahasanController {

	async list ({request, response}) {
		const data = request.only(['id_user', 'page', 'show_page']);
		const Pembahasan = await Database
			.query()
			.select('jenis_paket','tahun_soal','tingkat','kelas')
		  	.table('in_soal_langganan')
		  	.groupBy('jenis_paket')
		  	.groupBy('tahun_soal')
		  	.groupBy('tingkat')
		  	.groupBy('kelas')
		  	.orderBy('jenis_paket','ASC')
		  	.orderBy('tahun_soal','DESC')
		  	.paginate(data.page, data.show_page)

		return response.json({
			status : 'true',
			responses : '200',
			data:Pembahasan.data			
		})
	}

	async list_soal ({request, response}) {
		const data = request.only(['jenis_paket', 'tahun_soal', 'tingkat', 'kelas', 'page', 'show_page']);
		const Pembahasan = await Database
			.query()
		  	.table('in_soal_langganan')
		  	.where('jenis_paket', data.jenis_paket)
		  	.where('tahun_soal', data.tahun_soal)
		  	.where('tingkat', data.tingkat)
		  	.where('kelas', data.kelas)
		  	.orderBy('tahun_soal','DESC')
		  	.paginate(data.page, data.show_page)

		return response.json({
			status : 'true',
			responses : '200',
			data:Pembahasan.data			
		})
	}
}

module.exports = PembahasanController
