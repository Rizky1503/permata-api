'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const randomstring = use("randomstring");
const Product = use('App/Models/Product')
const Harga = use('App/Models/Harga')
const Order = use('App/Models/OrderModel')


class LesPrivatController {

	async validateDocument ({request, response}) {

		const productInfo 		= request.only(['id_mitra'])
		const dataMitra		= await Database
		.query()
	  	.table('in_mitra')		 
	  	.where('id_mitra', productInfo.id_mitra) 
	  	.first()

	  	return response.json({
			status : 'true',
			responses : '200',
			data: dataMitra
		})

	}
	

	async list_all ({params, response}) {

		const affectedRows = await Database
		.query()
	  	.table('in_produk')	
	  	.where('id_mitra', params.id_mitra.replace(/%20/g, ' '))
	  	.where('id_master_kategori', '19')
	  	.orderBy('id_produk','DESC')
	  	.paginate(params.page, params.show_page)
	  	return response.json({
			status : 'true',
			responses : '200',
			data: affectedRows.data
		})
	}

	async create_tingkat ({response}) {

		const affectedRows = await Database
		.query()
	  	.table('in_matpel')
	  	.select('kategori as label','urutan')	
	  	.groupBy('kategori','urutan')	
	  	.orderBy('urutan', 'DESC')
	  	return response.json({
			status : 'true',
			responses : '200',
			data: affectedRows
		})
	}

	async create_mata_pelajaran ({params, response}) {

		if (params.tingkat == "SMA") {
			const affectedRows = await Database
			.query()
		  	.table('in_silabus')
		  	.select('silabus as label')	
		  	.groupBy('silabus')	
		  	.where('tingkat', params.tingkat)
		  	return response.json({
				status : 'true',
				responses : '200',
				data: affectedRows
			})			
		}else{
			const affectedRows = await Database
			.query()
		  	.table('in_matpel')
		  	.select('nama_matpel as label')	
		  	.groupBy('nama_matpel')	
		  	.where('kategori', params.tingkat)
		  	return response.json({
				status : 'true',
				responses : '200',
				data: affectedRows
			})			
		}
	}

	async create_kota ({params, response}) {

		const affectedRows = await Database
		.query()
	  	.table('in_alamat_verifikasi')
	  	.select('kota as label')	
	  	.groupBy('kota')	
	  	return response.json({
			status : 'true',
			responses : '200',
			data: affectedRows
		})
	}

	async store ({request, response}) {

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

		const productInfo 		= request.only(['id_mitra','kota','pengalaman','module','sub_module','gaji_saat_ini','harga','total_murid'])

		const dataMitra		= await Database
			.query()
		  	.table('in_mitra')		 
		  	.where('id_mitra', productInfo.id_mitra) 
		  	.first()

		const product 				= new Product()
		product.id_produk 			= lastProdukNumber
		product.id_mitra 			= productInfo.id_mitra
		product.id_master_kategori 	= '19'
		product.nama_produk 		= 'les-privat '+dataMitra.nama+'-'+productInfo.module+'-'+productInfo.sub_module
		product.negara 				= 'Indonesia'
		product.kota 				= productInfo.kota
		product.status_product 		= 'Tidak Aktif'
		product.pengalaman 			= productInfo.pengalaman
		product.module 				= productInfo.module
		product.sub_module 			= productInfo.sub_module
		product.jenis_kelamin 		= dataMitra.jenis_kelamin
		product.gaji_saat_ini 		= productInfo.gaji_saat_ini
		product.harga 				= productInfo.harga
		product.total_murid 		= productInfo.total_murid
		product.alamat 				= ''

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

		const datas = ({
			product: product,
			count: CountRow.count
		})

		return response.status(201).json({
			status : 'true',
			responses : '200',
			data:datas		
		})	
	}


	async storeWaktu ({request, response}) {

		const hargaInfo    = request.only(['id_produk','hari', 'jam', 'harga'])
		const harga 	   = new Harga()		
		harga.id_produk    = hargaInfo.id_produk
		harga.hari 		   = hargaInfo.hari
		harga.jam 		   = hargaInfo.jam
		harga.jam_selesai  = hargaInfo.jam		
		harga.harga 	   = hargaInfo.harga
		await harga.save()
		return response.status(201).json(harga)	

	}

	async JadwalList ({params, response}) {

		const Data 	= await Database
		  	.table('in_pertemuan')
		  	.select('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')
		  	.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
		  	.innerJoin('in_order', 'in_pertemuan.id_invoice', 'in_order.id_order')
		  	.where('in_pertemuan.id_mitra', params.id_mitra)
		  	.where('in_order.status_order','In Progres')	
		  	.groupBy('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')
		  	.paginate(params.page, params.show_page)
	  	

	  	return response.status(201).json({
			status : 'true',
			responses : '200',
			data:Data.data
		})	
	}

	async JadwalDetailProfile ({request, response}) {
		const mitraInfo = request.only(['id_mitra','id_invoice']);
		const Data = await Database.from('in_pertemuan')
		.innerJoin('in_pelanggan', 'in_pelanggan.id_pelanggan', 'in_pertemuan.id_user_order')
		.where('id_mitra',mitraInfo.id_mitra)
		.where('id_invoice',mitraInfo.id_invoice)
		.first() 		
		return response.status(201).json({
			status : 'true',
			responses : '200',
			data:Data
		})			
	}


