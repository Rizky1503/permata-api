'use strict'
const PersyartanOrder = use('App/Models/PersyaratanOrder')
const Database = use('Database')


class PersyaratanOrderController {

	async index ({response}) {
		let persyartanOrder = await PersyartanOrder.all()
		return response.json(persyartanOrder)
	}

	async store ({request, response}) {
		const p_orderInfo = request.only(['id_mitra', 'nama_produk', 'syarat', 'value_syarat', 'status'])
		const persyartanOrder = new PersyartanOrder()
		persyartanOrder.id_mitra = p_orderInfo.id_mitra
		persyartanOrder.nama_produk = p_orderInfo.nama_produk
		persyartanOrder.syarat = p_orderInfo.syarat
		persyartanOrder.value_syarat = 	p_orderInfo.value_syarat
		persyartanOrder.status = p_orderInfo.status
		await persyartanOrder.save()
		return response.status(201).json(persyartanOrder)		
	}

}

module.exports = PersyaratanOrderController
