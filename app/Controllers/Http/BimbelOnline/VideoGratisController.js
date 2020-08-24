'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class VideoGratisController {

	async tingkat ({response}){
		const tingkat = await Database
			.select('tingkat')
			.from('in_video')
			.groupBy('tingkat')
			.orderBy('tingkat','ASC')
		return response.json(tingkat)
	}

	async matpel ({ request ,response }){
		const Inputs = request.only(['tingkat'])
		const matpel = await Database
			.select('nama_matpel')
			.from('in_video')
			.where('tingkat', Inputs.tingkat)
			.groupBy('nama_matpel')
		return response.json(matpel)
	}

	async semua ({params, response}) {
		const video = await Database
			.query()
		  	.table('in_video')
		  	.paginate(params.page, params.limit)

		return response.json(video)
	}

	async pertingkat ({request, response, params}) {
		const Inputs = request.only(['tingkat'])
		const video = await Database
			.query()
		  	.table('in_video')
		  	.where('tingkat',Inputs.tingkat)
		  	.paginate(params.page, params.limit)
		return response.json(video)
	}

	async permatpel ({params, response}) {
		const Inputs = request.only(['matpel'])
		const video = await Database
			.query()
		  	.table('in_video')
		  	.where('nama_matpel',Inputs.matpel)
		  	.paginate(params.page, params.limit)
		return response.json(video)
	}

	async permatpeldantingkat ({params, response, request}) {
		const Inputs = request.only(['matpel','tingkat'])
		const video = await Database
			.query()
		  	.table('in_video')
		  	.where('nama_matpel',Inputs.matpel)
		  	.where('tingkat',Inputs.tingkat)
		  	.paginate(params.page, params.limit)
		return response.json(video)
	}

	async detail ({params, response}) {
		const video = await Database
			.query()
		  	.table('in_video')
		  	.where('slug',params.slug)
		  	.first()

		return response.json(video)
	}

	async nambah_view ({response,params}){
		const nambah = await Database
			.raw("UPDATE in_video SET total_view = total_view+1 WHERE slug = ?", [params.slug])
		return response.json(nambah)
	}

	async serupa ({request, response}) {
		const Inputs = request.only(['tingkat'])
		const video = await Database
			.query()
		  	.table('in_video')
		  	.where('tingkat', Inputs.tingkat)
		  	.limit(6)
		  	.orderByRaw('random()')

		return response.json(video)
	}

	// revisi bulan april
	async dua_video_gratis ({params, response}) {
		const video = await Database
			.query()
		  	.table('in_video')
		  	.limit(2)
		  	.orderByRaw('random()')
		return response.json(video)
	}

}

module.exports = VideoGratisController
