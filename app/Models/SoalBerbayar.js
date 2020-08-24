'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SoalBerbayar extends Model {

	static get table () {
		return 'in_soal_langganan'
	}
	
	static get primaryKey () {
		return 'id_soal'
	}
}

module.exports = SoalBerbayar
