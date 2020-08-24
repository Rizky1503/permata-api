'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const moment = require('moment');
const Env = use('Env')

class langgananController {

	async change_data ({request, response}){

		// const pelanggan = await Database
		// 	// .select('id_pelanggan','email','in_order.id_order','in_order.status_order','in_order.product')
		//   	.table('in_pelanggan')
		//   	// .leftJoin('in_order', 'in_order.id_user_order', 'in_pelanggan.id_pelanggan')		  	
		//   	.where('email', 'LIKE', '%boyke%')
		//   	// .delete()

		// return pelanggan
		return Encryption.decrypt('01acd9740ae9e8a1baf2d6c3fd6a27668OBMlbrk1qtVpCtydduCPQ==')
		

		// const change_in_soal = await Database
		//   	.table('in_soal_langganan')
		//   	.where('tingkat', '7')
		//   	.update({
		//   		id_kelas: 7
		//   	})

		// return change_in_soal

		// const change_in_matpel_online = await Database
		//   	.table('in_matpel_online_langganan')
		//   	.where('tingkat', '7')
		//   	.update({
		//   		id_kelas: 7
		//   	})

		// return change_in_matpel_online

		// const change_in_video = await Database
		// 	.select('id_video')
		//   	.table('in_video')
		//   	.where('tingkat', 'SMA IPS')
		  	
	 //  	for (var i = 0; i < change_in_video.length; i++) {

	 //  		const data_store_temp = await Database
		// 			  .table('in_soal_langganan_video')
		// 			  .insert({
		// 			  	id_kelas: 3, 
		// 			  	id_video: change_in_video[i].id_video,
		// 			}) 			  			
  // 		}

  // 		return change_in_video

  // 		const change_in_mata_pelajaran = await Database			
		//   	.table('in_bedah_mata_pelajaran')
		//   	.where('tingkat', 'KELAS 9')
		//   	.update({
		//   		id_kelas: 5,
		//   	})
		
		
			
		// return change_in_mata_pelajaran
	}


