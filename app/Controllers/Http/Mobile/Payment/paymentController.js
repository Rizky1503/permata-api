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

const midtrans_url_payment = 'https://api.midtrans.com/v2/charge';
const midtrans_token_payment = 'Mid-server-0_7N8YEMOvU1GBFZtLEIkMFL:';
// const midtrans_url_payment = 'https://api.sandbox.midtrans.com/v2/charge';
// const midtrans_token_payment = 'SB-Mid-server-juzzj8oCGer3_4cZ5kgt_s46';
const {push_notification} = use('App/Helpers')

class paymentController {

	async bank_channel ({request, response}) {

		const pelangganInfo = request.only(['channel'])
		const channel_offline = await Database
			.query()
		  	.table('in_payment_method')
		  	.where('jenis_payment','manual')

		const channel_online = await Database
			.query()
		  	.table('in_payment_method')
		  	.where('jenis_payment','online')


		const all_channel = ({
			channel_offline: channel_offline,
			channel_online: channel_online,
		})

		return response.json({
			status : 'true',
			responses : '200',
			data:all_channel			
		})		
	}


	async submit_payment ({request, response}) {

		const pelangganInfo = request.only(['id_pelanggan','id_invoice','upload_file','nama_bank','paymentcode', 'id_voucher_already','nominal'])

		const insert_data_payment = await Database
			.query()
		  	.table('in_payment')
		  	.insert({
		  		id_user: pelangganInfo.id_pelanggan,
		  		id_invoice: pelangganInfo.id_invoice,
		  		nama_pengirim: 'permatamall',
		  		nama_bank: pelangganInfo.nama_bank,
		  		upload_file: pelangganInfo.upload_file,
		  		status: 'Requested',
		  		created_at: new Date(),
	        	updated_at: new Date()
		  	})

		const update_order = await Database
		  	.table('in_order')
		  	.where('id_order', pelangganInfo.id_invoice)
		  	.update({ 
		  		status_order: 'Cek_Pembayaran', 
		  		payment_channel: pelangganInfo.nama_bank,
		  		paymentcode: pelangganInfo.paymentcode,
		  		expired_date: new Date()
		  	})
	
		const get_data = await Database
		  	.table('in_order')
		  	.where('id_order', pelangganInfo.id_invoice)
		  	.first()

		if (pelangganInfo.id_voucher_already) {
			const update_order = await Database
		  	.table('in_order_deal')
		  	.where('id_order', pelangganInfo.id_invoice)
		  	.update({ 
		  		amount : pelangganInfo.nominal
		  	})

		  	const insert_data_payment = await Database
			.query()
		  	.table('in_voucher_use')
		  	.insert({
		  		id_invoice: pelangganInfo.id_invoice,
		  		id_pelanggan: pelangganInfo.id_pelanggan,		  		
		  		id_voucher_already: pelangganInfo.id_voucher_already,
		  		created_at: new Date(),
	        	updated_at: new Date()
		  	})
		}
		return response.json({
			status : 'true',
			responses : '200',
			data:get_data			
		})		
	}

	async request_notify ({request, response}) {

		const Bank = request.only(['order_id','data_payment', 'payment_method', 'payment_code'])

		const get_data_order = await Database
		  	.table('in_order')
		  	.where('id_order', Bank.order_id)
		  	.whereNull('payment_data')
		  	.first()

		if (get_data_order) {
			const change_order = await Database
		  	.table('in_order')
		  	.where('id_order', Bank.order_id)
		  	.update({
		  		status_order:'Cek_Pembayaran',
		  		payment_data: Bank.data_payment,
		  		payment_channel: Bank.payment_method,
		  		paymentcode: Bank.payment_code,
		  		expired_date: new Date(),
		  	})

		  	const result_data_payment_method = await Database
		  	.table('in_payment_method')
		  	.where('id_payment', Bank.payment_code)
		  	.first()	

		  	if (result_data_payment_method.id_payment) {
		  		const get_data_payment_method = await Database
				  	.table('in_payment_method')
				  	.where('id_payment', Bank.payment_code)
				  	.first()	

				const get_data_order_deal = await Database
				  	.table('in_order_deal')
				  	.where('id_order', Bank.order_id)
				  	.first()	

				if (get_data_payment_method.channel_payment_mobile == "gopay") {
					const amount_deal 		= get_data_order_deal.amount
					const amount_cost 		= get_data_payment_method.cost			
					const amount_percent    = parseInt(amount_deal) * parseInt(amount_cost) / 100

					const change_order_deal = await Database
				  	.table('in_order_deal')
				  	.where('id_order', Bank.order_id)
				  	.update({			  		
				  		amount_cost: amount_percent,
				  	})
				}else{
					const amount_deal 	= get_data_order_deal.amount
					const amount_cost 	= get_data_payment_method.cost

					const change_order_deal = await Database
				  	.table('in_order_deal')
				  	.where('id_order', Bank.order_id)
				  	.update({			  		
				  		amount_cost: amount_cost,
				  	})
				}
		  			
		  	}

			const result_data_order = await Database
		  	.table('in_order')
		  	.where('id_order', Bank.order_id)
		  	.first()	

			return response.json({
				status : 'true',
				responses : '202',
				data:result_data_order			
			})
		}else{		
			const result_data_order = await Database
		  	.table('in_order')
		  	.where('id_order', Bank.order_id)
		  	.first()	
			return response.json({
				status : 'true',
				responses : '201',
				data:result_data_order			
			})
		}		
	}

