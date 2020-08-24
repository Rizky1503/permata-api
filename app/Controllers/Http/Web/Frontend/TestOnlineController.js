'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");
const Order = use('App/Models/OrderModel')
const Encryption = use('Encryption')
const base64 = require('base-64')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const Mail = use('Mail')
const moment = require('moment');

class TestOnlineController {

   async order_online({ request, response }) {
        const Inputs    = request.only(['id_pelanggan','id_paket','id_harga'])   

        const CountRow = await Database
	        .query()
	        .table('in_order')      
	        .where('id_user_order','=',Inputs.id_pelanggan)
	        .whereIn('status_order', ['Pending','In Progres','Cek_Pembayaran'])
	        .where('product','=','BO')
	        .where('id_package_user', Inputs.id_paket)
	        .count()
	        .first()

        if (CountRow.count < 1) {
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

			function add_months(current_datetime, n) 
			{
			   return new Date(current_datetime.setMonth(current_datetime.getMonth() + n));      
			}

			function add_days(current_datetime, n) 
			{
			   return new Date(current_datetime.setDate(current_datetime.getDate() + n));      
			}

			const data_paket = await Database
				.select('in_soal_langganan_paket.tmp_kelas','in_soal_langganan_paket.tmp_matpel','in_soal_langganan_paket_harga.duration','in_soal_langganan_paket_harga.amount','in_soal_langganan_paket_harga.flag_duration')
				.table('in_soal_langganan_paket')
				.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
				.where('in_soal_langganan_paket.id_paket',Inputs.id_paket)
				.where('in_soal_langganan_paket_harga.id',Inputs.id_harga)
			

			if(data_paket[0].amount == 0){
				const InsertData = new Order()
			  		InsertData.id_order 				= lastProdukNumber,
			  		InsertData.id_user_order 			= Inputs.id_pelanggan,
			  		InsertData.product 					= 'BO',
			  		InsertData.status_order 			= 'In Progres',
			  		InsertData.keterangan 				= data_paket[0].tmp_kelas,
				  	InsertData.kondisi 					= data_paket[0].tmp_matpel,
				  	InsertData.id_package_user 		    = Inputs.id_paket,
				  	InsertData.id_paket_harga			= Inputs.id_harga,
			  		InsertData.expired_bimbel_online	= moment().add(3, 'M').format('YYYY-MM-DD')
				await InsertData.save()	

				const id_user_order = Inputs.id_pelanggan;
				const id_package_user = Inputs.id_paket;
				const DataOrder = await Database.raw(`select *, to_char(expired_bimbel_online, 'MM/DD/YYYY') as expired_bimbel_online from in_order where id_user_order = '${id_user_order}' AND id_package_user = '${id_package_user}' AND product = 'BO' AND status_order = 'In Progres'`)  

				const DataRow = await Database
				        .query()
				        .table('in_order')      
				        .where('id_user_order',Inputs.id_pelanggan)
				        .where('product','BO')
				        .where('id_package_user', Inputs.id_paket)
				        .orderBy('id_order','DESC')
				        .first()

				const InsertDataPayment  = await Database
			        .query()
			        .table('in_order_deal')
			        .insert({
			        	id_order: InsertData.id_order,
			        	id_produk : Inputs.id_harga,
			        	amount: Inputs.harga,
			        	description: 'berlangganan bimbel online',
		        })      	

			    const GetDataPayment      = await Database
			        .query()
			        .table('in_order_deal')
			        .where('id_order', InsertData.id_order)
				    .first()

				const AsalSekolah = await Database
					.from('in_asal_sekolah')
					.where('id_order', DataRow.id_order)
					.whereNotNull('asal_sekolah')
					.first()
					.count()

				const paket = await Database
					.select('in_soal_langganan_paket.nama_paket','in_soal_langganan_paket_harga.duration','in_soal_langganan_paket_harga.amount')
					.table('in_soal_langganan_paket')
					.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
					.where('in_soal_langganan_paket.id_paket',Inputs.id_paket)
					.where('in_soal_langganan_paket_harga.id',Inputs.id_harga)
					.first()

				const dealweb = await Database
					.query()
					.table('in_order_deal_web')
					.where('id_order',DataRow.id_order)
					.leftJoin('in_voucher','in_order_deal_web.id_voucher','in_voucher.id_voucher')
					.leftJoin('in_voucher_already','in_order_deal_web.id_voucher','in_voucher_already.id_voucher')
					.first()

			    return response.json({
			    	Data: DataOrder.rows[0],
			    	DataPayment: GetDataPayment,
			    	AsalSekolah: AsalSekolah,
			    	DataPaket : paket,
			    	DealWeb : dealweb
			    })
			}else{	
				const cek_trial = await Database
					.table('in_order_trial_bimbel_online')
					.where('id_pelanggan',Inputs.id_pelanggan)
					.where('id_paket',Inputs.id_paket)
					.first()
					.count()

				if (cek_trial.count < 1){

					const InsertData = new Order()
				  		InsertData.id_order 				= lastProdukNumber,
				  		InsertData.id_user_order 			= Inputs.id_pelanggan,
				  		InsertData.product 					= 'BO',
				  		InsertData.status_order 			= 'In Progres',
				  		InsertData.keterangan 				= data_paket[0].tmp_kelas,
					  	InsertData.kondisi 					= data_paket[0].tmp_matpel,
					  	InsertData.id_package_user 		    = Inputs.id_paket,
					  	InsertData.id_paket_harga			= Inputs.id_harga,
				  		InsertData.expired_bimbel_online	= moment().add(2, 'days').format('YYYY-MM-DD')

					await InsertData.save()	

					const InsertOrderTrial  = await Database
				        .table('in_order_trial_bimbel_online')
				        .insert({
				        	id_pelanggan: Inputs.id_pelanggan,
				        	id_paket : Inputs.id_paket,
				        	created_at : new Date(),
				        	updated_at : new Date()
			        })  

			        const id_user_order = Inputs.id_pelanggan;
			        const id_package_user = Inputs.id_paket;
			        const DataOrder = await Database.raw(`select *, to_char(expired_bimbel_online, 'MM/DD/YYYY') as expired_bimbel_online from in_order where id_user_order = '${id_user_order}' AND id_package_user = '${id_package_user}' AND product = 'BO' AND status_order = 'In Progres'`)  

					const DataRow = await Database
					        .query()
					        .table('in_order')      
					        .where('id_user_order',Inputs.id_pelanggan)
					        .where('product','BO')
					        .where('id_package_user', Inputs.id_paket)
					        .orderBy('id_order','DESC')
					        .first()

					const InsertDataPayment  = await Database
				        .query()
				        .table('in_order_deal')
				        .insert({
				        	id_order: InsertData.id_order,
				        	id_produk : Inputs.id_harga,
				        	amount: Inputs.harga,
				        	description: 'berlangganan bimbel online',
			        })      	

				    const GetDataPayment      = await Database
				        .query()
				        .table('in_order_deal')
				        .where('id_order', InsertData.id_order)
					    .first()

					const AsalSekolah = await Database
						.from('in_asal_sekolah')
						.where('id_order', DataRow.id_order)
						.whereNotNull('asal_sekolah')
						.first()
						.count()

					const paket = await Database
						.select('in_soal_langganan_paket.nama_paket','in_soal_langganan_paket_harga.duration','in_soal_langganan_paket_harga.amount')
						.table('in_soal_langganan_paket')
						.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
						.where('in_soal_langganan_paket.id_paket',Inputs.id_paket)
						.where('in_soal_langganan_paket_harga.id',Inputs.id_harga)
						.first()

					const dealweb = await Database
						.query()
						.table('in_order_deal_web')
						.where('id_order',DataRow.id_order)
						.leftJoin('in_voucher','in_order_deal_web.id_voucher','in_voucher.id_voucher')
						.leftJoin('in_voucher_already','in_order_deal_web.id_voucher','in_voucher_already.id_voucher')
						.first()

				    return response.json({
				    	Data: DataOrder.rows[0],
				    	DataPayment: GetDataPayment,
				    	AsalSekolah: AsalSekolah,
				    	DataPaket : paket,
				    	DealWeb : dealweb
				    })
				}else{
					const InsertData = new Order()
				  		InsertData.id_order 				= lastProdukNumber,
				  		InsertData.id_user_order 			= Inputs.id_pelanggan,
				  		InsertData.product 					= 'BO',
				  		InsertData.status_order 			= 'Pending',
				  		InsertData.keterangan 				= data_paket[0].tmp_kelas,
				  		InsertData.kondisi 					= data_paket[0].tmp_matpel,
				  		InsertData.id_package_user 		    = Inputs.id_paket,
				  		InsertData.id_paket_harga			= Inputs.id_harga,
				  		InsertData.expired_bimbel_online	= moment().add(3, 'M').format('YYYY-MM-DD')
					await InsertData.save()

					const id_user_order = Inputs.id_pelanggan;
					const id_package_user = Inputs.id_paket;
					const DataOrder = await Database.raw(`select *, to_char(expired_bimbel_online, 'MM/DD/YYYY') as expired_bimbel_online from in_order where id_user_order = '${id_user_order}' AND id_package_user = '${id_package_user}' AND product = 'BO' AND status_order = 'In Progres'`)
					
					const DataRow = await Database
				        .query()
				        .table('in_order')      
				        .where('id_user_order',Inputs.id_pelanggan)
				        .where('product','BO')
				        .where('id_package_user', Inputs.id_paket)
				        .orderBy('id_order','DESC')
				        .first()

				    const InsertDataOrderDealWeb = await Database
				      .table('in_order_deal_web')
				      .insert({
				      		id_order: InsertData.id_order,
				      		amount: data_paket[0].amount,
				       })

					const InsertDataPayment      = await Database
			        .query()
			        .table('in_order_deal')
			        .insert({
			        	id_order: InsertData.id_order,
			        	amount: data_paket[0].amount,
				        description: 'berlangganan bimbel online',
				        id_produk : Inputs.id_harga,
			        })      	

				    const GetDataPayment      = await Database
				        .query()
				        .table('in_order_deal')
				        .where('id_order', InsertData.id_order)
					    .first()

					const AsalSekolah = await Database
						.from('in_asal_sekolah')
						.where('id_order', DataRow.id_order)
						.whereNotNull('asal_sekolah')
						.first()
						.count()

					const paket = await Database
						.select('in_soal_langganan_paket.nama_paket','in_soal_langganan_paket_harga.duration','in_soal_langganan_paket_harga.amount')
						.table('in_soal_langganan_paket')
						.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
						.where('in_soal_langganan_paket.id_paket',Inputs.id_paket)
						.where('in_soal_langganan_paket_harga.id',Inputs.id_harga)
						.first()

					const dealweb = await Database
						.query()
						.table('in_order_deal_web')
						.where('id_order',DataRow.id_order)
						.leftJoin('in_voucher','in_order_deal_web.id_voucher','in_voucher.id_voucher')
						.leftJoin('in_voucher_already','in_order_deal_web.id_voucher','in_voucher_already.id_voucher')
						.first()

				    return response.json({
				    	Data: DataOrders.rows[0],
				    	DataPayment: GetDataPayment,
				    	Count : CountRow,
				    	AsalSekolah: AsalSekolah,
				    	DataPaket : paket,
				    	DealWeb : dealweb
				    })
				}
			}


        }else{
        	const id_user_order = Inputs.id_pelanggan;
        	const id_package_user = Inputs.id_paket;
        	const DataOrder = await Database.raw(`select *, to_char(expired_bimbel_online, 'MM/DD/YYYY') as expired_bimbel_online from in_order where id_user_order = '${id_user_order}' AND id_package_user = '${id_package_user}' AND product = 'BO' AND status_order = 'In Progres'`)

        	const DataRow = await Database
		        .query()
		        .table('in_order')      
		        .where('id_user_order',Inputs.id_pelanggan)
		        .where('product','BO')
		        .where('id_package_user', Inputs.id_paket)
		        .orderBy('id_order','DESC')
		        .first()

	        const GetDataPayment = await Database
		        .query()
		        .table('in_order_deal')
		        .where('in_order_deal.id_order', DataRow.id_order)
			    .first()

			const paket = await Database
				.select('in_soal_langganan_paket.nama_paket','in_soal_langganan_paket_harga.duration','in_soal_langganan_paket_harga.amount')
				.table('in_soal_langganan_paket')
				.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
				.where('in_soal_langganan_paket.id_paket',Inputs.id_paket)
				.first()
			// return  DataRow.id_order

			const AsalSekolah = await Database
				.from('in_asal_sekolah')
				.where('id_order', DataRow.id_order)
				.whereNotNull('asal_sekolah')
				.first()
				.count()

			const dealweb = await Database
				.query()
				.table('in_order_deal_web')
				.where('id_order',DataRow.id_order)
				.leftJoin('in_voucher','in_order_deal_web.id_voucher','in_voucher.id_voucher')
				.leftJoin('in_voucher_already','in_order_deal_web.id_voucher','in_voucher_already.id_voucher')
				.first()


	        return response.json({
		    	Data: DataRow,
		    	DataPayment: GetDataPayment,
		    	AsalSekolah: AsalSekolah,
		    	DataPaket : paket,
		    	DealWeb : dealweb
		    })
	        return CountRow
        }        
   }
 