	async list_paket ({request, response}){
		const data = request.only(['id_pelanggan', 'page','show_page']);
		// const batuk = await Database
		//   	.table('in_order')
		//   	.where('id_user_order', data.id_pelanggan)
		//   	.whereIn('in_order.status_order', ['In Progres'])
		//   	.whereNotNull('id_package_user')
		//   	// .delete();
		// // // for (var i = 0; i < batuk.length; i++) {
		// // // 	const batukDist = await Database
		// // //   	.table('in_order_deal')
		// // //   	.where('id_order', batuk[i].id_order)
		// // //   	batuk[i]['ada'] = batukDist
  // // // 		}

		// return batuk

		const inOrder = await Database
			.select('id_package_user')
		  	.table('in_order')
		  	.where('id_user_order', data.id_pelanggan)
		  	.whereIn('in_order.status_order', ['In Progres'])
		  	.whereNotNull('id_package_user')
		  	.groupBy('id_package_user')
		var TampungInOrder = [];
	  	for (var i = 0; i < inOrder.length; i++) {
	  		TampungInOrder.push(inOrder[i].id_package_user);	  			  		
  		}
  		const findDuplicates 		= arr => arr.filter((item, index) => arr.indexOf(item) == index)		
		const userHavePackage 		= findDuplicates(TampungInOrder);		

		const getPaket = await Database
			.select('id_paket','id_kelas','nama_paket','brief','description','icon_paket','banner_paket','short','flag')
		  	.table('in_soal_langganan_paket')
		  	.whereNotIn('in_soal_langganan_paket.id_paket', userHavePackage)
		  	.orderBy('short','ASC')
		  	.paginate(data.page, data.show_page)

		const mergePaket = getPaket.data;

		const countOrder = await Database
	  	.table('in_order')
	  	.where('id_user_order',data.id_pelanggan)
	  	.where('product','BO')
	  	.whereIn('in_order.status_order', ['In Progres','Close'])
	  	.whereNotNull('id_package_user')
	  	.count()
	  	.first()

	  	for (var i = 0; i < mergePaket.length; i++) {

	  		const getPriceDuration = await Database.raw('SELECT \
					  MIN(duration) as duration_minimal,\
					  MAX(duration) as duration_maximal,\
					  MIN(amount) as price_minimal,\
					  MAX(amount) as price_maximal\
					FROM \
					  public.in_soal_langganan_paket_harga \
					WHERE \
					  id_paket = ?', mergePaket[i].id_paket)
	  		mergePaket[i]['dataPrice'] 		= getPriceDuration.rows[0];	
	  		mergePaket[i]['icon_paket'] 	= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/paket/paket-all.png';		  			  			
	  		mergePaket[i]['banner_paket'] 	= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'images/paket/examp/'+mergePaket[i].banner_paket;		  			  			
	  		
	  		const getDiscount = await Database
		  	.table('in_soal_langganan_paket_promo')
		  	.where('active',1)
		  	.orderBy('limit_active','ASC')

		  	if (countOrder.count > 0) {
		  		if (getDiscount.length > 0) {
			  		for (var iclass = 0; iclass < getDiscount.length; iclass++) {
				  		if (countOrder.count >= getDiscount[iclass].limit_active) {
				  			const harga_min 		= getPriceDuration.rows[0].price_minimal;
				  			const percent_min 		= getDiscount[iclass].promo / 100 * harga_min;
				  			const harga_max 		= getPriceDuration.rows[0].price_maximal;
				  			const percent_max 		= getDiscount[iclass].promo / 100 * harga_max;
				  			mergePaket[i]['discount_min'] 	= harga_min - percent_min;		  			  				  		
				  			mergePaket[i]['discount_max'] 	= harga_max - percent_max;		  			  				  		
				  		}	
				  	}			  			
		  		}else{
			  		mergePaket[i]['discount_min'] 	= 0;			  			  				  		
		  			mergePaket[i]['discount_max'] 	= 0;		  			
		  		}
		  	}else{
		  		mergePaket[i]['discount_min'] 	= 0;			  			  				  		
	  			mergePaket[i]['discount_max'] 	= 0;
		  		// for (var iclass = 0; iclass < getDiscount.length; iclass++) {
		  		// 	mergePaket[i]['discount_min'] 	= 0;		  			  				  		
		  		// 	mergePaket[i]['discount_max'] 	= 0;	
			  	// }
		  	}
		  		  		
  		}

  		const dataDiscount = await Database
		  	.table('in_soal_langganan_paket_promo')
		  	.where('active',1)
		  	.orderBy('limit_active','ASC')

  		const voucher = await Database
		  	.table('in_voucher_already')
		  	.where('active',1)
		  	.count()
		  	.first()

		const dataVoucher = [{
			id_tutor: 1,
			tutor: '1. Pilih Paket / Kelas yang ingin dibeli dan lama berlangganan'
		},{
			id_tutor: 2,
			tutor: '2. Pilih kode voucher #HARDIKNAS untuk 30 pendaftar pertama (pastikan harga terpotong)'
		},{
			id_tutor: 3,
			tutor: '3. Pilih Metode Pembayaran (Transfer Manual atau Online Payment (BNI, PERMATA, GOPAY)'
		}]

		return response.json({
			status : 'true',
			responses : '200',
			voucher:dataVoucher,			
			discount:dataDiscount,			
			data:mergePaket			
		})
	}

