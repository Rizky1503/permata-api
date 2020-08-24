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


Route.group(() => {

	Route.get('listkategori', 'Belanja/BelanjaController.listkategori')
	Route.get('flag', 'Belanja/BelanjaController.flag')
	Route.get('sub_kategori', 'Belanja/BelanjaController.sub_kategori')
	Route.post('simpankategori', 'Belanja/BelanjaController.simpankategori')

	Route.get('detail', 'Belanja/BelanjaController.detail_produk')
	Route.get('test', 'Belanja/BelanjaController.test')


}).prefix('api/v1/cs/belanja')