    async kategori_pilihan ({ response,request }){
    	const Inputs = request.only(['id_pelanggan']) 
    	const data = await Database
			.select('in_order.*','in_soal_langganan_kelas.kelas','in_soal_langganan_paket.image')
			.from('in_order')
			.innerJoin('in_soal_langganan_paket','in_order.id_package_user','in_soal_langganan_paket.id_paket')
			.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
			.where('in_order.id_user_order', Inputs.id_pelanggan)
			.where('in_order.status_order','In Progres')
			.whereNotNull('in_order.id_package_user')
			.where('in_order.product', 'BO')
		return response.json(data)
    }

    async check_payment ({ params,request,response }){
    	const data = await Database
			.select('in_order.*','in_soal_langganan_kelas.kelas')
			.from('in_order')
			.innerJoin('in_soal_langganan_paket','in_order.id_package_user','in_soal_langganan_paket.id_paket')
			.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
			.where('id_order', params.id)
			.whereNotNull('in_order.id_package_user')
			.first()

		const paket = await Database
			.from('in_soal_langganan_paket')			
			.where('id_paket', data.id_package_user)
			.first()

		return response.json({
		    	Data: data,
		    	paket: paket,
		    })
		
    }

    async get_tahun ({ response,request }){
    	const Inputs = request.only(['jenis','id_kelas'])
    	const kelas = await Database
			.select('in_soal_langganan_kelas.id_kelas')
			.from('in_soal_langganan_paket')
			.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
			.where('in_soal_langganan_paket.id_paket',Inputs.id_kelas)
			.first()

    	const data = await Database
	    	.table('in_soal_langganan')
	    	.select('in_soal_langganan.tahun_soal','in_soal_langganan.tingkat','in_soal_langganan_images_tahun.images')
	    	.leftJoin('in_soal_langganan_images_tahun','in_soal_langganan.tahun_soal','in_soal_langganan_images_tahun.tahun')
	    	.where('in_soal_langganan.jenis_paket',Inputs.jenis)
	    	.where('in_soal_langganan.id_kelas',kelas.id_kelas)
	    	.groupBy('in_soal_langganan.tahun_soal','in_soal_langganan.tingkat','in_soal_langganan_images_tahun.images')
    	return response.json(data)
    }

