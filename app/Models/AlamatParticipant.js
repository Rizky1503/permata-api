'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AlamatParticipant extends Model {

	static get table () {
		return 'in_alamat_participant'
	}
	
	static get primaryKey () {
		return 'id_alamat_participant'
	}
}

module.exports = AlamatParticipant
