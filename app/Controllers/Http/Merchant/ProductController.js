'use strict'
const Product = use('App/Models/Product')
const Rated = use('App/Models/Rated')
const Database = use('Database')


class ProductController {

	async index ({response}) {
	
		let product = await Product.all()
		return response.json(product)
	}

	async produkByRating ({response,params}) {
		const prdbrat = await Database
		.select('*')
		.table('in_produk as produk')
		.innerJoin('in_rated as rated', 'produk.id_produk', 'rated.id_produk')
		.where('produk.id_produk', params.id)
		if (prdbrat == "") {
			return response.status(404).json({data: 'Resource not found'})
		}else
		return response.json(prdbrat)	
	}

	async store ({request, response}) {

		function appendLeadingZeroes(n){
			if(n <= 9){
			  return "0" + n;
			}
			return n
		  }
  
		  let current_datetime = new Date()
		  let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())		
  
		  const lastProduk = await Database.select(Database.raw('substr(id_produk,11,30) as id_produk'))
			  .from('in_produk')
			  .orderBy(Database.raw('substr(id_produk,11,30)'), 'desc')
			  .first();
  
		  let lastProdukNumber = null;
  
		  if (lastProduk ) {
  
			lastProdukNumber = 'PD'+ formatted_date + ++lastProduk.id_produk;
		  } else {
  
			lastProdukNumber = 'PD'+ formatted_date +'1000000001';
  
		  }

		const productInfo 		= request.only(['id_produk','id_mitra', 'id_master_kategori', 'nama_produk','alamat', 'negara', 'provinsi','kota','kecamatan','kode_pos','nama_pic','no_telpon','kontak_pic','status_product'])
		const product 				= new Product()
		product.id_produk 			= lastProdukNumber
		product.id_mitra 			= productInfo.id_mitra
		product.id_master_kategori 	= productInfo.id_master_kategori
		product.nama_produk 		= productInfo.nama_produk
		product.alamat 				= productInfo.alamat
		product.negara 				= productInfo.negara
		product.provinsi 			= productInfo.provinsi
		product.kota 				= productInfo.kota
		product.kecamatan 			= productInfo.kecamatan
		product.kode_pos 			= productInfo.kode_pos
		product.nama_pic 			= productInfo.nama_pic
		product.no_telpon 			= productInfo.no_telpon
		product.kontak_pic_wa 		= productInfo.kontak_pic
		product.status_product 		= productInfo.status_product
		await product.save()
		return response.status(201).json(product)		
	}

	async show ({params, response}) {
	
		const product = await Product.find(params.id)
		return response.json(product)
	
	}


	async update ({params, request, response}) {

		const productInfo 		= request.only(['id_mitra', 'id_master_kategori', 'nama_produk','alamat', 'negara', 'provinsi','kota','kecamatan','kode_pos','nama_pic','no_telpon','kontak_pic','status_product'])
		const product 		= await Product.find(params.id)
		if (!product) {
			return response.status(404).json({data: 'Resource not found'})
		}
		product.id_mitra 			= productInfo.id_mitra
		product.id_master_kategori 	= productInfo.id_master_kategori
		product.nama_produk 		= productInfo.nama_produk
		product.alamat 				= productInfo.alamat
		product.negara 				= productInfo.negara
		product.provinsi 			= productInfo.provinsi
		product.kota 				= productInfo.kota
		product.kecamatan 			= productInfo.kecamatan
		product.kode_pos 			= productInfo.kode_pos
		product.nama_pic 			= productInfo.nama_pic
		product.no_telpon 			= productInfo.no_telpon
		product.kontak_pic_wa 		= productInfo.kontak_pic
		product.status_product 		= productInfo.status_product
		await product.save()
		return response.status(200).json(product)
	}


	async delete ({params, response}) {

		const product = await Product.find(params.id)
		if (!product) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await product.delete()
		return response.status(204).json(null)
	}
}

module.exports = ProductController
