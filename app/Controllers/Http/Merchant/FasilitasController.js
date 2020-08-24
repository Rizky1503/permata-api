'use strict'
const Fasilitas = use('App/Models/Fasilitas')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class FasilitasController {

	async index ({response}) {
	
		let fasilitas = await Fasilitas.all()
		return response.json(fasilitas)
	}


	async store ({request, response}) {

		const fasilitas 		= new Fasilitas()
		const fasilitasInfo 	= request.only(['id_produk','fasilitas'])
		const icon 				= request.file('icon')
		let filename = ""

		if(icon !== null){ 
			let path 	= "images/fasilitas"
			filename  =   randomstring.generate(7) +"."+  icon.toJSON().extname;
			await icon.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			fasilitas.icon = filename
		}

		fasilitas.id_produk 	= fasilitasInfo.id_produk
		fasilitas.fasilitas 	= fasilitasInfo.fasilitas
		
		await fasilitas.save()
		return response.status(201).json(fasilitas)	

	}


	async show ({params, response}) {
	
		const fasilitas = await Fasilitas.find(params.id)
		return response.json(fasilitas)
	
	}


	async update ({params, request, response}) {

		const fasilitas 		= await Fasilitas.find(params.id)
		const fasilitasInfo 	= request.only(['id_produk','fasilitas'])
		const icon 				= request.file('icon')
		let filename = ""		
		
		if (!fasilitas) {
			return response.status(404).json({data: 'Resource not found'})
		}

		if(icon !== null){ 
			let path 	= "images/fasilitas"
			filename  =   randomstring.generate(7) +"."+  icon.toJSON().extname;
			await icon.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			fasilitas.icon = filename
		}

		fasilitas.id_produk 	= fasilitasInfo.id_produk
		fasilitas.fasilitas 	= fasilitasInfo.fasilitas
		fasilitas.icon 			= fasilitasInfo.icon
		await fasilitas.save()
		return response.status(200).json(fasilitas)
	}


	async delete ({params, response}) {

		const fasilitas 		= await Fasilitas.find(params.id)
		if (!fasilitas) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await fasilitas.delete()
		return response.status(204).json(fasilitas)
	}
}

module.exports = FasilitasController