    async get_matpel ({ response,request }){
		const Inputs = request.only(['jenis','tahun','id_kelas'])
		
		const kelas = await Database
			.select('in_soal_langganan_kelas.id_kelas')
			.from('in_soal_langganan_paket')
			.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
			.where('in_soal_langganan_paket.id_paket',Inputs.id_kelas)
			.first()

    	const data = await Database
	    	.from('in_soal_langganan')
	    	.select('in_soal_langganan.nama_matpel','in_soal_langganan_images_matpel.images')
	    	.leftJoin('in_soal_langganan_images_matpel','in_soal_langganan.nama_matpel','in_soal_langganan_images_matpel.nama_matpel')
	    	.where('in_soal_langganan.jenis_paket', Inputs.jenis)
	    	.where('in_soal_langganan.tahun_soal', Inputs.tahun)
	    	.where('in_soal_langganan.id_kelas', kelas.id_kelas)
	    	.groupBy('in_soal_langganan.nama_matpel','in_soal_langganan_images_matpel.images')

    	return response.json(data)
    }

    async get_data_paket ({ params,request,response }){
    	const Inputs = request.only(['id_kelas']) 
    	const data = await Database
			.select('in_soal_langganan.jenis_paket','in_soal_langganan_images_jenis_latihan.images')
			.from('in_soal_langganan')
			.leftJoin('in_soal_langganan_images_jenis_latihan','in_soal_langganan.jenis_paket','in_soal_langganan_images_jenis_latihan.jenis_latihan')			
			.where('in_soal_langganan.id_kelas', Inputs.id_kelas)
			.groupBy('in_soal_langganan.jenis_paket','in_soal_langganan_images_jenis_latihan.images')
			.orderBy('in_soal_langganan.jenis_paket','DESC')
		return response.json({
		    	data: data,
		    })
    }

