'use strict'
const Database = use('Database')
const Helpers = use('Helpers')

class Ts_RecruitmentController {
	async storerecruitment({request,response}){
		const Inputs = request.only(['nama','file'])
		const store = await Database
			.insert({
				nama	: Inputs.nama,
				cv		: Inputs.file,
			})
			.table('v2.ts_recruitment')
	}

	async ListRecruitment({response}){
		const list = await Database
			.table('v2.ts_recruitment')
			.orderBy('created_at','DESC')
		return response.json(list)
	}
}

module.exports = Ts_RecruitmentController
