'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const moment = require('moment');

class MatpelController {

	async kelas ({response}) {
		const kelas = await Database
			.query()
		  	.table('in_soal')
		  	.groupBy('kelas')
		  	.pluck('kelas')
		return response.json(kelas)
	}

	async mapel ({params, response}) {
		const mapel = await Database
			.query()
		  	.table('in_soal')
		  	.where('kelas', params.id.replace(/%20/g, ' '))
		  	.groupBy('nama_matpel')
		  	.pluck('nama_matpel')		  	
		return response.json(mapel)
	}

	async silabus ({params, response}) {

		const mapel = await Database
			.query()
		  	.table('in_soal')
			.select('kelas', 'nama_matpel', 'silabus','keterangan')
		  	.where('kelas', params.kelas.replace(/%20/g, ' '))
		  	.where('nama_matpel', params.mapel.replace(/%20/g, ' '))
		  	.groupBy('kelas', 'nama_matpel', 'silabus','keterangan')
		return response.json(mapel)
	}


	async confirm_silabus ({request, response}) {
		const Inputs = request.only(['tingkat','invoice','jenis','tahun','mata_pelajaran'])
		const confirm = await Database
		  	.table('in_matpel_online')
		  	.where('mata_pelajaran', Inputs.mata_pelajaran )
		  	.where('tingkat', Inputs.tingkat)
		  	.where('jenis_paket', Inputs.jenis)
		return response.json(confirm)
	}

	async soal ({params, response}) {

		const soal = await Database
		  	.table('in_soal')
		  	.where('kelas', params.kelas.replace(/%20/g, ' '))
		  	.where('nama_matpel', params.mapel.replace(/%20/g, ' '))
			.where('silabus', params.silabus.replace(/%20/g, ' '))
			.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(params.limit)

		return response.json(soal)
	}

