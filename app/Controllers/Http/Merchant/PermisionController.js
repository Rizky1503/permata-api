'use strict'
const Permison = use('App/Models/Permision')


class PermisionController {

	async index ({response}) {
	
		let permision = await Permison.all()
		return response.json(permision)
	}



	async store ({request, response}) {

		const permisionInfo 		 = request.only(['id_merchant','id_master_kategori'])
		const permision 			 = new Permison()
		permision.id_merchant        = permisionInfo.id_merchant
		permision.id_master_kategori = permisionInfo.id_master_kategori

		await permision.save()
		return response.status(201).json(permision)	

	}


	async show ({params, response}) {
	
		const permision = await Permison.find(params.id)
		return response.json(permision)
	
	}


	async update ({params, request, response}) {

		const permisionInfo 		 = request.only(['id_merchant','id_master_kategori'])
		const permision 			 = await Permison.find(params.id)
		if (!permision) {
			return response.status(404).json({data: 'Resource not found'})
		}
		permision.id_merchant        = permisionInfo.id_merchant
		permision.id_master_kategori = permisionInfo.id_master_kategori

		await permision.save()
		return response.status(200).json(permision)
	}


	async delete ({params, response}) {

		const permision = await Permison.find(params.id)
		if (!permision) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await permision.delete()
		return response.status(204).json(permision)
	}
}

module.exports = PermisionController
