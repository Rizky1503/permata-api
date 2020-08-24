'use strict'
const OrderMerchant = use('App/Models/OrderMerchant')
const Database = use('Database')


class OrderController {

	async index ({params, response}) {

		// return params;
		let order_merchant = await Database.from('in_order_merchant').where('id_matpel', params.id_matpel)
		return response.json(order_merchant)

		// const orderInfo 		= request.only(['id_merchant', 'id_product', 'id_matpel'])
		// const order 			= new OrderMerchant()
		// order.id_merchant 		= orderInfo.id_merchant
		// order.id_product 		= orderInfo.id_product
		// order.id_matpel 			= orderInfo.id_matpel
		// await order.save()
		// return response.status(201).json(order)		
	}


	async store ({request, response}) {

		const orderInfo 		= request.only(['id_merchant', 'id_product', 'id_matpel'])
		const order 			= new OrderMerchant()
		order.id_merchant 		= orderInfo.id_merchant
		order.id_product 		= orderInfo.id_product
		order.id_matpel 			= orderInfo.id_matpel
		await order.save()
		return response.status(201).json(order)		
	}

}

module.exports = OrderController
