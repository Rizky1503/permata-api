'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Video = use('App/Models/Video')

class Ts_videoController {
	async storeVideo({request,response}){
		const Inputs = request.only(['id_konten','status_video','title','durasi','deskripsi','banner','video','created_by'])
		if (Inputs.status_video == 0 ) {
			const video = new Video()
				video.id_content  	= Inputs.id_konten,
				video.title	    	= Inputs.title,
				video.file	    	= Inputs.video,
				video.duration    	= Inputs.durasi,
				video.banner	    = Inputs.banner,
				video.description 	= Inputs.deskripsi,
				video.free			= true,
				video.created_by	= Inputs.created_by,
			await video.save()	
		}else{
			const video = new Video()
				video.id_content  	= Inputs.id_konten,
				video.title	    	= Inputs.title,
				video.file	    	= Inputs.video,
				video.duration    	= Inputs.durasi,
				video.banner	    = Inputs.banner,
				video.description 	= Inputs.deskripsi,
				video.created_by	= Inputs.created_by,
			await video.save()	
		}
	}

	async listVideo({response,params}){
		const list = await Database
			.table('v2.ts_video')
			.where('id_content',params.id)
		return response.json(list)
	}

	async deleteVideo({params}){
		const hapus = await Database
			.table('v2.ts_video')
			.where('id_video',params.id)
			.delete()
	}
}

module.exports = Ts_videoController
