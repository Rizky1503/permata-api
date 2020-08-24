	'use strict'
const Admin = use('App/Models/Admin')


class AdminController {

	async index ({response}) {

		let admin = await Admin.all()
		return response.json(admin)
	}

	async store ({request, response}) {

		const adminInfo       =  request.only(['nip', 'no_telpon', 'TTL', 'jenis_kelamin', 'id_role', 'alamat', 'negara', 'provinsi', 'kota', 'kecamatan', 'kode_pos'])
		const admin 	 	  =  new Admin()
		admin.nip	 		  =  adminInfo.nip
		admin.no_telpon	 	  =  adminInfo.no_telpon
		admin.TTL	 	      =  adminInfo.TTL
		admin.jenis_kelamin	  =  adminInfo.jenis_kelamin
		admin.id_role	 	  =  adminInfo.id_role
		admin.alamat	 	  =  adminInfo.alamat
		admin.negara	 	  =  adminInfo.negara
		admin.provinsi	 	  =  adminInfo.provinsi
		admin.kota	 		  =  adminInfo.kota
		admin.kecamatan	 	  =  adminInfo.kecamatan
		admin.kode_pos	 	  =  adminInfo.kode_pos
		await admin.save()
		return response.status(201).json(admin)		
	}


	async show ({params, response}) {
	
		const admin = await Admin.find(params.id)
		return response.json(admin)
	
	}


	async update ({params, request, response}) {

		const adminInfo       =  request.only(['nip', 'no_telpon', 'TTL', 'jenis_kelamin', 'id_role', 'alamat', 'negara', 'provinsi', 'kota', 'kecamatan', 'kode_pos'])
		const admin = await Admin.find(params.id)
		if (!admin) {
			return response.status(404).json({data: 'Resource not found'})
		}
		admin.nip	 		  =  adminInfo.nip
		admin.no_telpon	 	  =  adminInfo.no_telpon
		admin.TTL	 	      =  adminInfo.TTL
		admin.jenis_kelamin	  =  adminInfo.jenis_kelamin
		admin.id_role	 	  =  adminInfo.id_role
		admin.alamat	 	  =  adminInfo.alamat
		admin.negara	 	  =  adminInfo.negara
		admin.provinsi	 	  =  adminInfo.provinsi
		admin.kota	 		  =  adminInfo.kota
		admin.kecamatan	 	  =  adminInfo.kecamatan
		admin.kode_pos	 	  =  adminInfo.kode_pos
		await admin.save()
		return response.status(201).json(admin)	
	}


	async delete ({params, response}) {

		const admin = await Admin.find(params.id)
		if (!admin) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await admin.delete()
		return response.status(204).json(null)
	}
}

module.exports = AdminController
