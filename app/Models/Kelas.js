'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Kelas extends Model {

    static get table() {
        return 'in_kelas_online'
    }

    static get primaryKey() {
        return 'id_kelas'
    }
}

module.exports = Kelas