    async get_jenis_latihan({request,response}){
    	const Inputs = request.only(['id_kelas','tingkat']) 
    	const data = await Database
			.from('in_soal_langganan')			
			.select('jenis_paket')
			.where('id_kelas', Inputs.id_kelas)
			.where('tingkat', Inputs.tingkat)
			.groupBy('jenis_paket')
		return response.json(data)
    }



    async getkelas ({ response, params}){
    	if (params.id == "IPA_Dan_IPS") {
	    	const getkelas = await Database
	    		.select('kelas')
	    		.from('in_matpel_online_langganan')
	    		.whereIn('tingkat',['IPA','IPS'])
	    		.where('jenis_paket', params.jenis_paket)
	    		.orderBy('kelas','ASC')
	    		.groupBy('kelas')
	    	return response.json(getkelas)	
    	}else{
	    	const getkelas = await Database
	    		.select('kelas')
	    		.from('in_matpel_online_langganan')
	    		.where('tingkat',params.id)
	    		.where('jenis_paket', params.jenis_paket)
	    		.orderBy('kelas','ASC')
	    		.groupBy('kelas')
	    	return response.json(getkelas)	    		
    	}
    }

    async nilai ({params, response}) {

		const profile = await Database
			.query()
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.orderBy('id_examp','DESC')

		return response.json(profile)
	}

