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

require('./routes-mitra')
require('./routes-mobile')
require('./routes-backend')
require('./routes-backendv2')
require('./routes-belanja')
require('./routes-bimbelberbayar')
require('./routes-web-v2')
require('./routes-reasec')

// frontend ONLY
require('./routes-frontend-product-belanja')
require('./routes-frontend-product-mitra-belanja')
require('./routes-examp-berbayar')
require('./routes-payment')
require('./routes-cront-job')

//
require('./v2-routes-permatabelajar')

//Tryout Examp Bimbel Online
Route.group(() => {
    // pembahasan
    Route.post('store', 'Complaint/ComplaintController.store')
}).prefix('api/v1/complaint/')


//Tryout Examp Bimbel Online
Route.group(() => {
    // pembahasan
    Route.get('member/:id_user', 'Notification/NotificationController.member')
    Route.get('member_update/:id_notification', 'Notification/NotificationController.member_update')

    Route.get('jadwal_reminder/:id_user', 'Notification/NotificationController.jadwal_reminder')

    // disable notification
    Route.get('disabled_notification/:id_user', 'Notification/NotificationController.disabled_notification')

}).prefix('api/v1/notification/')

//Tryout Examp Bimbel Online
Route.group(() => {
    Route.get('list/paket/ku/:id', 'BimbelOnline/PaketController.list')
    Route.get('list/paket', 'BimbelOnline/PaketController.list_old')

    Route.get('list/paket/:id/:pelanggan', 'BimbelOnline/PaketController.detail')
    Route.get('list/duration_paket/:id', 'BimbelOnline/PaketController.duration_paket')
    Route.post('list/detail_paket', 'BimbelOnline/PaketController.detail_paket')
    Route.post('list/paket_aktif', 'BimbelOnline/PaketController.paket_aktif')

    Route.post('berbayar/checkTrial', 'BimbelOnline/MatpelController.checkTrial')

    Route.get('list/kelas', 'BimbelOnline/MatpelController.kelas')
    Route.get('list/mapel/:id', 'BimbelOnline/MatpelController.mapel')
    Route.get('list/silabus/:kelas/:mapel', 'BimbelOnline/MatpelController.silabus')
    Route.get('list/confirm_silabus/:kelas/:mapel/:silabus', 'BimbelOnline/MatpelController.confirm_silabus')
    Route.get('list/soal/:kelas/:mapel/:silabus/:limit', 'BimbelOnline/MatpelController.soal')
    Route.get('list/remove_temp/:id_user', 'BimbelOnline/MatpelController.remove_temp')
    Route.post('store/temp', 'BimbelOnline/MatpelController.temp')
    Route.get('store/list/confirm/:id_user', 'BimbelOnline/MatpelController.confirm')
    Route.post('store/process', 'BimbelOnline/MatpelController.process')
    Route.post('store/process/soal', 'BimbelOnline/MatpelController.processSoal')

    Route.get('profile/:id_user', 'BimbelOnline/ProfileController.profile')
    Route.get('profile/:id_user', 'BimbelOnline/ProfileController.profile')

    // test
    Route.get('test/profile/:id_user', 'BimbelOnline/TestController.profile')
    Route.get('test/start/:id_examp/:id_user', 'BimbelOnline/TestController.start')
    Route.get('test/soal/:id_soal', 'BimbelOnline/TestController.soal')
    Route.post('test/answer/soal', 'BimbelOnline/TestController.answer')
    Route.post('test/answer/time', 'BimbelOnline/TestController.time')
    Route.post('test/finish', 'BimbelOnline/TestController.finish')

    // report
    Route.get('report/profile/:id_user', 'BimbelOnline/ReportController.profile')
    Route.get('report/start/:id_examp/:id_user', 'BimbelOnline/ReportController.start')
    Route.get('report/soal/:id_soal', 'BimbelOnline/ReportController.soal')

    // pembahasan
    Route.get('pembahasan/:id_user', 'BimbelOnline/PembahasanController.index')

    // berbayar
    Route.get('berbayar/cek_berlangganan/:id_user', 'BimbelOnline/PaketController.cek_berlangganan')
    Route.get('berbayar/list/confirm_silabus/:jenis_paket/:matpel/:kelas', 'BimbelOnline/MatpelController.confirm_silabus_berbayar')
    Route.post('berbayar/list/new_confirm_silabus', 'BimbelOnline/MatpelController.confirm_silabus_berbayar')
    Route.get('berbayar/list/soal/:jenis_paket/:tingkat/:kelas/:matpel/:limit', 'BimbelOnline/MatpelController.soal_berbayar')
    Route.post('berbayar/list/new_soal', 'BimbelOnline/MatpelController.new_soal_berbayar')
    Route.post('berbayar/store/temp', 'BimbelOnline/MatpelController.temp_berbayar')
    Route.get('berbayar/store/list/confirm/:id_user', 'BimbelOnline/MatpelController.confirm_berbayar')
    Route.get('berbayar/list/remove_temp/:id_user', 'BimbelOnline/MatpelController.remove_temp_berbayar')
    Route.post('berbayar/store/process', 'BimbelOnline/MatpelController.process_berbayar')
    Route.post('berbayar/store/process/soal', 'BimbelOnline/MatpelController.processSoal_berbayar')
    Route.post('berbayar/count_soal', 'BimbelOnline/MatpelController.count_soal')

    // test
    Route.get('berbayar/test/profile/:id_examp', 'BimbelOnline/TestBerbayarController.profile')
    Route.get('berbayar/test/start/:id_examp/:id_user', 'BimbelOnline/TestBerbayarController.start')
    Route.get('berbayar/test/soal/:id_soal', 'BimbelOnline/TestBerbayarController.soal')
    Route.post('berbayar/test/answer/soal', 'BimbelOnline/TestBerbayarController.answer')
    Route.post('berbayar/test/answer/time', 'BimbelOnline/TestBerbayarController.time')
    Route.post('berbayar/test/finish', 'BimbelOnline/TestBerbayarController.finish')

    //saran berbayar
    Route.post('berbayar/saran/semua', 'BimbelOnline/PembahasanController.saran_berbayar')
    Route.post('berbayar/pembahasan/semua', 'BimbelOnline/PembahasanController.pembahasan_berbayar')
    Route.get('berbayar/report/soal/:id_soal', 'BimbelOnline/ReportController.soal_berbayar_pembahasan')

    //video berbayar
    Route.post('berbayar/video/semua/:page/:limit', 'BimbelOnline/VideoBerbayarController.semua')
    Route.post('berbayar/video/get_matpel_video', 'BimbelOnline/VideoBerbayarController.get_matpel_video')
    Route.get('berbayar/video/detail/:slug', 'BimbelOnline/VideoBerbayarController.detail')
    Route.post('berbayar/video/serupa', 'BimbelOnline/VideoBerbayarController.serupa')
    Route.get('berbayar/video/random/depan', 'BimbelOnline/VideoBerbayarController.halaman_utama')

    //ringkasan berbayar
    Route.post('berbayar/ringkasan', 'BimbelOnline/RingkasanController.ringkasan')

    //gratis selamanya
    Route.get('gratis_nolog/list/kelas', 'BimbelOnline/MatpelController.gratis_nolog_kelas')
    Route.get('gratis_nolog/list/mapel/:id', 'BimbelOnline/MatpelController.gratis_nolog_mapel')    
    Route.get('gratis_nolog/list/silabus/:kelas/:mapel', 'BimbelOnline/MatpelController.gratis_nolog_silabus')
    Route.get('gratis_nolog/list/remove_temp/:id_user', 'BimbelOnline/MatpelController.gratis_nolog_remove_temp')
    Route.get('gratis_nolog/list/confirm_silabus/:kelas/:mapel/:silabus', 'BimbelOnline/MatpelController.gratis_nolog_confirm_silabus')
    Route.post('gratis_nolog/list/new_confirm_silabus', 'BimbelOnline/MatpelController.new_gratis_nolog_confirm_silabus')
    Route.get('gratis_nolog/list/soal/:kelas/:mapel/:silabus/:limit', 'BimbelOnline/MatpelController.gratis_nolog_soal')
    Route.post('gratis_nolog/list/new_soal', 'BimbelOnline/MatpelController.new_gratis_nolog_soal')
    Route.post('gratis_nolog/store/temp', 'BimbelOnline/MatpelController.gratis_nolog_temp')
    Route.get('gratis_nolog/store/list/confirm/:id_user', 'BimbelOnline/MatpelController.gratis_nolog_confirm')
    Route.post('gratis_nolog/store/process', 'BimbelOnline/MatpelController.gratis_nolog_process')
    Route.post('gratis_nolog/store/process/soal', 'BimbelOnline/MatpelController.gratis_nolog_processSoal')
    Route.get('gratis_nolog/list/remove_soal/:id_user', 'BimbelOnline/MatpelController.gratis_nolog_remove_soal')

    // test
    Route.get('gratis_nolog/test/profile/:id_user', 'BimbelOnline/TestController.gratis_nolog_profile')
    Route.get('gratis_nolog/test/start/:id_examp/:id_user', 'BimbelOnline/TestController.gratis_nolog_start')
    Route.get('gratis_nolog/test/soal/:id_soal', 'BimbelOnline/TestController.gratis_nolog_soal')
    Route.post('gratis_nolog/test/answer/soal', 'BimbelOnline/TestController.gratis_nolog_answer')
    Route.post('gratis_nolog/test/answer/time', 'BimbelOnline/TestController.gratis_nolog_time')
    Route.post('gratis_nolog/test/finish', 'BimbelOnline/TestController.gratis_nolog_finish')
    Route.get('gratis_nolog/pembahasan/:id_examp', 'BimbelOnline/PembahasanController.gratis_nolog_pembahasan')

    //Video Gratis 
    Route.get('gratis_nolog/video/nambah_view/:slug', 'BimbelOnline/VideoGratisController.nambah_view')
    Route.get('gratis_nolog/video/tingkat', 'BimbelOnline/VideoGratisController.tingkat')
    Route.post('gratis_nolog/video/matpel', 'BimbelOnline/VideoGratisController.matpel')
    Route.get('gratis_nolog/video/semua/:page/:limit', 'BimbelOnline/VideoGratisController.semua')
    Route.post('gratis_nolog/video/semua/tingkat/matpel/:page/:limit', 'BimbelOnline/VideoGratisController.permatpeldantingkat')
    Route.post('gratis_nolog/video/semua/tingkat/:page/:limit', 'BimbelOnline/VideoGratisController.pertingkat')
    Route.post('gratis_nolog/video/semua/matpel/:page/:limit', 'BimbelOnline/VideoGratisController.permatpel')
    Route.get('gratis_nolog/video/detail/:slug', 'BimbelOnline/VideoGratisController.detail')
    Route.post('gratis_nolog/video/serupa', 'BimbelOnline/VideoGratisController.serupa')

    //perubahan tampilan bulan april 2020
    Route.post('gratis_nolog/revisi/list_kelas', 'BimbelOnline/MatpelController.list_kelas')  
    Route.post('gratis_nolog/revisi/list_mata_pelajaran_fitur', 'BimbelOnline/MatpelController.list_mata_pelajaran_fitur')  
    Route.post('gratis_nolog/revisi/list_mata_pelajaran_from_tingkat', 'BimbelOnline/MatpelController.list_mata_pelajaran_from_tingkat')
    Route.post('gratis_nolog/revisi/submit_latihan', 'BimbelOnline/MatpelController.submit_latihan')
    Route.post('gratis_nolog/revisi/store_submit', 'BimbelOnline/MatpelController.store_submit')
    Route.post('gratis_nolog/revisi/maksimal_bimbel_gratis', 'BimbelOnline/MatpelController.maksimal_bimbel_gratis')

    //Video Gratis Perubahan Bulan April 2020
    Route.get('gratis_nolog/revisi/video/list_video', 'BimbelOnline/VideoGratisController.dua_video_gratis')   

    //Update table
    Route.post('gratis_nolog/revisi/updated_tabel_baru', 'BimbelOnline/MatpelController.updated_tabel_baru')

}).prefix('api/v1/bo/')