	async JadwalDetailAbsen ({params, response}) {

		const dataSudah = await Database
		.query()
	  	.table('in_pertemuan')
	  	.where('id_mitra',params.id_mitra.replace(/%20/g, ' '))	
	  	.where('id_invoice',params.id_invoice.replace(/%20/g, ' '))	
	  	.whereNotNull('absen_guru')
	  	.orderBy('id_pertemuan','ASC')

	  	const dataSudahAkhir = await Database
		.query()
	  	.table('in_pertemuan')
	  	.where('id_mitra',params.id_mitra.replace(/%20/g, ' '))	
	  	.where('id_invoice',params.id_invoice.replace(/%20/g, ' '))	
	  	.whereNull('status')
	  	.whereNotNull('absen_guru')
	  	.orderBy('id_pertemuan','DESC')
	  	.limit(1)

	  	const dataBelum = await Database
		.query()
	  	.table('in_pertemuan')
	  	.where('id_mitra',params.id_mitra.replace(/%20/g, ' '))	
	  	.where('id_invoice',params.id_invoice.replace(/%20/g, ' '))	
	  	.whereNull('absen_guru')
	  	.orderBy('id_pertemuan','ASC')
	  	.limit(1)

	  	if (dataBelum.length > 0) {
	  		if (dataSudahAkhir.length == 0) {
	  			dataSudah.push({
					"id_pertemuan": dataBelum[0].id_pertemuan,
					"id_invoice": dataBelum[0].id_invoice,
					"id_user_order": dataBelum[0].id_user_order,
					"id_mitra": dataBelum[0].id_mitra,
					"tanggal": dataBelum[0].tanggal,
					"pertemuan_ke": dataBelum[0].pertemuan_ke,
					"status": dataBelum[0].status,
					"absen_guru": dataBelum[0].absen_guru,
					"created_at": dataBelum[0].created_at,
					"updated_at": dataBelum[0].updated_at,
					"deleted_at": dataBelum[0].deleted_at,
					"id_produk": dataBelum[0].id_produk
				})	
	  		}
	  		
	  	}
		return response.status(201).json({
			status : 'true',
			responses : '200',
			data:dataSudah
		})			
	}


	async StoreDetailAbsen ({request, response}) {

		const productInfo 		= request.only(['id_pertemuan'])

		let current_datetime = new Date()
		const InsertData = await Database
	  	.table('in_pertemuan')
	  	.where('id_pertemuan', productInfo.id_pertemuan)
	  	.update({
	  		absen_guru:current_datetime
	  	})
		return response.status(201).json({
			status : 'true',
			responses : '200',
			data:'success'
		})			
	}


	async HistoryList ({params, response}) {

		const Data 	= await Database
	  	.table('in_pertemuan')
	  	.select('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')
	  	.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
	  	.innerJoin('in_order', 'in_pertemuan.id_invoice', 'in_order.id_order')
	  	.where('in_pertemuan.id_mitra', params.id_mitra)
	  	.whereIn('in_order.status_order', ['Close','Registrasi_Ulang','Konfirmasi_Ulang'])
	  	.groupBy('in_pertemuan.id_invoice', 'in_pertemuan.id_user_order', 'in_pelanggan.nama', 'in_order.keterangan')
	  	.paginate(params.page, params.show_page)		  	
	  	

	  	return response.status(201).json({
			status : 'true',
			responses : '200',
			data:Data.data
		})	
	}
	
	async HistoryDetailAbsen ({params, response}) {

		const dataSudah = await Database
		.query()
	  	.table('in_pertemuan')
	  	.where('id_mitra',params.id_mitra.replace(/%20/g, ' '))	
	  	.where('id_invoice',params.id_invoice.replace(/%20/g, ' '))	
	  	.whereNotNull('status')
	  	.orderBy('id_pertemuan','ASC')

		return response.status(201).json({
			status : 'true',
			responses : '200',
			data:dataSudah
		})			
	}


	async kota_Lahir ({request, response}) {
		const data  = request.only(['search','page','show_page'])

		if (data.search != null) {
			function kapital(str)
			{  
				return str.replace (/\w\S*/g, function(txt){  
		      		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); 
			    });
			}
			const kota_Lahir = await Database
			.query()
			.select('kota')
		  	.table('in_alamat')
		  	.where('kota', 'like', '%'+kapital(data.search)+'%')
		  	.groupBy('kota')
		  	.paginate(data.page, data.show_page)

			return response.status(201).json({
				status : 'true',
				responses : '200',
				data:kota_Lahir.data
			})
		}else{
			const kota_Lahir = await Database
			.query()
			.select('kota')
		  	.table('in_alamat')
		  	.groupBy('kota')
		  	.orderBy('kota','ASC')
		  	.paginate(data.page, data.show_page)

			return response.status(201).json({
				status : 'true',
				responses : '200',
				data:kota_Lahir.data
			})
		}				
	}

	async submit_persyaratan ({request, response}) {
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


		return response.status(201).json({
			status : 'true',
			responses : '200',
			data:affectedRows
		})							
	}
}

module.exports = LesPrivatController
