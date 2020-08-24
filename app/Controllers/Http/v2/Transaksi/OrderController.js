'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const fetch = require("node-fetch");
const base64 = require('base-64');
const moment = require('moment');
const randomstring = use("randomstring");
const convertRupiah = require('rupiah-format')


const midtrans_url_payment = 'https://api.midtrans.com/v2/charge';
const midtrans_token_payment = 'Mid-server-0_7N8YEMOvU1GBFZtLEIkMFL:';
// const midtrans_url_payment = 'https://api.sandbox.midtrans.com/v2/charge';
// const midtrans_token_payment = 'SB-Mid-server-juzzj8oCGer3_4cZ5kgt_s46';

class OrderController {

	async Status({request, response}){
		const data = request.only(['id_pelanggan','id_paket','id_price'])

		const id_pelanggan 	= data.id_pelanggan ? data.id_pelanggan : '';
		const id_paket 		= data.id_paket ? data.id_paket : 0;
		const id_price 		= data.id_price ? data.id_price : 0;

		const status = await Database
				.table('v2.tscn_order as order')
				.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
				.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
				.innerJoin('in_pelanggan as pelanggan','pelanggan.id_pelanggan','order.id_pelanggan')
				.where('order.id_pelanggan', id_pelanggan)
				.where('order.id_paket', id_paket)
				.where('order.id_price', id_price)
				.whereIn('order.status_order', ['Requested','Approved'])
				.first()
		if (status) {
			const tab 	= [];
			if (status.tab_order == "Checkout") {
				tab.push(1)
			}else if (status.tab_order == "Pembayaran") {
				tab.push(2)
			}else if (status.tab_order == "Selesai") {
				tab.push(3)
			}else{
				tab.push(-1)				
			}

			status.masa_aktif = status.duration+' '+status.type+' Setelah Sukses Pembayaran';
			return response.json({
				status 		: 'true',
				responses 	: '200',
				tab 		: tab[0],			
				data 		: status	
			})	

		}else{
			return response.json({
				status 		: 'true',
				responses 	: '200',
				tab 		: 0,
				data        : '',
			})	
		}
				
	}


	async Requested({request, response}){
		const data = request.only(['id_pelanggan','id_paket','id_price'])
		const id_pelanggan 	= data.id_pelanggan ? data.id_pelanggan : '';
		const id_paket 		= data.id_paket ? data.id_paket : 0;
		const id_price 		= data.id_price ? data.id_price : 0;				

		const status = await Database
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
			.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
			.innerJoin('in_pelanggan as pelanggan','pelanggan.id_pelanggan','order.id_pelanggan')
			.where('order.id_pelanggan', id_pelanggan)
			.where('order.id_paket', id_paket)
			.where('order.id_price', id_price)
			.whereIn('order.status_order', ['Requested','Approved'])
			.first()

		if (status) {
			return response.json({
				status 		: 'true',
				responses 	: '200',
				data        : 'data already exist',
			})	
		}else{

			const dataPaket = await Database
			.table('v2.tscn_price as price')
			.innerJoin('v2.tscn_paket as paket','paket.id_paket','paket.id_paket')
			.where('price.id_price', id_price)
			.where('paket.id_paket', id_paket)
			.first()

			let tab_order 		= 'Checkout';
			let status_order 	= 'Requested';
			let expired 		= moment();
			if (dataPaket.kategori == "Gratis") {
				tab_order 		= "Selesai"
				status_order 	= "Approved"
				if (dataPaket.type == "Hari") {
					expired 		= moment().add(dataPaket.duration, 'days');
				}else if (dataPaket.type == "Minggu") {
					expired 		= moment().add(dataPaket.duration, 'weeks');
				}else if (dataPaket.type == "Bulan") {
					expired 		= moment().add(dataPaket.duration, 'months');
				}else if (dataPaket.type == "Tahun") {
					expired 		= moment().add(dataPaket.duration, 'years');
				}				
			}

			if (moment().format('YMD') <= moment('07/31/2020').format('YMD')) {
				expired = moment('08/02/2020')
			}

			var year 	 = moment().format('YYYY').substr(2,2);
			var monthDay = moment().format('MMDD');
			var string   = randomstring.generate(3).toUpperCase();
			const count  = await Database.raw('select count(*) from v2.tscn_order where created_at::TIMESTAMP::DATE = NOW()::TIMESTAMP::DATE')

			const kode   = count.rows[0].count
			function minTwoDigits(n) {
			  	return (n < 100 ? n < 10 ? '00' : '0' : '') + n;
			}
			const automateCode = 'PB'+year+monthDay+string+minTwoDigits(kode)+id_paket+id_price	

			const createdOrder = await Database
		    .table('v2.tscn_order')
		    .insert({
		    	invoice 		: automateCode,
		    	id_pelanggan 	: id_pelanggan,
		    	id_paket 		: id_paket,
		    	id_price 		: id_price,
		    	tab_order 		: tab_order,
		    	status_order	: status_order,
		    	expired 		: expired.format('M/D/Y')
		    })

		    if (createdOrder) {
		    	const price = await Database
				.table('v2.tscn_price')
				.where('id_paket', id_paket)
				.where('id_price', id_price)
				.first()

		    	const createdOrderDeal = await Database
			    .table('v2.tscn_order_deal')
			    .insert({
			    	invoice 		: automateCode,
			    	id_payment 		: 0,
			    	price 			: price.price,
			    	total_price 	: price.price,
			    })

			    if (price.price == 0) {
			    	const updateOder = await Database
					    .table('v2.tscn_order')
					    .where('invoice', automateCode)
					    .update({
					    	tab_order 		: 'Selesai',
				    		status_order	: 'Approved',
					    })
			    }			    
		    }

		    return response.json({
				status 		: 'true',
				responses 	: '200',
				data        : 'data order success created',
			})

		}
	}


