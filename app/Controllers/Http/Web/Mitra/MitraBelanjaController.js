'use strict'
const Database = use('Database')
const Helpers = use('Helpers')

class MitraBelanjaController {

	
    async list_konfirmasi ({response,params}) {
        const list = await Database
            .select('in_basket.*','in_produk.nama_produk','in_pelanggan.nama')
            .from('in_basket')
            .innerJoin('in_produk','in_basket.id_produk','in_produk.id_produk')
            .leftJoin('in_pelanggan','in_basket.id_pelanggan','in_pelanggan.id_pelanggan')
            .where('status_stock','Menunggu')
            .where('in_basket.id_mitra',params.id)
            .orderBy('in_basket.updated_at','ASC')
        return response.json(list)
    }

    async tersedia ({request,response}){
        const tersediaInfo = request.only(['id_pelanggan','id_produk','status'])
        const tersedia = await Database
            .table('in_basket')
            .where('id_pelanggan',tersediaInfo.id_pelanggan)
            .where('id_produk',tersediaInfo.id_produk)
            .where('status_stock','Menunggu')
            .update('status_stock',tersediaInfo.status)
    }

    async kosong ({request,response}){
        const tersediaInfo = request.only(['id_pelanggan','id_produk','status'])
        const tersedia = await Database
            .table('in_basket')
            .where('id_pelanggan',tersediaInfo.id_pelanggan)
            .where('id_produk',tersediaInfo.id_produk)
            .where('status_stock','Menunggu')
            .delete()
    }

    async kurang ({request,response}){
        const tersediaInfo = request.only(['id_pelanggan','id_produk','status','tersedia'])
        const tersedia = await Database
            .table('in_basket')
            .where('id_pelanggan',tersediaInfo.id_pelanggan)
            .where('id_produk',tersediaInfo.id_produk)
            .where('status_stock','Menunggu')
            .update('status_stock',tersediaInfo.status)
            .update('stok_tersedia',tersediaInfo.tersedia)
            .update('qty',tersediaInfo.tersedia)
    }

    async list_order ({ response, params }){
        const list_order = await Database
            .select('*')
            .from('in_order')
            .where('id_mitra',params.id)
            .where('product','Belanja')
            .where('status_order','In Progres')
            .orderBy('updated_at','ASC')
        return response.json(list_order)
    }

    async list_produk ({ response,params }){
        const list_produk = await Database
            .select('in_produk.nama_produk','in_basket.qty','in_basket.harga','in_basket.total_harga')
            .from('in_basket')
            .innerJoin('in_produk','in_basket.id_produk','in_produk.id_produk')
            .where('id_invoice',params.id)
            .where('status','Bayar')
            .orderBy('in_basket.updated_at','ASC')
        return response.json(list_produk)
    }

    async update_resi ({ response,params,request }){
        const updateInfo = request.only(['resi'])
        const update_resi = await Database
            .table('in_order')
            .where('id_order',params.id)
            .update('no_resi',updateInfo.resi)
            .update('status_order','DiKirim')
    }

}

module.exports = MitraBelanjaController