//Gambar soal
Route.group(() => {
    Route.get('5041/Soal/:name', async({ request, response }) => {
        response.download(Helpers.publicPath('images/5041/Soal/' + request.params.name))
    })
    Route.get('5041/pembahasan/:name', async({ request, response }) => {
        response.download(Helpers.publicPath('images/5041/Pembahasan/' + request.params.name))
    })
    // cv
    Route.get('document/mitra/:mitra/:name', async({ request, response }) => {
        response.download(Helpers.publicPath('images/document/mitra/' + request.params.mitra + '/' + request.params.name))
    })
    //bukti pembayaram
    Route.get('document/payment/:name', async({ request, response }) => {
        response.download(Helpers.publicPath('images/document/payment/' + request.params.name))
    })
}).prefix('api/v1/images/')


Route.group(() => {
    // icon
    Route.get('icon/:name', async({ request, response }) => {
        response.download(Helpers.publicPath('icon/' + request.params.name))
    })
}).prefix('api/v1/')



//Transaction
Route.group(() => {
    Route.get('list/:id_user/:page/:limit', 'Web/Transaction/TransactionController.index')
    Route.get('check_jadwal/:id', 'Web/Transaction/TransactionController.check_jadwal')
    Route.get('detail/:id', 'Web/Transaction/TransactionController.detail')
    Route.get('detail/jadwallast/:id_invoice/:id_user', 'Web/Transaction/TransactionController.jadwallast')
    Route.get('detail/jadwal/:id_invoice/:id_user', 'Web/Transaction/TransactionController.jadwal')
    Route.get('detail/absen/:id_pertemuan/:id_user', 'Web/Transaction/TransactionController.Absen')
    Route.get('detail/absen_tidak/:id_pertemuan/:id_user', 'Web/Transaction/TransactionController.absen_tidak')
    Route.get('detail/absen_kelipatan/:id_pertemuan', 'Web/Transaction/TransactionController.absen_kelipatan')
    Route.get('detail/absen_kelipatan_tidak/:id_pertemuan', 'Web/Transaction/TransactionController.absen_kelipatan_tidak')
    Route.post('close_review', 'Web/Transaction/TransactionController.close_review')
    
    Route.get('detail/jadwal_last/:id_invoice/:id_user', 'Web/Transaction/TransactionController.jadwal_last')
    Route.post('detail/jadwal_last_close/', 'Web/Transaction/TransactionController.jadwal_last_close')
    
    Route.get('close/:id', 'Web/Transaction/TransactionController.close')
    
    // notification Transaction
    Route.get('notification/:id_user', 'Web/Transaction/TransactionController.notification')

    // jadwal
    Route.get('ListJadwal/:id_user', 'Web/Transaction/TransactionController.ListJadwal')

}).prefix('api/v1/web/Transaction/')