	async voucher({request, response}){
		const data = request.only(['id_pelanggan','id_paket','id_price'])
		const id_pelanggan 	= data.id_pelanggan ? data.id_pelanggan : '';
		const id_paket 		= data.id_paket ? data.id_paket : 0;
		const id_price 		= data.id_price ? data.id_price : 0;	

		const voucher = await Database
				.table('v2.tscn_order_voucher')
				.where('id_paket', id_paket).orWhere('id_paket', 0)
				.where('id_price', id_price).orWhere('id_price', 0)
				.where('active', true)
				.where('limit','>', 0)
				.limit(3)

		const result = [];
		for (var i = 0; i < voucher.length; i++) {
				
			const voucherUse = await Database
				.table('v2.tscn_order_deal')
				.where('id_voucher', voucher[i].id_voucher)
				.count()
				.first()
			if (voucher[i].limit > voucherUse.count) {
				result.push(voucher[i])
			}

		}

		return response.json({
			status 		: 'true',
			responses 	: '200',
			data        : result,
		})	
		
	}

	async voucherExecute({request, response}){
		const data = request.only(['harga','id_voucher'])
		const execute = this.executeVoucher(data.harga, data.id_voucher, {response})
		return execute

		
	}

	async executeVoucher(harga, id_voucher, {response}){
		const voucher = await Database
				.table('v2.tscn_order_voucher')
				.where('id_voucher',id_voucher)
				.first()

		if (voucher) {
			if (voucher.type == "potongan") {
				const result = ({
					disc 	: voucher.nominal,
					total 	: parseInt(harga) - parseInt(voucher.nominal),
				})
				return response.json({
					status 		: 'true',
					responses 	: '200',
					data        : result,
				})	
			}else{
				const harga_val = harga;
				const disc  = harga_val * voucher.nominal / 100;
				const total = harga_val - disc

				const result = ({
					disc 	: disc,
					total 	: total,
				})

				return response.json({
					status 		: 'true',
					responses 	: '200',
					data        : result,
				})	
			}	

		}else{
			const result = ({
				disc 	: 0,
				total 	: harga,
			})

			return response.json({
				status 		: 'true',
				responses 	: '200',
				data        : result,
			})
		}
	}

