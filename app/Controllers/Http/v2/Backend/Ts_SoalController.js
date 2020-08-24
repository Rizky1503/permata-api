'use strict'
const Database = use('Database')
const Helpers = use('Helpers')

class Ts_SoalController {
	async storeSoal({request,response}){
		const Inputs = request.only(['id_content','soal','pembahasan','jawaban','created_by','status','title','id_kumpulan'])
		const store = await Database
			.insert({
				title			: Inputs.title,
				id_content		: Inputs.id_content,
				soal			: Inputs.soal,
				pembahasan		: Inputs.pembahasan,
				jawaban			: Inputs.jawaban,
				id_kumpulan		: Inputs.id_kumpulan == 0 ? null : Inputs.id_kumpulan,
				free			: Inputs.status == 0 ? true : false,
				created_by		: Inputs.created_by,
			})
			.table('v2.ts_soal')
	}

	async listSoal({params,response}){
		const list = await Database
			.table('v2.ts_soal')
			.where('id_content',params.id)
			.orderBy('title','ASC')
		return response.json(list);
	}

	async deleteSoal({params}){
		const hapus = await Database
			.table('v2.ts_soal')
			.where('id_soal',params.id)
			.delete()
	}
}

module.exports = Ts_SoalController
