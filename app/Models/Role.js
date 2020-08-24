'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Role extends Model {

	static get table () {
		return 'in_role'
	}
	
	static get primaryKey () {
		return 'id_role'
	}
}

module.exports = Role
