'use strict'
const Database = use('Database')
const Helpers = use('Helpers')


class HomePageController {

	async index ({response}) {

		let Label = await Database.from('in_produk')
		.select('jenis_product')
		.limit(4)
		.where('jenis_product','!=', 'Private')
		.groupBy('jenis_product')
		.pluck('jenis_product')


		let List = await Database.from('in_produk')
		.select('nama_produk','jenis_product','image','slug')
		.orderBy('viewer', 'desc')
		.where('jenis_product','!=', 'Private')
		.limit(4)
	  	.leftJoin('in_image_produk', 'in_produk.id_produk', 'in_image_produk.id_produk')

		var ListData = [];
		for(var ii = 0, ll = List.length; ii < ll; ii++) {
		    ListData[ii] = {};
		    ListData[ii].nama_produk 	= List[ii].nama_produk;
		    ListData[ii].slug 			= List[ii].slug;
		    ListData[ii].jenis_product 	= List[ii].jenis_product;
		    ListData[ii].image 			= Helpers.publicPath('images\\product\\')+List[ii].image;
		}

		return response.json({
			Label: Label,
			list: ListData,
		})
	}

	async kota ({response}) {
		let kota = await Database.from('in_alamat_verifikasi')
		.select('kota')
		.groupBy('kota')
		.pluck('kota')
		return response.json(kota)
	}

	async semua_kota ({response}) {
		let kota = await Database.from('in_alamat')
		.select('kota')
		.groupBy('kota')
		.pluck('kota')
		return response.json(kota)
	}


	async count_pelanggan_survey ({response,params}){
		const data = await Database
			.from('in_survey')
			.where('id_pelanggan',params.id)
			.count()
			.first()
		return response.json(data)
	}

	async store_survey ({request,response}){
		const Inputs = request.only(['id_pelanggan','sumber'])
		const data = await Database
			.table('in_survey')
			.insert({
				id_pelanggan : Inputs.id_pelanggan,
				sumber 		 : Inputs.sumber
			})
		return response.json('200')
	}
}

module.exports = HomePageController
