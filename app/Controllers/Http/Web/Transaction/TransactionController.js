'use strict'
const Database = use('Database')

class TransactionController {

	async index ({params, response}) {

		const page = params.page;
        const limit = params.limit;
		let List = await Database
				.from('in_order')
				.select('in_order.*','in_order_deal.amount','in_soal_langganan_paket.nama_paket')
				.innerJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')	
				.leftJoin('in_soal_langganan_paket','in_order.id_package_user','in_soal_langganan_paket.id_paket')		
				.where('in_order.id_user_order', params.id_user)
				.orderBy('in_order.id_order','desc')

			for (var i = 0; i < List.length; i++) {
			const upload = await Database
				.select('upload_file')
			  	.table('in_payment')
				.where('id_invoice', List[i].id_order)

			List[i]['key'] = i;
			List[i]['upload'] = upload;
		}

		return response.json(List)
	}

	async detail ({params, response}) {

		let count = await Database.from('in_order')	
		  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
			.where('in_order.id_order', params.id)
			.count()
			.first()

		if (count.count == 0) {

			let List = await Database.from('in_order')	
				.select('in_order.id_order','in_order.status_order',Database.raw("TO_CHAR(in_order.created_at, 'DD-MON-YYYY HH12:MI:SS') as created_at"),'in_order_deal.amount','in_order.keterangan','in_order.id_product_order','in_order_deal.id_produk')
			  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
				.where('in_order.id_order', params.id)
				.first()			

			let Product = 0;			

			return response.json({
				transaksi:List,
				Product:Product,			
			})					

		}else{

			let List = await Database.from('in_order')	
				.select('in_order.id_order','in_order.status_order',Database.raw("TO_CHAR(in_order.created_at, 'DD-MON-YYYY HH12:MI:SS') as created_at"),'in_order_deal.amount','in_order.keterangan','in_order.id_product_order','in_order_deal.id_produk')
			  	.leftJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
				.where('in_order.id_order', params.id)
				.first()

			let Product = await Database.from('in_produk')
				.select('nama_produk')
				.where('id_produk',List.id_produk).first();

			return response.json({
				transaksi:List,
				Product:Product,			
			})		
		}	

	}

	async check_jadwal ({params, response}) {

		let List = await Database.from('in_order')	
			.where('id_order', params.id)
			.first()
		return response.json(List)					

	}

	async jadwallast ({params, response}) {

		let List = await Database.from('in_pertemuan')	
			.select('in_pertemuan.*','in_pelanggan.nama as nama_pelanggan','in_mitra.nama as nama_mitra')
			.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
			.innerJoin('in_mitra', 'in_pertemuan.id_mitra', 'in_mitra.id_mitra')
			.where('id_invoice', params.id_invoice)
			.where('id_user_order', params.id_user)
			.whereNotNull('status')
			.orderBy('id_pertemuan','ASC')

		return response.json(List)					

	}

	async jadwal ({params, response}) {

		let List = await Database.from('in_pertemuan')	
			.select('in_pertemuan.*','in_pelanggan.nama as nama_pelanggan','in_mitra.nama as nama_mitra')
			.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
			.innerJoin('in_mitra', 'in_pertemuan.id_mitra', 'in_mitra.id_mitra')
			.where('id_invoice', params.id_invoice)
			.where('id_user_order', params.id_user)
			.whereNull('status')
			.whereNotNull('absen_guru')
			.limit(1)
			.orderBy('id_pertemuan','ASC')
		return response.json(List)					

	}



	async notification ({params, response}) {

		let Count = await Database.from('in_order')	
			.where('id_user_order', params.id_user)		
			.whereIn('status_order', ['Requested','Pending','Cek_Pembayaran'])
			.count()
			.first()

		let Data = await Database	
			.select('in_order.*','in_order_deal.amount')
			.from('in_order')
		  	.innerJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
		  	.where('in_order.id_user_order', params.id_user)		
		  	.whereIn('in_order.status_order', ['Requested','Pending','Cek_Pembayaran'])
		  	.orderBy('in_order.id_order','DESC')

		return response.json({
			Count: Count,
			Data: Data,
		})					

	}

	async Absen ({params, response}) {
		let tanggal = new Date();
		let List = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.whereNull('tanggal')
			.whereNull('status')
			.update({
				tanggal: tanggal,
				status:'Hadir',
			});

		let Data = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.first()

		const Notification = await Database
	  	.table('in_notifikasi_member')
	  	.insert({
	  		id_user_request_notifikasi: params.id_user,
	  		id_user_receive_notifikasi:'',
	  		id_invoice:'',
	  		produk_notifikasi:'Privat',
	  		status_notifikasi:'Baru',
	  		keterangan:'Absen pertemuan ke '+Data.pertemuan_ke+' tanggal ' + tanggal,
	  		created_at: tanggal,
	  		updated_at: tanggal,
	  	})

		return response.json(List);				

	}

