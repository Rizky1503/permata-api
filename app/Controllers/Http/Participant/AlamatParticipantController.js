'use strict'
const AlamatParticipant = use('App/Models/AlamatParticipant')


class AlamatParticipantController {

	async index ({response}) {
	
		let alamatparticipant = await AlamatParticipant.all()
		return response.json(alamatparticipant)
	}



	async store ({request, response}) {
		const alamatparticipantInfo = request.only(['id_participant', 'nama_penerima', 'no_telpon_penerima', 'alamat', 'negara', 'provinsi', 'kota', 'kecamatan', 'kode_pos'])
		const alamatparticipant 				= new AlamatParticipant()
		alamatparticipant.id_participant 		= alamatparticipantInfo.id_participant
		alamatparticipant.nama_penerima			= alamatparticipantInfo.nama_penerima
		alamatparticipant.no_telpon_penerima 	= alamatparticipantInfo.no_telpon_penerima
		alamatparticipant.alamat 				= alamatparticipantInfo.alamat
		alamatparticipant.negara 				= alamatparticipantInfo.negara
		alamatparticipant.provinsi 				= alamatparticipantInfo.provinsi
		alamatparticipant.kota 					= alamatparticipantInfo.kota
		alamatparticipant.kecamatan 			= alamatparticipantInfo.kecamatan
		alamatparticipant.kode_pos 				= alamatparticipantInfo.kode_pos
		await alamatparticipant.save()
		return response.status(201).json(alamatparticipant)		
	}


	async show ({params, response}) {
		const alamatparticipant = await AlamatParticipant.find(params.id)
		return response.json(alamatparticipant)
	}


	async update ({params, request, response}) {
		const alamatparticipantInfo = request.only(['id_participant', 'nama_penerima', 'no_telpon_penerima', 'alamat', 'negara', 'provinsi', 'kota', 'kecamatan', 'kode_pos'])
		const alamatparticipant 		= await AlamatParticipant.find(params.id)
		if (!alamatparticipant) {
			return response.status(404).json({data: 'Resource not found'})
		}
		alamatparticipant.id_participant 		= alamatparticipantInfo.id_participant
		alamatparticipant.nama_penerima			= alamatparticipantInfo.nama_penerima
		alamatparticipant.no_telpon_penerima 	= alamatparticipantInfo.no_telpon_penerima
		alamatparticipant.alamat 				= alamatparticipantInfo.alamat
		alamatparticipant.negara 				= alamatparticipantInfo.negara
		alamatparticipant.provinsi 				= alamatparticipantInfo.provinsi
		alamatparticipant.kota 					= alamatparticipantInfo.kota
		alamatparticipant.kecamatan 			= alamatparticipantInfo.kecamatan
		alamatparticipant.kode_pos 				= alamatparticipantInfo.kode_pos
		await alamatparticipant.save()
		return response.status(200).json(alamatparticipant)
	}


	async delete ({params, response}) {

		const alamatparticipant 		= await AlamatParticipant.find(params.id)
		if (!alamatparticipant) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await alamatparticipant.delete()
		return response.status(204).json(null)
	}
}

module.exports = AlamatParticipantController
