'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class RingkasanController {

	async ringkasan ({request,response}){
		const Inputs = request.only(['id_kelas'])

		const get_id_kelas = await Database
			.select('id_kelas')
			.from('in_soal_langganan_paket')
			.where('id_paket',Inputs.id_kelas)
			.first()
			
		const ringkasan = await Database
			.select('matapelajaran')
			.table('in_bedah_mata_pelajaran')
			.where('id_kelas',get_id_kelas.id_kelas)
			.groupBy('matapelajaran')
			.orderBy('matapelajaran','ASC')

		for (var i = 0; i < ringkasan.length; i++) {
			const ringkasan_matpel = await Database
				.table('in_bedah_mata_pelajaran')
				.innerJoin('in_bedah_file','in_bedah_mata_pelajaran.id','in_bedah_file.id_bedah_mata_pelajaran')
				.where('in_bedah_mata_pelajaran.matapelajaran',ringkasan[i].matapelajaran)
				.where('in_bedah_mata_pelajaran.id_kelas',get_id_kelas.id_kelas)
				.orderBy('in_bedah_mata_pelajaran.silabus','ASC')
			ringkasan[i]['ringkasan_matpel'] = ringkasan_matpel; 
		}

		return response.json(ringkasan)
	}

}

module.exports = RingkasanController
