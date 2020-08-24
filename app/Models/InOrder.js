'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CsPrivateDeal extends Model {

    static get table() {
        return 'in_order_deal'
    }

    static get primaryKey() {
        return 'id_order_deal'
    }
}

module.exports = CsPrivateDeal