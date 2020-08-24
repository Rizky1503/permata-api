'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class gratisController {

	async profile ({request, response}){
		const data	= request.only(['id_user'])
		const Cek = await Database
	  	.table('in_soal_gratis_nolog_examp')
	  	.where('id_user', data.id_user)
	  	.where('status', 'Mulai')
	  	.orderBy('id_examp')
	  	.first()

	  	return response.json({
			status : 'true',
			responses : '200',
			data:Cek
		})
	}

	async tingkat ({response}) {
		const tingkat = await Database
			.query()
			.select('kelas as label','kelas as value','no_urut')
		  	.table('in_soal_gratis_nolog')
		  	.groupBy('kelas','no_urut')
		  	.orderBy('no_urut', 'ASC')
		return response.json({
			status : 'true',
			responses : '200',
			data:tingkat			
		})
	}

	async mata_pelajaran ({request, response}) {
		const input = request.only(['kelas']);
		const mapel = await Database
			.query()
			.select('nama_matpel as label','nama_matpel as value',)
		  	.table('in_soal_gratis_nolog')
		  	.where('kelas', input.kelas)
		  	.groupBy('nama_matpel')
		return response.json({
			status : 'true',
			responses : '200',
			data:mapel			
		})
	}

	async store_temp ({request, response}) {

		const temps	= request.only(['tingkat', 'matpel','id_user'])

		const affectedRows = await Database
	  	.table('in_soal_gratis_nolog_temp')
	  	.where('id_user', temps.id_user)
	  	.delete()
		
		const MatPelOnline 	= await Database
		.query()
	  	.table('in_matpel_online_gratis_nolog')
	  	.where('kelas', temps.tingkat)
	  	.where('mata_pelajaran', temps.matpel)
	  	.where('jumlah_soal','!=',0)	

	  	var Tampung_Data = [];
	  	for (var i = 0; i < MatPelOnline.length; i++) {	  		
	  		
	  		const soal = await Database
		  	.table('in_soal_gratis_nolog')
		  	.where('kelas', MatPelOnline[i].kelas)
		  	.where('nama_matpel', MatPelOnline[i].mata_pelajaran)
			.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(MatPelOnline[i].jumlah_soal)			
	  		Tampung_Data.push(soal);	
  		}	

  		for (var i = 0; i < Tampung_Data.length; i++) {

  			for (var no = 0; no < Tampung_Data[i].length; no++) {

  				const data_store_temp = await Database
				  .table('in_soal_gratis_nolog_temp')
				  .insert({
				  	id_soal: Tampung_Data[i][no].id_soal, 
				  	id_user: temps.id_user,
				  	waktu: Tampung_Data[i][no].waktu,
				  	jawaban_betul: Encryption.encrypt(Tampung_Data[i][no].jawaban)
				})
  			}
  		}

  		const GetTime = await Database
	  	.table('in_soal_gratis_nolog_temp')
	  	.where('id_user', temps.id_user)
	  	.sum('waktu')
	  	.first()

  		return response.json({
			status : 'true',
			responses : '200',
			data:MatPelOnline,
			menit:GetTime.sum		
		})
	}

	async store_submit ({request, response}) {

		const processData	= request.only(['id_user', 'keterangan', 'waktu_test'])

		const Cek = await Database
	  	.table('in_soal_gratis_nolog_examp')
	  	.where('id_user', processData.id_user)
	  	.where('status', 'Mulai')
	  	.count()
	  	.first()

	  	if (Cek.count == 0) {

			const send_data_examp = await Database
		  	.table('in_soal_gratis_nolog_examp')
		  	.insert({
			  	id_user: processData.id_user, 
			  	keterangan: processData.keterangan,
			  	waktu_test: processData.waktu_test,
			  	status: 'Mulai',
			  	created_at: new Date(),
			  	updated_at: new Date()
			})
			.returning('id_examp')	

			const get_data_temp = await Database
		  	.table('in_soal_gratis_nolog_temp')
		  	.where('id_user', processData.id_user)

		  	for (var i = 0; i < get_data_temp.length; i++) {		  		
		  		const send_data_execute = await Database
				  .table('in_soal_gratis_nolog_execute')
				  .insert({
				  	id_soal: get_data_temp[i].id_soal, 
				  	jawaban_betul: get_data_temp[i].jawaban_betul,
				  	id_user: processData.id_user,
				  	id_examp: send_data_examp[0],
				})
		  	}

		  	return response.json({
				status : 'true',
				responses : '200',
				data:"Completed",
			})
		}else{
			return response.json({
				status : 'true',
				responses : '200',
				data:"No Completed",
			})
		}


	}

	async clear_examp ({request, response}){
		const data	= request.only(['id_user'])
		const remove_examp = await Database
	  	.table('in_soal_gratis_nolog_examp')
	  	.where('id_user', data.id_user)
	  	.delete()

	  	const remove_execute = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_user', data.id_user)
	  	.delete()

	  	const remove_temp = await Database
	  	.table('in_soal_gratis_nolog_temp')
	  	.where('id_user', data.id_user)
	  	.delete()

	  	return response.json({
			status : 'true',
			responses : '200',
			data:"Finish"
		})
	}

	async test_list_number ({request, response}) {

		const temps	= request.only(['id_examp'])	
	  	const Satu_Soal = await Database
		.query()
	  	.table('in_soal_gratis_nolog_execute')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_soal', 'in_soal_gratis_nolog_execute.id_soal')
	  	.where('id_examp', temps.id_examp)
	  	.orderBy('in_soal_gratis_nolog_execute.id_soal_execute')
	  	.first()

	  	const check_sebelumnya = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_examp', temps.id_examp)
	  	.where('id_soal_execute', '<', Satu_Soal.id_soal_execute)
	  	.count()
	  	.first()

		const check_selanjutnya = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_examp', temps.id_examp)
	  	.where('id_soal_execute', '>', Satu_Soal.id_soal_execute)
	  	.count()
	  	.first()

	  	return response.json({
			status 		: 'true',
			responses 	: '200',
			Satu_Soal	: Satu_Soal,
			sebelumnya  : check_sebelumnya.count,
			selanjutnya : check_selanjutnya.count,		
		})
	}

	async click_number ({request, response}) {

		const temps	= request.only(['id_soal_execute'])			
	  	const Satu_Soal = await Database
		.query()
	  	.table('in_soal_gratis_nolog_execute')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_soal', 'in_soal_gratis_nolog_execute.id_soal')
	  	.where('id_soal_execute', temps.id_soal_execute)
	  	.orderBy('in_soal_gratis_nolog_execute.id_soal_execute')
	  	.first()

	  	const check_sebelumnya = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_examp', Satu_Soal.id_examp)
	  	.where('id_soal_execute', '<', temps.id_soal_execute)
	  	.count()
	  	.first()

		const check_selanjutnya = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_examp', Satu_Soal.id_examp)
	  	.where('id_soal_execute', '>', temps.id_soal_execute)
	  	.count()
	  	.first()


	  	return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: Satu_Soal,
			sebelumnya  : check_sebelumnya.count,
			selanjutnya : check_selanjutnya.count,	
		})
	}

	async click_number_new ({request, response}) {

		const temps	= request.only(['id_soal_execute','id_examp'])			
	  	const Satu_Soal = await Database
		.query()
	  	.table('in_soal_gratis_nolog_execute')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_soal', 'in_soal_gratis_nolog_execute.id_soal')
	  	.where('id_soal_execute', temps.id_soal_execute)
	  	.orderBy('in_soal_gratis_nolog_execute.id_soal_execute')
	  	.first()

	  	const check_sebelumnya = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_examp', temps.id_examp)
	  	.where('id_soal_execute', '<', temps.id_soal_execute)
	  	.count()
	  	.first()

		const check_selanjutnya = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_examp', temps.id_examp)
	  	.where('id_soal_execute', '>', temps.id_soal_execute)
	  	.count()
	  	.first()


	  	return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: Satu_Soal,
			sebelumnya  : check_sebelumnya.count,
			selanjutnya : check_selanjutnya.count,	
		})
	}

	async answer ({request, response}) {

		const temps	= request.only(['id_soal_execute', 'jawaban'])

			const soalJawab = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({jawaban_user: temps.jawaban})

		const Check = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog_execute.id_soal', 'in_soal_gratis_nolog.id_soal')
		  	.where('id_soal_execute', temps.id_soal_execute)
		  	.first()

		if (Check.jawaban_user === null) {
			
			const nilai = 0
			const soal = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')

		}else if (Check.jawaban_user == Encryption.decrypt(Check.jawaban_betul)) {
			const nilai = 1
			const soal = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})			
			.returning('id_examp')

		}else{
			const nilai = 0
			const soal = await Database
			.table('in_soal_gratis_nolog_execute')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')

		}

		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: Check			
		})
	}

	async update_time ({request, response}) {

		const temps	= request.only(['id_examp'])

		const get_time = await Database
			.table('in_soal_gratis_nolog_examp')
		  	.where('id_examp', temps.id_examp)
		  	.first()

		if (get_time.waktu_test != 0) {
			const update_time = await Database
			.table('in_soal_gratis_nolog_examp')
			.where('id_examp', temps.id_examp)
			.update({
				waktu_test: get_time.waktu_test - 1
			})
		}

			
		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: "success"			
		})
	}


	async Finish ({request, response}) {

		const temps	= request.only(['id_examp'])
		const soal = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp)
		  	.sum('nilai')
		  	.first()

		const TotalSoal = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp)
		  	.count()
		  	.first()

		const benar = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp)
		  	.where('nilai', '1')
		  	.count()
		  	.first()

		const salah = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp)
		  	.whereNotNull('jawaban_user')
		  	.where('nilai', '0')
		  	.count()
		  	.first()


		const nullable = await Database
			.table('in_soal_gratis_nolog_execute')
		  	.where('id_examp', temps.id_examp)
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


		const result = ({
			total_nilai: soal.sum,
			total_soal: TotalSoal.count,
			benar: benar.count,
			salah: salah.count,
			tidak_jawab: nullable.count
		})

		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: result			
		})
		return response.json(keterangan)
	}
}

module.exports = gratisController