	async tutor_payment ({request, response}) {

		const Data = request.only(['payment_code','id_tutor'])

		const get_data_tutor = await Database
		  	.table('in_payment_tutor')
		  	.where('id_payment_method', Data.payment_code)


		const get_payment_method = await Database
		  	.table('in_payment_method')
		  	.where('id_payment', Data.payment_code)
		  	.first()

		 if (Data.id_tutor == 0) {

		 	const ResultJsonTutor = await Database
			  	.table('in_payment_tutor')
			  	.where('id_payment_method', Data.payment_code)
			  	.orderBy('id_tutor','ASC')
			  	.first()

			const data_all = ({
				data_tutor : get_data_tutor,
				ResultJsonTutor : ResultJsonTutor,
				PaymentMethod : get_payment_method,
			})
				
			return response.json({
				status : 'true',
				responses : '201',
				data:data_all			
			})

		 }else{

		 	const ResultJsonTutor = await Database
			  	.table('in_payment_tutor')
			  	.where('id_tutor', Data.id_tutor)
			  	.first()

			const data_all = ({
				data_tutor : get_data_tutor,
				ResultJsonTutor : ResultJsonTutor,
				PaymentMethod : get_payment_method,
			})
				
			return response.json({
				status : 'true',
				responses : '201',
				data:data_all			
			})

		 }
				
	}

	async create_asal_sekolah ({request, response}) {

		const Data = request.only(['id_invoice','asal_sekolah'])
		const update_order = await Database
	  	.table('in_order')
	  	.where('id_order', Data.id_invoice)
	  	.update({ 
	  		asal_sekolah: Data.asal_sekolah.toUpperCase() 
	  	})

	  	return response.json({
			status : 'true',
			responses : '201',
			data: 'success'			
		})
				
	}

	async store_asal_sekolah ({request, response}) {

		const Data = request.only(['id_invoice','kota','tingkat','asal_sekolah','id_pelanggan'])

		if (Data.id_invoice && Data.kota && Data.tingkat && Data.asal_sekolah && Data.id_pelanggan) {
			const chekData = await Database
	        .query()
	        .table('in_asal_sekolah')
	        .where('id_order', Data.id_invoice)
	        .count()
	        .first()

	        if (chekData.count > 0) {
	        	const UPPERCASE_data_sekolah = Data.asal_sekolah.toUpperCase();
				const InsertDataAsalSekolah = await Database
		        .query()
		        .table('in_asal_sekolah')
		        .where('id_order', Data.id_invoice)
		        .update({
		        	tingkat_sekolah: Data.tingkat,
		        	asal_sekolah: UPPERCASE_data_sekolah.replace("SMA", "").replace("SMP", "").replace("SD", ""),
		        	kota_sekolah: Data.kota,
		        	id_order: Data.id_invoice,
		        	id_pelanggan: Data.id_pelanggan,
		        	created_at: new Date(),
		        	updated_at: new Date()
			    })

			  	return response.json({
					status : 'true',
					responses : '201',
					data: InsertDataAsalSekolah			
				})
	        }else{
	        	const UPPERCASE_data_sekolah = Data.asal_sekolah.toUpperCase();
				const InsertDataAsalSekolah = await Database
		        .query()
		        .table('in_asal_sekolah')
		        .insert({
		        	tingkat_sekolah: Data.tingkat,
		        	asal_sekolah: UPPERCASE_data_sekolah.replace("SMA", "").replace("SMP", "").replace("SD", ""),
		        	kota_sekolah: Data.kota,
		        	id_order: Data.id_invoice,
		        	id_pelanggan: Data.id_pelanggan,
		        	created_at: new Date(),
		        	updated_at: new Date()
			    })

			  	return response.json({
					status : 'true',
					responses : '201',
					data: InsertDataAsalSekolah			
				})
	        }
		}else{
			return response.json({
				status : 'false',
				responses : '202',
				data: "Lengkapi semua data"			
			})
		}

				
				
	}

