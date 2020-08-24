'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')

class FeedBackController {

	async load_data_master ({request, response}) {

		const data = request.only(['product_id'])
		const title = await Database.from('in_feedback_master').select('title_feedback').groupBy('title_feedback')	

		for (var i = 0; i < title.length; i++) {

			const sub_title = await Database
			.query()			
			.table('in_feedback_master')
		  	.where('title_feedback', title[i].title_feedback)

			title[i]['sub_title'] = sub_title;
		}	 

		return response.json({
			status : 'true',
			responses : '200',
			data:title			
		})
	}

	async submit_feedback ({request, response}) {

		const data = request.only(['id_pelanggan','id_feedback_master','lainya'])
		try{
			const data_store_temp = await Database
			  .table('in_feedback')
			  .insert({
			  	id_feedback_master: data.id_feedback_master, 
			  	id_pelanggan: data.id_pelanggan,
			  	lainya: data.lainya,
			  	created_at: new Date(),
			  	updated_at: new Date(),
			})
			return response.json({
				status : 'true',
				responses : '200',
				data: "Sumbit Success"
			})	
		}catch(e){
			return response.json({
				status : 'true',
				responses : '201',
				data: "silahkan coba lagi nanti"
			})
		}		
	}

	async get_data_andree ({params, response}) {

		// if (params.token == "xX6XJkdkiD") {
		// 	if (params.kelas == "All") {
		// 		const get_data_order = await Database
		// 		.select('kondisi as Kelas','nama','no_telpon as No Tlp','email','place as Kota','sumber as Promosi tau dari mana')
		// 		.table('in_order')
		// 		.leftJoin('in_pelanggan', 'in_pelanggan.id_pelanggan', 'in_order.id_user_order')
		// 		.leftJoin('in_login_location', 'in_login_location.id_pelanggan', 'in_order.id_user_order')
		// 		.leftJoin('in_survey', 'in_survey.id_pelanggan', 'in_order.id_user_order')
		// 		// .groupBy('kondisi','nama','no_telpon','email')
		// 		return get_data_order
		// 	}else{
		// 		const get_data_order = await Database
		// 		.select('kondisi as Kelas','nama','no_telpon as No Tlp','email','place as Kota','sumber as Promosi tau dari mana')
		// 		.table('in_order')
		// 		.leftJoin('in_pelanggan', 'in_pelanggan.id_pelanggan', 'in_order.id_user_order')
		// 		.leftJoin('in_login_location', 'in_login_location.id_pelanggan', 'in_order.id_user_order')
		// 		.leftJoin('in_survey', 'in_survey.id_pelanggan', 'in_order.id_user_order')
		// 		.where('kondisi','12 IPS')
		// 		// .groupBy('nama','no_telpon','email')
		// 		return get_data_order
		// 	}	
		// }else{
			return response.json({
				status : 'true',
				responses : '201',
				data: "Maaf Token tidak sesuai"
			})
		// }
	}
	
}

module.exports = FeedBackController
