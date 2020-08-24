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
    // change status expired data
    Route.get('expired-data-in-order', 'CrontJob/OrderController.crontJobExpired')
	
	// change status expired data
    Route.get('expired-bimbel-online', 'CrontJob/BimbleController.expiredBimbel')
    Route.get('reminder-bimbel-online-1-day', 'CrontJob/BimbleController.reminderBimbelOneDay')


}).prefix('api/v1/cront-job/')
