'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class VideoController {

	async list ({request, response}) {

		const data = request.only(['page','show_page']);
		const video = await Database
			.query()
		  	.table('in_video')
		  	.orderBy('id_video','DESC')
		  	.paginate(data.page, data.show_page)

		return video.data;

		return response.json({
			status : 'true',
			responses : '200',
			data:video.data			
		})
	}

	async list_and_filter ({request, response}) {

		const data = request.only(['tingkat','mata_pelajaran','urutkan','page','show_page']);

		function load_data_full(tingkat,mata_pelajaran,where,value_where){	

			const video = Database
				.query()
			  	.table('in_video')
			  	.where('tingkat', tingkat)
			  	.where('nama_matpel', mata_pelajaran)
			  	.orderBy(where,value_where)
			  	.paginate(data.page, data.show_page)
			return video
		}

		function load_data_custom(tingkat,where,value_where){	

			const video = Database
				.query()
			  	.table('in_video')
			  	.where('tingkat', tingkat)
			  	.orderBy(where,value_where)
			  	.paginate(data.page, data.show_page)
			return video
		}

		function load_data_other(where,value_where){	

			const video = Database
				.query()
			  	.table('in_video')
			  	.orderBy(where,value_where)
			  	.paginate(data.page, data.show_page)
			return video
		}

		if (data.tingkat && data.mata_pelajaran) {
			if (data.urutkan == 1) {
				//terbaru
				return load_data_full(data.tingkat, data.mata_pelajaran, 'id_video','DESC')
			}else if(data.urutkan == 2){
				//popular
				return load_data_full(data.tingkat, data.mata_pelajaran, 'total_view','DESC')
			}else if(data.urutkan == 3){
				//paling lama				
				return load_data_full(data.tingkat, data.mata_pelajaran, 'durasi','DESC')
			}else if(data.urutkan == 4){
				//paling sedikit
				return load_data_full(data.tingkat, data.mata_pelajaran, 'durasi','ASC')
			}
		}else if (data.tingkat) {
			if (data.urutkan == 1) {
				//terbaru
				return load_data_custom(data.tingkat, 'id_video','DESC')
			}else if(data.urutkan == 2){
				//popular
				return load_data_custom(data.tingkat, 'total_view','DESC')
			}else if(data.urutkan == 3){
				//paling lama				
				return load_data_custom(data.tingkat, 'durasi','DESC')
			}else if(data.urutkan == 4){
				//paling sedikit
				return load_data_custom(data.tingkat, 'durasi','ASC')
			}
		}else{
			if (data.urutkan == 1) {
				//terbaru
				return load_data_other('id_video','DESC')
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

	async tingkat ({request, response}) {

		const data = request.only(['data']);
		const tingkat = await Database
			.select('tingkat')
		  	.table('in_video')
		  	.groupBy('tingkat')
		  	.orderBy('tingkat','DESC')

		return response.json({
			status : 'true',
			responses : '200',
			data:tingkat			
		})
	}

	async mata_pelajaran ({request, response}) {

		const data = request.only(['tingkat']);
		const mata_pelajaran = await Database
			.select('nama_matpel')
		  	.table('in_video')
		  	.where('tingkat', data.tingkat)
		  	.groupBy('nama_matpel')
		  	.orderBy('nama_matpel','DESC')

		return response.json({
			status : 'true',
			responses : '200',
			data:mata_pelajaran			
		})
	}
}

module.exports = VideoController