//Payment
Route.group(() => {
    Route.get('check/:id', 'Web/Payment/PaymentController.check')
    Route.post('draft', 'Web/Payment/PaymentController.draft')
    Route.get('amount/:id', 'Web/Payment/PaymentController.amount')
    Route.get('online/amount/:id', 'Web/Payment/PaymentController.online_amount')
}).prefix('api/v1/web/payment/')



//jadwal
// Route.group(() => {
//     // list jadwal
//     Route.get('list/pelanggan/:id_user/:invoice/', 'Web/Jadwal/JadwalController.index')

//     Route.get('absen/:id_jadwal', 'Web/Jadwal/JadwalController.absen')
// }).prefix('api/v1/web/Jadwal/')


//homepage web
Route.group(() => {
    //populr product
    Route.get('popular/', 'Web/Homepage/HomePageController.index')
    Route.get('kota/', 'Web/Homepage/HomePageController.kota')
    Route.get('semua_kota/', 'Web/Homepage/HomePageController.semua_kota')
    //survey
    Route.get('survey/count/:id', 'Web/Homepage/HomePageController.count_pelanggan_survey')
    Route.post('survey/store', 'Web/Homepage/HomePageController.store_survey')
    //page private
    Route.get('private/:id', 'Web/Homepage/PrivatePageController.index')
    Route.get('private/list/kelas', 'Web/Homepage/PrivatePageController.listKelas')
    Route.get('private/list/silabus/:tingkat/:matpel', 'Web/Homepage/PrivatePageController.silabus')



}).prefix('api/v1/web/homepage/')



