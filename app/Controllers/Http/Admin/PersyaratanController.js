'use strict'
const Persyaratan = use('App/Models/Persyaratan')
const Database = use('Database')


class PersyaratanController {

	async index ({response}) {

		let persyaratan = await Persyaratan.all()
		return response.json(persyaratan)
	}

	async store ({request, response}) {

		const persyaratanInfo 			= request.only(['id_master_kategori', 'jenis_lembaga', 'persyaratan'])
		const persyaratan 				= new Persyaratan()
		persyaratan.id_master_kategori	= persyaratanInfo.id_master_kategori
		persyaratan.jenis_lembaga		= persyaratanInfo.jenis_lembaga
		persyaratan.persyaratan			= persyaratanInfo.persyaratan
		await persyaratan.save()
		return response.status(201).json(persyaratan)		
	}


	async show ({params, response}) {
	
		const persyaratan = await Persyaratan.find(params.id)
		return response.json(persyaratan)
	
	}

	async showIdMasterKategori ({params, response}) {
	
		const persyaratan = await Persyaratan.query().where('id_master_kategori', params.id).first()
		return response.json(persyaratan)
	
	}


	async update ({params, request, response}) {

		const persyaratanInfo 	= request.only(['id_master_kategori', 'jenis_lembaga', 'persyaratan'])
		const persyaratan = await Persyaratan.find(params.id)
		if (!persyaratan) {
			return response.status(404).json({data: 'Resource not found'})
		}
		persyaratan.id_master_kategori	= persyaratanInfo.id_master_kategori
		persyaratan.jenis_lembaga		= persyaratanInfo.jenis_lembaga
		persyaratan.persyaratan			= persyaratanInfo.persyaratan
		await persyaratan.save()
		return response.status(201).json(persyaratan)	
	}


	async delete ({params, response}) {

		const persyaratan = await Persyaratan.find(params.id)
		if (!persyaratan) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await persyaratan.delete()
		return response.status(204).json(persyaratan)
	}
}

module.exports = PersyaratanController
