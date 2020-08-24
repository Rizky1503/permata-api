'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Rated extends Model {

	static get table () {
		return 'in_rated'
	}
	
	static get primaryKey () {
		return 'id_rated'
	}
}

module.exports = Rated
