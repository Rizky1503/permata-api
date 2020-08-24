'use strict'
const Harga = use('App/Models/Harga')


class HargaController {

	async index ({response}) {
	
		let harga = await Harga.all()
		return response.json(harga)
	}


	async store ({request, response}) {

		const hargaInfo    = request.only(['id_produk','hari', 'jam', 'jenis', 'harga', 'dp', 'over_time', 'keterangan', 'id_fasilitas'])
		const harga 	   = new Harga()
		
		harga.id_produk    = hargaInfo.id_produk
		harga.hari 		   = hargaInfo.hari
		harga.jam 		   = hargaInfo.jam
		harga.jenis 	   = hargaInfo.jenis
		harga.harga 	   = hargaInfo.harga
		harga.dp 		   = hargaInfo.dp
		harga.over_time    = hargaInfo.over_time
		harga.keterangan   = hargaInfo.keterangan
		harga.id_fasilitas = hargaInfo.id_fasilitas

		await harga.save()
		return response.status(201).json(harga)	

	}


	async show ({params, response}) {
	
		const harga = await Harga.find(params.id)
		return response.json(harga)
	
	}


	async update ({params, request, response}) {

		const hargaInfo 	= request.only(['id_produk','hari', 'jam', 'jenis', 'harga', 'dp', 'over_time', 'keterangan', 'id_fasilitas'])
		const harga 		= await Harga.find(params.id)
		if (!harga) {
			return response.status(404).json({data: 'Resource not found'})
		}

		harga.id_produk 	= hargaInfo.id_produk
		harga.hari			= hargaInfo.hari
		harga.jam 			= hargaInfo.jam
		harga.jenis 		= hargaInfo.jenis
		harga.harga 		= hargaInfo.harga
		harga.dp 			= hargaInfo.dp
		harga.over_time 	= hargaInfo.over_time
		harga.keterangan 	= hargaInfo.keterangan
		harga.id_fasilitas  = hargaInfo.id_fasilitas

		await harga.save()
		return response.status(200).json(harga)
	}


	async delete ({params, response}) {

		const harga = await Harga.find(params.id)
		if (!harga) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await harga.delete()
		return response.status(204).json(harga)
	}
}

module.exports = HargaController