	async list_paket_upgrade ({request, response}){
		const data = request.only(['id_pelanggan', 'page','show_page']);		
		const inOrder = await Database
			.select('id_package_user')
		  	.table('in_order')
		  	.where('id_user_order', data.id_pelanggan)
		  	.whereIn('in_order.status_order', ['In Progres'])
		  	.whereNotNull('id_package_user')
		  	.groupBy('id_package_user')
		var TampungInOrder = [];
	  	for (var i = 0; i < inOrder.length; i++) {
	  		TampungInOrder.push(inOrder[i].id_package_user);	  			  		
  		}
  		const findDuplicates 		= arr => arr.filter((item, index) => arr.indexOf(item) == index)		
		const userHavePackage 		= findDuplicates(TampungInOrder);		

		const getPaket = await Database
			.select('id_paket','id_kelas','nama_paket','brief','description','icon_paket','banner_paket','short','flag')
		  	.table('in_soal_langganan_paket')
		  	.whereNotIn('in_soal_langganan_paket.id_paket', userHavePackage)
		  	.orderBy('short','ASC')
		  	.paginate(data.page, data.show_page)

		const mergePaket = getPaket.data;

		const countOrder = await Database
	  	.table('in_order')
	  	.where('id_user_order',data.id_pelanggan)
	  	.where('product','BO')
	  	.whereIn('in_order.status_order', ['In Progres','Close'])
	  	.whereNotNull('id_package_user')
	  	.count()
	  	.first()

	  	// return mergePaket

	  	for (var i = 0; i < mergePaket.length; i++) {

	  		const getPriceDuration = await Database.raw('SELECT \
					  MIN(duration) as duration_minimal,\
					  MAX(duration) as duration_maximal,\
					  MIN(amount::money::numeric::float8) as price_minimal,\
					  MAX(amount::money::numeric::float8) as price_maximal\
					FROM \
					  public.in_soal_langganan_paket_harga \
					WHERE \
					  id_paket = ?', mergePaket[i].id_paket)
	  		mergePaket[i]['dataPrice'] 		= getPriceDuration.rows[0];	
	  		mergePaket[i]['icon_paket'] 	= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/paket/paket-all.png';		  			  			
	  		mergePaket[i]['banner_paket'] 	= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'images/paket/examp/'+mergePaket[i].banner_paket;		  			  			
		  	if (mergePaket[i]['dataPrice'].price_minimal == 0) {
		  		mergePaket[i]['price_text'] 	= "Gratis selama promosi";		
		  		mergePaket[i]['price_command'] 	= "Bottom";		
		  	}else{
		  		const getListTrial = await Database
			  	.table('in_order_trial_bimbel_online')
			  	.where('id_pelanggan', data.id_pelanggan)
			  	.where('id_paket', mergePaket[i].id_paket)
			  	if (getListTrial.length == 0) {
			  		mergePaket[i]['price_text'] 	= "FREE TRIAL 2 HARI";
			  		mergePaket[i]['price_command'] 	= "Modal";				
			  	}else{
			  		const getDiscount = await Database
				  	.table('in_soal_langganan_paket_promo')
				  	.where('active',1)
				  	.orderBy('limit_active','ASC')
				  	if (countOrder.count > 0) {
				  		if (getDiscount.length > 0) {
					  		for (var iclass = 0; iclass < getDiscount.length; iclass++) {
						  		if (countOrder.count >= getDiscount[iclass].limit_active) {
						  			const harga_min 		= getPriceDuration.rows[0].price_minimal;
						  			const percent_min 		= getDiscount[iclass].promo / 100 * harga_min;
						  			const harga_max 		= getPriceDuration.rows[0].price_maximal;
						  			const percent_max 		= getDiscount[iclass].promo / 100 * harga_max;
						  			mergePaket[i]['discount_min'] 	= harga_min - percent_min;		  			  				  		
						  			mergePaket[i]['discount_max'] 	= harga_max - percent_max;	
						  			if (mergePaket[i]['discount_min'] == mergePaket[i]['discount_max']) {
						  				mergePaket[i]['price_text'] 	= "Rp. "+mergePaket[i]['discount_min']+" / "+mergePaket[i]['dataPrice'].duration_minimal+" Bulan";							  				
						  			}else{
						  				mergePaket[i]['price_text'] 	= "Rp. "+mergePaket[i]['discount_min']+" - Rp. "+mergePaket[i]['discount_max'];
						  			}	  	
						  		}	
						  	}			  			
				  		}else{
				  			if (mergePaket[i]['dataPrice'].price_minimal == mergePaket[i]['dataPrice'].price_maximal) {
				  				mergePaket[i]['price_text'] 	= "Rp. "+ mergePaket[i]['dataPrice'].price_minimal+ " / "+mergePaket[i]['dataPrice'].duration_minimal+" Bulan";		
				  				mergePaket[i]['price_command'] 	= "Bottom";
				  			}else{
				  				mergePaket[i]['price_text'] 	= "Rp. "+ mergePaket[i]['dataPrice'].price_minimal+" - Rp. "+mergePaket[i]['dataPrice'].price_maximal;		
				  				mergePaket[i]['price_command'] 	= "Bottom";
				  			}
				  		}
				  	}else{
			  			if (mergePaket[i]['dataPrice'].price_minimal == mergePaket[i]['dataPrice'].price_maximal) {
			  				mergePaket[i]['price_text'] 	= "Rp. "+ mergePaket[i]['dataPrice'].price_minimal+ " / "+mergePaket[i]['dataPrice'].duration_minimal+" Bulan";		
			  				mergePaket[i]['price_command'] 	= "Bottom";
			  			}else{
			  				mergePaket[i]['price_text'] 	= "Rp. "+ mergePaket[i]['dataPrice'].price_minimal+" - Rp. "+mergePaket[i]['dataPrice'].price_maximal;		
			  				mergePaket[i]['price_command'] 	= "Bottom";
			  			}
				  	}
			  	}
		  		
		  	}
		  		  		
  		}

  		const dataDiscount = await Database
		  	.table('in_soal_langganan_paket_promo')
		  	.where('active',1)
		  	.orderBy('limit_active','ASC')

  		const voucher = await Database
		  	.table('in_voucher_already')
		  	.where('active',1)
		  	.count()
		  	.first()

		const dataVoucher = [{
			id_tutor: 1,
			tutor: '1. Pilih Paket / Kelas yang ingin dibeli dan lama berlangganan'
		},{
			id_tutor: 2,
			tutor: '2. Pilih kode voucher #HARDIKNAS untuk 30 pendaftar pertama (pastikan harga terpotong)'
		},{
			id_tutor: 3,
			tutor: '3. Pilih Metode Pembayaran (Transfer Manual atau Online Payment (BNI, PERMATA, GOPAY)'
		}]

		return response.json({
			status : 'true',
			responses : '200',
			voucher:dataVoucher,			
			discount:dataDiscount,			
			data:mergePaket			
		})
	}

