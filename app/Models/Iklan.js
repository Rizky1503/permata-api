'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Iklan extends Model {

	static get table () {
		return 'in_iklan'
	}
	
	static get primaryKey () {
		return 'id_iklan'
	}
}

module.exports = Iklan
