'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderMerchant extends Model {

	static get table () {
		return 'in_order_merchant'
	}
	
	static get primaryKey () {
		return 'id_order_merchant'
	}
}

module.exports = OrderMerchant
