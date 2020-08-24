'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Payment extends Model {

    static get table() {
        return 'in_payment'
    }

    static get primaryKey() {
        return 'id_invoice'
    }
}

module.exports = Payment