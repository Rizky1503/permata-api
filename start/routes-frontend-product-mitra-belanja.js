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

    Route.get('persyaratan/:id_mitra/:id_mitra_produk', 'Web/Frontend/BelanjaController.persyaratan')
    Route.post('persyaratan_store', 'Web/Frontend/BelanjaController.persyaratan_store')
    Route.post('list_product', 'Web/Frontend/BelanjaController.list_product')
    Route.get('create_first/:id_mitra', 'Web/Frontend/BelanjaController.create_first')
    Route.post('store_product_belanja', 'Web/Frontend/BelanjaController.store_product_belanja')
    
    // form belanja product
    Route.get('list_category', 'Web/Frontend/BelanjaController.list_category')
    Route.get('list_sub_category/:sub_id', 'Web/Frontend/BelanjaController.list_sub_category')
    Route.get('list_sub__sub_category/:sub_id', 'Web/Frontend/BelanjaController.list_sub__sub_category')

    //images
    Route.post('store_image_product', 'Web/Frontend/BelanjaController.store_image_product')
    Route.post('remove_image_product', 'Web/Frontend/BelanjaController.remove_image_product')
    Route.get('remove_all_image_product/:id', 'Web/Frontend/BelanjaController.remove_all_image_product')
    Route.get('edit/:id', 'Web/Frontend/BelanjaController.edit')
    Route.get('gambar/:id', 'Web/Frontend/BelanjaController.gambar')
    

}).prefix('api/v1/frontend/mitra/belanja')