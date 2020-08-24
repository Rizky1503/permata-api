'use strict'
const Rated = use('App/Models/Rated')


class RatedController {

	async index ({response}) {
	
		let rated = await Rated.all()
		return response.json(rated)
	}

	async store ({request, response}) {

		const ratedInfo 		= request.only(['id_produk','id_participant', 'viewers'])
		const rated 			= new Rated()
		rated.id_produk 		= ratedInfo.id_produk
		rated.id_participant 	= ratedInfo.id_participant
		rated.viewers 			= ratedInfo.viewers
		await rated.save()
		return response.status(201).json(rated)	

	}


	async show ({params, response}) {
	
		const rated = await Rated.find(params.id)
		return response.json(rated)
	
	}


	async update ({params, request, response}) {

		const ratedInfo 	= request.only(['id_produk','rated'])
		const rated 		= await Rated.find(params.id)
		if (!rated) {
			return response.status(404).json({data: 'Resource not found'})
		}
		rated.id_produk 	= ratedInfo.id_produk
		rated.rated 	= ratedInfo.rated
		rated.icon 			= ratedInfo.icon
		await rated.save()
		return response.status(200).json(rated)
	}


	async delete ({params, response}) {

		const rated 		= await Rated.find(params.id)
		if (!rated) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await rated.delete()
		return response.status(204).json(rated)
	}
}

module.exports = RatedController
