'use strict'
const Database = use('Database')
const WebSocket = require('ws');
const Env = use('Env')


class ReasecController {

// Reasec Kategori
	async TampilKatergori ({response}){
		const data = await Database
			.table('v2.riasec_kategori')
			.orderBy('id_kategori','ASC')
		return response.json(data)
	}

	async StoreKatergori ({request}){
		const Inputs = request.only(['name','description'])
		const data = await Database
			.table('v2.riasec_kategori')
			.insert({
				name 		: Inputs.name,
				description : Inputs.description
			})
	}

	async EditKategori ({ params,response }){
		const data = await Database
			.table('v2.riasec_kategori')
			.where('id_kategori',params.id)
			.first()
		return response.json(data)
	}

	async UpdateKategori ({ request }){
		const Inputs = request.only(['name','description','id'])
		const data = await Database
			.table('v2.riasec_kategori')
			.where('id_kategori',Inputs.id)
			.update({
				name 		: Inputs.name,
				description : Inputs.description
			})
	}

	async DeletedKategori ({ params }){
		const data = await Database
			.table('v2.riasec_kategori')
			.where('id_kategori',params.id)
			.delete()
	}

// reasec content
	async TampilContent ({response}){
		const data = await Database
			.select('t1.id_riasec_content','t1.name','t1.id_kategori','t2.name as kategori')
			.table('v2.riasec_content as t1')
			.innerJoin('v2.riasec_kategori as t2','t1.id_kategori','t2.id_kategori')
			.orderBy('kategori','ASC')
		return response.json(data)
	}

	async StoreContent ({request}){
		const Inputs = request.only(['kategori','name'])
		const sort = await Database
			.select('sort')
			.table('v2.riasec_content')
			.where('id_kategori',Inputs.kategori)
			.orderBy('sort','DESC')
			.first()
		
		let sorting = parseFloat(sort.sort) + 1

		const data = await Database
			.table('v2.riasec_content')
			.insert({
				id_kategori : Inputs.kategori,
				name 		: Inputs.name,
				sort 		: sorting,
			})
	}

	async UpdateContent ({ request }){
		const Inputs = request.only(['id_riasec_content','content','kategori'])
		const data = await Database
			.table('v2.riasec_content')
			.where('id_riasec_content',Inputs.id_riasec_content)
			.update({
				name 		: Inputs.content,
				id_kategori : Inputs.kategori
			})
	}

// Rekomendasi
	async TampilRekomendasi ({response}){
		const data = await Database
			.select('t1.id_kategori_rekomendasi','t1.title','t1.sub_title','t1.id_kategori','t2.name as kategori')
			.table('v2.riasec_kategori_rekomendasi as t1')
			.innerJoin('v2.riasec_kategori as t2','t1.id_kategori','t2.id_kategori')
			.orderBy('kategori','ASC')
		return response.json(data)
	}

	async StoreRekomendasi ({request}){
		const Inputs = request.only(['kategori','title','sub_title'])
		const data = await Database
			.table('v2.riasec_kategori_rekomendasi')
			.insert({
				id_kategori 	: Inputs.kategori,
				title 			: Inputs.title,
				sub_title 		: Inputs.sub_title
			})
	}

	async UpdateRekomendasi ({ request }){
		const Inputs = request.only(['id_kategori_rekomendasi','title','sub_title','kategori'])
		const data = await Database
			.table('v2.riasec_kategori_rekomendasi')
			.where('id_kategori_rekomendasi',Inputs.id_kategori_rekomendasi)
			.update({
				title 		: Inputs.title,
				sub_title   : Inputs.sub_title,
				id_kategori : Inputs.kategori
			})
	}

}

module.exports = ReasecController
