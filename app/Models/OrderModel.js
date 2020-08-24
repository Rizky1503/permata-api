'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderModel extends Model {

    static get table() {
        return 'in_order'
    }

    static get primaryKey() {
        return 'id_order'
    }
}

module.exports = OrderModel