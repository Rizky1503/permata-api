'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Admin extends Model {

	static get table () {
		return 'in_user'
	}
	
	static get primaryKey () {
		return 'nip'
	}
}

module.exports = Admin
