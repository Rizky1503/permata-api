'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')
const moment = require('moment');


class ListController {

	async list ({request, response}) {

		const data = request.only(['page', 'id_pelanggan']);
		const id_pelanggan	= data.id_pelanggan
		const page  		= data.page
		const limit     	= 5

		const List = await Database
		.table('v2.tscn_order_notification')
		.where('id_pelanggan', id_pelanggan)
		.orWhere('to', 'All')
		.orderBy('created_at','DESC')
		.paginate(page,limit)

	    return response.json({
			status : 'true',
			responses : '200',
			data:List.data			
		})
	}
	
}

module.exports = ListController