	async absen_tidak ({params, response}) {
		let tanggal = new Date();
		let List = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.whereNull('tanggal')
			.whereNull('status')
			.update({
				tanggal: tanggal,
				status:'Tidak',
			});

		let Data = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.first()

		const Notification = await Database
	  	.table('in_notifikasi_member')
	  	.insert({
	  		id_user_request_notifikasi: params.id_user,
	  		id_user_receive_notifikasi:'',
	  		id_invoice:'',
	  		produk_notifikasi:'Privat',
	  		status_notifikasi:'Baru',
	  		keterangan:'Absen pertemuan ke '+Data.pertemuan_ke+' tanggal ' + tanggal + ' tidak hadir',
	  		created_at: tanggal,
	  		updated_at: tanggal,
	  	})

		return response.json(List);				

	}



	async absen_kelipatan ({params, response}) {
		let tanggal = new Date();
		let List = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.first()

		let ChangeStatus = await Database.from('in_order')				
			.where('id_order', List.id_invoice)
			.update({
				status_order: 'Registrasi_Ulang'
			});

		let UbahStatus = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.whereNull('tanggal')
			.whereNull('status')
			.update({
				tanggal: tanggal,
				status:'Hadir',
			});



		return response.json(UbahStatus);				

	}

	async absen_kelipatan_tidak ({params, response}) {
		let tanggal = new Date();
		let List = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.first()

		let ChangeStatus = await Database.from('in_order')				
			.where('id_order', List.id_invoice)
			.update({
				status_order: 'Registrasi_Ulang'
			});

		let UbahStatus = await Database.from('in_pertemuan')				
			.where('id_pertemuan', params.id_pertemuan)
			.whereNull('tanggal')
			.whereNull('status')
			.update({
				tanggal: tanggal,
				status:'Tidak',
			});



		return response.json(UbahStatus);				

	}

	async close_review ({request, response}) {
		const Info = request.only(['_token_close','status_order', 'review_close', 'alasan_close'])
		let UbahStatus = await Database.from('in_order')				
			.where('id_order', Info._token_close)
			.where('status_order','Registrasi_Ulang')
			.whereNull('flag_nilai')
			.update({
				status_order: Info.status_order,
				flag_nilai: Info.review_close,
				keterangan_nilai:Info.alasan_close,
			});

		let Data = await Database.from('in_order')				
			.where('id_order', Info._token_close)
			.first();

		let tanggal = new Date();
		const Notification = await Database
	  	.table('in_notifikasi_member')
	  	.insert({
	  		id_user_request_notifikasi: Data.id_user_order,
	  		id_user_receive_notifikasi:'', 
	  		id_invoice:'',
	  		produk_notifikasi:'Privat',
	  		status_notifikasi:'Baru',
	  		keterangan:'Konfirmasi Transaksi ' + Info.status_order + ' penilaian '+ Info.review_close +' Alasan : ' + Info.alasan_close,
	  		created_at: tanggal,
	  		updated_at: tanggal,
	  	})

		return response.json(UbahStatus);
	}

	async jadwal_last ({params, response}) {

		let List = await Database.from('in_pertemuan')	
			.where('id_invoice', params.id_invoice)
			.where('id_user_order', params.id_user)
			.whereNull('status')
			.count()
			.first()

		return response.json(List.count)					

	}

	async jadwal_last_close ({request, response}) {

		const Info = request.only(['data','status'])
		let tanggal = new Date();
		let List = await Database.from('in_pertemuan')				
			.where('id_pertemuan', Info.data)
			.first()

		let ChangeStatus = await Database.from('in_order')				
			.where('id_order', List.id_invoice)
			.update({
				status_order: 'Close',
				flag_nilai: Info.status,
				keterangan_nilai:'Selesai pembelajaran Les Privat',
			});

		let UbahStatus = await Database.from('in_pertemuan')				
			.where('id_pertemuan', Info.data)
			.update({
				tanggal: tanggal,
				status:'Hadir',
			});
		return response.json(UbahStatus);

	}

	async close ({params, response}) {

		let count = await Database.from('in_order')	
		.where('id_order', params.id)
		.where('status_order','Close')
		.whereNotNull('id_product_order')
		.count()
		.first()

		if (count.count > 0) {
			let data = await Database.from('in_order')	
			.leftJoin('in_pelanggan', 'in_order.id_user_order', 'in_pelanggan.id_pelanggan')
			.leftJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
			.where('id_order', params.id)
			.whereNotNull('id_product_order')
			.first()

			let Payment = await Database.from('in_order_deal')	
			.where('id_order', params.id)
			

			let Mitra = await Database.from('in_mitra')	
			.where('id_mitra', data.id_mitra)
			.first()

			let Jadwal = await Database.from('in_pertemuan')	
			.where('id_invoice', params.id)
			.whereNotNull('status')
			.orderBy('id_pertemuan')

			

			return response.json({
				data:data,
				Payment:Payment,
				Mitra:Mitra,
				Jadwal:Jadwal
			});

		}

	}

	async ListJadwal ({params, response}) {

		let Jadwal = await Database.from('in_order')	
		.where('id_user_order', params.id_user)
		.where('product', 'Private')
		.where('status_order', 'In Progres')
		.orderBy('id_order')
		return response.json(Jadwal);

	
	}

}

module.exports = TransactionController
