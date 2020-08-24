'use strict'
const Database = use('Database')

class OrderController {

	async crontJobExpired ({params, response}) {

		const ChangeStatusOrder = await Database.raw("UPDATE in_order SET status_order = 'Rejected' WHERE status_order = 'Pending' OR status_order = 'Cek_Pembayaran' AND expired_date <= current_timestamp - interval '2880 minutes'")

		return response.status(200).json({
			status: 201,
			message: 'crontjob has been running '+ChangeStatusOrder.rowCount+' data success update',
	  	})				
	}
	
}

module.exports = OrderController