	async change_payment_method ({request, response}) {

		const Data = request.only(['order_id'])
		const get_data_duplicate = await Database
		  	.table('in_order')
		  	.innerJoin('in_order_deal', 'in_order_deal.id_order', 'in_order.id_order')	  	
		  	.whereIn('in_order.status_order', ['Pending','Cek_Pembayaran'])
		  	.where('in_order.id_order', Data.order_id)								
		  	.first()
		if (get_data_duplicate) {

			const get_harga_paket = await Database
		  	.table('in_soal_langganan_paket_harga')
		  	.where('id', get_data_duplicate.id_produk)
		  	.first()
			
			const removeVoucherUse = await Database
		  	.table('in_voucher_use')
		  	.where('id_invoice', Data.order_id)
		  	.delete()

			const product = get_data_duplicate.product;
			const update_order = await Database
		  	.table('in_order')
		  	.where('id_order', get_data_duplicate.id_order)
		  	.update({ 
		  		status_order: 'Rejected'
		  	})

		  	fetch("https://api.midtrans.com/v2/"+get_data_duplicate.id_order+"/cancel",  {
		      method: 'POST',
		      headers: { 
		       'Accept': 'application/json',
		       'Content-Type': 'application/json',
		       'Authorization': 'Basic '+ base64.encode(midtrans_token_payment),
		      },
		      body: JSON.stringify({	        
		        command: 'Cancel',          	        
		      })
		    })
		    .then((response) => response.json())
		    .then((responseData) => {
		                        
		    })
		    .catch((err) => { 
		      console.log(JSON.stringify); 
		    });

		  	//duplicate data
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
		  		InsertData.id_user_order 			= get_data_duplicate.id_user_order,
		  		InsertData.id_product_order 		= get_data_duplicate.id_product_order,
		  		InsertData.id_package_user 			= get_data_duplicate.id_package_user,
		  		InsertData.product 					= get_data_duplicate.product,
		  		InsertData.status_order 			= 'Pending',
		  		InsertData.keterangan 				= get_data_duplicate.keterangan,
		  		InsertData.kondisi 					= get_data_duplicate.kondisi,
		  		InsertData.ProcessBy 				= get_data_duplicate.ProcessBy,
			await InsertData.save()		

			const InsertDataPayment      = await Database
		        .query()
		        .table('in_order_deal')
		        .insert({
		        	id_order: InsertData.id_order,
		        	id_produk: get_data_duplicate.id_produk,
		        	amount: get_harga_paket.amount,
		        	description: get_data_duplicate.description,
		        	created_at: new Date(),
		        	updated_at: new Date()
	        })

			if (product == "Private") {
				const get_data_pertemuan = await Database
			  	.table('in_pertemuan')
			  	.where('id_invoice', get_data_duplicate.id_order)								

			  	for (var i = 0; i < get_data_pertemuan.length; i++) {	  							
					const create_in_pertemuan = await Database
					.query()
				  	.table('in_pertemuan')
				  	.insert({
				  		id_invoice: InsertData.id_order,
				  		id_user_order: get_data_pertemuan[i].id_user_order,
				  		id_mitra: get_data_pertemuan[i].id_mitra,
				  		tanggal: get_data_pertemuan[i].tanggal,
				  		pertemuan_ke: get_data_pertemuan[i].pertemuan_ke,
				  		status: get_data_pertemuan[i].status,
				  		absen_guru: get_data_pertemuan[i].absen_guru,
				  		created_at: new Date(),
				  		updated_at: new Date(),
				  		id_produk: get_data_pertemuan[i].id_produk,
				  	})	  		
		  		}	
			}
			return response.json({
				status : 'true',
				responses : '200',
				data: InsertData			
			})
		}else{
			return response.json({
				status : 'true',
				responses : '201',
				data: 'data_tidak_lengkap'			
			})
		}
	}

