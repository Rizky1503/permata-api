'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Matpel extends Model {

	static get table () {
		return 'in_matpel'
	}
	
	static get primaryKey () {
		return 'id_matpel'
	}
}

module.exports = Matpel
