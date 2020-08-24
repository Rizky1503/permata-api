'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Kategori = use('App/Models/Kategoribelanja')

class BelanjaController {

	async listkategori ({ response }){
		const listkategori = await Database
			.select('*')
			.from('in_ms_kategori_belanja')
			.orderBy('flag','ASC') 
		return response.json(listkategori)	
	}

	async flag ({ response }){
		const flag = await Database
			.select ('flag')
			.from('in_ms_kategori_belanja')
			.orderBy('flag','ASC')
			.groupBy('flag')
		return response.json(flag)	
	}

	async sub_kategori ({ response,request }){
		const flaging = request.input('flag')
		const flag = await Database
			.select ('sub_kategori')
			.from('in_ms_kategori_belanja')
			.where('flag',flaging)
			.orderBy('sub_kategori','ASC')
			.groupBy('sub_kategori')
		return response.json(flag)	
	}

	async simpankategori ({ response,request }){
		const inputkate 		= request.only(['flag','sub_kat','kategori'])
		const kategori 			= new Kategori()
		kategori.flag 			= inputkate.flag
		kategori.sub_kategori 	= inputkate.sub_kat
		kategori.kategori 		= inputkate.kategori
		await kategori.save()
		return response.status(201).json(kategori)	
	}



}
module.exports = BelanjaController