	async rejected ({response,request}){
		const Inputs   = request.only(['id_invoice']) 
		const rejected = await Database
			.table('in_order')
  			.where('id_order', Inputs.id_invoice)
  			.update({ status_order: 'Rejected'})

  		const hapus = await Database
  			.table('in_voucher_use')
  			.where('id_invoice',Inputs.id_invoice)
  			.delete()
	}

	async payment_method ({response,request}){
		const Inputs   = request.only(['id_invoice','paymentcode','payment_channel','amount','id_voucher','id_pelanggan']) 
		const rejected = await Database
			.table('in_order')
  			.where('id_order', Inputs.id_invoice)
  			.update({ payment_channel: Inputs.payment_channel , paymentcode: Inputs.paymentcode , status_order : 'Cek_Pembayaran'})

  		const update = await Database
			.table('in_order_deal')
			.where('id_order', Inputs.id_invoice)
			.update({ 
				amount: Inputs.amount, 
			})

	    const insert = await Database
			.insert({ 
				id_invoice: Inputs.id_invoice,
				id_pelanggan: Inputs.id_pelanggan,
				id_voucher_already: Inputs.id_voucher, 
				created_at : new Date(),
				updated_at : new Date(),
 			})

			.into('in_voucher_use')
	}

	async amount_cost_ordel_deal ({response,request}){
		const Inputs   = request.only(['id_invoice','amount_cost']) 
		const rejected = await Database
			.table('in_order_deal')
  			.where('id_order', Inputs.id_invoice)
  			.update({ amount_cost: Inputs.amount_cost })
	}

