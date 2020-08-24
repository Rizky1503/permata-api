'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Harga extends Model {

	static get table () {
		return 'in_harga'
	}
	
	static get primaryKey () {
		return 'id_harga'
	}
}

module.exports = Harga
