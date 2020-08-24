'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Alamat extends Model {

	static get table () {
		return 'in_alamat'
	}
	
	static get primaryKey () {
		return 'id'
	}
}

module.exports = Alamat
