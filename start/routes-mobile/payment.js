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

Route.post('payment/voucher', 'Mobile/Payment/voucherController.list')


Route.post('payment/bank_channel', 'Mobile/Payment/paymentController.bank_channel')
Route.post('payment/kotaList', 'Mobile/Payment/paymentController.kotaList')
Route.post('payment/submit_payment', 'Mobile/Payment/paymentController.submit_payment')
Route.post('payment/request_notify', 'Mobile/Payment/paymentController.request_notify')
Route.post('payment/tutor_payment', 'Mobile/Payment/paymentController.tutor_payment')
Route.post('payment/create_asal_sekolah', 'Mobile/Payment/paymentController.create_asal_sekolah')
Route.post('payment/store_asal_sekolah', 'Mobile/Payment/paymentController.store_asal_sekolah')
Route.post('payment/change_payment_method', 'Mobile/Payment/paymentController.change_payment_method')
Route.post('payment/change_status_order_ios', 'Mobile/Payment/paymentController.change_status_order_ios')

// route midtrans
Route.post('payment/midtrans/request_notify', 'Mobile/Payment/paymentController.midtrans_request_notify')
Route.post('payment/change_notify', 'Mobile/Payment/paymentController.change_notify')