	async change_notify ({request, response}) {

		const Data = request.only(['order_id','transaction_status','transaction_time','payment_type'])
		try {
			const status = [];
			if (Data.transaction_status == "pending") {
				status.push("Cek_Pembayaran");
			}else if(Data.transaction_status == "settlement"){
				status.push("In Progres");
			}else if(Data.transaction_status == "expire"){
				status.push("Rejected");
			}
			if (status[0]) {

				if (Data.payment_type == "gopay") {
					return response.json({
						status : 'true',
						responses : '201',
						data: 'change with gopay type'
					})
				}else{					
					const getIdDuration = await Database
				  	.table('in_order')
				  	.innerJoin('in_order_deal', 'in_order_deal.id_order', 'in_order.id_order')
				  	.innerJoin('in_pelanggan', 'in_pelanggan.id_pelanggan', 'in_order.id_user_order')
				  	.where('in_order.id_order', Data.order_id)
				  	.first()
					
					const update_order = await Database
				  	.table('in_order')
				  	.where('id_order', Data.order_id)
				  	.update({ 
				  		status_order: status[0],
				  		payment_date_time: Data.transaction_time,
				  		payment_data: request.all(),
				  		expired_date: new Date() 
				  	})
				  	if (update_order == 1) {
				  		if (getIdDuration.product == "BO") {
							const getDuration = await Database
						  	.table('in_soal_langganan_paket_harga')
						  	.innerJoin('in_soal_langganan_paket', 'in_soal_langganan_paket.id_paket', 'in_soal_langganan_paket_harga.id_paket')
						  	.where('id', getIdDuration.id_produk)
						  	.first()

						  	if (getDuration.duration != 0) {
							  	if (getDuration.flag_duration == "m") {
							  		const update_order = await Database
								  	.table('in_order')
								  	.where('id_order', Data.order_id)
								  	.update({ 
								  		expired_date: moment().add(getDuration.duration, 'month').format('YYYY-MM-DD'),
								  		expired_bimbel_online: moment().add(getDuration.duration, 'month').format('YYYY-MM-DD'),							  		
								  	})
							  	}						

						  	}

						  	//set notification expired
							const insertNotification = await Database
							.table('in_notifikasi_member')
						  	.insert({
						  		id_user_request_notifikasi: getIdDuration.id_user_order,
						  		id_invoice: getIdDuration.id_order,
						  		produk_notifikasi: 'BO',
						  		status_notifikasi: 'Baru',
						  		keterangan: 'Hi '+getIdDuration.nama+', Paket Berlangganan '+getDuration.nama_paket+' Kamu sudah berakhir',
						  		created_at: new Date(),
						  		updated_at: new Date(),
						  		
						  	})

							push_notification(getIdDuration.id_user_order,'Paket Berlangganan Bimbel Online Berhasil Dibayar','Hi '+getIdDuration.nama+', Paket Berlangganan '+getDuration.nama_paket+' Kamu sudah berhasil dibayar & aktif sampai '+ moment().add(getDuration.duration, 'month').format('DD MMMM YYYY'),'','AllNotification','')

						}					  	
				  		return response.json({
							status : 'true',
							responses : '200',
							data: 'order_id success update'			
						})
			  		}else{
				  		return response.json({
							status : 'true',
							responses : '201',
							data: 'order_id not found'			
						})
			  		}					
				}				
			  				  	
			}else{
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

	async kotaList ({request, response}) {

		const Data = request.only(['search'])

		function titleCase(str) {
		   var splitStr = str.toLowerCase().split(' ');
		   for (var i = 0; i < splitStr.length; i++) {
		       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
		   }
		   return splitStr.join(' '); 
		}
		
		if (Data.search) {
			const search_data = await Database
		  	.table('in_alamat')
		  	.select('kota')
		  	.where('kota', 'LIKE' ,'%'+titleCase(Data.search)+'%')
		  	.groupBy('kota')		  	
			return response.json({
				status : 'true',
				responses : '200',
				data: search_data			
			})	
		}else{
			const search_data = await Database
		  	.table('in_alamat')
		  	.select('kota')
		  	.groupBy('kota')
		  	.orderByRaw('random()')
		  	.limit(20)	  	
			return response.json({
				status : 'true',
				responses : '200',
				data: search_data			
			})	
		}
								
	}	


	async midtrans_request_notify ({request, response}) {

		const Data = request.only(['order_id','payment_id', 'id_pelanggan', 'id_voucher_already','nominal'])		
		const midtrans_date = moment().format();
		const midtrans_unit = "day";
		const midtranst_duration = 2;

		if (Data.id_voucher_already) {
			const update_order = await Database
		  	.table('in_order_deal')
		  	.where('id_order', Data.order_id)
		  	.update({ 
		  		amount : Data.nominal
		  	})
		  	const insert_data_payment = await Database
			.query()
		  	.table('in_voucher_use')
		  	.insert({
		  		id_invoice: Data.order_id,
		  		id_pelanggan: Data.id_pelanggan,		  		
		  		id_voucher_already: Data.id_voucher_already,
		  		created_at: new Date(),
	        	updated_at: new Date()
		  	})
		}

		const data_transaction_check = await Database
	  	.table('in_order')
	  	.select('in_order.id_order','in_order_deal.amount','in_order_deal.amount_cost')
	  	.innerJoin('in_order_deal', 'in_order_deal.id_order', 'in_order.id_order')
	  	.where('in_order.id_order', Data.order_id)
	  	.where('status_order','Pending')
	  	.first()

	  	if (data_transaction_check) {	  		
	  		const check_payment = await Database
		  	.table('in_payment_method')
		  	.where('id_payment', Data.payment_id)
		  	.first()
		  	if (check_payment) {
		  		if (check_payment.id_payment) {	

					if (check_payment.channel_payment_mobile == "gopay") {
						const amount_deal 		= data_transaction_check.amount
						const amount_cost 		= check_payment.cost			
						const amount_percent    = parseInt(amount_deal) * parseInt(amount_cost) / 100

						const change_order_deal = await Database
					  	.table('in_order_deal')
					  	.where('id_order', data_transaction_check.id_order)
					  	.update({			  		
					  		amount_cost: amount_percent,
					  	})
					}else{
						const amount_cost 	= check_payment.cost
						const change_order_deal = await Database
					  	.table('in_order_deal')
					  	.where('id_order', data_transaction_check.id_order)
					  	.update({			  		
					  		amount_cost: amount_cost,
					  	})
					}
			  			
			  	}

			  	const data_transaction = await Database
			  	.table('in_order')
			  	.select('in_order.id_order','in_order_deal.amount','in_order_deal.amount_cost','in_produk.id_produk','in_produk.nama_produk','in_pelanggan.nama as nama_pelanggan','in_pelanggan.email','in_pelanggan.no_telpon')
			  	.innerJoin('in_order_deal', 'in_order_deal.id_order', 'in_order.id_order')
			  	.innerJoin('in_pelanggan', 'in_pelanggan.id_pelanggan', 'in_order.id_user_order')
			  	.leftJoin('in_produk', 'in_produk.id_produk', 'in_order.id_product_order')
			  	.where('in_order.id_order', Data.order_id)
			  	.where('status_order','Pending')
			  	.first()

		  		//const amount + amount_cost
		  		const midtrans_temp_amount 		= (data_transaction.amount == null) ? 0 : data_transaction.amount 
		  		const midtrans_temp_amount_cost = (data_transaction.amount_cost == null) ? 0 : data_transaction.amount_cost 
		  		const midtrans_amount_add_cost 	= parseInt(midtrans_temp_amount) + parseInt(midtrans_temp_amount_cost)

		  		//transaction details
		  		const midtrans_order_id = Data.order_id;
		  		const midtrans_amount 	= midtrans_amount_add_cost;
		  		//item details
		  		const midtrans_item_id 		= (data_transaction.id_produk == null) ? 1 : data_transaction.id_produk;
		  		const midtrans_item_price 	= midtrans_amount_add_cost;
		  		const midtrans_item_quantity= 1;
		  		const midtrans_item_name 	= (data_transaction.nama_produk == null) ? 'Produk Milik Permatamall' : data_transaction.nama_produk;
		  		//customer details
		  		const midtrans_customer_first_name 	= (data_transaction.nama_pelanggan == null) ? 'Permatamall' : data_transaction.nama_pelanggan;
		  		const midtrans_customer_email 		= (data_transaction.email == null) ? 'support@permatamall.com' : data_transaction.email;
		  		const midtrans_customer_phone 		= (data_transaction.no_telpon == null) ? '+62811811306' : data_transaction.no_telpon;
		  		
				if (check_payment.nama_bank.toUpperCase() == "GOPAY") {
					const response_midtrans = await fetch(midtrans_url_payment, {
				      method: 'POST',
				      headers: { 
				       'Accept': 'application/json',
				       'Content-Type': 'application/json',
				       'Authorization': 'Basic '+ base64.encode(midtrans_token_payment),
				      },
				      body: JSON.stringify({
				      	payment_type: 'gopay',
				        transaction_details: {
				          	order_id: midtrans_order_id,
				          	gross_amount: midtrans_amount,
				        },
				        item_details: [{
			        		id 		: midtrans_item_id,
			        		price 	: midtrans_item_price,
			        		quantity: midtrans_item_quantity,
			        		name 	: midtrans_item_name
			        	}],
			        	customer_details: {
			        		first_name: midtrans_customer_first_name,
						    email: midtrans_customer_email,
						    phone: midtrans_customer_phone
			        	},
						custom_expiry: {
						    start_time: midtrans_date,
						    unit: midtrans_unit,
						    expiry_duration: midtranst_duration
						}         
				      })
				    })
				    .then((response) => response.json())
				    .then((responseData) => {
				    	return responseData				                        
				    })
				    .catch((err) => { 
				    	return err
				    });

				    const result = ({
						order_id: midtrans_order_id,
						payment_id: Data.payment_id,
						payment_type: 'gopay',
						payment_result: response_midtrans
					})

				    return response.json({
						status : 'true',
						responses : '201',
						data: result			
					})	
				}else{
					const response_midtrans = await fetch(midtrans_url_payment, {
				      method: 'POST',
				      headers: { 
				       'Accept': 'application/json',
				       'Content-Type': 'application/json',
				       'Authorization': 'Basic '+ base64.encode(midtrans_token_payment),
				      },
				      body: JSON.stringify({
				      	payment_type: 'bank_transfer', 
				      	bank_transfer: {
				            bank: check_payment.channel_payment_mobile
				        },
				        transaction_details: {
				          	order_id: midtrans_order_id,
				          	gross_amount: midtrans_amount,
				        },
				        item_details: [{
			        		id 		: midtrans_item_id,
			        		price 	: midtrans_item_price,
			        		quantity: midtrans_item_quantity,
			        		name 	: midtrans_item_name
			        	}],
			        	customer_details: {
			        		first_name: midtrans_customer_first_name,
						    email: midtrans_customer_email,
						    phone: midtrans_customer_phone
			        	},
						custom_expiry: {
						    start_time: midtrans_date,
						    unit: midtrans_unit,
						    expiry_duration: midtranst_duration
						}         
				      })
				    })
				    .then((response) => response.json())
				    .then((responseData) => {
				    	return responseData				                        
				    })
				    .catch((err) => { 
				    	return err
				    });

				    const result = ({
						order_id: midtrans_order_id,
						payment_id: Data.payment_id,
						payment_type: 'bank_transefer',
						payment_result: response_midtrans
					})

				    return response.json({
						status : 'true',
						responses : '201',
						data: result			
					})
				}
			}else{
		  		return response.json({
					status : 'true',
					responses : '202',
					data: "Payment channel tidak tersedia"			
				})	
		  	}
	  	}else{
	  		return response.json({
				status : 'true',
				responses : '202',
				data: "Data Transaksi Tidak Ditemukan"			
			})	
	  	}								
	}



	async change_status_order_ios ({request, response}) {

		const Data = request.only(['id_invoice'])
		const data_transaction = await Database
	  	.table('in_order')
	  	.innerJoin('in_order_deal', 'in_order_deal.id_order', 'in_order.id_order')
	  	.whereIn('in_order.status_order', ['Pending','Cek_Pembayaran', 'In Progres'])
	  	.where('in_order.id_order', Data.id_invoice)
	  	.first()		

	  	if (data_transaction) {
	  		const update_order = await Database
		  	.table('in_order')
		  	.where('id_order', Data.id_invoice)
		  	.update({ 
		  		status_order: 'In Progres', 
		  	})

		  	const data_transaction_after_update = await Database
		  	.table('in_order')
		  	.select('in_order.id_order','in_order.product','in_order.keterangan','in_order.kondisi','in_order.status_order','in_order_deal.amount','in_produk.nama_produk', 'in_order_deal.amount_cost')
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')		  	
		  	.whereIn('in_order.status_order', ['Pending','Cek_Pembayaran', 'In Progres'])
		  	.where('in_order.id_order', Data.id_invoice)
		  	.first()		

		  	return response.json({
				status : 'true',
				responses : '200',
				data: data_transaction_after_update		
			})	 
	
	  	}else{
	  		return response.json({
				status : 'false',
				responses : '201',
				data: data_transaction		
			})	 
	  	}							
	}
	
}

module.exports = paymentController
