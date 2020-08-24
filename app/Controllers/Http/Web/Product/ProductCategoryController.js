'use strict'
const Database = use('Database')

class ProductCategoryController {

	async index ({response}) {
		let category = await Database.from('in_ms_kategori')
						.select('id_master_kategori','kategori','sub_kategori','flag','icon')
						.where('flag', 'Product')
		return response.json(category)
	}
}

module.exports = ProductCategoryController