	async profile ({params, response}) {

		const profile = await Database
			.query()
		  	.table('in_soal_examp_langganan')
		  	.innerJoin('in_pelanggan', 'in_soal_examp_langganan.id_user', 'in_pelanggan.id_pelanggan')
		  	.where('id_examp', params.id_user.replace(/%20/g, ' '))
		  	.where('status','Selesai')
		  	.first()

		return response.json(profile)
	}

	async start_ ({params, response}) {

		const soal = await Database
			.query()
		  	.table('in_soal_execute_langganan')
		  	.where('id_examp', params.id_examp.replace(/%20/g, ' '))
		  	.where('id_user', params.id_user.replace(/%20/g, ' '))
		  	.orderBy('id_soal_execute')

		return response.json(soal)
	}

	async start ({request, response}) {
		const Inputs = request.only([ 'id_kelas','nama_matpel','jenis_paket','id_soal','eksekutor'])
		if (Inputs.eksekutor == 'next') {
			const soal = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.where('id_soal','>',Inputs.id_soal)
			  	.orderBy('id_soal','ASC')

			const ASC = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.orderBy('id_soal','ASC')

			const DESC = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.orderBy('id_soal','DESC')

			const count = await Database
			  	.from('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.count()
	
			return response.json({
				soal : soal,
				lastid : DESC,
				firstid : ASC,
				count 	: count
			})
		}else if (Inputs.eksekutor == 'prev') {
			const soal = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.where('id_soal','<',Inputs.id_soal)
			  	.orderBy('id_soal','DESC')

			const ASC = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.orderBy('id_soal','ASC')

			const DESC = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.orderBy('id_soal','DESC')

			const count = await Database
			  	.from('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.count()
			  	
			return response.json({
				soal : soal,
				lastid : DESC,
				firstid : ASC,
				count 	: count
			})
		}else{
			const soal = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.orderBy('id_soal','ASC')

			const ASC = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.orderBy('id_soal','ASC')

			const DESC = await Database
				.query()
			  	.table('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.orderBy('id_soal','DESC')

			const count = await Database
			  	.from('in_soal_langganan')
			  	.where('id_kelas', Inputs.id_kelas)
			  	.where('nama_matpel', Inputs.nama_matpel)
			  	.where('jenis_paket',Inputs.jenis_paket)
			  	.count()

			return response.json({
				soal : soal,
				lastid : DESC,
				firstid : ASC,
				count 	: count
			})
		}

		
	}



	async test_data ({request, response}) {
		const Inputs    = request.only(['id_pelanggan','jenis_paket']) 
		const profile_data = await Database
			.query()
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', Inputs.id_pelanggan)
		  	.where('jenis_paket', Inputs.jenis_paket)
		  	.first()

		return response.json(profile_data)
	}

	async payment_manual ({ response }){
		const payment = await Database
			.select('*')
			.table('in_payment_method')
			.where('jenis_payment','manual')
			.orderBy('nama_bank','ASC')
		return response.json(payment)
	}

	async payment_online ({ response }){
		const payment = await Database
			.select('*')
			.table('in_payment_method')
			.where('jenis_payment','online')
			.orderBy('nama_bank','ASC')
		return response.json(payment)
	}

	async update_order ({ request,response }){
		const Inputs = request.only(['id_order','payment_code']) 
		const update = await Database
			.table('in_order')
			.where('id_order', Inputs.id_order)
			.update('paymentcode', Inputs.payment_code)

		if(update){
			return response.json('200')
		}else{
			return response.json('500')
		}
	}

	async get_payment ({ params,response }){
		const get = await Database
			.select('*')
			.from('in_payment_method')
			.where('id_payment',params.id)
			.first()
		return response.json(get)
	}

	async delete_payment_order ({ request,response }){
		const Inputs = request.only(['id_order']) 
		const update = await Database
			.table('in_order')
			.where('id_order', Inputs.id_order)
			.update('paymentcode','')

		if(update){
			return response.json('200')
		}else{
			return response.json('500')
		}
	}

	async input_payment ({request,response}) {
		const Inputs = request.only(['id_user','id_invoice','file','nama_pengirim']) 
		const insert = await Database
  			.insert({
  				id_user: Inputs.id_user,
  				id_invoice: Inputs.id_invoice,
  				nama_pengirim: Inputs.nama_pengirim,
  				nama_bank: 'permatamall',
  				upload_file: Inputs.file,
  				status: 'Requested',
  			})
  			.into('in_payment')

  		const update = await Database
			.table('in_order')
			.where('id_order', Inputs.id_invoice)
			.update('status_order','Cek_Pembayaran')
			
  		if(insert){
  			return response.json('200')
  		}else{
			return response.json('500')
		}
	}

	async cek_in_payment({ request,response }){
		const get = request.only(['id_user','id_invoice']) 
		const check = await Database
			.from('in_payment')
			.where('id_user', get.id_user)
			.where('id_invoice', get.id_invoice)
			.count() 
		return response.json(check)
	}

	async cancel_payment ({ request,response }){
		const fetch = require("node-fetch");
		const base64 = require('base-64');
		const get = request.only(['id_invoice']) 
		
		fetch("https://api.midtrans.com/v2/"+get.id_invoice+"/cancel", {
		      method: 'POST',
		      headers: { 
		       'Accept': 'application/json',
		       'Content-Type': 'application/json',
		       'Authorization': 'Basic '+ base64.encode("Mid-server-0_7N8YEMOvU1GBFZtLEIkMFL:"),
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
	}

	async private_order({ request,response }){
		const Inputs = request.only(['id_order','id_user_order'])
		const order = await Database
			.select('in_order.*','in_order_deal.amount')
			.from('in_order')
		  	.innerJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
			.where('in_order.id_order',Inputs.id_order)
			.where('in_order.id_user_order',Inputs.id_user_order)
			.first()
		return response.json(order)
	}

	async get_order_and_order_deal ({ response,request }){
		const Inputs = request.only(['id_invoice'])
		const data = await Database
			.select('in_order.*','in_order_deal.amount')
			.from('in_order')
			.innerJoin('in_order_deal', 'in_order.id_order', 'in_order_deal.id_order')
			.where('in_order.id_order',Inputs.id_invoice)
			.first()
		return response.json(data)
	}

	async data_pelanggan ({ response,request }){
		const Inputs = request.only(['id_pelanggan'])
		const data = await Database
			.select('*')
			.from('in_pelanggan')
			.where('id_pelanggan',Inputs.id_pelanggan)
			.first()
		return response.json(data)
	}

	async store_asal_sekolah ({ response,request }){
		const Inputs = request.only(['id_order','id_pelanggan','tingkat_sekolah','kota_sekolah','asal_sekolah'])
		const data = await Database
			.query()
			.table('in_asal_sekolah')
			.insert({
				id_order  : Inputs.id_order,
				id_pelanggan    : Inputs.id_pelanggan,
				tingkat_sekolah : Inputs.tingkat_sekolah,
				kota_sekolah    : Inputs.kota_sekolah,
				asal_sekolah    : Inputs.asal_sekolah,
			})
		return response.json(data)
	}

	async kota_sekolah ({response,request}){
		const Inputs = request.only(['kota'])
		function titleCase(str) {
		   var splitStr = str.toLowerCase().split(' ');
		   for (var i = 0; i < splitStr.length; i++) {
		       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
		   }
		   return splitStr.join(' '); 
		}

		const kota = await Database
			.select('kota')
			.table('in_alamat')
			.where('kota','LIKE','%'+titleCase(Inputs.kota)+'%')
			.groupBy('kota')
		return response.json(kota)
	}

	//bedah materi pelajaran
	async get_matpel_bedahmateri ({ response,request }){
		const Inputs = request.only(['tingkat'])
		const data = await Database
			.select('matapelajaran')
			.from('in_bedah_mata_pelajaran')
			.where('tingkat',Inputs.tingkat)
			.groupBy('matapelajaran')
		return response.json(data)	
	}

	async get_silabus_bedahmateri ({ response,request }){
		const Inputs = request.only(['matapelajaran','tingkat'])
		const data = await Database
			.select('in_bedah_mata_pelajaran.silabus','in_bedah_mata_pelajaran.id')
			.from('in_bedah_mata_pelajaran')
			.innerJoin('in_bedah_file','in_bedah_mata_pelajaran.id','in_bedah_file.id_bedah_mata_pelajaran')
			.where('in_bedah_mata_pelajaran.matapelajaran',Inputs.matapelajaran)
			.where('in_bedah_mata_pelajaran.tingkat',Inputs.tingkat)
			.groupBy('in_bedah_mata_pelajaran.silabus','in_bedah_mata_pelajaran.id')
		return response.json(data)	
	}

	async get_file_bedahmateri ({ response,request }){
		const Inputs = request.only(['id'])
		const data = await Database
			.select('file_bedah_soal','keterangan')
			.from('in_bedah_file')
			.where('id_bedah_mata_pelajaran',Inputs.id)
			.first()

		if (data) {
			return response.json({
				status : 'true',
				responses : '200',
				data: cryptr.encrypt(data.file_bedah_soal)	
			})			
		}else{
			return response.json({
				status : 'true',
				responses : '201',
			})
		}
	}

	async voucher ({response,params}){
		const voucher = await Database
			.select('in_voucher.*','in_voucher_already.limit','in_soal_langganan_kelas.kelas')
			.table('in_voucher')
			.innerJoin('in_voucher_already','in_voucher.id_voucher','in_voucher_already.id_voucher')
			.innerJoin('in_soal_langganan_paket','in_voucher_already.id_paket','in_soal_langganan_paket.id_paket')
			.innerJoin('in_soal_langganan_kelas','in_soal_langganan_paket.id_kelas','in_soal_langganan_kelas.id_kelas')
			.where('in_voucher_already.active','1')
			.where('in_voucher_already.product','BO')
			.where('in_voucher_already.id_paket',params.id)
			.orderBy('in_voucher_already.id_voucher_already','ASC')

		return response.json({
				voucher : voucher,
				count   : voucher.length,
			})
	}

	async update_deal_web ({request,response}){
		const Inputs = request.only(['id_order','amount','id_voucher'])
		const update = await Database
			.table('in_order_deal_web')
			.where('id_order', Inputs.id_order)
			.update({ 
				amount: Inputs.amount, 
				id_voucher: Inputs.id_voucher 
			})
	}

	async send_mail_pembayaran({response,request}){
		const Inputs = request.only(['id_order','id_pelanggan','file'])
		let data = { invoice: Inputs.id_order , user: Inputs.id_pelanggan, file_name : Inputs.file  }
		await Mail.send('users.notif_pembayaran', data, (message) => {
                message
                    .to('support@permatamall.com')
                    .from('noreply@permatamall.com', "Permata Mall")
                    .subject('Konfirmasi Alamat Email')
            })

        return response.json("Berhasil");
	}


}

module.exports = TestOnlineController
