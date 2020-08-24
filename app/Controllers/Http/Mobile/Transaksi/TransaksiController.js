'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const randomstring = use("randomstring");

class TransaksiController {

	async transaksi_load ({params, response}) {
		const data_transaksi = await Database
			.query()
		  	.table('in_order')
		  	.select('in_order.id_order','in_order.product','in_order.keterangan','in_order.kondisi','in_order.status_order','in_order_deal.amount','in_produk.nama_produk')
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
		  	.where('in_order.id_user_order', params.id_pelanggan)
		  	.orderBy('id_order','DESC')
		  	.paginate(params.page, params.show_page)

		return response.json(data_transaksi.data)
	}


	async transaksi_load_post ({request, response}) {
		
		const data = request.only(['id_pelanggan','status_order','page','show_page']);
		if (data.status_order == "Pending_Check_Pembayaran") {
			const data_transaksi = await Database
			.query()
		  	.table('in_order')
		  	.select('in_order.id_order','in_order.product','in_order.keterangan','in_order.kondisi','in_order.status_order','in_order_deal.amount','in_produk.nama_produk', 'in_order_deal.amount_cost')
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
		  	.where('in_order.id_user_order', data.id_pelanggan)
		  	.whereIn('in_order.status_order', ['Pending','Cek_Pembayaran'])
		  	.orderBy('id_order','DESC')
		  	// .paginate(data.page, data.show_page)
			return response.status(200).json({
				status : 'true',
				responses : '200',
				data:data_transaksi
			})
		}else{
			const data_transaksi = await Database
			.query()
		  	.table('in_order')
		  	.select('in_order.id_order','in_order.product','in_order.keterangan','in_order.kondisi','in_order.status_order','in_order_deal.amount','in_produk.nama_produk', 'in_order_deal.amount_cost')
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
		  	.where('in_order.id_user_order', data.id_pelanggan)
		  	.where('in_order.status_order', data.status_order)
		  	.orderBy('id_order','DESC')
		  	// .paginate(data.page, data.show_page)
			return response.status(200).json({
				status : 'true',
				responses : '200',
				data:data_transaksi
			})
		}		

		return data;
	}

	async transaksi_les_privat_detail ({request, response}) {
		
		const data = request.only(['id_user','id_order']);
		const data_transaksi = await Database
			.query()
		  	.table('in_order')
		  	.select(
		  		'in_order.*',
		  		'in_order_deal.amount',
		  		'in_produk.nama_produk'
		  	)		  	
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
		  	.where('in_order.id_order', data.id_order)
		  	.first()

		return response.status(200).json({
			status : 'true',
			responses : '200',
			data:data_transaksi
		})
	}

	async transaksi_bo_detail ({request, response}) {
		
		const data = request.only(['id_user','id_order']);
		const data_transaksi = await Database
			.query()
		  	.table('in_order')
		  	.select(
		  		'in_order.*',
		  		'in_order_deal.amount',
		  		'in_order_deal.amount_cost'
		  	)		  	
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.where('in_order.id_order', data.id_order)
		  	.first()

		const data_payment = await Database
			.query()
		  	.table('in_payment_method')		  	
		  	.where('id_payment', data_transaksi.paymentcode)
		  	.first()

		return response.status(200).json({
			status : 'true',
			responses : '200',
			data:data_transaksi,
			data_payment:data_payment
		})
	}

	async transaksi_les_privat_detail_payment ({request, response}) {		
		const data = request.only(['id_order']);

		const data_transaksi = await Database
			.query()
		  	.table('in_order')
		  	.select(
		  		'in_order.*',
		  		'in_order_deal.amount',
		  		'in_produk.nama_produk'
		  	)		  	
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
		  	.where('in_order.id_order', data.id_order)
		  	.first()

		if (data_transaksi) {
			const data_transaksi_last = await Database
				.query()
			  	.table('in_order')		  	
			  	.where('status_order', 'In Progres')
			  	.where('keterangan', data_transaksi.keterangan)
			  	.where('kondisi', data_transaksi.kondisi)
			  	.orderBy('id_order','DESC')
			  	.first()
			if (data_transaksi_last) {
				return response.status(200).json({
					status : 'true',
					responses : '200',
					data:data_transaksi,
					data_transaksi_last:data_transaksi_last
				})
			}else{
				const data_transaksi_last_except = await Database
				.query()
			  	.table('in_order')		  	
			  	.where('keterangan', data_transaksi.keterangan)
			  	.where('kondisi', data_transaksi.kondisi)
			  	.orderBy('id_order','DESC')
			  	.first()

			  	return response.status(200).json({
					status : 'true',
					responses : '200',
					data:data_transaksi,
					data_transaksi_last:data_transaksi_last_except
				})
			}			
		}else{
			return response.status(200).json({
				status : 'true',
				responses : '200',
				data:data_transaksi,				
			})
		}		
	}
}

module.exports = TransaksiController
