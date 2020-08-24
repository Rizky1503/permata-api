'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const moment = require('moment');
const Env = use('Env')

class gratisController {

	async update_database_relation ({response}){

		const getSoal 	= await Database
	  	.table('in_matpel_online_gratis_nolog')

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

  		// const abaasa = await Database
		// 	.select('kelas', 'urutan')
		//   	.table('in_soal_gratis_nolog_mata_pelajaran')
		// 	.groupBy('kelas', 'urutan')
		// 	.orderBy('urutan')

		// for (var i = 0; i < abaasa.length; i++) {
		// 	const abaasa = await Database
		//   	.table('in_soal_gratis_nolog_mata_pelajaran')
		//   	.where('jumlah_soal', '')
		//   	.update({
		//   		jumlah_soal: 4
		//   	})
		// }

		// const ada = await Database
	 //  	.table('in_soal_gratis_nolog_mata_pelajaran')
	 //  	.where('category', 'SD')
	 //  	.update({
	 //  		image_tingkat: 'sd.png'
	 //  	})

		// return ada
		// // ================================================


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
			command: "Uji coba GRATIS maksimal 3 kelas, untuk mendapatkan materi pelajaran yang lebih banyak, silahkan klik di sini"
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
			"title" 	: "Video Tutorial",
			"images" 	: "https://img.icons8.com/bubbles/2x/video-playlist.png",
			"action" 	: "page",
			"page" 		: "BimbelOnlineGratisVideo",
			"function" 	: ""
		}];

		if (check_tingkat.count  == 0) {
			const mata_pelajaran = await Database
			.select('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
		  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
			.groupBy('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran','in_soal_gratis_nolog_mata_pelajaran.image')

			return response.json({
				status 		: 'true',
				responses 	: '200',
				flag		: 'mata_pelajaran',
				data 		: mata_pelajaran,			
				data_feature: data_feature			
			})
		}else{

			const tingkat = await Database
			.select('in_soal_gratis_nolog_mata_pelajaran.tingkat', 'in_soal_gratis_nolog_mata_pelajaran.image_tingkat')
		  	.table('in_soal_gratis_nolog_mata_pelajaran')
		  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
		  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
		  	.groupBy('in_soal_gratis_nolog_mata_pelajaran.tingkat', 'in_soal_gratis_nolog_mata_pelajaran.image_tingkat')
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
		.select('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran', 'in_soal_gratis_nolog_mata_pelajaran.image')
	  	.table('in_soal_gratis_nolog_mata_pelajaran')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_matpel_online_gratis', 'in_soal_gratis_nolog_mata_pelajaran.id_matpel')
	  	.where('in_soal_gratis_nolog_mata_pelajaran.kelas', data.kelas)
	  	.where('in_soal_gratis_nolog_mata_pelajaran.tingkat', data.tingkat)
		.groupBy('in_soal_gratis_nolog.id_matpel_online_gratis','in_soal_gratis_nolog_mata_pelajaran.mata_pelajaran', 'in_soal_gratis_nolog_mata_pelajaran.image')

		return response.json({
			status 		: 'true',
			responses 	: '200',
			data 		: mata_pelajaran,			
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

	async submit_store_submit ({request, response}) {
		const data_send = request.only(['id_user','id_matpel_online','keterangan']);

		const Cek = await Database
		.select('in_soal_gratis_nolog_execute.id_examp','id_matpel_online_gratis','status')
	  	.table('in_soal_gratis_nolog_execute')
	  	.innerJoin('in_soal_gratis_nolog', 'in_soal_gratis_nolog.id_soal', 'in_soal_gratis_nolog_execute.id_soal')
	  	.innerJoin('in_soal_gratis_nolog_examp', 'in_soal_gratis_nolog_examp.id_examp', 'in_soal_gratis_nolog_execute.id_examp')
	  	.where('in_soal_gratis_nolog_execute.id_user', data_send.id_user)
	  	.where('in_soal_gratis_nolog.id_matpel_online_gratis', data_send.id_matpel_online)
	  	.where('in_soal_gratis_nolog_examp.status', "Mulai")
	  	.groupBy('in_soal_gratis_nolog_execute.id_examp','id_matpel_online_gratis','status')

	  	if (Cek.length == 0) {

			const send_data_examp = await Database
		  	.table('in_soal_gratis_nolog_examp')
		  	.insert({
			  	id_user: data_send.id_user, 
			  	keterangan: data_send.keterangan,
			  	waktu_test: 0,
			  	status: 'Mulai',
			  	created_at: new Date(),
			  	updated_at: new Date()
			})
			.returning('id_examp')	

			const get_data_temp = await Database
		  	.table('in_soal_gratis_nolog_temp')
		  	.where('id_user', data_send.id_user)

		  	for (var i = 0; i < get_data_temp.length; i++) {		  		
		  		const send_data_execute = await Database
				  .table('in_soal_gratis_nolog_execute')
				  .insert({
				  	id_soal: get_data_temp[i].id_soal, 
				  	jawaban_betul: get_data_temp[i].jawaban_betul,
				  	id_user: data_send.id_user,
				  	id_examp: send_data_examp[0],
				})
		  	}

		  	return response.json({
				status : 'true',
				responses : '200',
				id_examp:send_data_examp[0],
				data:"Completed",
			})
		}else{
			return response.json({
				status : 'true',
				responses : '201',
				id_examp:Cek[0].id_examp,
				data:"No Completed",
			})
		}
	}

	async video_list ({request, response}) {

		const Data = await Database
	  	.table('in_video')
	  	.orderByRaw('random()')
	  	.limit(2)

	  	var Tampung_Data = [];
	  	for (var i = 0; i < Data.length; i++) {	  			  				
	  		Tampung_Data.push({
	  			'id_video':Data[i].id_video,
	  			'title':Data[i].title,
	  			'tingkat':Data[i].tingkat,
	  			'slug':Data[i].slug,
	  			'chunk':Data[i].chunk,
	  			'kategori':Data[i].kategori,
	  			'kelas':Data[i].kelas,
	  			'nama_matpel':Data[i].nama_matpel,
	  			'video':Data[i].video,
	  			'url_video': Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'video/materi/'+Data[i].video,
	  			'durasi':Data[i].durasi,
	  			'total_view':Data[i].total_view,
	  			'banner':Data[i].banner,
	  			'url_banner':Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'images/Video/banner/'+Data[i].kelas+'/'+Data[i].nama_matpel+'/'+Data[i].banner,
	  			'deskripsi':Data[i].deskripsi,
	  			'created_at':Data[i].created_at,
	  		});	
  		}

	  	return response.json({
			status : 'true',
			responses : '200',
			data:Tampung_Data,
		})
	}

	async video_list_kelas ({request, response}) {
		const data_send = request.only(['kelas']);

		const where = [];
		if (data_send.kelas == "KELAS 12 IPA") {
			where.push('SMA IPA')
		}else if (data_send.kelas == "KELAS 12 IPS") {
			where.push('SMA IPS')
		}else{
			where.push(data_send.kelas)
		}
		const Data = await Database
	  	.table('in_video')
	  	.where('tingkat', where[0])
	  	.orderByRaw('random()')
	  	.limit(2)

	  	var Tampung_Data = [];
	  	for (var i = 0; i < Data.length; i++) {	  			  				
	  		Tampung_Data.push({
	  			'id_video':Data[i].id_video,
	  			'title':Data[i].title,
	  			'tingkat':Data[i].tingkat,
	  			'slug':Data[i].slug,
	  			'chunk':Data[i].chunk,
	  			'kategori':Data[i].kategori,
	  			'kelas':Data[i].kelas,
	  			'nama_matpel':Data[i].nama_matpel,
	  			'video':Data[i].video,
	  			'url_video': Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'video/materi/'+Data[i].video,
	  			'durasi':Data[i].durasi,
	  			'total_view':Data[i].total_view,
	  			'banner':Data[i].banner,
	  			'url_banner':Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'images/Video/banner/'+Data[i].kelas+'/'+Data[i].nama_matpel+'/'+Data[i].banner,
	  			'deskripsi':Data[i].deskripsi,
	  			'created_at':Data[i].created_at,
	  		});	
  		}

	  	return response.json({
			status : 'true',
			responses : '200',
			data:Tampung_Data,
		})
	}

	async get_id_examp ({request, response}){
		const data	= request.only(['id_examp'])
		const Cek = await Database
	  	.table('in_soal_gratis_nolog_examp')
	  	.where('id_examp', data.id_examp)
	  	.where('status', 'Mulai')
	  	.first()

	  	if (Cek) {
		  	return response.json({
				status : 'true',
				responses : '200',
				data:Cek
			})	  		
	  	}else{
		  	return response.json({
				status : 'true',
				responses : '201',
				data:"Tes Sudah Selesai Dilaksanakan"
			})	  		
	  	}
	}

}
module.exports = gratisController
