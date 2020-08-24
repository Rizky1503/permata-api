'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Permision extends Model {

	static get table () {
		return 'in_merchant_permision'
	}
	
	static get primaryKey () {
		return 'id_permision'
	}
}

module.exports = Permision