	async checkoutSubmit({request, response}){
		const data = request.only(['invoice','id_voucher'])		
		const updateOrder = await Database
		.table('v2.tscn_order')
		.where('invoice',data.invoice)
		.update({
			tab_order: 'Pembayaran'
		})
		const voucher = await Database
				.table('v2.tscn_order_voucher')
				.where('id_voucher',data.id_voucher)
				.first()			
		
		if (voucher) {

			const getDeal = await Database
				.table('v2.tscn_order_deal')
				.where('invoice',data.invoice)
				.first()

			if (getDeal) {
				const all = [];

				if (voucher.type == "potongan") {
					const discount  = voucher.nominal
					const total 	= parseInt(getDeal.price) - parseInt(discount)
					all.push(discount)
					all.push(total)
				}else{
					const harga = getDeal.price;
					const discount  = harga * voucher.nominal / 100;
					const total 	= harga - discount
					all.push(discount)
					all.push(total)
				}

				const updatePrice = await Database
				.table('v2.tscn_order_deal')
				.where('invoice',data.invoice)
				.update({
					discount 	: all[0],
					total_price : all[1],
					id_voucher  : data.id_voucher,
				})
			}

		}

		return response.json({
			status 		: 'true',
			responses 	: '200',
			data        : 'success update data',
		})
	}

	async paymentList({request, response}){		
		const data = request.only(['invoice'])	

		const dataOrder = await Database
			.select('order.invoice','price','discount', 'cost_payment', 'total_price', 'order_deal.id_payment')
		  	.table('v2.tscn_order as order')
		  	.innerJoin('v2.tscn_order_deal as order_deal','order_deal.invoice','order.invoice')
		  	.where('order.invoice', data.invoice)
		  	.first()

		const total_price = dataOrder.total_price + dataOrder.cost_payment

		const dataPayment = ({
			height : 200,
			title  : 'Total Pembayaran',
			value  : convertRupiah.convert(total_price ? total_price : 0),
			more   : [{
				title : 'Harga',
				value : dataOrder.price > 0 ? convertRupiah.convert(dataOrder.price) : 0
			},{
				title : 'Diskon',
				value : dataOrder.discount > 0 ? convertRupiah.convert(dataOrder.discount) : 0
			},{
				title : 'Biaya Admin',
				value : dataOrder.cost_payment > 0 ? convertRupiah.convert(dataOrder.cost_payment) : 0
			},{
				title : 'Total Harga',
				value :  total_price > 0 ? convertRupiah.convert(total_price) : 0
			}
			]
		})

		const getOrder = await Database
			.select('order.invoice','total_price', 'order_deal.id_payment', 'nama_bank', 'jenis_payment', 'method', 'breadchumb', 'file', 'no_payment', 'midtrans')
		  	.table('v2.tscn_order as order')
		  	.innerJoin('v2.tscn_order_deal as order_deal','order_deal.invoice','order.invoice')
		  	.innerJoin('v2.tscn_order_payment_method as order_payment_method','order_payment_method.id_payment','order_deal.id_payment')
		  	.innerJoin('v2.tscn_order_deal_payment as order_deal_payment','order_deal_payment.invoice','order.invoice')
		  	.where('order.invoice', data.invoice)
		  	.first()

		if (getOrder) {
			if (getOrder.file) {
				getOrder.textPayment = "Bukti Pembayaran sudah Diupload, PermataBelajar akan menghubungi segera, jika Ada Pertanyaan atau keluhan silahkan masuk ke halaman profile -> Hubungi Kami"
			}else{
				getOrder.textPayment = "Upload Bukti Pembayaran"
			}

			let virtual_account = ''
			let qr_code = ''
			let url 	= ''

			if (getOrder.midtrans) {
				if (getOrder.midtrans.permata_va_number) {
					virtual_account = getOrder.midtrans.permata_va_number
				}else if (getOrder.midtrans.va_numbers) {
					virtual_account = getOrder.midtrans.va_numbers[0].va_number
				}else if (getOrder.midtrans.actions) {
					qr_code = getOrder.midtrans.actions[0].url
					url = getOrder.midtrans.actions[1].url
				}
			}			

			if (getOrder.midtrans) {
				getOrder.midtrans.virtual_account 			= virtual_account;
				getOrder.midtrans.qr_code 					= qr_code;
				getOrder.midtrans.url 						= url;
				getOrder.midtrans.transaction_time_convert 	= moment(getOrder.midtrans.transaction_time).add(2, 'days').format('LLLL');
			}
			const dataTutorial = await Database
		  	.table('v2.tscn_order_payment_tutor')
		  	.where('id_payment', dataOrder.id_payment)
		  	.orderBy('sort','ASC')

			const result = ({
				dataOrder 	: dataOrder,
				dataPayment : dataPayment,
				data 		: getOrder,
				tutorial    : dataTutorial
			})
			return response.json({
				status 		: 'true',
				responses 	: '200',
				component 	: 'detail',
				data 		: result			
			})
		}else{
			const groupChannel = await Database
				.select('jenis_payment as channel')
			  	.table('v2.tscn_order_payment_method')
			  	.where('maintenance', false)
			  	.groupBy('jenis_payment')
			  	.orderBy('jenis_payment')
			for (var i = 0; i < groupChannel.length; i++) {				
				const channel = await Database
			  	.table('v2.tscn_order_payment_method')
			  	.where('maintenance', false)
			  	.where('jenis_payment', groupChannel[i].channel)
			  	.orderBy('sort')

			  	if (groupChannel[i].channel == "Manual") {
			  		groupChannel[i].keterangan = "Perhatian : Sesuai dengan peraturan yang berlaku. Jika rekening bank yang dimiliki berbeda dengan rekening bank yang dituju maka akan dikenakan biaya transfer antar bank";
			  	}else if (groupChannel[i].channel == "Online") {
			  		groupChannel[i].keterangan = "Perhatian : Sesuai dengan peraturan yang berlaku maka transfer melalui virtual account akan dikenakan biaya admin sebesar Rp 4.000 dan melaui gopay sebesar 2% dari biaya";
			  	}else{
			  		groupChannel[i].keterangan = "";
			  	}

				groupChannel[i].list = channel;

			}

			const result = ({
				dataOrder 	: dataOrder,
				dataPayment : dataPayment,
				data 		: groupChannel,
				tutorial    : []
			})

			return response.json({
				status 		: 'true',
				responses 	: '200',
				component 	: 'list',
				data 		: result			
			})	
		}
				
	}

