'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const randomstring = use("randomstring");
const Order = use('App/Models/OrderModel')
const fetch = require("node-fetch");
const base64 = require('base-64');
const moment = require('moment');
const {push_notification} = use('App/Helpers')

const woodlotCustomLogger = require('woodlot').customLogger;
const woodlot = new woodlotCustomLogger({
    streams: ['./logs/'+moment().format('YYYY')+'/'+moment().format('YYYY-MM')+'/report-daily-'+moment().format('YYYY-MM-DD')+'.log'],
    stdout: false,
    userAnalytics: {
        platform: true,
        country: true
    },
    format: {
        type: 'json',
        options: {
          cookies: true,
          headers: true,
            spacing: 4,
            separator: '\n'
        }
    }
});


class paymentController {

	async response ({request, response}) {

		woodlot.info(request.all());

		const Data = request.only(['order_id','transaction_status','transaction_time','payment_type', 'gross_amount'])

		const invoice = Data.order_id
		const transaction_status = Data.transaction_status
		const transaction_time = Data.transaction_time
		const payment_type = Data.payment_type
		const gross_amount = Data.gross_amount

		try {
			const tab_order = [];
			const status 	= [];
			if (transaction_status == "pending") {
				tab_order.push("Pembayaran");
				status.push("Requested");
			}else if(transaction_status == "settlement"){
				tab_order.push("Selesai");
				status.push("Approved");
			}else if(transaction_status == "expire"){
				tab_order.push("Selesai");
				status.push("Expired");
			}

			if (status[0]) {
				const getOrder = await Database
				  	.table('v2.tscn_order as order')
				  	.innerJoin('v2.tscn_order_deal as order_deal', 'order_deal.invoice', 'order.invoice')
				  	.innerJoin('v2.tscn_paket as paket', 'paket.id_paket', 'order.id_paket')
				  	.innerJoin('v2.tscn_price as price', 'price.id_price', 'order.id_price')
				  	.where('order.invoice', invoice)
				  	.where('tab_order', 'Pembayaran')
				  	.where('status_order', 'Requested')
				  	.first()

				if (getOrder) {

					//get duration
					const getDuration = await Database
					  	.table('v2.tscn_price')
					  	.where('id_price', getOrder.id_price)
					  	.first()

					let expired = moment();
					if (getDuration.type == "Hari") {
						expired = moment().add(getDuration.duration, 'days');
					}else if (getDuration.type == "Minggu") {
						expired = moment().add(getDuration.duration, 'weeks');
					}else if (getDuration.type == "Bulan") {
						expired = moment().add(getDuration.duration, 'months');
					}else if (getDuration.type == "Tahun") {
						expired = moment().add(getDuration.duration, 'years');
					}

					const update_order = await Database
					  	.table('v2.tscn_order')
					  	.where('invoice', invoice)
					  	.update({ 
					  		tab_order 		: tab_order[0],
					  		status_order 	: status[0],
					  		expired  		: expired.format('M/D/Y')
					  	})

					const nama_paket = getOrder.nama_paket +' '+getOrder.duration+' '+getOrder.type;
					let title = '';
					let command = '';
					let command_not = '';

					if (status[0] == "Requested") {
						title 	 	= 'Silahkan melakukan Pembayaran'
						command    	= 'Hi, Silahkan melakukan pembayaran untuk '+nama_paket+' Kamu'
						command_not = 'Hi, Silahkan melakukan pembayaran untuk '+nama_paket+' Kamu dengan pilih menu transaksi -> dan pilih salah satu daftar yang ada di transaksi'
					}else if (status[0] == "Approved") {
						title 	 = 'Paket Berlangganan Bimbel Online Berhasil Dibayar'
						command    = 'Hi, Paket Berlangganan '+nama_paket+' Kamu sudah berhasil dibayar & aktif sampai '+ moment(expired).format('DD MMMM YYYY')
					}else if (status[0] == "Expired") {
						title 	 = 'Paket Berlangganan Bimbel Online Berakhir'
						command    = 'Hi, Paket Berlangganan '+nama_paket+' Kamu Sudah Berakhir, Silahkan melakukan langganan kembali dengan memilih paket yang tersedia di menu Transaksi -> Lihat Paket Belajar Lainya'
					}
					push_notification(getOrder.id_pelanggan, title, command,'','AllNotification','')						
					// insert notification
					const insertNotification = await Database
					  	.table('v2.tscn_order_notification')
					  	.insert({
					  	 to   			: 'Pelanggan',
					  	 id_pelanggan   : getOrder.id_pelanggan,
					  	 title 			: title, 
					  	 description 	: command,
					  	 status 		: 'New'
					  	})

					woodlot.info('invoice '+invoice+' has been update');
					return response.json({
						status : 'true',
						responses : '200',
						data: 'invoice has been update'			
					})
																						
				}else{
					woodlot.info('invoice '+invoice+' not found');
					return response.json({
						status : 'true',
						responses : '201',
						data: 'invoice not found'			
					})
				}

			}else{
				woodlot.info('status_order '+invoice+' not found');
				return response.json({
					status : 'true',
					responses : '201',
					data: 'status_order not found'			
				})
			}						  	
		}
		catch(err) {
		  	return response.json({
				status : 'true',
				responses : '201',
				data: err			
			})
		}						
	}
	
}

module.exports = paymentController
