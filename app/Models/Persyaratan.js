'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Persyartan extends Model {

	static get table () {
		return 'in_persyaratan'
	}
	
	static get primaryKey () {
		return 'id_persyaratan'
	}
}

module.exports = Persyartan
