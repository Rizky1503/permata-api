'use strict'
const Video = use('App/Models/Video')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class VideoController {

	async index ({response}) {
	
		let video = await Video.all()
		return response.json(video)
	}


	async store ({request, response}) {

		const video 		 = new Video()
		const videoInfo 	 = request.only(['kategori','kelas', 'nama_matpel'])
		const videofile		 = request.file('video')
		let filename 		 = ""

		if(videofile !== null){ 
			let path 	= "Video/BankVideo"
			filename  =   randomstring.generate(7) +"."+  videofile.toJSON().extname;
			await videofile.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			  video.video = filename
		}

		video.kategori 	 	 = videoInfo.kategori
		video.kelas 		 = videoInfo.kelas
		video.nama_matpel 	 = videoInfo.nama_matpel
		
		await video.save()
		return response.status(201).json(video)	

	}


	async show ({params, response}) {
	
		const video = await Video.find(params.id)
		return response.json(video)
	
	}


	async update ({params, request, response}) {

		const video 	= await Video.find(params.id)
		const videoInfo 	 = request.only(['kategori','kelas', 'nama_matpel'])
		const videofile		 = request.file('video')
		let filename 		 = ""
		if (!video) {
			return response.status(404).json({data: 'Resource not found'})
		}
		if(videofile !== null){ 
			let path 	= "Video/BankVideo"
			filename  =   randomstring.generate(7) +"."+  videofile.toJSON().extname;
			await videofile.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			  video.video = filename
		}
		video.kategori 		 = videoInfo.kategori
		video.kelas 		 = videoInfo.kelas
		video.nama_matpel 	 = videoInfo.nama_matpel
		video.kurikulum 	 = videoInfo.kurikulum
		video.video 		 = videoInfo.video
		
		await video.save()
		return response.status(200).json(video)
	}


	async delete ({params, response}) {

		const video 	= await Video.find(params.id)
		if (!video) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await video.delete()
		return response.status(204).json(video)
	}
}

module.exports = VideoController
