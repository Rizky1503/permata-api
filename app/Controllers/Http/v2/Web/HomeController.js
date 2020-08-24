'use strict'
const Database = use('Database')
const Helpers = use('Helpers')

class HomeController {

	async GetRingkasanMateriRandom({response}){
		const get = await Database
			.select('ringkasan.file','kelas.kelas','bidstud.bidang_studi')
			.table('v2.ts_ringkasan_materi as ringkasan')
			.innerJoin('v2.ts_content as konten','ringkasan.id_content','konten.id_content')
			.innerJoin('v2.ms_kelas as kelas','konten.id_kelas','kelas.id_kelas')
			.innerJoin('v2.ms_bidang_studi as bidstud','konten.id_bidang_studi','bidstud.id_bidang_studi')
			.leftJoin('v2.ms_topik as topik','konten.id_topik','topik.id_topik')
			.limit(1)
			.orderByRaw('random()')
			.first()
		return response.json(get)
	}

	async GetSoalRandom({response}){
		const get = await Database
			.select('soal.pembahasan','soal.soal','kelas.kelas','bidstud.bidang_studi','soal.id_content')
			.table('v2.ts_soal as soal')
			.innerJoin('v2.ts_content as konten','soal.id_content','konten.id_content')
			.innerJoin('v2.ms_kelas as kelas','konten.id_kelas','kelas.id_kelas')
			.innerJoin('v2.ms_bidang_studi as bidstud','konten.id_bidang_studi','bidstud.id_bidang_studi')
			.leftJoin('v2.ms_topik as topik','konten.id_topik','topik.id_topik')
			.limit(1)
			.orderByRaw('random()')
			.first()
		return response.json(get)
	}

}

module.exports = HomeController
