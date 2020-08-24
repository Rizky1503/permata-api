'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");
const Product = use('App/Models/Product')
const Harga = use('App/Models/Harga')
const Order = use('App/Models/OrderModel')



class PrivateController {

	async index ({params, response}) {
		const affectedRows = await Database
			.query()
			.select('in_produk.id_master_kategori','kategori','icon')
		  	.innerJoin('in_ms_kategori', 'in_produk.id_master_kategori', 'in_ms_kategori.id_master_kategori')
		  	.table('in_produk')
		  	.where('id_mitra', params.id)
		  	.groupBy('in_produk.id_master_kategori','kategori','icon')


		return response.json(affectedRows)
	}


	async store ({request, response}) {

		const Inputs 		= request.only(['id_mitra', 'jenis_kelamin', 'pemilik_rek', 'no_rek', 'cv', 'foto', 'sertifikat','kota'])

		const affectedRows = await Database
		  .table('in_mitra')
		  .where('id_mitra', Inputs.id_mitra)
		  .update({ 
		  	jenis_kelamin: Inputs.jenis_kelamin, 
		  	cv: Inputs.cv, 
		  	pemilik_rek: Inputs.pemilik_rek, 
		  	no_rek: Inputs.no_rek, 
		  	foto: Inputs.foto,
		  	sertifikat: Inputs.sertifikat,
		  	kota: Inputs.kota, 
		  })


		  return response.status(200).json({
			affectedRows,
			id_mitra: Inputs.id_mitra,
		  });
	}

	async check ({params, response}) {
		const affectedRows = await Database
		  .table('in_mitra')
		  .where('id_mitra', params.id)
		  .first()
		return affectedRows;
	}

	async kelas ({response}) {
		const affectedRows = await Database
			.query()
		  	.table('in_matpel')		  
		  	.groupBy('kategori')
	  		.pluck('kategori')

	  	return response.status(200).json(affectedRows);
	}


	async matpel ({params, response}) {

		const Tingkat =  params.id.replace(/%20/g, ' ')

		if (Tingkat == "SMA") {
			const affectedRows = await Database
			.query()
		  	.table('in_silabus')		 
		  	.where('tingkat', params.id.replace(/%20/g, ' ')) 
		  	.groupBy('silabus')
	  		.pluck('silabus')
		  	return response.status(200).json(affectedRows);
		}else{
			const affectedRows = await Database
				.query()
			  	.table('in_matpel')		 
			  	.where('kategori', params.id.replace(/%20/g, ' ')) 
			  	.groupBy('nama_matpel')
		  		.pluck('nama_matpel')
		  	return response.status(200).json(affectedRows);

		}
	}


	async storeProduct ({request, response}) {

		function appendLeadingZeroes(n){
			if(n <= 9){
			  return "0" + n;
			}
			return n
		  }
  
		  let current_datetime = new Date()
		  let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())		
  
		  const lastProduk = await Database.select(Database.raw('substr(id_produk,11,30) as id_produk'))
			  .from('in_produk')
			  .orderBy(Database.raw('substr(id_produk,11,30)'), 'desc')
			  .first();
  
		  let lastProdukNumber = null;
  
		  if (lastProduk ) {
  
			lastProdukNumber = 'PD'+ formatted_date + ++lastProduk.id_produk;
		  } else {
  
			lastProdukNumber = 'PD'+ formatted_date +'1000000001';
  
		  }

		const productInfo 		= request.only(['id_produk','id_mitra', 'id_master_kategori', 'nama_produk','alamat', 'negara', 'provinsi','kota','kecamatan','kode_pos','nama_pic','no_telpon','kontak_pic','status_product','pengalaman','module','sub_module','jenis_kelamin','gaji_saat_ini','harga','total_murid'])
		const product 				= new Product()
		product.id_produk 			= lastProdukNumber
		product.id_mitra 			= productInfo.id_mitra
		product.id_master_kategori 	= productInfo.id_master_kategori
		product.nama_produk 		= productInfo.nama_produk
		product.alamat 				= productInfo.alamat
		product.negara 				= productInfo.negara
		product.provinsi 			= productInfo.provinsi
		product.kota 				= productInfo.kota
		product.kecamatan 			= productInfo.kecamatan
		product.kode_pos 			= productInfo.kode_pos
		product.nama_pic 			= productInfo.nama_pic
		product.no_telpon 			= productInfo.no_telpon
		product.kontak_pic_wa 		= productInfo.kontak_pic
		product.status_product 		= productInfo.status_product
		product.pengalaman 			= productInfo.pengalaman
		product.module 				= productInfo.module
		product.sub_module 			= productInfo.sub_module
		product.jenis_kelamin 		= productInfo.jenis_kelamin
		product.gaji_saat_ini 		= productInfo.gaji_saat_ini
		product.harga 				= productInfo.harga
		product.total_murid 		= productInfo.total_murid

		const CountRow 		= await Database
			.query()
		  	.table('in_produk')		 
		  	.where('id_mitra', productInfo.id_mitra) 
		  	.where('module', productInfo.module) 
		  	.where('sub_module', productInfo.sub_module) 
		  	.where('kota', productInfo.kota) 
		  	.count()
		  	.first()

		if (CountRow.count == 0) {
			await product.save()
		}

