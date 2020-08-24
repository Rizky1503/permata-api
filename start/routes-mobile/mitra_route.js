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

Route.post('mitra/login', 'Mobile/Mitra/AuthController.login')
Route.post('mitra/registrasi', 'Mobile/Mitra/AuthController.registrasi')
Route.post('mitra/email_verify', 'Mobile/Mitra/AuthController.email_verify')
Route.post('mitra/email_verify_send_code', 'Mobile/Mitra/AuthController.email_verify_send_code')
Route.post('mitra/verify_otp', 'Mobile/Mitra/AuthController.verify_otp')


// produk LES PRIVAT
Route.post('mitra/product/les_privat_validate_document', 'Mobile/Mitra/LesPrivatController.validateDocument')

Route.get('mitra/product/les_privat/:id_mitra/:page/:show_page', 'Mobile/Mitra/LesPrivatController.list_all')
Route.get('mitra/product/les_privat_create/tingkat', 'Mobile/Mitra/LesPrivatController.create_tingkat')
Route.get('mitra/product/les_privat_create/mata_pelajaran/:tingkat', 'Mobile/Mitra/LesPrivatController.create_mata_pelajaran')
Route.get('mitra/product/les_privat_create/kota', 'Mobile/Mitra/LesPrivatController.create_kota')
Route.post('mitra/product/les_privat_create/store', 'Mobile/Mitra/LesPrivatController.store')
Route.post('mitra/product/les_privat_create/storeWaktu', 'Mobile/Mitra/LesPrivatController.storeWaktu')

Route.get('mitra/product/les_privat_jadwal/:id_mitra/:page/:show_page', 'Mobile/Mitra/LesPrivatController.JadwalList')
Route.post('mitra/product/les_privat_jadwal_detail_profile', 'Mobile/Mitra/LesPrivatController.JadwalDetailProfile')
Route.get('mitra/product/les_privat_jadwal_detail_absen/:id_mitra/:id_invoice', 'Mobile/Mitra/LesPrivatController.JadwalDetailAbsen')
Route.post('mitra/product/les_privat_jadwal_StoreDetailAbsen', 'Mobile/Mitra/LesPrivatController.StoreDetailAbsen')

Route.get('mitra/product/les_privat_history/:id_mitra/:page/:show_page', 'Mobile/Mitra/LesPrivatController.HistoryList')
Route.get('mitra/product/les_privat_history_detail_absen/:id_mitra/:id_invoice', 'Mobile/Mitra/LesPrivatController.HistoryDetailAbsen')

Route.post('mitra/product/les_privat_kota_lahir', 'Mobile/Mitra/LesPrivatController.kota_Lahir')
Route.post('mitra/product/les_privat_submit_persyaratan', 'Mobile/Mitra/LesPrivatController.submit_persyaratan')
