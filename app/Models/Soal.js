'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Role extends Model {

	static get table () {
		return 'in_soal'
	}
	
	static get primaryKey () {
		return 'id_soal'
	}
}

module.exports = Role
