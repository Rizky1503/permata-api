'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const Helpers = use('Helpers')

//Tryout Examp Bimbel Online
Route.group(() => {

    Route.get('list_kategori', 'Web/Belanja/BelanjaController.kategori')
    Route.get('list_produk', 'Web/Belanja/BelanjaController.produk')
    Route.get('gambar_produk', 'Web/Belanja/BelanjaController.gambar_produk')
    Route.get('detail/:id', 'Web/Belanja/BelanjaController.detail_produk')
    Route.post('keranjang/:id', 'Web/Belanja/BelanjaController.keranjang')
    Route.get('list_keranjang/:id/:id_mr', 'Web/Belanja/BelanjaController.list_keranjang')
    Route.get('cek_keranjang/:id_pr/:id_pg', 'Web/Belanja/BelanjaController.cek_keranjang')
    Route.post('update_keranjang', 'Web/Belanja/BelanjaController.update_keranjang')
    Route.get('list_keranjang_mitra/:id', 'Web/Belanja/BelanjaController.list_keranjang_mitra')
    Route.get('provinsi', 'Web/Belanja/BelanjaController.provinsi')
    Route.get('kota/:id', 'Web/Belanja/BelanjaController.kota')
    Route.get('kode_pos/:id', 'Web/Belanja/BelanjaController.kode_pos')
    Route.post('pembayaran', 'Web/Belanja/BelanjaController.pembayaran')
    Route.get('list_bayar/:id_pg/:id_mr/:id_inv', 'Web/Belanja/BelanjaController.list_bayar')
    Route.post('update_order', 'Web/Belanja/BelanjaController.update_order')
    Route.post('hapus_produk', 'Web/Belanja/BelanjaController.hapus_produk')



}).prefix('api/v1/frontend/belanja')