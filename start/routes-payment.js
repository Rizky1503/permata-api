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

    //confirm payment
    Route.post('verify/', 'Payment/PaymentController.doku_verify')
    Route.post('notify/', 'Payment/PaymentController.doku_confirm_payment')

}).prefix('api/v1/permatamall/payment/doku/')