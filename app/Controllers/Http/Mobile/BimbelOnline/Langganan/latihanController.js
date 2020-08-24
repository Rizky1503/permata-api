'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const moment = require('moment');
const Env = use('Env')
const Order = use('App/Models/OrderModel')

class latihanController {

	async tingkat ({request, response}){

		const data = request.only(['id_kelas']);

		const getTingkat = await Database
			.select('tingkat as value', 'tingkat as label')
		  	.table('in_soal_langganan')	  	
		  	.where('id_kelas', data.id_kelas)
		  	.groupBy('value', 'label')

		return response.json({
			status : 'true',
			responses : '200',
			data:getTingkat			
		})
	}

	async tingkatKategoriLatihan ({request, response}){

		const data = request.only(['id_kelas']);

		const getKategoriLatihan = await Database
			.select('jenis_paket as value', 'jenis_paket as label')
		  	.table('in_soal_langganan')	  	
		  	.where('id_kelas', data.id_kelas)
		  	.groupBy('value', 'label')

		if (data.tingkat) {
			return response.json({
				status : 'true',
				responses : '200',
				formKategoriLatihan: true,
				data:getKategoriLatihan			
			})						
		}else{
			return response.json({
				status : 'true',
				responses : '200',
				formKategoriLatihan: false,
				data:getKategoriLatihan			
			})			
		}
	}