	async paymentSubmit({request, response}){		
		const data = request.only(['invoice', 'id_payment'])	

		const selectPayment = await Database
			  	.table('v2.tscn_order_payment_method')
			  	.where('id_payment', data.id_payment)
			  	.first()


		const dataAmount = await Database
	    .select('order.invoice', 'total_price')
	  	.table('v2.tscn_order as order')
	  	.innerJoin('v2.tscn_order_deal as order_deal','order_deal.invoice','order.invoice')			  	
	  	.where('order.invoice', data.invoice)
	  	.first()

	  	if (dataAmount) {
		    const insertPayment = await Database.raw(`INSERT INTO v2.tscn_order_deal_payment (invoice, id_payment, status)
				SELECT * FROM (SELECT '`+data.invoice+`', `+data.id_payment+`, 'Requested') AS tmp
				WHERE NOT EXISTS (
				    SELECT * FROM v2.tscn_order_deal_payment WHERE invoice = '`+data.invoice+`'
				) LIMIT 1;`)
	
			if (selectPayment.jenis_payment == "Online") {
				if (selectPayment.method == "transfer") {
					const amount = dataAmount.total_price;
					const cost 	 = selectPayment.cost;
					const all 	 = parseInt(amount) + parseInt(cost)
					return this.payWithTransefer(data.invoice, data.id_payment, selectPayment.channel_payment, cost, all, {response})
				}else if (selectPayment.method == "direct") {
					const amount 	= dataAmount.total_price;
					const cost 	 	= selectPayment.cost;
					const percent 	= parseInt(amount) * parseInt(cost) / 100;
					const all 	 	= parseInt(amount) + parseInt(percent)
					return this.payWithGopay(data.invoice, data.id_payment, selectPayment.channel_payment, percent, all, {response})
				}
			}else{

				const changeUpdate = await Database
			  	.table('v2.tscn_order_deal')
			  	.where('invoice', data.invoice)
			  	.update({
			  		id_payment 	: data.id_payment,
			  	})

			  	return response.json({
					status 		: 'true',
					responses 	: '200',
					data 		: 'success update payment manual'
				})
			}		  					
	  	}else{
	  		return response.json({
				status 		: 'true',
				responses 	: '201',
				data 		: 'Transaksi Dibatalkan'
			})

	  	}

				
	}


