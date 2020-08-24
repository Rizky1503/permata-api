'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const convertRupiah = require('rupiah-format')

class PaketController {

	async filter({request, response}){
		const data		= request.only(['page'])
		if (data.page == "kelas") {
			const kelas = await Database
				.select('paket_available.id_kelas as key', 'kelas as value', 'sort')
				.table('v2.tscn_paket_available as paket_available')
				.innerJoin('v2.ms_kelas as kelas','kelas.id_kelas','paket_available.id_kelas')
				.where('active', true)
				.groupBy('paket_available.id_kelas','kelas','sort')
				.orderBy('sort','ASC')
			kelas.unshift({
				"key":"",
				"value":"",
				"sort":"0"
			});

			for (var iresult = 0; iresult < kelas.length; iresult++) {
				kelas[iresult].label = kelas[iresult].value == "" ? "SEMUA KELAS" : kelas[iresult].value;
			}

			return response.json({
				status : 'true',
				responses : '200',
				data:kelas			
			})
		}else{
			const durasi = await Database
				.select('type as key', 'type as value')
				.table('v2.tscn_price as price')
				.groupBy('type')
				.orderBy('type','ASC')				
			durasi.unshift({"key":"","value":"","sort":"0"});
			for (var iresult = 0; iresult < durasi.length; iresult++) {
				durasi[iresult].label = durasi[iresult].value == "" ? "SEMUA DURASI" : durasi[iresult].value;
			}
			return response.json({
				status : 'true',
				responses : '200',
				data:durasi			
			})
		}		
	}

	async list({request, response}){
		const data		= request.only(['id_kelas','durasi','page'])  
		const id_kelas 	= data.id_kelas
		const durasi  	= data.durasi
		const page  	= data.page
		const limit     = 5

		//search
		if (id_kelas && durasi ) {
			const paket = await Database
				.select('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.table('v2.tscn_paket as paket')
				.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
				.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
				.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
				.where('paket.active', true)
				.whereNotIn('kategori', ['Gratis'])
				.where('ms_kelas.id_kelas', id_kelas)
				.where('price.type', durasi)
				.groupBy('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.orderBy('price', 'ASC')				
				.paginate(page,limit)
			const result = paket.data
			for (var iresult = 0; iresult < result.length; iresult++) {
				result[iresult].nama_paket = result[iresult].nama_paket+' '+convertRupiah.convert(result[iresult].price)+' / '+result[iresult].duration+' '+result[iresult].type;
			}
			return response.json({
				status : 'true',
				responses : '200',
				data:result		
			})
		}else if (id_kelas) {
			const paket = await Database
				.select('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.table('v2.tscn_paket as paket')
				.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
				.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
				.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
				.where('paket.active', true)
				.whereNotIn('kategori', ['Gratis'])
				.where('ms_kelas.id_kelas', id_kelas)
				.groupBy('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')				
				.orderBy('duration', 'ASC')				
				.paginate(page,limit)

			const result = paket.data
			for (var iresult = 0; iresult < result.length; iresult++) {
				result[iresult].nama_paket = result[iresult].nama_paket+' '+convertRupiah.convert(result[iresult].price)+' / '+result[iresult].duration+' '+result[iresult].type;
			}
			return response.json({
				status : 'true',
				responses : '200',
				data:result		
			})

		}else if (durasi) {
			const paket = await Database
				.select('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.table('v2.tscn_paket as paket')
				.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
				.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
				.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
				.where('paket.active', true)
				.whereNotIn('kategori', ['Gratis'])
				.where('price.type', durasi)
				.groupBy('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.orderBy('duration', 'ASC')				
				.paginate(page,limit)

			const result = paket.data
			for (var iresult = 0; iresult < result.length; iresult++) {
				result[iresult].nama_paket = result[iresult].nama_paket+' '+convertRupiah.convert(result[iresult].price)+' / '+result[iresult].duration+' '+result[iresult].type;
			}
			return response.json({
				status : 'true',
				responses : '200',
				data:result		
			})

		}else{
			const paket = await Database
				.select('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.table('v2.tscn_paket as paket')
				.innerJoin('v2.tscn_price as price','price.id_paket','paket.id_paket')
				.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','paket.id_paket')
				.innerJoin('v2.ms_kelas as ms_kelas','ms_kelas.id_kelas','paket_available.id_kelas')
				.where('paket.active', true)
				.whereNotIn('kategori', ['Gratis'])
				.groupBy('paket.id_paket', 'nama_paket', 'brief', 'description', 'syarat', 'ketentuan', 'paket.icon', 'paket.image', 'duration', 'type', 'price', 'id_price')
				.orderBy('price', 'ASC')				
				.paginate(page,limit)

			const result = paket.data
			for (var iresult = 0; iresult < result.length; iresult++) {
				result[iresult].nama_paket = result[iresult].nama_paket+' '+convertRupiah.convert(result[iresult].price)+' / '+result[iresult].duration+' '+result[iresult].type;
			}
			return response.json({
				status : 'true',
				responses : '200',
				data:result		
			})
		}
	}

}

module.exports = PaketController
