'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Participant extends Model {

	static get table () {
		return 'in_pelanggan'
	}
	
	static get primaryKey () {
		return 'id_pelanggan'
	}
}

module.exports = Participant
