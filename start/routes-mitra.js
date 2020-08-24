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

//Product mitra
Route.group(() => {
    // homepage
    Route.get('list/:id', 'webDesktop/Mitra/ProductController.index')
    Route.get('listcategory', 'webDesktop/Mitra/ProductController.category')
    Route.get('listcategory_home/:id_mitra', 'webDesktop/Mitra/ProductController.listcategory_home')
    Route.get('list-product-all/:id_mitra', 'webDesktop/Mitra/ProductController.listProductAll')
    Route.get('list-product/:id_mitra/:id_kategori', 'webDesktop/Mitra/ProductController.listProduct')
    Route.get('product-privat/:slug', 'webDesktop/Mitra/ProductController.ProductPrivat')
}).prefix('api/v1/mitra/web-desktop/')

//Product mitra
Route.group(() => {
    Route.get('category', 'Web/Product/ProductCategoryController.index')

    //private
    Route.get('list/:id', 'Web/Product/PrivateController.index')
    Route.post('privat', 'Web/Product/PrivateController.store')
    Route.get('privat/check/:id', 'Web/Product/PrivateController.check')
    Route.get('kelas', 'Web/Product/PrivateController.kelas')
    Route.get('kelas/:id', 'Web/Product/PrivateController.matpel')
    Route.post('save', 'Web/Product/PrivateController.storeProduct')
    Route.post('harga', 'Web/Product/PrivateController.harga')
    Route.post('private/search', 'Web/Product/PrivateController.search')
    Route.post('private/order', 'Web/Product/PrivateController.order')
    Route.post('private/order/request', 'Web/Product/PrivateController.orderRequest')
    Route.get('private/absen/:id_pertemuan', 'Web/Product/PrivateController.absenPrivat')

    Route.get('private/semua_jadwal/:id_mitra', 'Web/Product/PrivateController.semua_jadwal')
    Route.get('private/semua_jadwal_history/:id_mitra', 'Web/Product/PrivateController.semua_jadwal_history')


    //mitra
    Route.get('mitra/:id', 'Web/Product/MitraController.index')
    Route.get('mitra/list/:id', 'Web/Product/MitraController.list')

}).prefix('api/v1/web/mitra/product/')

//Mitra Belanja
Route.group(() => {
    Route.get('list_konfirmasi/:id', 'Web/Mitra/MitraBelanjaController.list_konfirmasi')
    Route.post('tersedia', 'Web/Mitra/MitraBelanjaController.tersedia')
    Route.post('kosong', 'Web/Mitra/MitraBelanjaController.kosong')
    Route.post('kurang', 'Web/Mitra/MitraBelanjaController.kurang')
    Route.get('list_order/:id', 'Web/Mitra/MitraBelanjaController.list_order')
    Route.get('list_produk/:id', 'Web/Mitra/MitraBelanjaController.list_produk')
    Route.post('update_resi/:id', 'Web/Mitra/MitraBelanjaController.update_resi')

}).prefix('api/v1/web/mitra/belanja/')


//Tryout Examp Bimbel Online
Route.group(() => {
    // pembahasan
    Route.get('jadwal_reminder/:id_mitra', 'Notification/NotificationController.jadwal_reminder_guru')

}).prefix('api/v1/notification/guru/')