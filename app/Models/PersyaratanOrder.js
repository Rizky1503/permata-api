'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PersyartanOrder extends Model {

	static get table () {
		return 'in_persyaratan_order'
	}
	
	static get primaryKey () {
		return 'id_persyaratan_order'
	}
}

module.exports = PersyartanOrder
