'use strict'
const Alamat = use('App/Models/Alamat')


class AlamatController {

	async provinsi ({response}) {
	
		// let alamat = await Alamat.all()
		let provinsi = await Alamat
		.query()
		.select('provinsi')
		.groupBy('provinsi')
		.pluck('provinsi')
		
		return response.json(provinsi)
	}



	async kota ({params, response}) {
		let kota = await Alamat
		.query()
		.select('kota')
		.where('provinsi', '=', params.id.replace(/%20/g, ' '))
		.groupBy('kota')
		.pluck('kota')

		return response.json(kota)
	
	}

	async kecamatan ({params, response}) {
	
		let kecamatan = await Alamat
		.query()
		.select('kecamatan')
		.where('kota', '=', params.id.replace(/%20/g, ' '))
		.groupBy('kecamatan')
		.pluck('kecamatan')

		return response.json(kecamatan)
	
	}

	async kode_pos ({params, response}) {
	
		let kode_pos = await Alamat
		.query()
		.select('kode_pos')
		.where('kecamatan', '=', params.id.replace(/%20/g, ' '))
		.groupBy('kode_pos')
		.pluck('kode_pos')
		return response.json(kode_pos)	

	}
	
}

module.exports = AlamatController
