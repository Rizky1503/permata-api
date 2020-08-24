'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const moment = require('moment');
const Env = use('Env')
const Order = use('App/Models/OrderModel')

class fiturController {

	async menu ({request, response}){

		const data = request.only(['id_kelas']);
		const getMenu = await Database
			.select('in_menu.id_menu','in_menu.nama_menu','in_menu.icon_menu','in_menu.product','in_menu.action','in_menu.page','in_menu.params','in_soal_langganan_menu.active')
		  	.table('in_soal_langganan_menu')
		  	.innerJoin('in_menu', 'in_menu.id_menu', 'in_soal_langganan_menu.id_menu')		  			  	
		  	.where('id_kelas', data.id_kelas)
		  	.where('in_soal_langganan_menu.active', 1)
		  	.orderBy('in_soal_langganan_menu.shortBy', 'ASC')
		return response.json({
			status : 'true',
			responses : '200',
			data:getMenu			
		})
	}
	
	async videoList ({request, response}) {

		const data = request.only(['id_kelas','mata_pelajaran','urutkan','page','show_page']);

		function load_data_full(mata_pelajaran,where,value_where){	

			const video = Database
				.query()
			  	.table('in_soal_langganan_video')
			  	.innerJoin('in_video', 'in_video.id_video', 'in_soal_langganan_video.id_video')	
			  	.where('in_soal_langganan_video.id_kelas', data.id_kelas)
			  	.where('nama_matpel', mata_pelajaran)
			  	.orderBy(where,value_where)
			  	.paginate(data.page, data.show_page)
			return video
		}

		function load_data_custom(where,value_where){	

			const video = Database
				.query()
			  	.table('in_soal_langganan_video')
			  	.innerJoin('in_video', 'in_video.id_video', 'in_soal_langganan_video.id_video')	
			  	.where('in_soal_langganan_video.id_kelas', data.id_kelas)
			  	.orderBy(where,value_where)
			  	.paginate(data.page, data.show_page)
			return video
		}

		function load_data_other(where,value_where){	

			const video = Database
				.query()
			  	.table('in_soal_langganan_video')
			  	.innerJoin('in_video', 'in_video.id_video', 'in_soal_langganan_video.id_video')	
			  	.where('in_soal_langganan_video.id_kelas', data.id_kelas)
			  	.orderBy(where,value_where)
			  	.paginate(data.page, data.show_page)
			return video
		}

		if (data.mata_pelajaran) {
			if (data.urutkan == 1) {
				//terbaru
				return load_data_full(data.mata_pelajaran, 'in_video.id_video','DESC')
			}else if(data.urutkan == 2){
				//popular
				return load_data_full(data.mata_pelajaran, 'total_view','DESC')
			}else if(data.urutkan == 3){
				//paling lama				
				return load_data_full(data.mata_pelajaran, 'durasi','DESC')
			}else if(data.urutkan == 4){
				//paling sedikit
				return load_data_full(data.mata_pelajaran, 'durasi','ASC')
			}
		}else{
			if (data.urutkan == 1) {
				//terbaru
				return load_data_other('in_video.id_video','DESC')
			}else if(data.urutkan == 2){
				//popular
				return load_data_other('total_view','DESC')
			}else if(data.urutkan == 3){
				//paling lama				
				return load_data_other('durasi','DESC')
			}else if(data.urutkan == 4){
				//paling sedikit
				return load_data_other('durasi','ASC')
			}
		}		
	}

	async videoFilterTingkat ({request, response}) {

		const data = request.only(['id_kelas']);
		const tingkat = await Database
			.select('in_video.tingkat')
		  	.table('in_soal_langganan_video')
		  	.innerJoin('in_video', 'in_video.id_video', 'in_soal_langganan_video.id_video')	
		  	.where('in_soal_langganan_video.id_kelas', data.id_kelas)
		  	.groupBy('tingkat')
		  	.orderBy('tingkat','DESC')

		return response.json({
			status : 'true',
			responses : '200',
			data:tingkat			
		})
	}

