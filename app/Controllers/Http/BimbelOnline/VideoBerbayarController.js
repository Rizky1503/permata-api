'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class VideoBerbayarController {

	async semua ({params, response, request}) {
		const Inputs = request.only(['id_kelas','matapelajaran'])
		const get_id_kelas = await Database
			.select('id_kelas')
			.from('in_soal_langganan_paket')
			.where('id_paket',Inputs.id_kelas)
			.first()

		if (Inputs.matapelajaran) {
			const video = await Database
				.select('in_video.*')
			  	.table('in_soal_langganan_video')
			  	.innerJoin('in_soal_langganan_kelas','in_soal_langganan_video.id_kelas','in_soal_langganan_video.id_kelas')
			  	.innerJoin('in_video','in_soal_langganan_video.id_video','in_video.id_video')
			  	.where('in_soal_langganan_video.id_kelas',get_id_kelas.id_kelas)
			  	.where('in_video.nama_matpel',Inputs.matapelajaran)
			  	.paginate(params.page, params.limit)
			return response.json(video)
		}else{
			const video = await Database
				.select('in_video.*')
			  	.table('in_soal_langganan_video')
			  	.innerJoin('in_soal_langganan_kelas','in_soal_langganan_video.id_kelas','in_soal_langganan_video.id_kelas')
			  	.innerJoin('in_video','in_soal_langganan_video.id_video','in_video.id_video')
			  	.where('in_soal_langganan_video.id_kelas',get_id_kelas.id_kelas)
			  	.paginate(params.page, params.limit)
			return response.json(video)
		}
		
	}

	async get_matpel_video ({request,response}){
		const Inputs = request.only(['id_kelas'])

		const get_id_kelas = await Database
			.select('id_kelas')
			.from('in_soal_langganan_paket')
			.where('id_paket',Inputs.id_kelas)
			.first()

		const video = await Database
			.select('in_video.nama_matpel')
		  	.table('in_soal_langganan_video')
		  	.innerJoin('in_soal_langganan_kelas','in_soal_langganan_video.id_kelas','in_soal_langganan_video.id_kelas')
		  	.innerJoin('in_video','in_soal_langganan_video.id_video','in_video.id_video')
		  	.where('in_soal_langganan_video.id_kelas',get_id_kelas.id_kelas)
		  	.groupBy('in_video.nama_matpel')

		return response.json(video)
	}

	async semua_	({params, response}) {
		const kelas_video = await Database
			.select('kelas')
			.table('in_video')
			.groupBy('kelas')

		const video = await Database
			.select('kelas')
			.table('in_video')
			.groupBy('kelas')

		for (var i = 0; i < video.length; i++) {
			const matpel = await Database
				.select('nama_matpel','kelas')
				.table('in_video')
				.where('kelas',video[i].kelas)
				.groupBy('nama_matpel','kelas')
			video[i]['key'] = i;
			video[i]['matpel'] = matpel;

			for (var i = 0; i < matpel.length; i++) {
				const vid = await Database
					.query()
					.table('in_video')
					.where('nama_matpel',matpel[i].nama_matpel)
					.where('kelas',matpel[i].kelas)
					.paginate(params.page, params.limit)
				matpel[i]['key'] = i;
				matpel[i]['vid'] = vid;
			}

		}

		return response.json({
			status : 'true',
			responses : '200',
			kelas : kelas_video,
			data:video,
		})
	}


	async detail ({params, response}) {
		const video = await Database
			.query()
		  	.table('in_video')
		  	.where('slug',params.slug)
		  	.first()

		return response.json(video)
	}

	async serupa ({request, response}) {
		const Inputs = request.only(['id_kelas'])
		
		const get_id_kelas = await Database
			.select('id_kelas')
			.from('in_soal_langganan_paket')
			.where('id_paket',Inputs.id_kelas)
			.first()

	  	const video = await Database
			.select('in_video.*')
		  	.table('in_soal_langganan_video')
		  	.innerJoin('in_soal_langganan_kelas','in_soal_langganan_video.id_kelas','in_soal_langganan_video.id_kelas')
		  	.innerJoin('in_video','in_soal_langganan_video.id_video','in_video.id_video')
		  	.where('in_soal_langganan_video.id_kelas',get_id_kelas.id_kelas)
		  	.limit(6)
	  		.orderByRaw('random()')

		return response.json(video)
	}

	async nambah_view ({response,params}){
		const nambah = await Database
			.raw("UPDATE in_video SET total_view = total_view+1 WHERE slug = ?", [params.slug])
		return response.json(nambah)
	}

	async halaman_utama ({response}){
		const data = await Database
			.select('*')
			.table('in_video')
			.limit(4)
			.orderByRaw('random()')
		return response.json(data)
	}

}

module.exports = VideoBerbayarController
