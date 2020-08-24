'use strict'

const Task = use('Task')

class ChangeStatusOrder extends Task {
  static get schedule () {
    return '0 */1 * * * *'
  }

  async handle () {
  	return "adada";
    this.info('Task ChangeStatusOrder handle')
  }
}

module.exports = ChangeStatusOrder
