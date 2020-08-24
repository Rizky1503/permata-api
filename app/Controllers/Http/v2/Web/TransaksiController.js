'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const fetch = require("node-fetch");
const base64 = require('base-64');
const moment = require('moment');
const randomstring = use("randomstring");
const convertRupiah = require('rupiah-format')
const Env = use('Env')

const midtrans_url_payment = 'https://api.midtrans.com/v2/charge';
const midtrans_token_payment = 'Mid-server-0_7N8YEMOvU1GBFZtLEIkMFL:';

class TransaksiController {

	async filter({request, response}){
		const data	= request.only(['page'])
		if (data.page == "kelas") {
			const kelas = await Database
				.select('kelas as value','sort','kelas.id_kelas')
				.table('v2.tscn_paket_available as paket_available')
				.innerJoin('v2.ms_kelas as kelas','kelas.id_kelas','paket_available.id_kelas')
				.where('kelas.active',true)
				.groupBy('kelas','sort','kelas.id_kelas')
				.orderBy('sort','ASC')

			for (var i = 0; i < kelas.length; i++) {
				const  bebas_akses = Env.get('BebasAkses',[]);
				
				let title = []
				if(bebas_akses.includes(parseFloat(kelas[i].id_kelas))){
					title = 'GRATIS SELAMA MASA PROMOSI'
				}else{
					title = 'GRATIS 2 HARI UNTUK SMA'
				}
				kelas[i]['title'] = title;
			}

			return response.json({
				status : 'true',
				responses : '200',
				data:kelas,
			})

		}else{
			const durasi = await Database
				.select('type as value')
				.table('v2.tscn_price as price')
				.groupBy('type')
				.whereNot('type','Hari')
				.orderBy('type','ASC')

			return response.json({
				status : 'true',
				responses : '200',
				data:durasi			
			})
		}		
	}

	async CheckPaket ({request, response}) {
		const requestData = request.only(['id_kelas','id_pelanggan']);
		const checkPaket = await Database
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket_available as paket_available', 'paket_available.id_paket', 'order.id_paket')		
			.where('order.id_pelanggan', requestData.id_pelanggan)
			.where('order.tab_order', 'Selesai')
			.where('order.status_order', 'Approved')
			.where('paket_available.id_kelas', requestData.id_kelas)
			.first()

		let title 	= '';
		let status 	= '';
		let command	= '';
		let page	= '';

		const  bebas_akses = Env.get('BebasAkses',[]);

		if (checkPaket) {
			title	= "Berlangganan Sampai"+' '+moment(checkPaket.expired).format('D MMMM Y');
			status 	= true
			command = ""
			page    = "aktif"
		}else if(bebas_akses.includes(parseFloat(requestData.id_kelas))){
			title	= "* Gratis Selama Promosi";
			status 	= true
			command = "Mulai Pembelajaran"
			page    = "gratis"
		}else{
			const dataPaket = await Database.raw(`select nama_paket, price, duration, type 
				from v2.tscn_paket as paket 
				inner join v2.tscn_price as price on price.id_paket = paket.id_paket 
				inner join v2.tscn_paket_available as paket_available on paket_available.id_paket = paket.id_paket 
				inner join v2.ms_kelas as ms_kelas on ms_kelas.id_kelas = paket_available.id_kelas 
				where paket.active = true
				and paket.kategori in ('Gratis')
				and paket_available.id_kelas = `+requestData.id_kelas+`
				and not exists (select * from v2.tscn_order where v2.tscn_order.id_pelanggan = '`+requestData.id_pelanggan+`' and v2.tscn_order.id_paket = paket.id_paket)`)
			
			if (dataPaket.rows.length > 0) {
				title	= "Gratis 2 Hari Untuk SMA";
				status 	= false;
				command = "Aktifkan";
				page    = "2 harI";
			}else{
				title	= " ";
				status 	= false;
				command = "Berlangganan";
				page    = "paketPages";
			}
		}

		const dataLangganan = ({
			title: title,
			langganan: status,
			command: command,
			page: page,
		})

	    return response.json({
			status : 'true',
			responses : '200',
			data:dataLangganan			
		})
	}

