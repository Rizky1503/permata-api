'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Gambar = use('App/Models/gambarproduk')
const Mitra = use('App/Models/Mitra')

class Product extends Model {

	static get table () {
		return 'in_produk'
	}
	
	static get primaryKey () {
		return 'id_produk'
	}

	static boot () {
	    super.boot()
	    this.addTrait('@provider:Lucid/Slugify', {
	      fields: { slug: 'nama_produk' },
	      strategy: 'dbIncrement',
	      disableUpdates: false
	    })
  	}


  	Category () {
	    return this.hasOne('App/Models/Category')
	}

	gambarproduk (){
		return this.hasMany(Gambar, 'id_produk','id_produk')
	}

	mitra (){
		return this.hasOne(Mitra, 'id_mitra','id_mitra')
	}
}

module.exports = Product