	async temp ({request, response}) {

		const temps	= request.only(['id_soal', 'id_user', 'waktu','jawaban_betul'])				

		const Cek = await Database
		  	.table('in_soal_temp')
		  	.where('id_soal', temps.id_soal)
		  	.where('id_user', temps.id_user)
		  	.where('waktu', temps.waktu)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  .table('in_soal_temp')
			  .insert({
			  	id_soal: temps.id_soal, 
			  	id_user: temps.id_user,
			  	waktu: temps.waktu,
			  	jawaban_betul: Encryption.encrypt(temps.jawaban_betul)
			})		
		}
		return response.status(201).json("Success")	

	}

	async remove_temp ({params, response}) {

		const affectedRows = await Database
		  .table('in_soal_temp')
		  .where('id_user', params.id_user)
		  .delete()
	}

	async confirm ({params, response}) {

		const jumlahSoal = await Database
		  	.table('in_soal_temp')
		  	.where('id_user', params.id_user)
		  	.count() 
		  	.first()


		const TotalWaktu = await Database
		  	.from('in_soal_temp')
		  	.where('id_user', params.id_user)
		  	.sum('waktu as total_waktu')
		  	.first()

		const SemuaSoal = await Database
		  	.from('in_soal_temp')
		  	.where('id_user', params.id_user)


		if (TotalWaktu.total_waktu === null) {

			return response.json({
				jumlahSoal : jumlahSoal,
				TotalWaktu : '0',
				data : SemuaSoal,
			})

		}else{

			return response.json({
				jumlahSoal : jumlahSoal,
				TotalWaktu : TotalWaktu.total_waktu,
				data : SemuaSoal,
			})
		}
	}


	async process ({request, response}) {

		const processData	= request.only(['id_user', 'keterangan', 'waktu_test','status'])		

		const Cek = await Database
		  	.table('in_soal_examp')
		  	.where('id_user', processData.id_user)
		  	.where('waktu_test', processData.waktu_test)
		  	.where('status', processData.status)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  	.table('in_soal_examp')
			  	.insert({
				  	id_user: processData.id_user, 
				  	keterangan: processData.keterangan,
				  	waktu_test: processData.waktu_test,
				  	status: processData.status,
				  	created_at: new Date(),
				  	updated_at: new Date()
				})
				.returning('id_examp')
			return data[0];		
		}else{
			return "0"
		}
				
	}


	async processSoal ({request, response}) {

		const processData	= request.only(['id_soal', 'jawaban_betul', 'id_user','id_examp'])		

		const Cek = await Database
		  	.table('in_soal_execute')
		  	.where('id_soal', processData.id_soal)
		  	.where('id_user', processData.id_user)
		  	.where('id_examp', processData.id_examp)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  .table('in_soal_execute')
			  .insert({
			  	id_soal: processData.id_soal, 
			  	jawaban_betul: processData.jawaban_betul,
			  	id_user: processData.id_user,
			  	id_examp: processData.id_examp,
			})		
		}

		return response.status(201).json("Success")	
	}


	async confirm_silabus_berbayar ({request, response}) {
			const Inputs = request.only(['jenis','tingkat','mata_pelajaran','id_kelas'])
			const kelas = await Database
				.select('in_soal_langganan_kelas.id_kelas')
				.from('in_soal_langganan_paket')
				.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
				.where('in_soal_langganan_paket.id_paket',Inputs.id_kelas)
				.first()
			const confirm = await Database
			  	.table('in_matpel_online_langganan')
			  	.where('jenis_paket', Inputs.jenis)
			  	.where('id_kelas', kelas.id_kelas)
			  	.where('kelas', Inputs.mata_pelajaran)
			return response.json(confirm)
	}

	async soal_berbayar ({params, response}) {
		const soal = await Database
		  	.table('in_soal_langganan')
		  	.where('jenis_paket', params.jenis_paket.replace(/%20/g, ' '))
		  	.where('tingkat', params.tingkat.replace(/%20/g, ' '))
		  	.where('kelas', params.kelas.replace(/%20/g, ' '))
		  	.where('nama_matpel', params.matpel.replace(/%20/g, ' '))
		  	.where('tahun', params.matpel.replace(/%20/g, ' '))
			.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(params.limit)

		const soalPelajaran = await Database.raw("select nama_matpel, COUNT(nama_matpel) as total_matpel from in_soal_langganan where tingkat = '"+ params.tingkat.replace(/%20/g, ' ')+"' and kelas = '"+ params.kelas.replace(/%20/g, ' ')+"' and nama_matpel = '"+ params.matpel.replace(/%20/g, ' ')+"' and soal is not null and jawaban is not null GROUP BY nama_matpel limit "+params.limit+"");
		return response.json({
			listSoal:soal,
			listSoalPelajaran:soalPelajaran.rows,
		})
	}

	async new_soal_berbayar ({request, response}) {
		const Inputs = request.only(['jenis','tingkat','mata_pelajaran','tahun','limit','id_kelas'])

		const soal = await Database
		  	.table('in_soal_langganan')
		  	.where('id_kelas',Inputs.id_kelas)
		  	.where('jenis_paket', Inputs.jenis)
		  	.where('tahun_soal', Inputs.tahun)			
		  	.where('nama_matpel', Inputs.mata_pelajaran)
		  	.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(Inputs.limit)

		return response.json({
			listSoal:soal,
			
		})
	}

	async temp_berbayar ({request, response}) {

		const temps	= request.only(['id_soal', 'id_user', 'waktu','jawaban_betul'])				

		const Cek = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_soal', temps.id_soal)
		  	.where('id_user', temps.id_user)
		  	.where('waktu', temps.waktu)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  .table('in_soal_temp_langganan')
			  .insert({
			  	id_soal: temps.id_soal, 
			  	id_user: temps.id_user,
			  	waktu: temps.waktu,
			  	jawaban_betul: Encryption.encrypt(temps.jawaban_betul)
			})		
		}
		return response.status(201).json("Success")	

	}

	async confirm_berbayar ({params, response}) {

		const jumlahSoal = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', params.id_user)
		  	.count() 
		  	.first()


		const TotalWaktu = await Database
		  	.from('in_soal_temp_langganan')
		  	.where('id_user', params.id_user)
		  	.sum('waktu as total_waktu')
		  	.first()

		const SemuaSoal = await Database
		  	.from('in_soal_temp_langganan')
		  	.where('id_user', params.id_user)


		if (TotalWaktu.total_waktu === null) {

			return response.json({
				jumlahSoal : jumlahSoal,
				TotalWaktu : '0',
				data : SemuaSoal,
			})

		}else{

			return response.json({
				jumlahSoal : jumlahSoal,
				TotalWaktu : TotalWaktu.total_waktu,
				data : SemuaSoal,
			})
		}
	}

	async remove_temp_berbayar ({params, response}) {

		const affectedRows = await Database
		  .table('in_soal_temp_langganan')
		  .where('id_user', params.id_user)
		  .delete()
	}

	async process_berbayar ({request, response}) {

		const processData	= request.only(['id_user', 'keterangan', 'waktu_test','status','jenis_paket','tahun_soal','id_kelas','id_matpel'])		

		const kelas = await Database
			.select('in_soal_langganan_kelas.id_kelas')
			.from('in_soal_langganan_paket')
			.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
			.where('in_soal_langganan_paket.id_paket',processData.id_kelas)
			.first()

		const Cek = await Database
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', processData.id_user)
		  	.where('status', processData.status)
		  	.where('jenis_paket', processData.jenis_paket)
		  	.where('tahun_soal', processData.tahun_soal)
		  	.where('id_kelas', kelas.id_kelas)
		  	.where('id_matpel_online', processData.id_matpel)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  	.table('in_soal_examp_langganan')
			  	.insert({
				  	id_user: processData.id_user, 
				  	keterangan: processData.keterangan,
				  	waktu_test: processData.waktu_test,
				  	status: processData.status,
				  	jenis_paket: processData.jenis_paket,
				  	tahun_soal: processData.tahun_soal,
				  	id_kelas: kelas.id_kelas,
				  	id_matpel_online: processData.id_matpel,
				  	waktu_test : 0,
				  	created_at: new Date(),
				  	updated_at: new Date()
				})
				.returning('id_examp')

			return response.json({
				status  : true,
				data 	: data[0],
			})
		}else{
			const data = await Database
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', processData.id_user)
		  	.where('status', processData.status)
		  	.where('jenis_paket', processData.jenis_paket)
		  	.where('tahun_soal', processData.tahun_soal)
		  	.where('id_kelas', kelas.id_kelas)
		  	.where('id_matpel_online', processData.id_matpel)
		  	.first()

			return response.json({
				status  : false,
				data 	: data.id_examp,
			})
		}
				
	}

	async processSoal_berbayar ({request, response}) {

		const processData	= request.only(['id_soal', 'jawaban_betul', 'id_user','id_examp'])		

		const Cek = await Database
		  	.table('in_soal_execute_langganan')
		  	.where('id_soal', processData.id_soal)
		  	.where('id_user', processData.id_user)
		  	.where('id_examp', processData.id_examp)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  .table('in_soal_execute_langganan')
			  .insert({
			  	id_soal: processData.id_soal, 
			  	jawaban_betul: processData.jawaban_betul,
			  	id_user: processData.id_user,
			  	id_examp: processData.id_examp,
			})		
		}

		return response.status(201).json("Success")	
	}

	async gratis_nolog_kelas ({response}) {
		const kelas = await Database
			.select('kelas','no_urut')
		  	.table('in_soal_gratis_nolog')
		  	.groupBy('kelas','no_urut')
		  	.orderBy('no_urut','ASC')
		return response.json(kelas)
	}

	async gratis_nolog_mapel ({params, response}) {
		const mapel = await Database
			.query()
		  	.table('in_soal_gratis_nolog')
		  	.where('kelas', params.id.replace(/%20/g, ' '))
		  	.groupBy('nama_matpel')
		  	.pluck('nama_matpel')		  	
		return response.json(mapel)
	}

	async gratis_nolog_silabus ({params, response}) {

		const mapel = await Database
			.query()
		  	.table('in_soal_gratis_nolog')
			.select('kelas', 'nama_matpel', 'silabus','keterangan')
		  	.where('kelas', params.kelas.replace(/%20/g, ' '))
		  	.where('nama_matpel', params.mapel.replace(/%20/g, ' '))
		  	.groupBy('kelas', 'nama_matpel', 'silabus','keterangan')
		return response.json(mapel)
	}

	async gratis_nolog_remove_temp ({params, response}) {

		const affectedRows = await Database
		  .table('in_soal_gratis_nolog_temp')
		  .where('id_user', params.id_user)
		  .delete()
	}


	async gratis_nolog_confirm_silabus ({params, response}) {

		const silabus = params.silabus.replace(/%20/g, ' ')
		const confirm = await Database
		  	.table('in_matpel_online_gratis_nolog')
		  	.where('kelas', params.kelas.replace(/%20/g, ' '))
		  	.where('mata_pelajaran', params.mapel.replace(/%20/g, ' '))
			.whereIn('silabus', silabus.split(','))

		return response.json(confirm)
	}

	async new_gratis_nolog_confirm_silabus ({request, response}) {
		const Inputs	= request.only(['mapel', 'kelas'])	
		const confirm = await Database
		  	.table('in_matpel_online_gratis_nolog')
		  	.where('kelas', Inputs.kelas)
		  	.where('mata_pelajaran', Inputs.mapel )
		return response.json(confirm)
	}

	async new_gratis_nolog_soal ({request, response}) {
		const Inputs = request.only(['mapel', 'kelas', 'limit'])	
		const soal = await Database
		  	.table('in_soal_gratis_nolog')
		  	.where('kelas', Inputs.kelas)
		  	.where('nama_matpel', Inputs.mapel )
			.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(Inputs.limit)
		return response.json(soal)
	}

	async gratis_nolog_soal ({params, response}) {

		const soal = await Database
		  	.table('in_soal_gratis_nolog')
		  	.where('kelas', params.kelas.replace(/%20/g, ' '))
		  	.where('nama_matpel', params.mapel.replace(/%20/g, ' '))
			.where('silabus', params.silabus.replace(/%20/g, ' '))
			.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(params.limit)

		return response.json(soal)
	}


	async gratis_nolog_temp ({request, response}) {

		const temps	= request.only(['id_soal', 'id_user', 'waktu','jawaban_betul'])				

		const Cek = await Database
		  	.table('in_soal_gratis_nolog_temp')
		  	.where('id_soal', temps.id_soal)
		  	.where('id_user', temps.id_user)
		  	.where('waktu', temps.waktu)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  .table('in_soal_gratis_nolog_temp')
			  .insert({
			  	id_soal: temps.id_soal, 
			  	id_user: temps.id_user,
			  	waktu: temps.waktu,
			  	jawaban_betul: Encryption.encrypt(temps.jawaban_betul)
			})		
		}
		return response.status(201).json("Success")	

	}

	async gratis_nolog_confirm ({params, response}) {

		const jumlahSoal = await Database
		  	.table('in_soal_gratis_nolog_temp')
		  	.where('id_user', params.id_user)
		  	.count() 
		  	.first()


		const TotalWaktu = await Database
		  	.from('in_soal_gratis_nolog_temp')
		  	.where('id_user', params.id_user)
		  	.sum('waktu as total_waktu')
		  	.first()

		const SemuaSoal = await Database
		  	.from('in_soal_gratis_nolog_temp')
		  	.where('id_user', params.id_user)


		if (TotalWaktu.total_waktu === null) {

			return response.json({
				jumlahSoal : jumlahSoal,
				TotalWaktu : '0',
				data : SemuaSoal,
			})

		}else{

			return response.json({
				jumlahSoal : jumlahSoal,
				TotalWaktu : TotalWaktu.total_waktu,
				data : SemuaSoal,
			})
		}
	}


	async gratis_nolog_process ({request, response}) {

		const processData	= request.only(['id_user', 'keterangan', 'waktu_test','status'])		

		const Delete = await Database
		  	.table('in_soal_gratis_nolog_examp')
		  	.where('id_user', processData.id_user)
		  	.where('waktu_test', processData.waktu_test)
		  	.where('status', processData.status)
		  	.delete()

		const Cek = await Database
		  	.table('in_soal_gratis_nolog_examp')
		  	.where('id_user', processData.id_user)
		  	.where('waktu_test', processData.waktu_test)
		  	.where('status', processData.status)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  	.table('in_soal_gratis_nolog_examp')
			  	.insert({
				  	id_user: processData.id_user, 
				  	keterangan: processData.keterangan,
				  	waktu_test: processData.waktu_test,
				  	status: processData.status,
				  	created_at: new Date(),
				  	updated_at: new Date()
				})
				.returning('id_examp')
			return data[0];		
		}else{
			return "0"
		}
				
	}

	async gratis_nolog_processSoal ({request, response}) {

		const processData	= request.only(['id_soal', 'jawaban_betul', 'id_user','id_examp'])		

		const Cek = await Database
		  	.table('in_soal_gratis_nolog_execute')
		  	.where('id_soal', processData.id_soal)
		  	.where('id_user', processData.id_user)
		  	.where('id_examp', processData.id_examp)
		  	.count()
		  	.first()

		if (Cek.count == 0) {
			const data = await Database
			  .table('in_soal_gratis_nolog_execute')
			  .insert({
			  	id_soal: processData.id_soal, 
			  	jawaban_betul: processData.jawaban_betul,
			  	id_user: processData.id_user,
			  	id_examp: processData.id_examp,
			})		
		}

		return response.status(201).json("Success")	
	}

	async gratis_nolog_remove_soal ({params, response}) {

		const Temp = await Database
	  	.table('in_soal_temp')
	  	.where('id_user', params.id_user)
	  	.delete()

	  	const Examp = await Database
	  	.table('in_soal_gratis_nolog_examp')
	  	.where('id_user', params.id_user)
	  	.delete()

	  	const Soal = await Database
	  	.table('in_soal_gratis_nolog_execute')
	  	.where('id_user', params.id_user)
	  	.delete()
	}

	async count_soal ({ request,response }){
		const Inputs = request.only([ 'tingkat','jenis_paket','tahun_soal','nama_matpel','id_kelas'])
		const kelas = await Database
			.select('in_soal_langganan_kelas.id_kelas')
			.from('in_soal_langganan_paket')
			.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
			.where('in_soal_langganan_paket.id_paket',Inputs.id_kelas)
			.first()

		const count = await Database
			.table('in_soal_langganan')
		  	.where('id_kelas', kelas.id_kelas)
		  	.where('jenis_paket', Inputs.jenis_paket)
		  	.where('tahun_soal', Inputs.tahun_soal)
		  	.where('nama_matpel', Inputs.nama_matpel)
		  	.count()
		  	.first()
		return response.json(count)
	}

	// revisi bulan april
	async list_kelas__ss ({response}){
		const Category = await Database
			.select('in_soal_gratis_nolog_mata_pelajaran.category')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
			.groupBy('in_soal_gratis_nolog_mata_pelajaran.category')

		for (var i = 0; i < Category.length; i++) {

			const Kelas = await Database
				.select('in_soal_gratis_nolog_mata_pelajaran.kelas','in_soal_gratis_nolog_mata_pelajaran.image_kelas')
			  	.table('in_soal_gratis_nolog_mata_pelajaran')
			  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
				.where('category', Category[i].category)
				.groupBy('in_soal_gratis_nolog_mata_pelajaran.kelas','in_soal_gratis_nolog_mata_pelajaran.image_kelas','in_soal_gratis_nolog_mata_pelajaran.urutan')
				.orderBy('in_soal_gratis_nolog_mata_pelajaran.urutan','ASC')

			Category[i]['key'] = i;
			Category[i]['Kelas'] = Kelas;
		}

		return response.json({
			status : 'true',
			responses : '200',
			data:Category			
		})
	}

	async list_kelas ({request, response}){
		const data = request.only(['id_pelanggan']);	

		const get_soal_execute = await Database
		  	.table('in_soal_gratis_nolog_execute')
		  	.select('in_soal_gratis_nolog.id_matpel_online_gratis')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_soal', 'in_soal_gratis_nolog_execute.id_soal')
		  	.where('id_user', data.id_pelanggan)
		  	.groupBy('in_soal_gratis_nolog.id_matpel_online_gratis')

		var Tampung_Data_soal = [];
	  	for (var i = 0; i < get_soal_execute.length; i++) {	  			  		
	  		const soal_mata_pelajaran = await Database
	  		.select('kelas')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.where('id_matpel', get_soal_execute[i].id_matpel_online_gratis)
		  	.first()
	  		Tampung_Data_soal.push(soal_mata_pelajaran);	
  		}

  		var Tampung_Data_kelas = [];
	  	for (var i = 0; i < Tampung_Data_soal.length; i++) {
	  		Tampung_Data_kelas.push(Tampung_Data_soal[i].kelas);	  			  		
  		}
  		const findDuplicates 	= arr => arr.filter((item, index) => arr.indexOf(item) == index)
		const alreadyUser 		= findDuplicates(Tampung_Data_kelas);
		
		// load user punya
		const Kelas_user = await Database
		.select('in_soal_gratis_nolog_mata_pelajaran.kelas', 'in_soal_gratis_nolog_mata_pelajaran.urutan','image_kelas')
	  	.table('in_soal_gratis_nolog_mata_pelajaran')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
		.whereIn('in_soal_gratis_nolog_mata_pelajaran.kelas', alreadyUser)
		.groupBy('in_soal_gratis_nolog_mata_pelajaran.kelas', 'in_soal_gratis_nolog_mata_pelajaran.urutan','image_kelas')
		.orderBy('in_soal_gratis_nolog_mata_pelajaran.urutan', 'ASC')

		//load bukan punya user
		const Category = await Database
			.select('in_soal_gratis_nolog_mata_pelajaran.category')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
			.groupBy('in_soal_gratis_nolog_mata_pelajaran.category')
		
		for (var i = 0; i < Category.length; i++) {

			const Kelas = await Database
				.select('in_soal_gratis_nolog_mata_pelajaran.kelas', 'in_soal_gratis_nolog_mata_pelajaran.urutan','image_kelas')
			  	.table('in_soal_gratis_nolog_mata_pelajaran')
			  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
				.where('category', Category[i].category)
				.whereNotIn('in_soal_gratis_nolog_mata_pelajaran.kelas', alreadyUser)
				.groupBy('in_soal_gratis_nolog_mata_pelajaran.kelas', 'in_soal_gratis_nolog_mata_pelajaran.urutan','image_kelas')
				.orderBy('in_soal_gratis_nolog_mata_pelajaran.urutan', 'ASC')

			Category[i]['key'] = i;
			Category[i]['Kelas'] = Kelas;
		}


		return response.json({
			status : 'true',
			responses : '200',
			length_access: 3,
			data_user: Kelas_user,
			data:Category,
			command: "Dapatkan materi lengkap setiap kelas, klik disini"
		})
	}

	async list_mata_pelajaran_fitur ({request, response}) {
		const data = request.only(['kelas']);
		
		const check_tingkat = await Database
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
		  	.whereNotNull('tingkat')
		  	.count()
		  	.first()

		const data_feature 	= [{
			"key"		: 0,
			"title" 	: "Video",
			"images" 	: "asaa",
			"action" 	: "url",
			"url" 		: "",
			"function" 	: ""
		}];

		if (check_tingkat.count  == 0) {
			const mata_pelajaran = await Database
			.select('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
		  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
		  	.whereNull('in_soal_gratis_nolog_mata_pelajaran.urutan_matapelajaran')
			.groupBy('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
			.orderBy('in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','ASC')

			const mata_pelajaran_wajib = await Database
			.select('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
		  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
		  	.whereNotNull('in_soal_gratis_nolog_mata_pelajaran.urutan_matapelajaran')
			.groupBy('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
			.orderBy('in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','ASC')

			return response.json({
				status 		: 'true',
				responses 	: '200',
				flag		: 'mata_pelajaran',
				data 		: mata_pelajaran,			
				data_wajib 	: mata_pelajaran_wajib,			
				data_feature: data_feature			
			})

		}else{

			const tingkat = await Database
			.select('in_soal_gratis_nolog_mata_pelajaran.tingkat','in_soal_gratis_nolog_mata_pelajaran.image_tingkat')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
		  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
		  	.groupBy('in_soal_gratis_nolog_mata_pelajaran.tingkat','in_soal_gratis_nolog_mata_pelajaran.image_tingkat')
		  	.orderBy('in_soal_gratis_nolog_mata_pelajaran.tingkat','ASC')
			return response.json({
				status 		: 'true',
				responses 	: '200',
				flag		: 'tingkat',
				data 		: tingkat,			
				data_feature: data_feature			
			})
		}
	}

	async list_mata_pelajaran_from_tingkat ({request, response}) {
		const data = request.only(['kelas','tingkat']);
		const mata_pelajaran = await Database
		.select('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
	  	.table('in_soal_gratis_nolog_mata_pelajaran')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
	  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
	  	.where('in_soal_gratis_nolog_mata_pelajaran.tingkat', data.tingkat)
	  	.whereNull('in_soal_gratis_nolog_mata_pelajaran.urutan_matapelajaran')
		.groupBy('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
		.orderBy('in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','ASC')

		const mata_pelajaran_wajib = await Database
		.select('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
	  	.table('in_soal_gratis_nolog_mata_pelajaran')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
	  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
	  	.where('in_soal_gratis_nolog_mata_pelajaran.tingkat', data.tingkat)
	  	.whereNotNull('in_soal_gratis_nolog_mata_pelajaran.urutan_matapelajaran')
		.groupBy('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
		.orderBy('in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','ASC')

		return response.json({
			status 		: 'true',
			responses 	: '200',
			flag		: 'mata_pelajaran',
			data 		: mata_pelajaran,			
			data_wajib 	: mata_pelajaran_wajib,			
		})

	}

	async submit_latihan ({request, response}) {
		const data = request.only(['id_matpel_online','id_pelanggan']);
		const remove_from_table_temp = await Database
	  	.table('in_soal_gratis_nolog_temp')
	  	.where('id_user', data.id_pelanggan)
	  	.delete()

	  	const matpel_online = await Database
		.query()
	  	.table('in_soal_gratis_nolog_mata_pelajaran')
	  	.where('id_matpel', data.id_matpel_online)
	  	.where('jumlah_soal','!=',0)	

	  	var Tampung_Data = [];
	  	for (var i = 0; i < matpel_online.length; i++) {	  		
	  		
	  		const soal = await Database
		  	.table('in_soal_gratis_nolog')
		  	.where('id_matpel_online_gratis', matpel_online[i].id_matpel)
			.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(matpel_online[i].jumlah_soal)			
	  		Tampung_Data.push(soal);	
  		}

  		for (var i = 0; i < Tampung_Data.length; i++) {

  			for (var no = 0; no < Tampung_Data[i].length; no++) {

  				const data_store_temp = await Database
				  .table('in_soal_gratis_nolog_temp')
				  .insert({
				  	id_soal: Tampung_Data[i][no].id_soal, 
				  	id_user: data.id_pelanggan,
				  	waktu: Tampung_Data[i][no].waktu,
				  	jawaban_betul: Encryption.encrypt(Tampung_Data[i][no].jawaban)
				})
  			}
  		}

  		const TotalSoal = await Database
	  	.table('in_soal_gratis_nolog_temp')
	  	.where('id_user', data.id_pelanggan)
	  	.count()
	  	.first()
		
		const GetTime = await Database
	  	.table('in_soal_gratis_nolog_temp')
	  	.where('id_user', data.id_pelanggan)
	  	.sum('waktu')
	  	.first()

	  	const all_request = {
	  		jumlah_soal : TotalSoal.count,
	  		total_waktu : GetTime.sum,
	  		tanggal_latihan : moment().format('LLLL'),
	  	}


  		return response.json({
			status : 'true',
			responses : '200',
			data: all_request

		})
	}

	async store_submit ({request, response}) {
		const processData	= request.only(['id_user', 'keterangan', 'id_matpel_online'])

		const delet = await Database
	  	.table('in_soal_gratis_nolog_examp')
	  	.where('id_user', processData.id_user)
	  	.where('status', 'Mulai')
	  	.delete()

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
			  	waktu_test: '0',
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

	async maksimal_bimbel_gratis({request,response}){
		const Inputs = request.only(['id_user'])
		const data = await Database
			.table('in_soal_gratis_nolog_examp')
			.where('status','Selesai')
			.where('id_user',Inputs.id_user)
			.first()
			.count()

		if(data.count > 3){
		  	return response.json({
				status : 'true',
				responses : '201',
				data:"tidak bisa akses",
			})
		  }else{
	  	  	return response.json({
	  			status : 'true',
	  			responses : '200',
	  			data:"bisa akses",
	  		})
		  }
	}

	async checkTrial ({request,response}){
		const Inputs = request.only(['id_paket','id_pelanggan'])
		const check = await Database
			.query()
			.table('in_order_trial_bimbel_online')
			.where('id_pelanggan',Inputs.id_pelanggan)
			.where('id_paket',Inputs.id_paket)
			.first()
			.count()
		return response.json(check)
	}

	async updated_tabel_baru({response}){
		const getSoal 	= await Database
		.table('in_soal_gratis_nolog_mata_pelajaran')
		  	for (var i = 0; i < getSoal.length; i++) {	  			  		
		  		const soal = await Database
			  	.table('in_soal_gratis_nolog')
			  	.where('kelas', getSoal[i].kelas)
			  	.where('nama_matpel', getSoal[i].mata_pelajaran)
			  	.where('silabus', getSoal[i].silabus)
			  	.update({
			  		id_matpel_online_gratis: getSoal[i].id_matpel
			  	})
	  		}	
	  	return "selesai";
	}

	async updated_tabel_baru_langganan({response}){
		const getSoal 	= await Database
		.table('in_matpel_online_langganan')
		  	for (var i = 0; i < getSoal.length; i++) {	  			  		
		  		const soal = await Database
			  	.table('in_soal_langganan')
			  	.where('kelas', getSoal[i].kelas)
			  	.where('nama_matpel', getSoal[i].mata_pelajaran)
			  	.where('silabus', getSoal[i].silabus)
			  	.update({
			  		id_matpel_online_gratis: getSoal[i].id_matpel
			  	})
	  		}	
	  	return "selesai";
	}

}

module.exports = MatpelController
