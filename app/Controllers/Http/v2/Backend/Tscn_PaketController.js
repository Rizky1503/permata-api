'use strict'
const Database = use('Database')
const Helpers = use('Helpers')

class Tscn_PaketController {
	async ListPaket({response}){
		const list = await Database
			.table('v2.tscn_paket')
			.orderBy('created_at','ASC')
		return response.json(list)
	}

	async SetActive({response,request}){
		const Inputs = request.only(['active','id_paket'])
		const update = await Database
			.table('v2.tscn_paket')
			.where('id_paket',Inputs.id_paket)
			.update({
				active		: Inputs.active,
			})
		if (update) {
			return response.json('sukses')
		}else{
			return response.json('gagal')
		}
	}
}

module.exports = Tscn_PaketController
