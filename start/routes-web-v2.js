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
	Route.get('ringkasan','HomeController.GetRingkasanMateriRandom')
	Route.get('soal','HomeController.GetSoalRandom')
}).prefix('api/v2/web').namespace('v2/Web')

Route.group(() => {
	Route.post('filter','TransaksiController.filter')
	Route.post('check/paket','TransaksiController.CheckPaket')
	Route.post('list/listTrans','TransaksiController.listTrans')
	Route.post('list/paket','TransaksiController.list')
	Route.post('order/status','TransaksiController.Status')	
	Route.post('order/requested','TransaksiController.Requested')	
	Route.post('order/paymentList','TransaksiController.paymentList')	
	Route.post('order/paymentSubmit','TransaksiController.paymentSubmit')	
	Route.post('order/changeMethod','TransaksiController.changeMethod')	
	Route.post('order/buktiPembayaran','TransaksiController.buktiPembayaran')
	Route.post('Download/destkop','TransaksiController.DownloadDestkop')
}).prefix('api/v2/web/transaksi').namespace('v2/Web').middleware(['auth:jwt'])
