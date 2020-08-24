'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UploadDokumen extends Model {

	static get table () {
		return 'in_dokument_merchant'
	}
	
	static get primaryKey () {
		return 'id_doc'
	}
}

module.exports = UploadDokumen
