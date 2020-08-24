'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Product = use('App/Models/Product')
const Mitra = use('App/Models/Mitra')

class Basket extends Model {

	static get table () {
		return 'in_basket'
	}
	
	static get primaryKey () {
		return 'id_keranjang'
	}

	relationProduk (){
		return this.hasOne(Product, 'id_produk','id_produk')
	}

	
}

module.exports = Basket
