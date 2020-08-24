'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class BedahMateriController {

	async kelas ({request, response}) {
		
		const data = request.only(['id_user']);
		
		const order = await Database
			.query()			
			.select([Database.raw("CASE WHEN keterangan = 'TINGKAT' THEN kondisi ELSE concat_ws(' ', keterangan,kondisi) END AS value"), Database.raw("CASE WHEN keterangan = 'TINGKAT' THEN kondisi ELSE concat_ws(' ', keterangan,kondisi) END AS label")])
			.table('in_order')
		  	.where('id_user_order',data.id_user)
		  	.where('status_order','In Progres')

		return response.json({
			status : 'true',
			responses : '200',
			data:order			
		})
	}

	async index ({request, response}) {
		
		const data = request.only(['paket_pelajaran']);
		
		const matpel = await Database
			.query()			
			.select('in_bedah_mata_pelajaran.matapelajaran')
			.table('in_bedah_file')
		  	.innerJoin('in_bedah_mata_pelajaran', 'in_bedah_mata_pelajaran.id', 'in_bedah_file.id_bedah_mata_pelajaran')
		  	.groupBy('matapelajaran')
		  	.where('tingkat',data.paket_pelajaran)

		for (var i = 0; i < matpel.length; i++) {

			const silabus = await Database
			.query()			
			.table('in_bedah_file')
		  	.innerJoin('in_bedah_mata_pelajaran', 'in_bedah_mata_pelajaran.id', 'in_bedah_file.id_bedah_mata_pelajaran')
		  	.where('tingkat', data.paket_pelajaran)
		  	.where('matapelajaran', matpel[i].matapelajaran)

			matpel[i]['data_silabus'] = silabus;
		}

		return response.json({
			status : 'true',
			responses : '200',
			data:matpel			
		})
	}
}

module.exports = BedahMateriController
