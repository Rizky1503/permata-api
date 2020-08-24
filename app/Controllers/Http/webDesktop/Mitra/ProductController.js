'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");
const Product = use('App/Models/Product')
const Harga = use('App/Models/Harga')


class ProductController {

	async index ({params, response}) {
		const affectedRows = await Database
			.query()
			.select('in_produk.id_master_kategori','kategori','icon')
		  	.innerJoin('in_ms_kategori', 'in_produk.id_master_kategori', 'in_ms_kategori.id_master_kategori')
		  	.table('in_produk')
		  	.where('id_mitra', params.id)
		  	.groupBy('in_produk.id_master_kategori','kategori','icon')
		  	.orderBy('id_master_kategori','ASC')



		return response.json(affectedRows)
	}


	async category ({response}) {
		let category = await Database.from('in_ms_kategori')
						.select('id_master_kategori','kategori','sub_kategori','flag','icon')
						.where('flag', 'Product')
		return response.json(category)
	}

	async listcategory_home ({params, response}) {

		const query = "select * from  in_ms_kategori where not exists ( select * from in_produk where in_produk.id_master_kategori = in_ms_kategori.id_master_kategori AND in_produk.id_mitra = '"+params.id_mitra+"') AND flag = 'Product'";
		let category = await Database.raw(query);
		return response.json(category)
	}


	async listProduct ({params, response}) {
		const affectedRows = await Database
			.query()
			.table('in_produk')
		  	.where('id_mitra', params.id_mitra)
		  	.where('id_master_kategori', params.id_kategori)


		return response.json(affectedRows)
	}

	async listProductAll ({params, response}) {
		const affectedRows = await Database
			.query()
			.table('in_produk')
			.where('status_product','Aktif')
		  	.where('id_mitra', params.id_mitra)


		return response.json(affectedRows)
	}

	async ProductPrivat ({params, response}) {
		const Count = await Database
			.query()
			.table('in_order')
			.innerJoin('in_pelanggan', 'in_order.id_user_order', 'in_pelanggan.id_pelanggan')			
		  	.where('id_order', params.slug)
		  	.count()
		  	.first()

		 if (Count.count > 0) {

			const affectedRows = await Database
			.query()
			.table('in_order')
			.innerJoin('in_pelanggan', 'in_order.id_user_order', 'in_pelanggan.id_pelanggan')
		  	.where('id_order', params.slug)
		  	.first()

 			const PertemuanSudah = await Database
				.query()
				.table('in_pertemuan')
			  	.where('id_invoice', params.slug)
			  	.whereNotNull('tanggal')
			  	.orderBy('id_pertemuan')

 			const Pertemuan = await Database
				.query()
				.table('in_pertemuan')
			  	.where('id_invoice', params.slug)
			  	.whereNull('tanggal')
			  	.limit(1)
			  	.orderBy('id_pertemuan')
			return response.json({
				Product: affectedRows,
				PertemuanSudah: PertemuanSudah,
				Pertemuan: Pertemuan,
			})

		 }
	}

}

module.exports = ProductController
