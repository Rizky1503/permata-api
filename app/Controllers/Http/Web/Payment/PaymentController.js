'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class PaymentController {

	async check ({params, response}) {

		const CheckAlredy 	= await Database
	  	.table('in_order')
	  	.where('id_order', params.id)
	  	.whereNull('id_product_order')
	  	.count()
	  	.first()

	  	if (CheckAlredy.count > 0) {
			return response.status(201).json("NoAlready")
	  	}else{
	  		return response.status(201).json("Already")
	  	}
	}

	async draft ({request, response}) {

		const Inputs 			= request.only(['id_user', 'id_invoice', 'nama_pengirim', 'nama_bank', 'status', 'upload_file'])
		
		const CheckAlredy 	= await Database
	  	.table('in_payment')
	  	.where('id_user', Inputs.id_user)
	  	.where('id_invoice', Inputs.id_invoice)
	  	.where('nama_bank', Inputs.nama_bank)
	  	.where('status', Inputs.status)
	  	.count()
	  	.first()

	  	if (CheckAlredy.count > 0) {
	  		return response.status(201).json("Already")
	  	}else{
	  		let current_datetime = new Date()
			const InsertData 	= await Database
		  	.table('in_payment')
		  	.insert({
		  		id_user: Inputs.id_user,
		  		id_invoice: Inputs.id_invoice,
		  		nama_pengirim: Inputs.nama_pengirim,
		  		nama_bank: Inputs.nama_bank,
		  		upload_file:Inputs.upload_file,
		  		status: Inputs.status,	  		
		  		created_at: current_datetime,
		  		updated_at: current_datetime,
		  	})
		  	.returning('id_user')

		  	const updateRow = await Database
		  	.table('in_order')
		  	.where('id_order', Inputs.id_invoice)
		  	.update('status_order', 'Cek_Pembayaran')

		  	const Notification = await Database
		  	.table('in_notifikasi_member')
		  	.insert({
		  		id_user_request_notifikasi: Inputs.id_user,
		  		id_user_receive_notifikasi:'',
		  		id_invoice:Inputs.id_invoice,
		  		produk_notifikasi:'Privat',
		  		status_notifikasi:'Baru',
		  		keterangan:'requested upload bukti pembayaran',
		  		created_at: current_datetime,
		  		updated_at: current_datetime,
		  	})

			return response.status(201).json(InsertData)
	  	}		
	}


	async amount ({params, response}) {
		const Count 	= await Database
	  	.table('in_order')
	  	.where('id_order', params.id)
	  	.whereNotNull('id_product_order')
	  	.count()
	  	.first()

	  	if (Count.count > 0 ) {
			const CheckAlredy 	= await Database
		  	.table('in_order')
		  	.where('id_order', params.id)
		  	.whereNotNull('id_product_order')
		  	.first()	  		


		  	const Finaly = await Database
		  	.table('in_order_deal')
		  	.select('id_order_deal','id_order','in_produk.id_produk','amount','nama_produk')
		  	.innerJoin('in_produk', 'in_order_deal.id_produk', 'in_produk.id_produk')
		  	.where('id_order', params.id)
		  	.where('in_order_deal.id_produk', CheckAlredy.id_product_order)
		  	.orderBy('id_order_deal','DESC')
		  	.first()

		  	const productNya = await Database
		  	.table('in_order')
		  	.innerJoin('in_pelanggan', 'in_order.id_user_order', 'in_pelanggan.id_pelanggan')
		  	.where('id_order', params.id)
		  	.first()

			return response.status(201).json({
				Finaly:Finaly,
				productNya:productNya,
			})

	  	}else{

			return response.status(201).json("0")
	  	}

	}

	async online_amount ({params, response}) {
		const Count 	= await Database
	  	.table('in_order')
	  	.where('id_order', params.id)
	  	.count()
	  	.first()

	  	if (Count.count > 0 ) {

		  	const productNya = await Database
		  	.table('in_order')
		  	.innerJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.innerJoin('in_pelanggan', 'in_order.id_user_order', 'in_pelanggan.id_pelanggan')
		  	.where('in_order.id_order', params.id)
		  	.first()

			return response.status(201).json(productNya)

	  	}else{

			return response.status(201).json("0")
	  	}

	}
}

module.exports = PaymentController
