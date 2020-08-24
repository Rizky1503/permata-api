'use strict'
const Database = use('Database')

class NotificationController {

	async member ({params, response}) {
	
		let Count = await Database.from('in_notifikasi_member')	
			.where('id_user_receive_notifikasi', params.id_user)		
			.where('status_notifikasi', 'Baru')
			.count()
			.first()

		let Data = await Database.from('in_notifikasi_member')	
			.where('id_user_receive_notifikasi', params.id_user)		
			.orderBy('id_notifikasi','DESC')
			.where('status_notifikasi', 'Baru')
			.limit(3)

		return response.json({
			Count: Count,
			Data: Data,
		})	

	}

	async member_update ({params, response}) {
	
		let Remove = await Database.from('in_notifikasi_member')	
			.where('id_notifikasi', params.id_notification)		
			.update({
				status_notifikasi:'Tidak'
			})
		let Data = await Database.from('in_notifikasi_member')	
			.where('id_notifikasi', params.id_notification)		
			.first()
						
		return response.json(Data)	

	}


	async jadwal_reminder ({params, response}) {
		
		let Count = await Database.from('in_pertemuan')	
			.where('in_pertemuan.id_user_order', params.id_user)
			.whereNull('status')
			.whereNotNull('absen_guru')
			.count()
			.first()
		
		if (Count.count > 0) {
			let List = await Database.from('in_pertemuan')	
				.select('in_pertemuan.*','in_pelanggan.nama as nama_pelanggan','in_mitra.nama as nama_mitra', 'in_order.keterangan')			
				.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
				.innerJoin('in_mitra', 'in_pertemuan.id_mitra', 'in_mitra.id_mitra')
				.innerJoin('in_order', 'in_pertemuan.id_invoice', 'in_order.id_order')
				.where('in_pertemuan.id_user_order', params.id_user)
				.whereNull('status')
				.whereNotNull('absen_guru')
				.limit(1)
				.orderBy('id_pertemuan','ASC')		
				.first()	

			return response.json({
				Count:Count.count,
				List:List
			})

		}else{
			return response.json({
				Count:Count.count,
				List:""
			})

		}
	}


	async jadwal_reminder_guru ({params, response}) {
		
		let Count = await Database.from('in_pertemuan')	
			.where('in_pertemuan.id_mitra', params.id_mitra)
			.whereNull('status')
			.count()
			.first()
		
		if (Count.count > 0) {
			let List = await Database.from('in_pertemuan')	
				.select('in_pertemuan.*','in_pelanggan.nama as nama_pelanggan','in_mitra.nama as nama_mitra', 'in_order.keterangan')			
				.innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
				.innerJoin('in_mitra', 'in_pertemuan.id_mitra', 'in_mitra.id_mitra')
				.innerJoin('in_order', 'in_pertemuan.id_invoice', 'in_order.id_order')
				.where('in_pertemuan.id_mitra', params.id_mitra)
				.whereNull('status')
				.limit(1)
				.orderBy('id_pertemuan','ASC')		
				.first()	

			return response.json({
				Count:Count.count,
				List:List
			})

		}else{
			return response.json({
				Count:Count.count,
				List:""
			})

		}
	}

	async disabled_notification ({params, response}) {
		
		let Data = await Database.from('in_notifikasi_member')	
			.where('id_user_receive_notifikasi', params.id_user)
			.update({
				status_notifikasi:'Tidak'
			})
	}
	
}

module.exports = NotificationController
