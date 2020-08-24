'use strict'
const Matpel = use('App/Models/Matpel')


class MatpelController {

	async index ({response}) {

		let matpel = await Matpel
			.query()
			.select('kategori','kelas')
			.groupBy('kategori','kelas')
			.fetch()
		return response.json(matpel)
	}

	async mapel ({params, response}) {

		let matpel = await Matpel
			.query()
			.where('kelas', '=', params.id.replace('%20', ' '))
			.fetch()
		return response.json(matpel)
	}
}

module.exports = MatpelController
