'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Mitra extends Model {

	static get table () {
		return 'in_mitra'
	}
	
	static get primaryKey () {
		return 'id_mitra'
	}
}

module.exports = Mitra
