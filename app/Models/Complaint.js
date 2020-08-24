'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Complaint extends Model {

	static get table () {
		return 'in_complaint'
	}
	
	static get primaryKey () {
		return 'id_complaint'
	}
}

module.exports = Complaint
