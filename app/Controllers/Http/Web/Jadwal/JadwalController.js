'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class JadwalController {

	async index ({params, response}) {

		let List = await Database.from('in_jadwal')			
				.where('id_pelanggan', params.id_user)				
				.where('id_order', params.invoice)				

		return response.json(List)
	}

	
	async absen ({params, response}) {

		let List = await Database.from('in_jadwal')			
				.where('id_pelanggan', params.id_user)				
				.where('id_order', params.invoice)				

		return response.json(params.id_jadwal)
	}

}

module.exports = JadwalController