// profile
Route.group(() => {
    //cek no telpon midleware
    Route.get('check_telephone/:id_mitra', 'Web/Profile/ProfileController.check_telephone')
    Route.post('store_telephone', 'Web/Profile/ProfileController.store_telephone')
    Route.post('store_lat_long', 'Web/Profile/ProfileController.store_lat_long')

    //pelanggan
    Route.get('pelanggan/:id', 'Web/Profile/ProfileController.pelanggan')
    Route.get('pelanggan/email_verified/:id', 'Web/Profile/ProfileController.email_verified_pelanggan')
    Route.post('pelanggan/cek_password', 'Web/Profile/ProfileController.cek_password')
    Route.post('pelanggan/change_password', 'Web/Profile/ProfileController.changepassword_pelanggan')
    
    // update profile orang tua
    Route.post('pelanggan/ortu', 'Web/Profile/ProfileController.pelangganOrtu')
    Route.post('pelanggan/change_profile', 'Web/Profile/ProfileController.change_profile')

    //mitra
    Route.get('mitraJoin/:id', 'Web/Profile/ProfileController.mitraJoin')
    Route.get('mitra/email_verified/:id', 'Web/Profile/ProfileController.email_verified_mitra')
    Route.get('mitraJoin/getPassword/:id_mitra', 'Web/Profile/ProfileController.getPassword')
    Route.post('mitraJoin/changepassword', 'Web/Profile/ProfileController.changepassword')
    Route.get('mitra/:id', 'Web/Profile/ProfileController.mitra')

    Route.post('mitraJoin/changeprofile', 'Web/Profile/ProfileController.changeprofile')
    Route.post('mitraJoin/changeprofileExceptFoto', 'Web/Profile/ProfileController.changeprofileExceptFoto')



    // verifikasi email
    Route.post('pelanggan/email_send', 'Web/Profile/ProfileController.email_send_pelanggan')
    Route.get('pelanggan/email_confirm/:id', 'Web/Profile/ProfileController.email_confirm_pelanggan')

    Route.post('mitra/email_send', 'Web/Profile/ProfileController.email_send_mitra')
    Route.get('mitra/email_confirm/:id', 'Web/Profile/ProfileController.email_confirm_mitra')


    // /forgot-password
    Route.post('forgot', 'Web/Profile/ForgotController.Forgot')
    Route.post('change', 'Web/Profile/ForgotController.Change')


}).prefix('api/v1/web/profile/')


