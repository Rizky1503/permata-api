'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const moment = require('moment');
const Env = use('Env')
const Order = use('App/Models/OrderModel')
const {push_notification} = use('App/Helpers')

class orderController {

	async order ({request, response}){
		const data = request.only(['id_pelanggan', 'id_harga']);
		const getPaket = await Database
		  	.table('in_soal_langganan_paket_harga')
		  	.innerJoin('in_soal_langganan_paket', 'in_soal_langganan_paket.id_paket', 'in_soal_langganan_paket_harga.id_paket')		  
		  	.where('id', data.id_harga)
		  	.first()
		if (!getPaket) {
			return response.json({
				status : 'false',
				responses : '201',
				data: 'Paket tidak ditemukan'	
			})	
		}else{

			const getDataOrder = await Database
				.table('in_order')
			  	.innerJoin('in_soal_langganan_paket', 'in_soal_langganan_paket.id_paket', 'in_order.id_package_user')
			  	.where('id_user_order', data.id_pelanggan)
			  	.where('id_package_user', getPaket.id_paket)
			  	.whereIn('in_order.status_order', ['Pending','Cek_Pembayaran'])
			  	.first()
			if (getDataOrder) {
				if (getDataOrder.status == "In Progres") {	  
					getDataOrder['alert_image'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/transaksi/status/pembayaran-sukses.png';
					getDataOrder['alert_status'] = 'Status Pendaftaran';
					getDataOrder['alert_brief_status'] = 'Paket Bimbel Online kamu sudah aktif';
					getDataOrder['alert_command_status'] = 'Masuk Pembelajaran';
				} else {	  
					getDataOrder['alert_image'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/transaksi/status/pembayaran-tertunda.png';
					getDataOrder['alert_status'] = 'Status Pendaftaran';
					getDataOrder['alert_brief_status'] = 'Selamat pendaftaran kamu berhasil, silahkan lakukan pembayaran';
					getDataOrder['alert_command_status'] = 'Lanjutkan Pembayaran';
				}
			    return response.json({
					status : 'true',
					responses : '200',
					data: getDataOrder	
				})

			}else{
				const countOrder = await Database
			  	.table('in_order')
			  	.where('id_user_order',data.id_pelanggan)
			  	.where('product','BO')
			  	.whereIn('in_order.status_order', ['In Progres','Close'])
			  	.whereNotNull('id_package_user')
			  	.count()
			  	.first()

				function appendLeadingZeroes(n){
					if(n <= 9){
					  return "0" + n;
					}
					return n
				}		  
			  	let current_datetime = new Date()
			  	let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())			  
			  	const lastProduk = await Database.select(Database.raw('substr(id_order,12,30) as id_order'))
					.from('in_order')
					.orderBy(Database.raw('substr(id_order,12,30)'), 'desc')
					.first();

				let lastProdukNumber = null;	  
				if (lastProduk ) {	  
					lastProdukNumber = 'INV'+ formatted_date + ++lastProduk.id_order;
				} else {	  
					lastProdukNumber = 'INV'+ formatted_date +'1000000001';	  
				}

				let statusOrder = null;	  
				if (getPaket.amount == 0) {	  
					statusOrder = 'In Progres';
				} else {	  
					statusOrder = 'Pending';	  
				}
				const InsertData = new Order()
			  		InsertData.id_order 				= lastProdukNumber,
			  		InsertData.id_user_order 			= data.id_pelanggan,
			  		InsertData.id_package_user 			= getPaket.id_paket,
			  		InsertData.product 					= 'BO',
			  		InsertData.status_order 			= statusOrder,
			  		InsertData.keterangan 				= getPaket.tmp_kelas,
			  		InsertData.kondisi 					= getPaket.tmp_matpel,
				await InsertData.save()

				const getDiscount = await Database
			  	.table('in_soal_langganan_paket_promo')
			  	.where('active',1)		  	
			  	.orderBy('limit_active','DESC')

			  	const amountTotal = [];
			  	if (countOrder.count > 0) {
			  		if (getDiscount.length > 0) {
				  		for (var iclass = 0; iclass < getDiscount.length; iclass++) {
					  		if (countOrder.count >= getDiscount[iclass].limit_active) {
					  			const harga_awal 		= getPaket.amount;
					  			const percent_awal 		= getDiscount[iclass].promo / 100 * harga_awal;
					  			amountTotal.push(harga_awal - percent_awal);		  			  				  		
					  		}	
					  	}			  			
			  		}else{
				  		amountTotal.push(getPaket.amount);
			  		}			  		
				  }else{
				  	amountTotal.push(getPaket.amount);
				  }
			  		

			  	let amountReal = 0;	  
				if (amountTotal[0] == 0) {	  
					amountReal = getPaket.amount;
				} else {	  
					amountReal = amountTotal[0];	  
				}

				const InsertDataPayment      = await Database
			        .query()
			        .table('in_order_deal')
			        .insert({
			        	id_order: InsertData.id_order,
			        	id_produk: data.id_harga,
			        	amount: amountReal,
			        	description: 'berlangganan Bimbel Online',
		        })    
		          	
				if (getPaket.amount == 0) {	  
					InsertData['alert_image'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/transaksi/status/pembayaran-sukses.png';
					InsertData['alert_status'] = 'Status Pendaftaran';
					InsertData['alert_brief_status'] = 'Paket Bimbel Online kamu sudah aktif';
					InsertData['alert_command_status'] = 'Masuk Pembelajaran';

					push_notification(data.id_pelanggan,'Berlangganan paket Bimbel Online berhasil','Paket Bimbel Online kamu sudah aktif, silahkan nikmati berbagai fitur yang tersedia','','BimbelOnline','id_notification')
				} else {	  
					InsertData['alert_image'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/transaksi/status/pembayaran-tertunda.png';
					InsertData['alert_status'] = 'Status Pendaftaran';
					InsertData['alert_brief_status'] = 'Selamat pendaftaran kamu berhasil, silahkan lakukan pembayaran';
					InsertData['alert_command_status'] = 'Lanjutkan Pembayaran';

					push_notification(data.id_pelanggan,'Silahkan lakukan pembayaran','Untuk menikmati paket berlangganan kamu, silahkan lakukan pembayaran , klik disini','','','id_notification')
				}
			    return response.json({
					status : 'true',
					responses : '200',
					data: InsertData	
				})

			}
			// const CheckAlreadyUse = await Database
			// 	.select('id_order','id_user_order','id_package_user','id_kelas','product','status_order','keterangan','kondisi','expired_bimbel_online','in_order.created_at','in_order.updated_at')
			//   	.table('in_order')
			//   	.innerJoin('in_soal_langganan_paket', 'in_soal_langganan_paket.id_paket', 'in_order.id_package_user')
			//   	.where('id_user_order', data.id_pelanggan)
			//   	.where('id_package_user', getPaket.id_paket)
			//   	.whereIn('in_order.status_order', ['Pending','Cek_Pembayaran'])
			//   	.update({
			//   		status_order : 'Rejected'
			//   	})			
		}
	}


	async orderTrial ({request, response}){
		const data = request.only(['id_pelanggan', 'id_paket']);		
		const getPaket = await Database
		  	.table('in_soal_langganan_paket')
		  	.where('id_paket', data.id_paket)
		  	.first()
		if (!getPaket) {
			return response.json({
				status : 'false',
				responses : '201',
				data: 'Paket tidak ditemukan'	
			})	
		}else{
			const getDataOrder = await Database
				.table('in_order')
			  	.innerJoin('in_soal_langganan_paket', 'in_soal_langganan_paket.id_paket', 'in_order.id_package_user')
			  	.where('id_user_order', data.id_pelanggan)
			  	.where('id_package_user', getPaket.id_paket)
			  	.whereIn('in_order.status_order', ['Pending','Cek_Pembayaran', 'In Progres'])
			  	.first()
			if (getDataOrder) {		
				const getPaketData = await Database
				.select('in_order.id_order','in_order.status_order','in_soal_langganan_paket.nama_paket','in_soal_langganan_kelas.id_kelas','in_soal_langganan_kelas.kelas','in_soal_langganan_kelas.icon','in_soal_langganan_paket.flag')
			  	.table('in_soal_langganan_paket')
			  	.innerJoin('in_order', 'in_order.id_package_user', 'in_soal_langganan_paket.id_paket')
			  	.innerJoin('in_soal_langganan_kelas', 'in_soal_langganan_kelas.id_kelas', 'in_soal_langganan_paket.id_kelas')
			  	.where('in_order.id_user_order', data.id_pelanggan)
			  	.where('in_order.status_order', 'In Progres')
			  	.where('id_paket', data.id_paket)
			  	.first()
			    return response.json({
					status : 'true',
					responses : '200',
					data: getPaketData
				})
			}else{
				const countOrder = await Database
			  	.table('in_order')
			  	.where('id_user_order',data.id_pelanggan)
			  	.where('product','BO')
			  	.whereIn('in_order.status_order', ['In Progres','Close'])
			  	.whereNotNull('id_package_user')
			  	.count()
			  	.first()

				function appendLeadingZeroes(n){
					if(n <= 9){
					  return "0" + n;
					}
					return n
				}		  
			  	let current_datetime = new Date()
			  	let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())			  
			  	const lastProduk = await Database.select(Database.raw('substr(id_order,12,30) as id_order'))
					.from('in_order')
					.orderBy(Database.raw('substr(id_order,12,30)'), 'desc')
					.first();

				let lastProdukNumber = null;	  
				if (lastProduk ) {	  
					lastProdukNumber = 'INV'+ formatted_date + ++lastProduk.id_order;
				} else {	  
					lastProdukNumber = 'INV'+ formatted_date +'1000000001';	  
				}
				const InsertData = new Order()
			  		InsertData.id_order 				= lastProdukNumber,
			  		InsertData.id_user_order 			= data.id_pelanggan,
			  		InsertData.id_package_user 			= getPaket.id_paket,
			  		InsertData.product 					= 'BO',
			  		InsertData.status_order 			= 'In Progres',
			  		InsertData.keterangan 				= getPaket.tmp_kelas,
			  		InsertData.kondisi 					= getPaket.tmp_matpel,
			  		InsertData.expired_bimbel_online 	= moment().add(2, 'days').format('YYYY-MM-DD'),
				await InsertData.save()

				const InsertDataPayment      = await Database
			        .query()
			        .table('in_order_deal')
			        .insert({
			        	id_order: InsertData.id_order,
			        	id_produk: 0,
			        	amount: 0,
			        	description: 'berlangganan Bimbel Online',
		        })  

			    const InsertDataTrial      = await Database
			        .query()
			        .table('in_order_trial_bimbel_online')
			        .insert({
			        	id_pelanggan: data.id_pelanggan,
			        	id_paket: data.id_paket,
			        	created_at: new Date(),
			        	updated_at: new Date(),
		        }) 
		        // push_notification(data.id_pelanggan,'Berlangganan paket Bimbel Online berhasil','Paket Bimbel Online kamu sudah aktif, silahkan nikmati berbagai fitur yang tersedia','','BimbelOnline','id_notification')  		          					
				const getPaketData = await Database
				.select('in_order.id_order','in_order.status_order','in_soal_langganan_paket.nama_paket','in_soal_langganan_kelas.id_kelas','in_soal_langganan_kelas.kelas','in_soal_langganan_kelas.icon','in_soal_langganan_paket.flag')
			  	.table('in_soal_langganan_paket')
			  	.innerJoin('in_order', 'in_order.id_package_user', 'in_soal_langganan_paket.id_paket')
			  	.innerJoin('in_soal_langganan_kelas', 'in_soal_langganan_kelas.id_kelas', 'in_soal_langganan_paket.id_kelas')
			  	.where('in_order.id_user_order', data.id_pelanggan)
			  	.where('in_order.status_order', 'In Progres')
			  	.where('id_paket', data.id_paket)
			  	.first()

			    return response.json({
					status : 'true',
					responses : '200',
					data: getPaketData	
				})

			}
		}
	}

}
module.exports = orderController
