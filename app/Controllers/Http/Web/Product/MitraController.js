'use strict'
const Database = use('Database')

class MitraController {

	async index ({params, response}) {
		let mitra = await Database.from('in_mitra')
						.where('id_mitra', params.id)
						.first()
		return response.json(mitra)
	}

	async list ({params, response}) {
		let mitra = await Database.from('in_order')
			.select('in_order.id_order','in_pelanggan.nama','in_produk.module','in_produk.kota','in_pelanggan.nama_ortu','in_pelanggan.foto')
			.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
			.leftJoin('in_pelanggan', 'in_order.id_user_order', 'in_pelanggan.id_pelanggan')
			.where('id_product_order', params.id)
		  	.where('status_order','In Progres')

		return response.json(mitra)
	}
}

module.exports = MitraController
