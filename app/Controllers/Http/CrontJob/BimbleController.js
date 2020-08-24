'use strict'
const Database = use('Database')
const moment = require('moment');
const {push_notification} = use('App/Helpers')

class BimbleController {

	async expiredBimbel ({params, response}) {	  	
		const ChangeStatusOrder = await Database.raw("select * from in_order where status_order ='In Progres' AND product = 'BO' AND to_char(expired_bimbel_online, 'YYYY-MM-DD') <= '"+moment().format('YYYY-MM-DD')+"'")
		// const ChangeStatusOrder = await Database.raw("select * from in_order where id_user_order='PG202001271000000050' AND product = 'BO' AND to_char(expired_bimbel_online, 'YYYY-MM-DD') <= '"+moment().format('YYYY-MM-DD')+"'")
		// return Cha
		for (var i = 0; i < ChangeStatusOrder.rows.length; i++) {
			const changeStatus = await Database
				.table('in_order')
			  	.where('id_order', ChangeStatusOrder.rows[i].id_order)
			  	.update({
			  		status_order: 'Close'
			  	})
			const getPaket = await Database
				.select('id_paket','id_kelas','nama_paket')
			  	.table('in_soal_langganan_paket')
			  	.where('id_paket', ChangeStatusOrder.rows[i].id_package_user)
			  	.first()			
			const getPelanggan = await Database
			  	.table('in_pelanggan')
			  	.where('id_pelanggan', ChangeStatusOrder.rows[i].id_user_order)
			  	.first()
			const insertNotification = await Database
				.table('in_notifikasi_member')
			  	.insert({
			  		id_user_request_notifikasi: ChangeStatusOrder.rows[i].id_user_order,
			  		id_invoice: ChangeStatusOrder.rows[i].id_order,
			  		produk_notifikasi: 'BO',
			  		status_notifikasi: 'Baru',
			  		keterangan: 'Hi '+getPelanggan.nama+', Paket Berlangganan '+getPaket.nama_paket+' Kamu sudah berakhir',
			  		created_at: new Date(),
			  		updated_at: new Date(),
			  		
			  	})
			push_notification(ChangeStatusOrder.rows[i].id_user_order,'Paket Berlangganan Bimbel Online Berakhir','Hi '+getPelanggan.nama+', Paket Berlangganan '+getPaket.nama_paket+' Kamu sudah berakhir','','AllNotification','')
		}
		return response.status(200).json({
			status: 201,
			message: 'crontjob has been running data '+ChangeStatusOrder.rows.length+' success update',
	  	})				
	}

	async reminderBimbelOneDay ({params, response}) {	  	
		const ChangeStatusOrder = await Database.raw("select * from in_order where status_order ='In Progres' AND product = 'BO' AND to_char(expired_bimbel_online, 'YYYY-MM-DD') <= '"+moment().format('YYYY-MM-DD')+"'")
		for (var i = 0; i < ChangeStatusOrder.rows.length; i++) {
			const getPaket = await Database
				.select('id_paket','id_kelas','nama_paket')
			  	.table('in_soal_langganan_paket')
			  	.where('id_paket', ChangeStatusOrder.rows[i].id_package_user)
			  	.first()			
			const getPelanggan = await Database
			  	.table('in_pelanggan')
			  	.where('id_pelanggan', ChangeStatusOrder.rows[i].id_user_order)
			  	.first()
			const insertNotification = await Database
				.table('in_notifikasi_member')
			  	.insert({
			  		id_user_request_notifikasi: ChangeStatusOrder.rows[i].id_user_order,
			  		id_invoice: ChangeStatusOrder.rows[i].id_order,
			  		produk_notifikasi: 'BO',
			  		status_notifikasi: 'Baru',
			  		keterangan: 'Hi '+getPelanggan.nama+', Paket Berlangganan '+getPaket.nama_paket+' Kamu akan berakhir hari ini',
			  		created_at: new Date(),
			  		updated_at: new Date(),
			  		
			  	})
			push_notification(ChangeStatusOrder.rows[i].id_user_order,'Paket Berlangganan Bimbel Online Berakhir hari ini','Hi '+getPelanggan.nama+', Paket Berlangganan '+getPaket.nama_paket+' Kamu akan berakhir hari ini','','BimbelOnline','')
		}
		return response.status(200).json({
			status: 201,
			message: 'crontjob has been running data '+ChangeStatusOrder.rows.length+' success reminder',
	  	})				
	}
	
}

module.exports = BimbleController
