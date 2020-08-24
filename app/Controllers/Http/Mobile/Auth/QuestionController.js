'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')

class QuestionController {

	async list_product ({request, response}) {

		const data = request.only(['product_id'])
		const response_data = await Database.from('in_question_master').select('product', 'product_name').groupBy('product', 'product_name').orderBy('product', 'ASC')		 
		return response.json({
			status : 'true',
			responses : '200',
			data:response_data			
		})
	}

	async list_jenis_pertanyaan ({request, response}) {

		const data = request.only(['product_id'])
		const response_data = await Database.from('in_question_master').select('label as label','id_question_master as value').where('product',data.product_id) 
		return response.json({
			status : 'true',
			responses : '200',
			data:response_data			
		})
	}

	async check_member ({request, response}) {

		const data = request.only(['id_question_master','id_pelanggan'])
		const response_data = await Database.from('in_question_master').where('id_question_master',data.id_question_master).first() 
		if (response_data) {
			if (response_data.flag_berbayar == 1) {
				const check_data_member = await Database.from('in_order')
					.where('id_user_order', data.id_pelanggan)
				if (check_data_member) {
					return response.json({
						status : 'true',
						responses : '200'
					})					
				}else{
					return response.json({
						status : 'true',
						responses : '201',
						data: "hanya member yang dapat akses fitur ini, silahkan pilih jenis pertanyaan lain"
					})					
				}
			}else{
				return response.json({
					status : 'true',
					responses : '201',
					data: "Data "
				})									
			}
		}
	}

	async submit_question ({request, response}) {
		const data = request.only(['id_pelanggan','id_question_master','question','phone_number','file_upload'])		
		try{
			const data_store_temp = await Database
			  .table('in_question')
			  .insert({
			  	id_question_master: data.id_question_master, 
			  	id_pelanggan: data.id_pelanggan,
			  	phone_number: data.phone_number,
			  	question: data.question,
			  	file_upload: data.file_upload, 
			  	review_question: 0,
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
				data: "data belum lengkap"
			})
		}



	}

	async load_data_question ({request, response}) {
		const data = request.only(['id_pelanggan', 'page','show_page']);
		const list_question = await Database
		.query()
	  	.table('in_question')
	  	.leftJoin('in_question_master', 'in_question.id_question_master', 'in_question_master.id_question_master')
	  	.where('id_pelanggan', data.id_pelanggan)
	  	.orderBy('review_question','ASC')
	  	.paginate(data.page, data.show_page)
		return response.json({
			status : 'true',
			responses : '201',
			data: list_question.data
		})
	}
	
}

module.exports = QuestionController
