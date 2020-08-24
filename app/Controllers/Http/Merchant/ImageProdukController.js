'use strict'
const ImageProduk = use('App/Models/ImageProduk')
const randomstring = use("randomstring");
const Helpers = use('Helpers')

class ImageProdukController {

	async index ({response}) {
	
		let imageproduk = await ImageProduk.all()
		return response.json(imageproduk)
	}


	async store ({request, response}) {

		const imageproduk 		= new ImageProduk()
		const idProduk 	= request.input('id_produk')
		const image = request.file('image')
		let filename = ""
		
	    if(image !== null){ 
			let path 	= "images/ImageProduct"
			filename  =   randomstring.generate(7) +"."+  image.toJSON().extname;
			await image.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			  imageproduk.image = filename
		  }

		imageproduk.id_produk 	= idProduk
		await imageproduk.save()
		return response.status(201).json(imageproduk)	

	}

	async show ({params, response}) {
	
		const imageproduk = await ImageProduk.find(params.id)
		return response.json(imageproduk)
	
	}


	async update ({params, request, response}) {
		
		const imageproduk = await ImageProduk.find(params.id)
		const idProduk 	= request.input('id_produk')
		const image = request.file('image')
		let filename = ""

		if (!imageproduk) {
			return response.status(404).json({data: 'Resource not found'})
		}

		if(image !== null){ 
			let path 	= "images/ImageProduct"
			filename  =   randomstring.generate(7) +"."+  image.toJSON().extname;
			await image.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			  imageproduk.image = filename
		  }

		imageproduk.id_produk 	= idProduk
		await imageproduk.save()
		return response.status(201).json(imageproduk)	
	}


	async delete ({params, response}) {

		const imageproduk = await ImageProduk.find(params.id)
		if (!imageproduk) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await imageproduk.delete()
		return response.status(204).json(imageproduk)
	}
}

module.exports = ImageProdukController