	async videoFilterMataPelajaran ({request, response}) {

		const data = request.only(['id_kelas']);
		const mata_pelajaran = await Database
			.select('nama_matpel')
			.table('in_soal_langganan_video')
		  	.innerJoin('in_video', 'in_video.id_video', 'in_soal_langganan_video.id_video')	
		  	.where('in_soal_langganan_video.id_kelas', data.id_kelas)
		  	.groupBy('nama_matpel')
		  	.orderBy('nama_matpel','DESC')

		return response.json({
			status : 'true',
			responses : '200',
			data:mata_pelajaran			
		})
	}

	async pembahasanList ({request, response}) {
		const data = request.only(['id_user', 'id_kelas', 'page', 'show_page']);
		const Pembahasan = await Database
			.query()
			.select('jenis_paket','tahun_soal','tingkat','kelas')
		  	.table('in_soal_langganan')
		  	.where('id_kelas', data.id_kelas)
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

	async pembahasanListSoal ({request, response}) {
		const data = request.only(['id_kelas', 'jenis_paket', 'tahun_soal', 'tingkat', 'kelas', 'page', 'show_page']);
		const Pembahasan = await Database
			.query()
		  	.table('in_soal_langganan')
		  	.where('id_kelas', data.id_kelas)
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

	async bedahMateriList ({request, response}) {
		const data = request.only(['id_kelas']);


		const matpel = await Database
			.query()			
			.select('in_bedah_mata_pelajaran.matapelajaran')
			.table('in_bedah_file')
		  	.innerJoin('in_bedah_mata_pelajaran', 'in_bedah_mata_pelajaran.id', 'in_bedah_file.id_bedah_mata_pelajaran')
		  	.groupBy('matapelajaran')
		  	.where('id_kelas',data.id_kelas)

		for (var i = 0; i < matpel.length; i++) {

			const silabus = await Database
			.query()			
			.table('in_bedah_file')
		  	.innerJoin('in_bedah_mata_pelajaran', 'in_bedah_mata_pelajaran.id', 'in_bedah_file.id_bedah_mata_pelajaran')
		  	.where('id_kelas', data.id_kelas)
		  	.where('matapelajaran', matpel[i].matapelajaran)

			matpel[i]['data_silabus'] = silabus;
		}

		return response.json({
			status : 'true',
			responses : '200',
			data:matpel			
		})
	}

	async historyList ({request, response}) {
		const data = request.only(['id_pelanggan','id_kelas','page','show_page']);
		const examp = await Database
			.select('in_matpel_online_langganan.jenis_paket','in_matpel_online_langganan.mata_pelajaran')
			.table('in_soal_examp_langganan')
			.innerJoin('in_matpel_online_langganan', 'in_matpel_online_langganan.id_matpel', 'in_soal_examp_langganan.id_matpel_online')
		  	.where('id_user',data.id_pelanggan)
		  	.where('in_soal_examp_langganan.id_kelas',data.id_kelas)
		  	.where('status','Selesai')
		  	.groupBy('in_matpel_online_langganan.jenis_paket','in_matpel_online_langganan.mata_pelajaran')
		  	.paginate(data.page, data.show_page)

		for (var i = 0; i < examp.data.length; i++) {

			const Nilai = await Database
			.select('total_nilai','in_matpel_online_langganan.jumlah_soal','keterangan_akhir','in_soal_examp_langganan.created_at')
			.table('in_soal_examp_langganan')
			.innerJoin('in_matpel_online_langganan', 'in_matpel_online_langganan.id_matpel', 'in_soal_examp_langganan.id_matpel_online')
		  	.where('id_user',data.id_pelanggan)
		  	.where('in_soal_examp_langganan.id_kelas',data.id_kelas)
		  	.where('in_matpel_online_langganan.jenis_paket', examp.data[i].jenis_paket)
		  	.where('in_matpel_online_langganan.mata_pelajaran', examp.data[i].mata_pelajaran)
		  	.where('status','Selesai')
		  	.orderBy('in_soal_examp_langganan.created_at','DESC')
			examp.data[i]['more'] = Nilai;
		}

		return response.json({
			status : 'true',
			responses : '200',
			data: examp.data		
		})
	}

}
module.exports = fiturController