	async payWithTransefer(invoice, id_payment, bank_name, cost,  nominal, {response}){		

		const midtrans_date 		= moment().format();
		const midtrans_unit 		= "day";
		const midtranst_duration 	= 2;

		const data = await Database
			  	.table('v2.tscn_order as order')
			  	.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')			  	
				.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
			  	.where('order.invoice', invoice)
			  	.first()

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
	            bank: bank_name
	        },
	      	transaction_details: {
	          	order_id 		: invoice,
	          	gross_amount	: nominal,
	        },
	        item_details: [{
        		id 		: data.id_paket,
        		price 	: nominal,
        		quantity: 1,
        		name 	: data.nama_paket+' '+data.duration+''+' '+data.type
        	}],
        	customer_details: {
        		first_name  : 'permatabelajar',
			    email 		: 'support@permatabelajar.com',
			    phone 		: '0811-811-306'
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

	    if (response_midtrans.status_code == 201) {

	    	const data = await Database
			  	.table('v2.tscn_order_deal')
			  	.where('invoice', invoice)
			  	.update({
			  		cost_payment: cost,
			  		id_payment 	: id_payment,
			  		midtrans 	: response_midtrans
			  	})
	    }

	    const final = await Database
	    .select('order.invoice', 'total_price', 'midtrans')
	  	.table('v2.tscn_order as order')
	  	.innerJoin('v2.tscn_order_deal as order_deal','order_deal.invoice','order.invoice')			  	
	  	.where('order.invoice', invoice)
	  	.first()

	    return response.json({
			status : 'true',
			responses : '200'	
		})
				
	}

	async payWithGopay(invoice, id_payment, bank_name, cost,  nominal, {response}){		

		const midtrans_date 		= moment().format();
		const midtrans_unit 		= "day";
		const midtranst_duration 	= 2;

		const data = await Database
			  	.table('v2.tscn_order as order')
			  	.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')			  	
				.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
			  	.where('order.invoice', invoice)
			  	.first()

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
	          	order_id: invoice,
	          	gross_amount: nominal,
	        },
	        item_details: [{
        		id 		: data.id_paket,
        		price 	: nominal,
        		quantity: 1,
        		name 	: data.nama_paket+' '+data.duration+''+' '+data.type
        	}],
        	customer_details: {
        		first_name: 'permatabelajar',
			    email: 'support@permatabelajar.com',
			    phone: '0811-811-306'
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

	    if (response_midtrans.status_code == 201) {

	    	const data = await Database
			  	.table('v2.tscn_order_deal')
			  	.where('invoice', invoice)
			  	.update({
			  		cost_payment: cost,
			  		id_payment 	: id_payment,
			  		midtrans 	: response_midtrans
			  	})
	    }

	    const final = await Database
	    .select('order.invoice', 'total_price', 'midtrans')
	  	.table('v2.tscn_order as order')
	  	.innerJoin('v2.tscn_order_deal as order_deal','order_deal.invoice','order.invoice')			  	
	  	.where('order.invoice', invoice)
	  	.first()

	    return response.json({
			status : 'true',
			responses : '200'	
		})
				
	}

	async PaymentRemove({request, response}){
		const data = request.only(['invoice'])		
		const insertBukti = await Database
			  	.table('v2.tscn_order_deal_payment')
			  	.where('invoice', data.invoice)
			  	.delete()
		return response.json({
			status 		: 'true',
			responses 	: '200',
			data        : 'success delete pembayaran',
		})
	}

	async buktiPembayaran({request, response}){
		const data = request.only(['invoice','file'])		
		const insertBukti = await Database
			  	.table('v2.tscn_order_deal_payment')
			  	.where('invoice', data.invoice)
			  	.update({
			  		file	: data.file,
			  		status 	: 'Pending',
			  	})
		return response.json({
			status 		: 'true',
			responses 	: '200',
			data        : 'success update data bukti pembayaran',
		})
	}

