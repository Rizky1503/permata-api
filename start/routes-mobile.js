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

    Route.post('home/intro', 'Mobile/Home/HomeController.intro')
    Route.post('home/slider', 'Mobile/Home/HomeController.slider')
    Route.post('home/menu', 'Mobile/Home/HomeController.menu')
    Route.post('home/panduan/bo', 'Mobile/Home/HomeController.panduan')
    //les privat
    Route.post('version/pelanggan', 'Mobile/Auth/VersionController.version_pelanggan')
    Route.post('version/mitra', 'Mobile/Auth/VersionController.version_mitra')
    Route.post('pelanggan/login', 'Mobile/Auth/LoginController.login')
    Route.post('pelanggan/login_with_other', 'Mobile/Auth/LoginController.login_with_other')
    Route.post('pelanggan/login_update', 'Mobile/Auth/LoginController.login_update')
    Route.post('pelanggan/registrasi', 'Mobile/Auth/LoginController.registrasi')
    Route.post('pelanggan/check_phone_number', 'Mobile/Auth/LoginController.check_phone_number')
    Route.post('pelanggan/verify_email', 'Mobile/Auth/LoginController.verify_email')
    Route.post('pelanggan/verify_email_new', 'Mobile/Auth/LoginController.verify_email_new')
    Route.post('pelanggan/send_token_notification', 'Mobile/Auth/LoginController.send_token_notification')
    Route.post('pelanggan/survey_check', 'Mobile/Auth/VersionController.survey_check')
    Route.post('pelanggan/survey_sumber', 'Mobile/Auth/VersionController.survey_sumber')
    Route.post('pelanggan/log_error_mobile', 'Mobile/Auth/VersionController.log_error_mobile')

    Route.post('pelanggan/auth/request_otp', 'Mobile/Auth/LoginController.request_otp')


    Route.post('pelanggan/forgot_password', 'Mobile/Auth/LoginController.forgot_password')

    require('./routes-mobile/bimbel_online')
    require('./routes-mobile/payment')

    //les privat
    Route.get('les_privat/tingkat', 'Mobile/LesPrivat/LesPrivatController.tingkat')
    Route.get('les_privat/mata_pelajaran/:id', 'Mobile/LesPrivat/LesPrivatController.mata_pelajaran')
    Route.get('les_privat/kota', 'Mobile/LesPrivat/LesPrivatController.kota')

    Route.post('les_privat/list_silabus', 'Mobile/LesPrivat/LesPrivatController.list_silabus')

    Route.post('les_privat/get_profile', 'Mobile/LesPrivat/LesPrivatController.get_profile')
    Route.post('les_privat/update_data_orang_tua', 'Mobile/LesPrivat/LesPrivatController.update_data_orang_tua')
    Route.post('les_privat/orderLesPrivat', 'Mobile/LesPrivat/LesPrivatController.orderLesPrivat')

    // les privat jadwal
    Route.get('les_privat/jadwal/semua/:id_pelanggan/:page/:show_page', 'Mobile/LesPrivat/JadwalController.semua')
    Route.get('les_privat/jadwal/absen/:id_pelanggan/:id_invoice/:page/:show_page', 'Mobile/LesPrivat/JadwalController.absen')
    Route.post('les_privat/jadwal/get_profile', 'Mobile/LesPrivat/JadwalController.get_profile')
    Route.post('les_privat/jadwal/absen_kehadiran', 'Mobile/LesPrivat/JadwalController.absen_kehadiran')


    //transaksi
    Route.get('transaksi_load/:id_pelanggan/:page/:show_page', 'Mobile/Transaksi/TransaksiController.transaksi_load')
    Route.post('transaksi_load', 'Mobile/Transaksi/TransaksiController.transaksi_load_post')
    Route.post('transaksi_les_privat/detail', 'Mobile/Transaksi/TransaksiController.transaksi_les_privat_detail')
    Route.post('transaksi_les_privat/detail_payment', 'Mobile/Transaksi/TransaksiController.transaksi_les_privat_detail_payment')

    //transaksi bo
    Route.post('transaksi_bo/detail', 'Mobile/Transaksi/TransaksiController.transaksi_bo_detail')

    Route.post('setting/profil', 'Mobile/Setting/ProfileController.profile')
    Route.post('setting/change_profile', 'Mobile/Setting/ProfileController.change_profile')


    require('./routes-mobile/mitra_route')


    Route.post('question/list_product', 'Mobile/Auth/QuestionController.list_product')
    Route.post('question/list_jenis_data', 'Mobile/Auth/QuestionController.list_jenis_pertanyaan')
    Route.post('question/check_member', 'Mobile/Auth/QuestionController.check_member')
    Route.post('question/submit_question', 'Mobile/Auth/QuestionController.submit_question')
    Route.post('question/load_data_question', 'Mobile/Auth/QuestionController.load_data_question')

    Route.post('feedback/load_data_master', 'Mobile/Auth/FeedBackController.load_data_master')
    Route.post('feedback/submit_feedback', 'Mobile/Auth/FeedBackController.submit_feedback')

    Route.get('andree/get_data/:token/:kelas', 'Mobile/Auth/FeedBackController.get_data_andree')



}).prefix('api/v1/mobile/')