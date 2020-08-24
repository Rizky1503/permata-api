'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Kategoribelanja extends Model {

    static get table() {
        return 'in_ms_kategori_belanja'
    }

    static get primaryKey() {
        return 'id_master_kategori'
    }
}

module.exports = Kategoribelanja