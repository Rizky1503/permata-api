'use strict'
const Database = use('Database')
const WebSocket = require('ws');
const Env = use('Env')


class PaymentController {

	async doku_verify ({request, response}) {			
		return request.all()
	}

	async doku_confirm_payment ({request, response}) {		
		const requested = request.only(['TRANSIDMERCHANT','AMOUNT','WORDS','STATUSTYP','RESPONSECODE','APPROVALCODE','RESULTMSG','PAYMENTCHANNEL','PAYMENTCODE','SESSIONID','BANK','MCN','PAYMENTDATETIME','VERIFYID','VERIFYSCORE','VERIFYSTATUS']);

		const Data = await Database.from('in_order').where('id_order', requested.TRANSIDMERCHANT).where('status_order', 'Pending').first();	

		let current_datetime = new Date()

		if (Data) {
			if (requested.RESULTMSG == "SUCCESS") {			
				const Data = await Database.from('in_order')
				.where('id_order', requested.TRANSIDMERCHANT)
				.update({
					'words'             : requested.WORDS,
		            'statustype'        : requested.STATUSTYP,
		            'response_code'     : requested.RESPONSECODE,
		            'approvalcode'      : requested.APPROVALCODE,
		            'status_order'      : 'In Progres',
		            'payment_channel'   : requested.PAYMENTCHANNEL,
		            'paymentcode'       : requested.PAYMENTCODE,
		            'session_id'        : requested.SESSIONID,
		            'bank_issuer'       : requested.BANK,
		            'creditcard'        : requested.MCN,
		            'payment_date_time' : requested.PAYMENTDATETIME,
		            'verifyid'          : requested.VERIFYID,
		            'verifyscore'       : requested.VERIFYSCORE,
		            'verifystatus'      : requested.VERIFYSTATUS
				});	

				const ORDER = await Database.from('in_order').where('id_order', requested.TRANSIDMERCHANT).first();	

				const Notification = await Database
			  	.table('in_notifikasi_member')
			  	.insert({
			  		id_user_request_notifikasi:'',
			  		id_user_receive_notifikasi:ORDER.id_user_order,
			  		id_invoice:requested.TRANSIDMERCHANT,
			  		produk_notifikasi:ORDER.product,
			  		status_notifikasi:'Baru',
			  		keterangan:'Pembayaran Berhasil '+requested.TRANSIDMERCHANT,
			  		created_at: current_datetime,
			  		updated_at: current_datetime,
			  	})			

			}else{

				const Data = await Database.from('in_order')
				.where('id_order', requested.TRANSIDMERCHANT)
				.update({
		            'status_order'      : 'Close',
				});


				const ORDER = await Database.from('in_order').where('id_order', requested.TRANSIDMERCHANT).first();	
				const Notification = await Database
			  	.table('in_notifikasi_member')
			  	.insert({
			  		id_user_request_notifikasi:'',
			  		id_user_receive_notifikasi:ORDER.id_product_order,
			  		id_invoice:requested.TRANSIDMERCHANT,
			  		produk_notifikasi:ORDER.product,
			  		status_notifikasi:'Baru',
			  		keterangan:'Pembayaran Gagal '+requested.TRANSIDMERCHANT,
			  		created_at: current_datetime,
			  		updated_at: current_datetime,
			  	})

			}			
			return response.status(200).json("Continue");
		}else{
			return response.status(200).json("Data Not Found");
		}
	}
	
}

module.exports = PaymentController