	async list_paket_have_user ({request, response}){

		const data = request.only(['id_pelanggan']);
		const userData = await Database
		  	.table('in_pelanggan')
		  	.select('nama','foto')
		  	.where('id_pelanggan', data.id_pelanggan)
		  	.first()

		if (userData.foto) {
			userData['foto'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'images/profile/pelanggan/'+userData.foto;
		}else{
			userData['foto'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'images/profile/pelanggan/default.png';			
		}


		const getDataExpiredTwoDays = await Database
		  	.table('in_soal_langganan_paket')
			.select('in_order.id_order','in_order.status_order','in_soal_langganan_paket.nama_paket','in_soal_langganan_kelas.id_kelas','in_soal_langganan_kelas.kelas','in_soal_langganan_kelas.icon','in_soal_langganan_paket.flag', 'in_order.expired_bimbel_online','in_order_deal.id_produk')		  	
		  	.innerJoin('in_order', 'in_order.id_package_user', 'in_soal_langganan_paket.id_paket')
		  	.innerJoin('in_order_deal', 'in_order_deal.id_order', 'in_order.id_order')
		  	.innerJoin('in_soal_langganan_kelas', 'in_soal_langganan_kelas.id_kelas', 'in_soal_langganan_paket.id_kelas')
		  	.where('in_order.id_user_order', data.id_pelanggan)
		  	.where('in_order.status_order', 'In Progres')
		  	.whereNotNull('expired_bimbel_online')


		for (var i = 0; i < getDataExpiredTwoDays.length; i++) {

			const getDuration = await Database
		  	.table('in_soal_langganan_paket_harga')
		  	.where('id', getDataExpiredTwoDays[i].id_produk)
		  	.first();
	  		getDataExpiredTwoDays[i]['paket_berakhir'] = moment(getDataExpiredTwoDays[i].expired_bimbel_online).format('D MMMM Y');	
	  		if (getDuration) {
	  			getDataExpiredTwoDays[i]['duration'] 		= getDuration.duration;
	  			if (getDuration.flag_duration == "m") {
	  				getDataExpiredTwoDays[i]['flag_duration'] 		= "Bulan";	  				
	  			}else if (getDuration.flag_duration == "w") {
	  				getDataExpiredTwoDays[i]['flag_duration'] 		= "Minggu";	  				
	  			}
	  		}else{	  		
	  			getDataExpiredTwoDays[i]['duration'] 		= 0;	
	  			getDataExpiredTwoDays[i]['flag_duration'] 	= "";	  			  				
	  		}
  		}


		const countOrder = await Database
		  	.table('in_order')
		  	.where('id_user_order', data.id_pelanggan)
		  	.whereIn('in_order.status_order', ['In Progres'])
		  	.whereNotNull('id_package_user')
		  	.count()
		  	.first()

		const inOrder = await Database
			.select('id_package_user')
		  	.table('in_order')
		  	.where('id_user_order', data.id_pelanggan)
		  	.whereIn('in_order.status_order', ['In Progres'])
		  	.whereNotNull('id_package_user')
		  	.groupBy('id_package_user')


		// return inOrder
		var TampungInOrder = [];
	  	for (var i = 0; i < inOrder.length; i++) {
	  		TampungInOrder.push(inOrder[i].id_package_user);	  			  		
  		}
  		const findDuplicates 		= arr => arr.filter((item, index) => arr.indexOf(item) == index)		
		const userHavePackage 		= findDuplicates(TampungInOrder);		
		const getPaket = await Database
			.select('in_order.id_order','in_order.status_order','in_soal_langganan_paket.nama_paket','in_soal_langganan_kelas.id_kelas','in_soal_langganan_kelas.kelas','in_soal_langganan_kelas.icon','in_soal_langganan_paket.flag')
		  	.table('in_soal_langganan_paket')
		  	.innerJoin('in_order', 'in_order.id_package_user', 'in_soal_langganan_paket.id_paket')
		  	.innerJoin('in_soal_langganan_kelas', 'in_soal_langganan_kelas.id_kelas', 'in_soal_langganan_paket.id_kelas')
		  	.where('in_order.id_user_order', data.id_pelanggan)
		  	.where('in_order.status_order', 'In Progres')
		  	.whereIn('id_paket', userHavePackage)
		  	.orderBy('id_order','DESC')

		for (var i = 0; i < getPaket.length; i++) {
	  		getPaket[i]['icon_paket'] = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/bo/paket/paket-all.png';		  			  			
  		}

  		var reminderExpired = 0;
  		for (var i = 0; i < getDataExpiredTwoDays.length; i++) {
  			if (moment(getDataExpiredTwoDays[i].expired_bimbel_online).format('Y-MM-DD') <= moment().add(2, 'days').format('Y-MM-DD')) {
	  			reminderExpired ++;
  			}
  		}

		const data_temp = ({
			userData 	: userData,
			command 	: "Total "+countOrder.count+" Paket Berlangganan",
			berakhir 	: reminderExpired+" Paket akan berakhir",
			berakhirData: getDataExpiredTwoDays,
			dataPaket 	: getPaket,
		})

		return response.json({
			status : 'true',
			responses : '200',
			data:data_temp			
		})
	}

	async duration_list ({request, response}){

		const data = request.only(['id_pelanggan', 'id_paket']);
		const DataDuration = await Database
			.select('id as value')
		  	.table('in_soal_langganan_paket_harga')
		  	.where('id_paket', data.id_paket)

		const DataDurationTemp = await Database
		  	.table('in_soal_langganan_paket_harga')
		  	.where('id_paket', data.id_paket)

	  	for (var i = 0; i < DataDurationTemp.length; i++) {

	  		const countOrder = await Database
		  	.table('in_order')
		  	.where('id_user_order',data.id_pelanggan)
		  	.where('product','BO')
		  	.whereIn('in_order.status_order', ['In Progres','Close'])
		  	.whereNotNull('id_package_user')
		  	.count()
		  	.first()

	  		const getDiscount = await Database
		  	.table('in_soal_langganan_paket_promo')
		  	.where('active',1)
		  	.orderBy('limit_active','DESC')
		  	const discount = [];
		  	if (countOrder.count > 0) {
		  		if (getDiscount.length > 0) {
			  		for (var iclass = 0; iclass < getDiscount.length; iclass++) {
				  		if (countOrder.count >= getDiscount[iclass].limit_active) {
				  			const harga 					= DataDurationTemp[i].amount;
				  			const percent 					= getDiscount[iclass].promo / 100 * harga;
				  			discount.push(harga - percent);		  			  				  		
				  		}	
				  	}			  			
		  		}else{
			  		discount.push(DataDurationTemp[i].amount);	
		  		}
		  	}else{
		  		discount.push(DataDurationTemp[i].amount);	
		  	}
		  		

	  		if (DataDurationTemp[i].duration == 0) {		  		
		  		DataDuration[i]['label'] =  'Gratis selama promosi ' + ' - RP. ' + discount;		  		
	  		}else if (DataDurationTemp[i].flag_duration == 'm') {		  		
		  		DataDuration[i]['label'] =  'Paket ' + DataDurationTemp[i].duration + ' Bulan' + ' - RP. ' + discount;		  		
	  		}else if (DataDurationTemp[i].flag_duration == 'w') {
		  		DataDuration[i]['label'] =  'Paket ' + DataDurationTemp[i].duration + ' Minggu' + ' - RP. ' + discount;		  		
	  		}
  		}

		return response.json({
			status : 'true',
			responses : '200',
			data:DataDuration			
		})
	}

	async selectDuration ({request, response}){
		const data = request.only(['id_harga']);
		const DataDuration = await Database
		  	.table('in_soal_langganan_paket_harga')
		  	.leftJoin('in_soal_langganan_paket', 'in_soal_langganan_paket.id_paket', 'in_soal_langganan_paket_harga.id_paket')		  	
		  	.where('in_soal_langganan_paket_harga.id', data.id_harga)
		  	.first()
		return response.json({
			status : 'true',
			responses : '200',
			data:DataDuration			
		})
	}


}
module.exports = langgananController
