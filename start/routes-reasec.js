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
	// kategori
	Route.get('TampilKatergori','ReasecController.TampilKatergori')
	Route.post('StoreKatergori','ReasecController.StoreKatergori')
	Route.get('EditKategori/:id','ReasecController.EditKategori')
	Route.post('UpdateKategori','ReasecController.UpdateKategori')
	Route.get('DeletedKategori/:id','ReasecController.DeletedKategori')
	
	// content
	Route.get('TampilContent','ReasecController.TampilContent')
	Route.post('StoreContent','ReasecController.StoreContent')
	Route.post('UpdateContent','ReasecController.UpdateContent')

	// Rekomendasi
	Route.get('TampilRekomendasi','ReasecController.TampilRekomendasi')
	Route.post('StoreRekomendasi','ReasecController.StoreRekomendasi')
	Route.post('UpdateRekomendasi','ReasecController.UpdateRekomendasi')

}).prefix('api/v2/riasec').namespace('Reasec/backend')

