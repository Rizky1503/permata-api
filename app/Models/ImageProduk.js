'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ImageProduk extends Model {

	static get table () {
		return 'in_gambar_produk'
	}
	
	static get primaryKey () {
		return 'id_gambar'
	}
}

module.exports = ImageProduk
