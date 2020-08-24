'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const randomstring = use("randomstring");
const Product = use('App/Models/Product')
const Harga = use('App/Models/Harga')
const Order = use('App/Models/OrderModel')

class JadwalController {	

	async semua ({params, response}) {
		
		const affectedRows = await Database
		.query()
	  	.table('in_order')	
	  	.innerJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
	  	.where('id_user_order', params.id_pelanggan.replace(/%20/g, ' '))
	  	.where('product', 'Private')
	  	.where('status_order', 'In Progres')
	  	.paginate(params.page, params.show_page)


	  	return response.status(200).json(affectedRows.data);
	}

	async absen ({params, response}) {
		
		const affectedRows = await Database
		.query()
	  	.table('in_pertemuan')
	  	.where('id_user_order',params.id_pelanggan.replace(/%20/g, ' '))	
	  	.where('id_invoice',params.id_invoice.replace(/%20/g, ' '))	
	  	.whereNotNull('absen_guru')
	  	.orderBy('id_pertemuan','ASC')
	  	.paginate(params.page, params.show_page)


	  	return response.status(200).json(affectedRows.data);
	}

	async get_profile ({request, response}) {
		const pelangganInfo = request.only(['id_pelanggan','id_invoice']);
		const Data = await Database.from('in_pertemuan')
		.innerJoin('in_mitra', 'in_mitra.id_mitra', 'in_pertemuan.id_mitra')
		.where('id_user_order',pelangganInfo.id_pelanggan)
		.where('id_invoice',pelangganInfo.id_invoice)
		.first() 				
		return response.json(Data)
	}

	async absen_kehadiran ({request, response}) {
		let current_datetime = new Date()
		const pelangganInfo = request.only(['id_pertemuan','status_kehadiran']);
		const Data = await Database.from('in_pertemuan')
		.where('id_pertemuan', pelangganInfo.id_pertemuan)
		.update({
			tanggal: current_datetime,
			status: pelangganInfo.status_kehadiran,
		});	

		return response.json(Data)
	}
		
}

module.exports = JadwalController
