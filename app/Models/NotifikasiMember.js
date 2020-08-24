'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class NotifikasiMember extends Model {

    static get table() {
        return 'in_notifikasi_member'
    }

    static get primaryKey() {
        return 'id_notifikasi'
    }
}

module.exports = NotifikasiMember