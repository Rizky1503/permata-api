'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const randomstring = use("randomstring");
const Product = use('App/Models/Product')
const Harga = use('App/Models/Harga')
const Order = use('App/Models/OrderModel')
const request = require('request');
const moment = require('moment');

class LesPrivatController {

	async tingkat ({response}) {
		const tingkat = await Database
			.query()
			.select('kategori as id','kategori as name',)
		  	.table('in_matpel')
		  	.groupBy('kategori')
		return response.json(tingkat)
	}

	async mata_pelajaran ({params, response}) {

		const Tingkat =  params.id.replace(/%20/g, ' ')

		if (Tingkat == "SMA") {
			const affectedRows = await Database
			.query()
			.select('silabus as id','silabus as name')
		  	.table('in_silabus')		 
		  	.where('tingkat', params.id.replace(/%20/g, ' ')) 
		  	.groupBy('silabus')
		  	return response.status(200).json(affectedRows);
		}else{
			const affectedRows = await Database
				.query()
				.select('nama_matpel as id','nama_matpel as name')
			  	.table('in_matpel')		 
			  	.where('kategori', params.id.replace(/%20/g, ' ')) 
			  	.groupBy('nama_matpel')
		  	return response.status(200).json(affectedRows);

		}
	}

	async kota ({response}) {
		
		const affectedRows = await Database
		.query()
		.select('kota')
	  	.table('in_alamat_verifikasi')		 
	  	.groupBy('kota')
	  	return response.status(200).json(affectedRows);
	}

	async get_profile ({request, response}) {
		const pelangganInfo = request.only(['id_pelanggan']);
		const Data = await Database.from('in_pelanggan')
		.where('id_pelanggan',pelangganInfo.id_pelanggan)
		.first() 				
		return response.json(Data)
	}

	async update_data_orang_tua ({request, response}) {
		
		const pelangganInfo = request.only(['id_pelanggan','nama_orang_tua','no_telp_orang_tua','asal_sekolah']);
		const Data = await Database.from('in_pelanggan')
		.where('id_pelanggan',pelangganInfo.id_pelanggan)
		.update({ 
			nama_ortu: pelangganInfo.nama_orang_tua, 
			telpon_ortu: pelangganInfo.no_telp_orang_tua,
			asal_sekolah: pelangganInfo.asal_sekolah,
		}) 				
		return response.json({status : 'true'})
	}


	async orderLesPrivat ({request, response}) {
		

		// 'id_user_order'     => decrypt(Session::get('id_token_xmtrusr')),
	 //    'id_product_order'  => '',
	 //    'product'           => 'Private',
	 //    'status_order'      => 'Requested',
	 //    'keterangan'        => $keterangan,
	 //    'kondisi'           => $kondisi,



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
		const requested    	= request.only(['id_user_order','id_product_order','product','status_order','keterangan','kondisi'])
		const CheckAlredy 	= await Database
	  	.table('in_order')
	  	.where('status_order', 'Requested')
	  	.where('kondisi', requested.kondisi)
	  	.count()
	  	.first()

	  	if (CheckAlredy.count > 0) {
	  		return response.json({status : 'Requested'})
	  	}else{
	  		const InsertData = new Order()
		  		InsertData.id_order 			= lastProdukNumber,
		  		InsertData.id_user_order 		= requested.id_user_order,
		  		InsertData.id_product_order 	= requested.id_product_order,
		  		InsertData.product 			= requested.product,
		  		InsertData.status_order 		= requested.status_order,
		  		InsertData.keterangan 		= requested.keterangan,
		  		InsertData.kondisi 			= requested.kondisi,
			await InsertData.save()

		  	const Notification = await Database
		  	.table('in_notifikasi_member')
		  	.insert({
		  		id_user_request_notifikasi: requested.id_user_order,
		  		id_user_receive_notifikasi:'',
		  		id_invoice:InsertData.id_order,
		  		produk_notifikasi:'Privat',
		  		status_notifikasi:'Baru',
		  		keterangan:'requested les privat',
		  		created_at: current_datetime,
		  		updated_at: current_datetime,
		  	})

		  	const bodytelegram = "<b>"+ moment().format('D MMMM YYYY, h:mm:ss a') +"</b>\
					<pre><code class='language-python'>Pemberitahuan Order Baru Bimbel Online <b>Permata Bimbel Online</b></code></pre>"

			request('https://api.telegram.org/bot942020580:AAHUSq902msIsMt5-GEXjNmuCt6H5tL9gHQ/sendMessage?chat_id=289385941&text='+bodytelegram+'&parse_mode=html', { json: true }, (err, res, body) => {		  
			});

		  	return response.json({
		  		status : 'Baru_Requested',
		  		data: InsertData
		  	})
	  	}
	}


	async list_silabus ({request, response}) {
		
		const Info = request.only(['tingkat','mata_pelajaran']);
		const Data = await Database.from('in_silabus')
		.where('tingkat', Info.tingkat)
		.where('matpel', Info.mata_pelajaran)
		return response.json({
			status : 'true',
			responses : '200',
			data:Data
		})
	}	
}

module.exports = LesPrivatController
