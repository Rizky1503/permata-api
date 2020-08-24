'use strict'
const Merchant = use('App/Models/Merchant')
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class MerchantController {

	async index ({response}) {
	
		let merchant = await Merchant.all()
		return response.json(merchant)
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

		const lastMerIDchant = await Database.select(Database.raw('substr(id_merchant,11,30) as id_merchant'))
		    .from('in_merchant')
		    .orderBy(Database.raw('substr(id_merchant,11,30)'), 'desc')
		    .first();

        let lastMerIDchantNumber = null;

		if (lastMerIDchant ) {

		  lastMerIDchantNumber = 'MT'+ formatted_date + ++lastMerIDchant.id_merchant;
		} else {

		  lastMerIDchantNumber = 'MT'+ formatted_date +'1000000001';

		}
		
		const merchant 			= new Merchant()

		const merchantInfo 		= request.only(['id_merchant','email', 'no_telpon', 'nama', 'TTL', 'jenis_kelamin', 'jenis_lembaga', 'alamat', 'negara', 'provinsi', 'kota', 'kecamatan', 'kode_pos'])
		const ktp = request.file('ktp')
		const npwp = request.file('npwp')
		const foto = request.file('foto')
		let filenamektp=""
		let filenamenpwp=""
		let filenamefoto=""

		if(ktp !== null){ 
			let path  = "images/merchant/"+lastMerIDchantNumber
			filename  =  randomstring.generate(7) +"."+  ktp.toJSON().extname;
			await ktp.move(Helpers.publicPath(path), {
			  name : filenamektp, 
			  overwrite: true
			})
			merchant.ktp = filenamektp
		}

		if(npwp !== null){ 
			let path  = "images/merchant/"+lastMerIDchantNumber
			filename  =  randomstring.generate(7) +"."+  npwp.toJSON().extname;
			await npwp.move(Helpers.publicPath(path), {
			  name : filenamenpwp, 
			  overwrite: true
			})
			merchant.npwp = filenamenpwp
		}

		if(foto !== null){ 
			let path  = "images/merchant/"+lastMerIDchantNumber
			filename  =  randomstring.generate(7) +"."+  foto.toJSON().extname;
			await foto.move(Helpers.publicPath(path), {
			  name : filenamefoto, 
			  overwrite: true
			})
			merchant.foto = filenamefoto
		}

		merchant.id_merchant 	= lastMerIDchantNumber
		merchant.email 			= merchantInfo.email
		merchant.no_telpon 		= merchantInfo.no_telpon
		merchant.nama			= merchantInfo.nama
		merchant.TTL 			= merchantInfo.TTL
		merchant.jenis_kelamin 	= merchantInfo.jenis_kelamin
		merchant.jenis_lembaga 	= merchantInfo.jenis_lembaga
		merchant.alamat 		= merchantInfo.alamat
		merchant.negara 		= merchantInfo.negara
		merchant.provinsi 		= merchantInfo.provinsi
		merchant.kota 		 	= merchantInfo.kota
		merchant.kecamatan 		= merchantInfo.kecamatan
		merchant.kode_pos 		= merchantInfo.kode_pos
		


		await merchant.save()
		return response.status(201).json(merchant)		
	}

	async show ({params, response}) {
	
		const merchant = await Merchant.find(params.id)
		return response.json(merchant)
	
	}

	async update ({params, request, response}) {
		const merchant = await Merchant.find(params.id)

		const merchantInfo 		= request.only(['id_merchant','email', 'no_telpon', 'nama', 'TTL', 'jenis_kelamin', 'jenis_lembaga', 'alamat', 'negara', 'provinsi', 'kota', 'kecamatan', 'kode_pos'])
		const ktp = request.file('ktp')
		const npwp = request.file('npwp')
		const foto = request.file('foto')
		let filenamektp=""
		let filenamenpwp=""
		let filenamefoto=""

		if (!merchant) {
			return response.status(404).json({data: 'Resource not found'})
		}

		if(ktp !== null){ 
			let path  = "images/merchant/"+lastMerIDchantNumber
			filename  =  randomstring.generate(7) +"."+  ktp.toJSON().extname;
			await ktp.move(Helpers.publicPath(path), {
			  name : filenamektp, 
			  overwrite: true
			})
			merchant.ktp = filenamektp
		}

		if(npwp !== null){ 
			let path  = "images/merchant/"+lastMerIDchantNumber
			filename  =  randomstring.generate(7) +"."+  npwp.toJSON().extname;
			await npwp.move(Helpers.publicPath(path), {
			  name : filenamenpwp, 
			  overwrite: true
			})
			merchant.npwp = filenamenpwp
		}

		if(foto !== null){ 
			let path  = "images/merchant/"+lastMerIDchantNumber
			filename  =  randomstring.generate(7) +"."+  foto.toJSON().extname;
			await foto.move(Helpers.publicPath(path), {
			  name : filenamefoto, 
			  overwrite: true
			})
			merchant.foto = filenamefoto
		}
		merchant.id_merchant 	= merchantInfo.id_merchant
		merchant.email 			= merchantInfo.email
		merchant.no_telpon 		= merchantInfo.no_telpon
		merchant.nama			= merchantInfo.nama
		merchant.TTL 			= merchantInfo.TTL
		merchant.jenis_kelamin 	= merchantInfo.jenis_kelamin
		merchant.jenis_lembaga 	= merchantInfo.jenis_lembaga
		merchant.alamat 		= merchantInfo.alamat
		merchant.negara 		= merchantInfo.negara
		merchant.provinsi 		= merchantInfo.provinsi
		merchant.kota 		 	= merchantInfo.kota
		merchant.kecamatan 		= merchantInfo.kecamatan
		merchant.kode_pos 		= merchantInfo.kode_pos
		merchant.ktp 			= merchantInfo.ktp
		merchant.npwp 			= merchantInfo.npwp

		await merchant.save()
		return response.status(201).json(merchant)		

	}

	async delete ({params, response}) {

		const merchant = await Merchant.find(params.id)
		if (!merchant) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await merchant.delete()
		return response.status(204).json(null)
		
	}

	async store_latlong ({request}){
		const merchantInfo = request.only(['id_pelanggan','lat', 'long')
		const data = await Database
  			.table('in_login_location')
	        .insert({
	           id_pelanggan     :'11 SMA IPS',
	           latitude       	:data[i].mata_pelajaran,
	           jumlah_soal          :data[i].jumlah_soal,
	           jumlah_soal_berbayar :data[i].jumlah_soal_berbayar,
	           silabus              :data[i].silabus,
	           waktu                :data[i].waktu,
	        }) 

	}

}

module.exports = MerchantController
