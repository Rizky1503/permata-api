'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Merchant extends Model {

	static get table () {
		return 'in_merchant'
	}
	
	static get primaryKey () {
		return 'id_merchant'
	}
}

module.exports = Merchant
