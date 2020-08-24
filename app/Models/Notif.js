'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Notif extends Model {

    static get table() {
        return 'in_notifikasi'
    }

    static get primaryKey() {
        return 'id_notifikasi'
    }
}

module.exports = Notif