'use strict'
const Category = use('App/Models/Category')
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class CategoryController {

	async index ({response}) {
	
		let category = await Database.from('in_ms_kategori').where('flag', 'ms_Product')
		return response.json(category)
	}


	async sub_index ({params, response}) {
	
		let category = await Database.from('in_ms_kategori').where('sub_kategori', params.id.replace('%20', ' '))
		return response.json(category)
	}



	async store ({request, response}) {

		const category 			= new Category()

		const categoryInfo 		= request.only(['kategori', 'sub_kategori', 'flag',])
		const icon 				= request.file('icon')
		let filename = ""

		if(icon !== null){ 
			let path 	= "images/category"
			filename  =   randomstring.generate(7) +"."+  icon.toJSON().extname;
			await icon.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			category.icon = filename
		}

		category.kategori 		= categoryInfo.kategori
		category.sub_kategori 	= categoryInfo.sub_kategori
		category.flag 			= categoryInfo.flag

		await category.save()
		return response.status(201).json(category)		
	}


	async show ({params, response}) {
	
		const category = await Category.find(params.id)
		return response.json(category)
	
	}


	async update ({params, request, response}) {
		const category 		= await Category.find(params.id)

		const categoryInfo 		= request.only(['kategori', 'sub_kategori', 'flag',])
		const icon 				= request.file('icon')
		let filename = ""

		if (!category) {
			return response.status(404).json({data: 'Resource not found'})
		}

		if(icon !== null){ 
			let path 	= "images/category"
			filename  =   randomstring.generate(7) +"."+  icon.toJSON().extname;
			await icon.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			   category.icon = filename
		}
		category.kategori 		= categoryInfo.kategori
		category.sub_kategori 	= categoryInfo.sub_kategori
		category.flag 			= categoryInfo.flag

		await category.save()
		return response.status(200).json(category)
	}


	async delete ({params, response}) {

		const category = await Category.find(params.id)
		if (!category) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await category.delete()
		return response.status(204).json(null)
	}
}

module.exports = CategoryController