//merchant
Route.group(() => {
    // auth
    Route.post('login/', 'Merchant/LoginController.loginPost')
    Route.post('registrasi/:id', 'Merchant/LoginController.registrasiPost')
    Route.post('v/verify/:id', 'Merchant/LoginController.verifyPost')

    // category
    Route.get('category', 'Merchant/CategoryController.index')
    Route.post('category', 'Merchant/CategoryController.store')
    Route.get('category/:id', 'Merchant/CategoryController.show')
    Route.put('category/:id', 'Merchant/CategoryController.update')
    Route.delete('category/:id', 'Merchant/CategoryController.delete')

    //sub category
    Route.get('sub_category/:id', 'Merchant/CategoryController.sub_index')


    // product
    Route.get('product', 'Merchant/ProductController.index')
    Route.get('productByRated/:id', 'Merchant/ProductController.produkByRating')
    Route.post('product', 'Merchant/ProductController.store')
    Route.get('product/:id', 'Merchant/ProductController.show')
    Route.put('product/:id', 'Merchant/ProductController.update')
    Route.delete('product/:id', 'Merchant/ProductController.delete')

    //alamat
    Route.get('alamat/provinsi', 'Merchant/AlamatController.provinsi')
    Route.get('alamat/kota/:id', 'Merchant/AlamatController.kota')
    Route.get('alamat/kecamatan/:id', 'Merchant/AlamatController.kecamatan')
    Route.get('alamat/kode-pos/:id', 'Merchant/AlamatController.kode_pos')

    //merchant
    Route.get('merchant', 'Merchant/MerchantController.index')
    Route.post('merchant', 'Merchant/MerchantController.store')
    Route.get('merchant/:id', 'Merchant/MerchantController.show')
    Route.put('merchant/:id', 'Merchant/MerchantController.update')
    Route.delete('merchant/:id', 'Merchant/MerchantController.delete')

    //upload dokumen
    Route.get('uploadoc', 'Merchant/UploadDokumenController.index')
    Route.post('uploadoc', 'Merchant/UploadDokumenController.store')
    Route.get('uploadoc/:id', 'Merchant/UploadDokumenController.show')
    Route.put('uploadoc/:id', 'Merchant/UploadDokumenController.update')
    Route.delete('uploadoc/:id', 'Merchant/UploadDokumenController.delete')
    Route.get('uploadoc/id_merchant/:id', 'Merchant/UploadDokumenController.showIdMerchant')
    Route.get('uploadoc/check_alredy/:id_merchant/:id_persyaratan', 'Merchant/UploadDokumenController.checkAlredy')


    //image produk
    Route.get('imageproduk', 'Merchant/ImageProdukController.index')
    Route.get('imageprodukr', 'Merchant/ImageProdukController.random')
    Route.post('imageproduk', 'Merchant/ImageProdukController.store')
    Route.post('imageproduk1', 'Merchant/ImageProdukController.storeupload')
    Route.post('imageproduk2', 'Merchant/ImageProdukController.store2')
    Route.get('imageproduk/:id', 'Merchant/ImageProdukController.show')
    Route.put('imageproduk/:id', 'Merchant/ImageProdukController.update')
    Route.delete('imageproduk/:id', 'Merchant/ImageProdukController.delete')

    //fasilitas
    Route.get('fasilitas', 'Merchant/FasilitasController.index')
    Route.post('fasilitas', 'Merchant/FasilitasController.store')
    Route.get('fasilitas/:id', 'Merchant/FasilitasController.show')
    Route.put('fasilitas/:id', 'Merchant/FasilitasController.update')
    Route.delete('fasilitas/:id', 'Merchant/FasilitasController.delete')

    //Harga
    Route.get('harga', 'Merchant/HargaController.index')
    Route.post('harga', 'Merchant/HargaController.store')
    Route.get('harga/:id', 'Merchant/HargaController.show')
    Route.put('harga/:id', 'Merchant/HargaController.update')
    Route.delete('harga/:id', 'Merchant/HargaController.delete')

    //soal
    Route.get('soal', 'Merchant/SoalController.index')
    Route.post('soal', 'Merchant/SoalController.store')
    Route.get('soal/:id', 'Merchant/SoalController.show')
    Route.put('soal/:id', 'Merchant/SoalController.update')
    Route.delete('soal/:id', 'Merchant/SoalController.delete')


    //soal
    Route.get('matpel', 'Merchant/MatpelController.index')
    Route.get('matpel/detail/:id', 'Merchant/MatpelController.mapel')

    //soal
    Route.post('order/merchant', 'Merchant/OrderController.store')
    Route.get('order/merchant/:id_matpel/:id_merchant/:id_product', 'Merchant/OrderController.index')

    //mitra
    Route.post('mitra', 'Merchant/MitraController.store')
        //Route.get('mitra/cek', 'Merchant/MitraController.cek')
    Route.post('mitra/cekLogin', 'Merchant/MitraController.cekLogin')
    Route.get('mitra/cek/:id', 'Merchant/MitraController.cek')

    // Mitra with google
    Route.post('mitra_google', 'Merchant/MitraController.store_google')


    //pelanggan
    Route.post('pelanggan', 'Merchant/PelangganController.store')
        //Route.get('pelanggan/cek', 'Merchant/PelangganController.cek')
    Route.post('pelanggan/cekLogin', 'Merchant/PelangganController.cekLogin')
    Route.get('pelanggan/cek/:id', 'Merchant/PelangganController.cek')

    //pelanggan with google
    Route.post('pelanggan_google', 'Merchant/PelangganController.store_google')
    
    //persyaratnOrder
    Route.get('persyaratanOrder', 'Merchant/PersyaratanOrderController.index')
    Route.post('persyaratanOrder', 'Merchant/PersyaratanOrderController.store')


}).prefix('api/v1/merchant')


//Participant
Route.group(() => {

    //participant
    Route.get('participant', 'Participant/ParticipantController.index')
    Route.post('participant', 'Participant/ParticipantController.store')
    Route.get('participant/:id', 'Participant/ParticipantController.show')
    Route.put('participant/:id', 'Participant/ParticipantController.update')
    Route.delete('participant/:id', 'Participant/ParticipantController.delete')

    //alamat participant
    Route.get('alamat', 'Participant/AlamatParticipantController.index')
    Route.post('alamat', 'Participant/AlamatParticipantController.store')
    Route.get('alamat/:id', 'Participant/AlamatParticipantController.show')
    Route.put('alamat/:id', 'Participant/AlamatParticipantController.update')
    Route.delete('alamat/:id', 'Participant/AlamatParticipantController.delete')

}).prefix('api/v1/participant')