		return response.status(201).json({
			product: product,
			count: CountRow.count
		})	
	}


	async harga ({request, response}) {

		const hargaInfo    = request.only(['id_produk','hari', 'jam', 'jenis', 'harga', 'dp', 'over_time', 'keterangan', 'id_fasilitas','jam_selesai'])
		const harga 	   = new Harga()
		
		harga.id_produk    = hargaInfo.id_produk
		harga.hari 		   = hargaInfo.hari
		harga.jam 		   = hargaInfo.jam
		harga.jam_selesai  = hargaInfo.jam_selesai
		harga.jenis 	   = hargaInfo.jenis
		harga.harga 	   = hargaInfo.harga
		harga.dp 		   = hargaInfo.dp
		harga.over_time    = hargaInfo.over_time
		harga.keterangan   = hargaInfo.keterangan
		harga.id_fasilitas = hargaInfo.id_fasilitas

		await harga.save()
		return response.status(201).json(harga)	

	}

	async search ({request, response}) {

		const requested    	= request.only(['jenis_kelamin','tingkat','mata_pelajaran','kota','level'])
		if (requested.level == "Senior") {

			const CountRow 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '>=', '4') 			  	
			  	.where('status_product', 'Aktif') 
			  	.count()
			  	.first()
			
			const ListRow 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.select('id_produk','id_mitra','nama_produk','kota','alamat')
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '>=', '4') 			  	
			  	.where('status_product', 'Aktif') 

			const max 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.select('harga as max')
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '>=', '4') 			  	
			  	.where('status_product', 'Aktif') 
			  	.orderBy('harga', 'DESC')
			  	.first()

			const min 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.select('harga as min')
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '>=', '4') 			  	
			  	.where('status_product', 'Aktif') 
			  	.orderBy('harga', 'ASC')
			  	.first()



			return response.status(201).json({
				CountRow: CountRow,
				ListRow: ListRow,
				min: min,
				max: max,

			})	

		}else{

			const CountRow 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '<=', '4') 			  	
			  	.where('status_product', 'Aktif') 
			  	.count()
			  	.first()
			
			const ListRow 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.select('id_produk','id_mitra','nama_produk','kota','alamat')
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '<', '4')  
			  	.where('status_product', 'Aktif') 

			const max 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.select('harga as max')
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '<', '4')  
			  	.where('status_product', 'Aktif') 
			  	.orderBy('harga', 'DESC')
			  	.first()

			const min 		= await Database
				.query()
			  	.table('in_produk')		 
			  	.select('harga as min')
			  	.where('jenis_kelamin', requested.jenis_kelamin) 
			  	.where('module', requested.tingkat) 
			  	.where('sub_module', requested.mata_pelajaran) 
			  	.where('kota', requested.kota) 
			  	.where('pengalaman', '<', '4')  
			  	.where('status_product', 'Aktif') 
			  	.orderBy('harga', 'ASC')
			  	.first()

			
			return response.status(201).json({
				CountRow: CountRow,
				ListRow: ListRow,
				min: min,
				max: max,

			})	
		}

	}


	async order ({request, response}) {
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
	  		return response.status(201).json("Requested")
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

			return response.status(201).json(InsertData)
	  	}
			
	}


	async orderRequest ({request, response}) {		

		const requested    	= request.only(['id_order','id_produk','id_mitra','nama_produk','kota','alamat'])
		let current_datetime = new Date()

		const InsertData = await Database
	  	.table('in_order_private')
	  	.insert({
	  		id_order: requested.id_order,
	  		id_produk: requested.id_produk,
	  		id_mitra: requested.id_mitra,
	  		nama_produk: requested.nama_produk,
	  		kota: requested.kota,
	  		alamat: requested.alamat,
	  		created_at: current_datetime,
	  		updated_at: current_datetime,
	  	})
		return response.status(201).json("Berhasil")	
	}

	async absenPrivat ({params, response}) {
		let current_datetime = new Date()
		const InsertData = await Database
	  	.table('in_pertemuan')
	  	.where('id_pertemuan', params.id_pertemuan)
	  	.update({
	  		absen_guru:current_datetime
	  	})
	  	.returning('id_invoice')

		return response.status(201).json(InsertData[0])	
	}

	async semua_jadwal ({params, response}) {
		
		const Data 	= await Database
	  	.table('in_pertemuan')
	  	.select('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')
	  	.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
	  	.innerJoin('in_order', 'in_pertemuan.id_invoice', 'in_order.id_order')
	  	.where('in_pertemuan.id_mitra', params.id_mitra)
	  	.where('in_order.status_order','In Progres')
	  	.groupBy('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')

		return response.status(201).json(Data)	
	}

	async semua_jadwal_history ({params, response}) {
		
		const Data 	= await Database
	  	.table('in_pertemuan')
	  	.select('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')
	  	.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
	  	.innerJoin('in_order', 'in_pertemuan.id_invoice', 'in_order.id_order')
	  	.where('in_pertemuan.id_mitra', params.id_mitra)
	  	.whereIn('in_order.status_order', ['Close','Registrasi_Ulang','Konfirmasi_Ulang'])
	  	.groupBy('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')

		return response.status(201).json(Data)	
	}
}

module.exports = PrivateController