	async listTrans({request, response}){
		const data		= request.only(['id_pelanggan','page', 'active'])
		const page  	= data.page
		const limit     = 5		
		const active    = data.active		

		if (active == 1) {
			const dataPaket = await Database.raw(`select paket.id_paket, nama_paket, brief, description, syarat, ketentuan, paket.icon, paket.image, duration, type, price, id_price 
				from v2.tscn_paket as paket 
				inner join v2.tscn_price as price on price.id_paket = paket.id_paket 
				inner join v2.tscn_paket_available as paket_available on paket_available.id_paket = paket.id_paket 
				inner join v2.ms_kelas as ms_kelas on ms_kelas.id_kelas = paket_available.id_kelas 
				where paket.active = true
				and paket.kategori in ('Gratis')
				and not exists (select * from v2.tscn_order where v2.tscn_order.id_pelanggan = '`+data.id_pelanggan+`' and v2.tscn_order.id_paket = paket.id_paket)
				GROUP BY paket.id_paket, nama_paket, brief, description, syarat, ketentuan, paket.icon, paket.image, duration, type, price, id_price
				LIMIT `+limit+` OFFSET `+parseInt(page-1))
			const resultPaketGratis = dataPaket.rows

			const execute = await Database
			.select('invoice','order.id_paket','order.id_price','tab_order','status_order','expired','nama_paket','price','duration','type')
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
			.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
			.where('order.id_pelanggan', data.id_pelanggan)
			.whereNotIn('status_order', ['Expired'])
			.orderBy('status_order','DESC')
			.paginate(page,limit)
			const orderList = execute.data;
			var order 		= resultPaketGratis.concat(orderList);

			for (var i = 0; i < order.length; i++) {
				const price 		= order[i].price != 0 ? convertRupiah.convert(order[i].price)+' / ' : '';
				order[i].nama_paket = order[i].nama_paket+' '+price+order[i].duration+' '+order[i].type;				
				if (order[i].invoice) {
					order[i].command 	= "TSCN";
					order[i].expired 	= moment(order[i].expired).format('D MMMM Y');
					const expiredText 	= [];
					order[i].expiredText= moment(order[i].expired).diff(new Date(), 'days');
					if (order[i].expiredText > 0) {
						if (order[i].expiredText < 5 ) {
							const addOne = parseInt(order[i].expiredText) + parseInt(1)
							expiredText.push("Akan Berakhir Dalam "+addOne+" Hari");
						}else{
							expiredText.push(order[i].expired);
						}
					}else if (order[i].expiredText == 0) {
						expiredText.push("Berakhir Hari Ini");
					}else{
						expiredText.push("Sudah Berakhir");
					}
					const resultPaket   = await Database
						.select('kelas.id_kelas','kelas.kelas','paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
						.table('v2.tscn_paket as paket')
						.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
						.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
						.innerJoin('v2.ms_kelas as kelas','paket_available.id_kelas','kelas.id_kelas')
						.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
						.where('paket.id_paket', order[i].id_paket)
						.where('id_price', order[i].id_price)
						.first()

					order[i].resultPaket= resultPaket;

					let tab_order  		= '';
					if (order[i].tab_order == "Checkout") {
						tab_order  		= "Pilih Metode Pembayaran";						
					}else if (order[i].tab_order == "Pembayaran") {
						tab_order  		= "Menunggu Pembayaran";						
					}else if (order[i].tab_order == "Selesai") {
						if (order[i].status_order == "Approved") {
							tab_order  		= "Sedang Berlangganan";						
						}else{
							tab_order  		= "-";													
						}
					}
					order[i].result 	= ([
						{
							"icon" 		: "ios-information-circle-outline",
							"name" 		: "Nomor Pembelian",
							"value" 	: order[i].invoice,
							"color" 	: '#000',
							"fontFamily": 'Ubuntu-Regular',
						},{
							"icon" 		: "ios-information-circle-outline",
							"name" 		: "Status",
							"value" 	: tab_order,
							"color" 	: order[i].status_order == "Approved" ?  '#000' : '#F00',
							"fontFamily": 'Ubuntu-Bold',
						},{
							"icon" 		: "ios-information-circle-outline",
							"name" 		: "Berakhir",
							"value" 	: order[i].status_order == "Approved" ?  expiredText[0] : 'Silahkan Lanjutkan Transaksi',
							"color" 	: '#000',
							"fontFamily": 'Ubuntu-Regular',
						},
					]);
					order[i].belajar 	= 'Masuk Pembelajaran';
					order[i].more 		= 'Detail Pesanan';						
				}else{
					order[i].command 	= "EXCT";
					order[i].result 	= ([
						{
							"icon" 		: "ios-information-circle-outline",
							"name" 		: "Syarat",
							"value" 	: order[i].syarat,
							"color" 	: '#000',
							"fontFamily": 'Ubuntu-Regular',
						},{
							"icon" 		: "ios-information-circle-outline",
							"name" 		: "Ketentuan",
							"value" 	: order[i].ketentuan,
							"color" 	: '#000',
							"fontFamily": 'Ubuntu-Regular',
						}
					]);
					order[i].url 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/template/transaksi/voucher';
					order[i].more 		= 'Dapatkan Sekarang';	
				}
				
			}

			return response.json({
				status 		: 'true',
				responses 	: '200',
				data        : order,
			})	
		}else{

			const execute = await Database
			.select('invoice','order.id_paket','order.id_price','tab_order','status_order','expired','nama_paket','price','duration','type')
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
			.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
			.where('order.id_pelanggan', data.id_pelanggan)
			.whereIn('status_order', ['Expired'])
			.orderBy('status_order','DESC')
			.paginate(page,limit)

			const order = execute.data;

			for (var i = 0; i < order.length; i++) {
				order[i].nama_paket = order[i].nama_paket+' '+order[i].price+' / '+order[i].duration+' '+order[i].type;
				order[i].expired 	= moment(order[i].expired).format('D MMMM Y');

				const expiredText 	= [];
				order[i].expiredText= moment(order[i].expired).diff(new Date(), 'days');
				if (order[i].expiredText > 0) {
					if (order[i].expiredText < 5 ) {
						expiredText.push("Akan Berakhir Dalam 5 Hari");
					}else{
						expiredText.push(order[i].expired);
					}
				}else if (order[i].expiredText == 0) {
					expiredText.push("Berakhir Hari Ini");
				}else{
					expiredText.push("Sudah Berakhir");
				}



				const resultPaket   = await Database
					.select('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
					.table('v2.tscn_paket as paket')
					.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
					.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
					.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
					.where('paket.id_paket', order[i].id_paket)
					.where('id_price', order[i].id_price)
					.first()

				order[i].resultPaket= resultPaket;
				order[i].result 	= ([
					{
						"icon" 		: "ios-information-circle-outline",
						"name" 		: "Nomor Pembelian",
						"value" 	: order[i].invoice,
						"color" 	: '#000',
						"fontFamily": 'Ubuntu-Regular',
					},{
						"icon" 		: "ios-information-circle-outline",
						"name" 		: "Status",
						"value" 	: order[i].tab_order == "Selesai" ?  order[i].status_order : order[i].tab_order,
						"color" 	: order[i].status_order == "Approved" ?  '#000' : '#F00',
						"fontFamily": 'Ubuntu-Bold',
					},{
						"icon" 		: "ios-information-circle-outline",
						"name" 		: "Berakhir",
						"value" 	: order[i].status_order == "Approved" ?  expiredText[0] : order[i].status_order == "Expired" ? 'Berakhir Tanggal '+order[i].expired  : 'Silahkan Lanjutkan Transaksi',
						"color" 	: '#000',
						"fontFamily": 'Ubuntu-Regular',
					},
				]);
				order[i].belajar 	= 'Masuk Pembelajaran';
				order[i].more 		= 'Detail Pesanan';
			}
			
			return response.json({
				status 		: 'true',
				responses 	: '200',
				data        : order,
			})
		}	
		
	}

	async list({request, response}){
		const data		= request.only(['id_kelas','durasi','page'])  
		const id_kelas 	= data.id_kelas
		const durasi  	= data.durasi
		const page      = data.page
		
		if (data.page == '2 hari') {
			const paket = await Database
				.select('paket.id_paket', 'nama_paket', 'kelas','brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.table('v2.tscn_paket as paket')
				.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
				.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
				.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
				.where('paket.active', true)
				.where('kategori','Gratis')
				.where('ms_kelas.id_kelas', id_kelas)
				.where('price.type', 'Hari')
				.groupBy('paket.id_paket', 'nama_paket', 'kelas','brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.orderBy('price', 'ASC')

			const result = paket
			
			for (var iresult = 0; iresult < result.length; iresult++) {
				
				result[iresult].nama_paket = 'Paket'+' '+result[iresult].duration+' '+result[iresult].type;

				if (result[iresult].type == 'Hari') {
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'days')).format('D MMMM Y');
				}else if(result[iresult].type == 'Minggu'){
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'weeks')).format('D MMMM Y');
				}else if(result[iresult].type == 'Bulan'){
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'months')).format('D MMMM Y');
				}else if(result[iresult].type == 'Tahun')  {
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'years')).format('D MMMM Y');
				}				
			}

			return response.json({
				status : 'true',
				responses : '200',
				data:result		
			})
		}else{
			const paket = await Database
				.select('paket.id_paket', 'nama_paket', 'kelas','brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.table('v2.tscn_paket as paket')
				.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
				.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
				.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
				.where('paket.active', true)
				.whereNotIn('kategori', ['Gratis'])
				.where('ms_kelas.id_kelas', id_kelas)
				.where('price.type', durasi)
				.groupBy('paket.id_paket', 'nama_paket', 'kelas','brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.orderBy('price', 'ASC')

			const result = paket
			
			for (var iresult = 0; iresult < result.length; iresult++) {
				
				result[iresult].nama_paket = 'Paket'+' '+result[iresult].duration+' '+result[iresult].type;

				if (result[iresult].type == 'Hari') {
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'days')).format('D MMMM Y');
				}else if(result[iresult].type == 'Minggu'){
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'weeks')).format('D MMMM Y');
				}else if(result[iresult].type == 'Bulan'){
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'months')).format('D MMMM Y');
				}else if(result[iresult].type == 'Tahun')  {
					result[iresult].expired    = moment(moment().add(result[iresult].duration, 'years')).format('D MMMM Y');
				}				
			}

			return response.json({
				status : 'true',
				responses : '200',
				data:result		
			})
		}
	}

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
			
			return response.json({
				status 		: 'true',
				responses 	: '200',
				data        : status ? status : [],
			})	
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
				data        : status,
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
			}else{
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

		    const data_order = await Database
		    	.table('v2.tscn_order as order')
		    	.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
		    	.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
		    	.innerJoin('in_pelanggan as pelanggan','pelanggan.id_pelanggan','order.id_pelanggan')
		    	.where('order.invoice', automateCode)
		    	.whereIn('order.status_order', ['Requested','Approved'])
		    	.first()

		    return response.json({
				status 		: 'true',
				responses 	: '200',
				data        : data_order,
			})

		}
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

				  	const updateOrder = await Database
			  			.table('v2.tscn_order')
			  			.where('invoice',data.invoice)
			  			.update({
			  				tab_order: 'Pembayaran'
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

	  	const updateOrder = await Database
  			.table('v2.tscn_order')
  			.where('invoice',invoice)
  			.update({
  				tab_order: 'Pembayaran'
  			})

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

	  	const updateOrder = await Database
  			.table('v2.tscn_order')
  			.where('invoice',invoice)
  			.update({
  				tab_order: 'Pembayaran'
  			})

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

	async changeMethod({request}){
		const data = request.only(['invoice'])
		const hapus = await Database
			.table('v2.tscn_order')
			.where('invoice', data.invoice)
			.update({
				tab_order 	 : 'Selesai',
				status_order : 'Expired'
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

	async DownloadDestkop({request}){
		const data = await Database
			.table('jumlah')
			.first()
	}

}

module.exports = TransaksiController
