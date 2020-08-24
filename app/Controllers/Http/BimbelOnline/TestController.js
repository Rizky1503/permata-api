'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class TestController {

	async profile ({params, response}) {

		const profile = await Database
			.query()
		  	.table('in_soal_examp')
		  	.innerJoin('in_pelanggan', 'in_soal_examp.id_user', 'in_pelanggan.id_pelanggan')
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.where('status','Mulai')
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
		  	.select('id_soal_execute','in_soal.id_soal','id_examp','soal','jawaban_user')
		  	.innerJoin('in_soal', 'in_soal_execute.id_soal', 'in_soal.id_soal')
		  	.where('id_soal_execute', params.id_soal.replace(/%20/g, ' '))
		  	.first()

		return response.json(soal)
	}


	async answer ({request, response}) {

		const temps	= request.only(['id_soal_execute', 'jawaban'])

			const soalJawab = await Database
			.table('in_soal_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({jawaban_user: temps.jawaban})

		const Check = await Database
			.table('in_soal_execute')
		  	.innerJoin('in_soal', 'in_soal_execute.id_soal', 'in_soal.id_soal')
		  	.where('id_soal_execute', temps.id_soal_execute.replace(/%20/g, ' '))
		  	.first()

		if (Check.jawaban_user === null) {
			
			const nilai = 0
			const soal = await Database
			.table('in_soal_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')
			return response.json(soal)

		}else if (Check.jawaban_user == Encryption.decrypt(Check.jawaban_betul)) {
			const nilai = 1
			const soal = await Database
			.table('in_soal_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})			
			.returning('id_examp')
			return response.json(soal)

		}else{
			const nilai = 0
			const soal = await Database
			.table('in_soal_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')
			return response.json(soal)

		}		
	}

	

	async time ({request, response}) {

		const temps	= request.only(['id_examp', 'waktu'])
		const soal = await Database
			.table('in_soal_examp')
			.where('id_examp', temps.id_examp)
			.update({waktu_test: temps.waktu})
			.returning('in_soal_examp')

		return response.json(soal)
	}


	async finish ({request, response}) {

		const temps	= request.only(['id_examp'])
		const soal = await Database
			.table('in_soal_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.sum('nilai')
		  	.first()

		const TotalSoal = await Database
			.table('in_soal_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.count()
		  	.first()

		const benar = await Database
			.table('in_soal_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.where('nilai', '1')
		  	.count()
		  	.first()

		const salah = await Database
			.table('in_soal_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.where('nilai', '0')
		  	.count()
		  	.first()


		const nullable = await Database
			.table('in_soal_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.whereNull('jawaban_user')
		  	.count()
		  	.first()

		const keterangan = ({
			benar: benar.count,
			salah: salah.count,
			tidak_jawab: nullable.count
		})

		const SoalTotal 			= TotalSoal.count * 4;
		const SoalTotalBenar 		= soal.sum;
		const SoalTotalCount 		= soal.sum / SoalTotal;
		const SoalTotalCountPercent = SoalTotalCount * 100;


		const Examp = await Database
			.table('in_soal_examp')
			.where('id_examp', temps.id_examp)
			.update({total_nilai: soal.sum, keterangan_akhir:keterangan, status: 'Selesai', passing_grade: SoalTotalCountPercent})

		return response.json(keterangan)
		
	}


	async gratis_nolog_profile ({params, response}) {

		const profile = await Database
			.query()
		  	.table('in_soal_gratis_nolog_examp')
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.where('status','Mulai')
		  	.first()

		return response.json(profile)
	}


	async gratis_nolog_start ({params, response}) {

		const soal = await Database
			.query()
		  	.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', params.id_examp.replace(/%20/g, ' '))
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.orderBy('id_soal_execute')

		return response.json(soal)
	}

	async gratis_nolog_soal ({params, response}) {

		const soal = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.select('id_soal_execute','in_soal_gratis_nolog.id_soal','id_examp','soal','pembahasan','jawaban_user')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog_execute.id_soal', 'in_soal_gratis_nolog.id_soal')
		  	.where('id_soal_execute', params.id_soal.replace(/%20/g, ' '))
		  	.first()

		return response.json(soal)
	}

	async gratis_nolog_answer ({request, response}) {

		const temps	= request.only(['id_soal_execute', 'jawaban'])

			const soalJawab = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({jawaban_user: temps.jawaban})

		const Check = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog_execute.id_soal', 'in_soal_gratis_nolog.id_soal')
		  	.where('id_soal_execute', temps.id_soal_execute.replace(/%20/g, ' '))
		  	.first()

		if (Check.jawaban_user === null) {
			
			const nilai = 0
			const soal = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')
			return response.json(soal)

		}else if (Check.jawaban_user == Encryption.decrypt(Check.jawaban_betul)) {
			const nilai = 1
			const soal = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})			
			.returning('id_examp')
			return response.json(soal)

		}else{
			const nilai = 0
			const soal = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')
			return response.json(soal)

		}		
	}

	async gratis_nolog_time ({request, response}) {

		const temps	= request.only(['id_examp', 'waktu'])
		const soal = await Database
			.table('in_soal_gratis_nolog_examp')
			.where('id_examp', temps.id_examp)
			.update({waktu_test: temps.waktu})
			.returning('in_soal_gratis_nolog_examp')

		return response.json(soal)
	}

	async gratis_nolog_finish ({request, response}) {

		const temps	= request.only(['id_examp'])
		const soal = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.sum('nilai')
		  	.first()

		const TotalSoal = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.count()
		  	.first()

		const benar = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.where('nilai', '1')
		  	.count()
		  	.first()

		const salah = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.whereNotNull('jawaban_user')
		  	.where('nilai', '0')
		  	.count()
		  	.first()


		const nullable = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp.replace(/%20/g, ' '))
		  	.whereNull('jawaban_user')
		  	.count()
		  	.first()

		const keterangan = ({
			benar: benar.count,
			salah: salah.count,
			tidak_jawab: nullable.count
		})

		const SoalTotal 			= TotalSoal.count * 4;
		const SoalTotalBenar 		= soal.sum;
		const SoalTotalCount 		= soal.sum / SoalTotal;
		const SoalTotalCountPercent = SoalTotalCount * 100;


		const Examp = await Database
			.table('in_soal_gratis_nolog_examp')
			.where('id_examp', temps.id_examp)
			.update({total_nilai: soal.sum, keterangan_akhir:keterangan, status: 'Selesai', passing_grade: SoalTotalCountPercent})

		return response.json(keterangan)
		
	}

}

module.exports = TestController
