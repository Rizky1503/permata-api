'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Pertemuan extends Model {

    static get table() {
        return 'in_pertemuan'
    }

    static get primaryKey() {
        return 'id_pertemuan'
    }
}

module.exports = Pertemuan