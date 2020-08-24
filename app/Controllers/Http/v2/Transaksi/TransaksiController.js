'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const moment = require('moment');
const convertRupiah = require('rupiah-format')
const Env = use('Env')

class TransaksiController {

	async pelanggan({request, response}){

		const execute = await Database
			.distinct('no_telpon as no_telp')
			.table('in_pelanggan')
			.whereNotNull('no_telpon')

		for (var i = 0; i < execute.length; i++) {
			if (execute[i].no_telp.substring(0, 1) == 0) {
				execute[i].no_telp = '62'+execute[i].no_telp.substring(1, 15)				
			}else if (execute[i].no_telp.substring(0, 1) == 8) {
				execute[i].no_telp = '62'+execute[i].no_telp.substring(1, 15)				
			}
			execute[i].no_telp = execute[i].no_telp.replace(/\+/g, "")
		}
		return execute

	}
	async list({request, response}){
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
						.select('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
						.table('v2.tscn_paket as paket')
						.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
						.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
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

}

module.exports = TransaksiController
