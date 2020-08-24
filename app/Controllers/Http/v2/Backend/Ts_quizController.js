'use strict'
const Database = use('Database')
const Helpers = use('Helpers')

class Ts_quizController {

	async storekuis({request,response}){
		const Inputs = request.only(['id_content','uuid','title','soal','pembahasan','jawaban','created_by'])
		const store = await Database
			.insert({
				id_content		: Inputs.id_content,
				uuid	    	: Inputs.uuid,    
				title			: Inputs.title,
				soal			: Inputs.soal,
				pembahasan		: Inputs.pembahasan,
				jawaban			: Inputs.jawaban,
				created_by		: Inputs.created_by,
			})
			.table('v2.ts_quiz')
	}

	async listkuis({params,response}){
		const list = await Database
			.table('v2.ts_quiz')
			.where('id_content',params.id)
			.where('uuid',params.uuid)
			.orderBy('title','ASC')
		return response.json(list);
	}

	async deletekuis({params}){
		const hapus = await Database
			.table('v2.ts_quiz')
			.where('id_soal',params.id)
			.delete()
	}
}	

module.exports = Ts_quizController