	async finishStatus({request, response}){
		const data = request.only(['invoice'])		

		const status = await Database
			  	.table('v2.tscn_order as order')
				.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
				.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')			  	
			  	.where('order.invoice', data.invoice)
			  	.first()
		status.nama_paket = status.nama_paket+' '+status.duration+' '+status.type
		if (status) {
			if (status.status_order == "Approved") {

				function formatRupiah(angka, prefix){
					var number_string 	= angka.toString(),
					split   			= number_string.split(','),
					sisa     			= split[0].length % 3,
					rupiah     			= split[0].substr(0, sisa),
					ribuan     			= split[0].substr(sisa).match(/\d{3}/gi);
					if(ribuan){
						const separator = sisa ? '.' : '';
						rupiah += separator + ribuan.join('.');
					}
					rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
					return prefix == undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '');
				}

				const dataPaket = await Database
				.select('nama_paket','duration','type','order_deal.price','order_deal.cost_payment','order_deal.discount','order_deal.total_price','order_deal.updated_at','payment_method.jenis_payment','payment_method.nama_bank','payment_method.breadchumb')
			  	.table('v2.tscn_order as order')
				.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
				.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
		  		.innerJoin('v2.tscn_order_deal as order_deal','order_deal.invoice','order.invoice')			  	
		  		.leftJoin('v2.tscn_order_payment_method as payment_method','payment_method.id_payment','order_deal.id_payment')  	
			  	.where('order.invoice', data.invoice)
			  	.first()

				const result = ([{
						title 		: "Informasi Paket",
						sort  		: 1,						
						breadchumb 	: dataPaket.breadchumb,
						data  : [{
							title : 'Nama Paket',
							brief : dataPaket.nama_paket,
						},{
							title : 'Durasi',
							brief : dataPaket.duration+' '+dataPaket.type,
							
						}]
					},{
						title 		: "Informasi Pembayaran",						
						sort  		: 2,
						breadchumb 	: dataPaket.breadchumb,
						data  : [{
							title : 'Harga',
							brief : dataPaket.price != 0 ? formatRupiah(dataPaket.price, 'Rp. ') : 'Gratis',
						},{
							title : 'Biaya Administrasi',
							brief : dataPaket.cost_payment != 0 ? formatRupiah(dataPaket.cost_payment, 'Rp. ') : '',
						},{
							title : 'Diskon',
							brief : dataPaket.discount != 0 ? formatRupiah(dataPaket.discount, 'Rp. ') : '',
							
						},{
							title : 'Total Harga',
							brief : dataPaket.total_price != 0 ? formatRupiah(dataPaket.total_price, 'Rp. ') : 'Gratis',
							
						}]
					},{
						title : "Metode Pembayaran",
						sort  : 3,
						breadchumb : dataPaket.breadchumb,
						data  : [{
							title : 'Jenis Pembayaran',
							brief : dataPaket.jenis_payment == "Online" ? 'Verifikasi Otomatis' : 'Manual Verifikasi (maks 1 x 24 jam)',
						},{
							title : 'Nama Bank',
							brief : dataPaket.nama_bank,
						},{
							title : 'Tanggal Pembayaran',
							brief : dataPaket.jenis_payment ? moment(dataPaket.updated_at).format('LLLL') : 'Langsung Terverifikasi',
							
						}]
					},
				])

				const final = ({
					image  : 'https://st3.depositphotos.com/14846838/19149/v/450/depositphotos_191494534-stock-illustration-award-badge-vector-icon-flat.jpg',
					title  : "Berlangganan Sampai "+moment(status.expired).format('D MMMM Y'),
					textCommand : "Masuk Pembelajaran",
					order  : status,
					result : result
				})

				return response.json({
					status 		: 'true',
					responses 	: '200',
					data        : final,
				})

			}else if (status.status_order == "Expired") {
				const final = ({
					image  		: 'https://i.pinimg.com/280x280_RS/df/59/3f/df593f8809382f96cf77d0b165cfe87f.jpg',
					title  		: "Paket "+status.nama_paket+" Sudah Berakhir Tanggal "+moment(status.expired).format('D MMMM Y'),
					textCommand : "Beli Paket Baru",
					order  		: status,
					result 		: []
				})

				return response.json({
					status 		: 'true',
					responses 	: '200',
					data        : final,
				})

			}else{
				return response.json({
					status 		: 'true',
					responses 	: '201',
					data        : 'error data',
				})				
			}

		}else{
			return response.json({
				status 		: 'true',
				responses 	: '201',
				data        : 'error data',
			})
		}
	}	

}

module.exports = OrderController