	async tingkatMataPelajaran ({request, response}){

		const data = request.only(['id_kelas','jenis_paket']);
		const getMataPelajaran = await Database
		.select('in_soal_langganan.nama_matpel as mata_pelajaran','in_soal_langganan_images_matpel.images as images')
	  	.table('in_soal_langganan')	  	
	  	.leftJoin('in_soal_langganan_images_matpel', 'in_soal_langganan_images_matpel.nama_matpel', 'in_soal_langganan.nama_matpel')
	  	.where('id_kelas', data.id_kelas)
	  	.where('jenis_paket', data.jenis_paket)
	  	.groupBy('mata_pelajaran','images')

	  	for (var i = 0; i < getMataPelajaran.length; i++) {	  				  		
	  		if (getMataPelajaran[i].images) {
		  		getMataPelajaran[i]['images'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/mata-pelajaran/'+getMataPelajaran[i].images
	  		}else{
		  		getMataPelajaran[i]['images'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/mata-pelajaran/bahasa-indonesia.gif'	  			
	  		}
  		}
  		// https://cdn6.aptoide.com/imgs/9/e/2/9e24fc1abd50527b4e8565630dd7150d_icon.png?w=256

	  	return response.json({
			status 		: 'true',
			responses 	: '200',
			data 		: getMataPelajaran			
		})
		
	}

	async tingkatRequestData ({request, response}){

		const data = request.only(['id_user', 'id_kelas', 'kategori_latihan', 'mata_pelajaran', 'silabus']);


		if (data.silabus) {
			return response.json({
				status 		: 'true',
				responses 	: '200',
				data 		: 'ini punya silabus'
			})
		}else{
			const removeTemporary = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', data.id_user)
		  	.delete()

			const mataPelajaran 	= await Database
			.select('id_matpel','id_kelas','jenis_paket','mata_pelajaran','jumlah_soal','waktu')
		  	.table('in_matpel_online_langganan')
		  	.where('id_kelas', data.id_kelas)
		  	.where('jenis_paket', data.kategori_latihan)		  	
		  	.where('mata_pelajaran', data.mata_pelajaran)		  	
		  	.where('jumlah_soal','!=',0)	

		  	var TampungData = [];
		  	for (var i = 0; i < mataPelajaran.length; i++) {	  		
		  		
		  		const soal = await Database
			  	.table('in_soal_langganan')
			  	.where('id_kelas', mataPelajaran[i].id_kelas)
			  	.where('jenis_paket', mataPelajaran[i].jenis_paket)
			  	.where('nama_matpel', mataPelajaran[i].mata_pelajaran)
				.whereNotNull('soal')
				.whereNotNull('jawaban')
				.orderByRaw('random()')
				.limit(mataPelajaran[i].jumlah_soal)			
		  		TampungData.push(soal);	
	  		}	

	  		for (var i = 0; i < TampungData.length; i++) {
	  			for (var no = 0; no < TampungData[i].length; no++) {
	  				const data_store_temp = await Database
					  .table('in_soal_temp_langganan')
					  .insert({
					  	id_soal: TampungData[i][no].id_soal, 
					  	id_user: data.id_user,
					  	waktu: TampungData[i][no].waktu,
					  	jawaban_betul: Encryption.encrypt(TampungData[i][no].jawaban),
					  	jenis_paket: TampungData[i][no].jenis_paket, 
					})
	  			}
	  		}
	  		

	  		const JumlahSoal = await Database
		  	.table('in_soal_temp_langganan')
		  	.innerJoin('in_soal_langganan', 'in_soal_langganan.id_soal', 'in_soal_temp_langganan.id_soal')		  	
		  	.where('id_user', data.id_user)
		  	.where('in_soal_temp_langganan.jenis_paket', data.kategori_latihan)
		  	.where('in_soal_langganan.nama_matpel', data.mata_pelajaran)
		  	.count()
		  	.first()
		  	const DetailData = ({
				id_matpel 	: mataPelajaran[0].id_matpel,
				jumlah_soal : JumlahSoal.count,
				tanggal_latihan : moment().format('LLLL'),
			})

	  		return response.json({
				status : 'true',
				responses : 200,
				data:DetailData	
			})
		}		
		
	}

	
	async tingkatSubmitData ({request, response}){
		const data = request.only(['id_user', 'id_kelas', 'id_matpel_online', 'jenis_paket', 'keterangan']);	
		const DataExampStart = await Database
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', data.id_user)
		  	.where('status', 'Mulai')
		  	.where('id_kelas', data.id_kelas)
		  	.where('id_matpel_online', data.id_matpel_online)
		  	.first()

		if (DataExampStart) {
			return response.json({
				status : 'true',
				responses : 200,
				data:DataExampStart	
			})
		}else{
			const insertExamp = await Database
		  	.table('in_soal_examp_langganan')
		  	.insert({
			  	id_user: data.id_user, 
			  	id_kelas: data.id_kelas, 
			  	id_matpel_online: data.id_matpel_online, 
			  	jenis_paket: data.jenis_paket,
			  	keterangan: data.keterangan,
			  	waktu_test: 0,
			  	status: 'Mulai',
			  	created_at: new Date(),
			  	updated_at: new Date()
			})
			.returning('id_examp')	

			const getDatTemp = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', data.id_user)
		  	.where('jenis_paket', data.jenis_paket)

		  	for (var i = 0; i < getDatTemp.length; i++) {		  		
		  		const sendDataExecute = await Database
				  .table('in_soal_execute_langganan')
				  .insert({
				  	no_urut: i + 1,
				  	id_soal: getDatTemp[i].id_soal, 
				  	jawaban_betul: getDatTemp[i].jawaban_betul,
				  	id_user: data.id_user,
				  	id_examp: insertExamp[0],
				})
		  	}

		  	const DataExampAfterSaved = await Database
			  	.table('in_soal_examp_langganan')
			  	.where('id_examp', insertExamp[0])
			  	.first()

		  	return response.json({
				status : 'true',
				responses : 200,
				data: DataExampAfterSaved,
			})
		}
	}

	// ================================================================================================================

	async kategoriLatihan ({request, response}){

		const data = request.only(['id_kelas']);

		const getKategoriLatihan = await Database
			.select('jenis_paket as value', 'jenis_paket as label')
		  	.table('in_soal_langganan')	  	
		  	.where('id_kelas', data.id_kelas)
		  	.groupBy('value', 'label')

		return response.json({
			status : 'true',
			responses : '200',
			data:getKategoriLatihan			
		})
	}

	async tahunMataPelajaran ({request, response}){

		const data = request.only(['id_kelas', 'jenis_paket']);

		const getTahun = await Database
			.select('tahun_soal as value', 'tahun_soal as label')
		  	.table('in_soal_langganan')	  	
		  	.where('id_kelas', data.id_kelas)
		  	.where('jenis_paket', data.jenis_paket)
		  	.groupBy('value', 'label')

		if (getTahun.length > 0) {
			return response.json({
				status 		: 'true',
				responses 	: '200',
				tahun 		: true,
				data 		: getTahun			
			})			
		}else{
			const getMataPelajaran = await Database
			.select('in_soal_langganan.nama_matpel as mata_pelajaran','in_soal_langganan_images_matpel.images as images')	  	
		  	.table('in_soal_langganan')	
		  	.leftJoin('in_soal_langganan_images_matpel', 'in_soal_langganan_images_matpel.nama_matpel', 'in_soal_langganan.nama_matpel')	  	  	
		  	.where('id_kelas', data.id_kelas)
		  	.where('jenis_paket', data.jenis_paket)
		  	.groupBy('mata_pelajaran','images')
		  	for (var i = 0; i < getMataPelajaran.length; i++) {	  				  		
		  		if (getMataPelajaran[i].images) {
			  		getMataPelajaran[i]['images'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/mata-pelajaran/'+getMataPelajaran[i].images
		  		}else{
			  		getMataPelajaran[i]['images'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/mata-pelajaran/bahasa-indonesia.gif'	  			
		  		}
	  		}
		  	return response.json({
				status 		: 'true',
				responses 	: '200',
				tahun 		: false,
				data 		: getMataPelajaran			
			})
		}
		
	}

	async mataPelajaran ({request, response}){

		const data = request.only(['id_kelas', 'jenis_paket', 'tahun']);
		const getMataPelajaran = await Database
		.select('in_soal_langganan.nama_matpel as mata_pelajaran','in_soal_langganan_images_matpel.images as images')
	  	.table('in_soal_langganan')	  	
	  	.leftJoin('in_soal_langganan_images_matpel', 'in_soal_langganan_images_matpel.nama_matpel', 'in_soal_langganan.nama_matpel')
	  	.where('id_kelas', data.id_kelas)
	  	.where('jenis_paket', data.jenis_paket)
	  	.where('tahun_soal', data.tahun)
	  	.groupBy('mata_pelajaran','images')
	  	for (var i = 0; i < getMataPelajaran.length; i++) {	  				  		
	  		if (getMataPelajaran[i].images) {
		  		getMataPelajaran[i]['images'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/mata-pelajaran/'+getMataPelajaran[i].images
	  		}else{
		  		getMataPelajaran[i]['images'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/mata-pelajaran/bahasa-indonesia.gif'	  			
	  		}
  		}
	  	return response.json({
			status 		: 'true',
			responses 	: '200',
			data 		: getMataPelajaran			
		})
		
	}

	async requestData ({request, response}){

		const data = request.only(['id_user', 'id_kelas', 'kategori_latihan', 'tahun_soal', 'mata_pelajaran', 'silabus']);


		if (data.silabus) {
			return response.json({
				status 		: 'true',
				responses 	: '200',
				data 		: 'ini punya silabus'
			})
		}else{

			const removeTemporary = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', data.id_user)
		  	.delete()
			
			const mataPelajaran 	= await Database
			.select('id_matpel','id_kelas','jenis_paket','mata_pelajaran','jumlah_soal','waktu')
		  	.table('in_matpel_online_langganan')
		  	.where('id_kelas', data.id_kelas)
		  	.where('jenis_paket', data.kategori_latihan)		  	
		  	.where('mata_pelajaran', data.mata_pelajaran)		  	
		  	.where('jumlah_soal','!=',0)	

		  	if (data.tahun_soal) {
		  		var TampungData = [];
			  	for (var i = 0; i < mataPelajaran.length; i++) {	  		
			  		
			  		const soal = await Database
				  	.table('in_soal_langganan')
				  	.where('id_kelas', mataPelajaran[i].id_kelas)
				  	.where('jenis_paket', mataPelajaran[i].jenis_paket)
				  	.where('tahun_soal', data.tahun_soal)
				  	.where('nama_matpel', mataPelajaran[i].mata_pelajaran)
					.whereNotNull('soal')
					.whereNotNull('jawaban')
					.orderByRaw('random()')
					.limit(mataPelajaran[i].jumlah_soal)			
			  		TampungData.push(soal);	
		  		}	

		  		for (var i = 0; i < TampungData.length; i++) {
		  			for (var no = 0; no < TampungData[i].length; no++) {
		  				const data_store_temp = await Database
						  .table('in_soal_temp_langganan')
						  .insert({
						  	id_soal: TampungData[i][no].id_soal, 
						  	id_user: data.id_user,
						  	waktu: TampungData[i][no].waktu,
						  	jawaban_betul: Encryption.encrypt(TampungData[i][no].jawaban),
						  	jenis_paket: TampungData[i][no].jenis_paket, 
						})
		  			}
		  		}
		  		

		  		const JumlahSoal = await Database
			  	.table('in_soal_temp_langganan')
			  	.innerJoin('in_soal_langganan', 'in_soal_langganan.id_soal', 'in_soal_temp_langganan.id_soal')		  	
			  	.where('id_user', data.id_user)
			  	.where('in_soal_temp_langganan.jenis_paket', data.kategori_latihan)
			  	// .where('in_soal_langganan.tahun_soal', data.tahun_soal)
			  	// .where('in_soal_langganan.nama_matpel', data.mata_pelajaran)
			  	.count()
			  	.first()

			  	const JumlahSoalUtama = await Database
			  	.table('in_soal_langganan')
			  	.where('id_kelas', data.id_kelas)
			  	.where('jenis_paket', data.kategori_latihan)
			  	.where('tahun_soal', data.tahun_soal)
			  	.where('nama_matpel', data.mata_pelajaran)
			  	.count()
			  	.first()
			  	const DetailData = ({
					id_matpel 	: mataPelajaran[0].id_matpel,
					jumlah_soal : JumlahSoal.count+' dari '+JumlahSoalUtama.count+' Soal',
					tanggal_latihan : moment().format('LLLL'),
				})

		  		return response.json({
					status : 'true',
					responses : 200,
					data:DetailData	
				})
		  	}else{
		  		var TampungData = [];
			  	for (var i = 0; i < mataPelajaran.length; i++) {	  		
			  		
			  		const soal = await Database
				  	.table('in_soal_langganan')
				  	.where('id_kelas', mataPelajaran[i].id_kelas)
				  	.where('jenis_paket', mataPelajaran[i].jenis_paket)
				  	.where('nama_matpel', mataPelajaran[i].mata_pelajaran)
					.whereNotNull('soal')
					.whereNotNull('jawaban')
					.orderByRaw('random()')
					.limit(mataPelajaran[i].jumlah_soal)			
			  		TampungData.push(soal);	
		  		}	

		  		for (var i = 0; i < TampungData.length; i++) {
		  			for (var no = 0; no < TampungData[i].length; no++) {
		  				const data_store_temp = await Database
						  .table('in_soal_temp_langganan')
						  .insert({
						  	id_soal: TampungData[i][no].id_soal, 
						  	id_user: data.id_user,
						  	waktu: TampungData[i][no].waktu,
						  	jawaban_betul: Encryption.encrypt(TampungData[i][no].jawaban),
						  	jenis_paket: TampungData[i][no].jenis_paket, 
						})
		  			}
		  		}
		  		

		  		const JumlahSoal = await Database
			  	.table('in_soal_temp_langganan')
			  	.innerJoin('in_soal_langganan', 'in_soal_langganan.id_soal', 'in_soal_temp_langganan.id_soal')		  	
			  	.where('id_user', data.id_user)
			  	.where('in_soal_temp_langganan.jenis_paket', data.kategori_latihan)
			  	// .where('in_soal_langganan.tahun_soal', data.tahun_soal)
			  	// .where('in_soal_langganan.nama_matpel', data.mata_pelajaran)
			  	.count()
			  	.first()

			  	const JumlahSoalUtama = await Database
			  	.table('in_soal_langganan')
			  	.where('id_kelas', data.id_kelas)
			  	.where('jenis_paket', data.kategori_latihan)
			  	.where('nama_matpel', data.mata_pelajaran)
			  	.count()
			  	.first()
			  	const DetailData = ({
					id_matpel 	: mataPelajaran[0].id_matpel,
					jumlah_soal : JumlahSoal.count+' dari '+JumlahSoalUtama.count+' Soal',
					tanggal_latihan : moment().format('LLLL'),
				})

		  		return response.json({
					status : 'true',
					responses : 200,
					data:DetailData	
				})
		  	}		  	
		}		
		
	}

	async submitData ({request, response}){

		const data = request.only(['id_user', 'id_kelas', 'id_matpel_online', 'tahun_soal', 'jenis_paket', 'keterangan']);			
		const DataExampStart = await Database
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', data.id_user)
		  	.where('status', 'Mulai')
		  	.where('id_kelas', data.id_kelas)
		  	.where('id_matpel_online', data.id_matpel_online)
		  	.where('tahun_soal', data.tahun_soal)
		  	.first()

		if (DataExampStart) {
			return response.json({
				status : 'true',
				responses : 200,
				data:DataExampStart	
			})
		}else{
			const insertExamp = await Database
		  	.table('in_soal_examp_langganan')
		  	.insert({
			  	id_user: data.id_user, 
			  	id_kelas: data.id_kelas, 
			  	id_matpel_online: data.id_matpel_online, 
			  	tahun_soal: data.tahun_soal, 
			  	jenis_paket: data.jenis_paket,
			  	keterangan: data.keterangan,
			  	waktu_test: 0,
			  	status: 'Mulai',
			  	created_at: new Date(),
			  	updated_at: new Date()
			})
			.returning('id_examp')	

			const getDatTemp = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', data.id_user)
		  	.where('jenis_paket', data.jenis_paket)

		  	for (var i = 0; i < getDatTemp.length; i++) {		  		
		  		const sendDataExecute = await Database
				  .table('in_soal_execute_langganan')
				  .insert({
				  	no_urut: i + 1,
				  	id_soal: getDatTemp[i].id_soal, 
				  	jawaban_betul: getDatTemp[i].jawaban_betul,
				  	id_user: data.id_user,
				  	id_examp: insertExamp[0],
				})
		  	}

		  	const DataExampAfterSaved = await Database
			  	.table('in_soal_examp_langganan')
			  	.where('id_examp', insertExamp[0])
			  	.first()

		  	return response.json({
				status : 'true',
				responses : 200,
				data: DataExampAfterSaved,
			})
		}
		return DataExampStart
	}

	async testGetSoal({request, response}){
		const temps	= request.only(['id_examp'])		
		const Data_Examp = await Database
	  	.table('in_soal_examp_langganan')
	  	.where('id_examp', temps.id_examp)
	  	.first()

		const Data_Execute_Count = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.count()
	  	.first()

		const Data_Soal_Pertama = await Database
	  	.table('in_soal_execute_langganan')
	  	.innerJoin('in_soal_langganan', 'in_soal_langganan.id_soal', 'in_soal_execute_langganan.id_soal')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.orderBy('id_soal_execute', 'ASC')
	  	.first()
		
		const check_sebelumnya = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.where('id_soal_execute', '<', Data_Soal_Pertama.id_soal_execute)
	  	.count()
	  	.first()

		const check_selanjutnya = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.where('id_soal_execute', '>', Data_Soal_Pertama.id_soal_execute)
	  	.count()
	  	.first()


	  	const result = ({
			data_examp: Data_Examp,
			total_soal: Data_Execute_Count.count,
			soal_pertama: Data_Soal_Pertama,
			sebelumnya: check_sebelumnya.count,
			selanjutnya: check_selanjutnya.count,
		})

		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: result			
		})
	}

}
module.exports = latihanController
