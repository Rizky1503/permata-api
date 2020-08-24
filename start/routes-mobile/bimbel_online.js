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

Route.post('bimbel_online/gratis/profile', 'Mobile/BimbelOnline/gratisController.profile')
Route.get('bimbel_online/gratis/tingkat', 'Mobile/BimbelOnline/gratisController.tingkat')
Route.post('bimbel_online/gratis/mata_pelajaran', 'Mobile/BimbelOnline/gratisController.mata_pelajaran')
Route.post('bimbel_online/gratis/store_temp', 'Mobile/BimbelOnline/gratisController.store_temp')
Route.post('bimbel_online/gratis/store_submit', 'Mobile/BimbelOnline/gratisController.store_submit')
Route.post('bimbel_online/gratis/clear_examp', 'Mobile/BimbelOnline/gratisController.clear_examp')

Route.post('bimbel_online/gratis/test/list_number', 'Mobile/BimbelOnline/gratisController.test_list_number')
Route.post('bimbel_online/gratis/test/click_number', 'Mobile/BimbelOnline/gratisController.click_number')
Route.post('bimbel_online/gratis/test/click_number_new', 'Mobile/BimbelOnline/gratisController.click_number_new')
Route.post('bimbel_online/gratis/test/answer', 'Mobile/BimbelOnline/gratisController.answer')
Route.post('bimbel_online/gratis/test/update_time', 'Mobile/BimbelOnline/gratisController.update_time')
Route.post('bimbel_online/gratis/test/finish', 'Mobile/BimbelOnline/gratisController.Finish')

// ============================================================================================================

Route.post('bimbel_online/free/Menu', 'Mobile/BimbelOnline/freeController.Menu')
Route.post('bimbel_online/free/Order', 'Mobile/BimbelOnline/freeController.Order')
Route.post('bimbel_online/free/check_paket', 'Mobile/BimbelOnline/freeController.check_paket')
Route.post('bimbel_online/free/check_tahun', 'Mobile/BimbelOnline/freeController.check_tahun')
Route.post('bimbel_online/free/check_mata_pelajaran', 'Mobile/BimbelOnline/freeController.check_mata_pelajaran')
Route.post('bimbel_online/free/submit_data', 'Mobile/BimbelOnline/freeController.submit_data')
Route.post('bimbel_online/free/test/get_soal', 'Mobile/BimbelOnline/freeController.get_soal')

Route.post('bimbel_online/free/profile', 'Mobile/BimbelOnline/freeController.profile')
Route.post('bimbel_online/free/check_kondition', 'Mobile/BimbelOnline/freeController.check_kondition')

Route.get('bimbel_online/free/tingkat', 'Mobile/BimbelOnline/freeController.tingkat')
Route.post('bimbel_online/free/mata_pelajaran', 'Mobile/BimbelOnline/freeController.mata_pelajaran')
Route.post('bimbel_online/free/store_temp', 'Mobile/BimbelOnline/freeController.store_temp')
Route.post('bimbel_online/free/store_submit', 'Mobile/BimbelOnline/freeController.store_submit')


Route.post('bimbel_online/free/test/list_number', 'Mobile/BimbelOnline/freeController.test_list_number')
Route.post('bimbel_online/free/test/click_number', 'Mobile/BimbelOnline/freeController.click_number')
Route.post('bimbel_online/free/test/answer', 'Mobile/BimbelOnline/freeController.answer')
Route.post('bimbel_online/free/test/update_time', 'Mobile/BimbelOnline/freeController.update_time')
Route.post('bimbel_online/free/test/finish', 'Mobile/BimbelOnline/freeController.Finish')

//bimbel online video
Route.post('bimbel_online/free/video/list', 'Mobile/BimbelOnline/VideoController.list')
Route.post('bimbel_online/free/video/list_and_filter', 'Mobile/BimbelOnline/VideoController.list_and_filter')
Route.post('bimbel_online/free/video/tingkat', 'Mobile/BimbelOnline/VideoController.tingkat')
Route.post('bimbel_online/free/video/mata_pelajaran', 'Mobile/BimbelOnline/VideoController.mata_pelajaran')

//bimbel online pembahasan
Route.post('bimbel_online/free/pembahasan/list', 'Mobile/BimbelOnline/PembahasanController.list')
Route.post('bimbel_online/free/pembahasan/list_soal', 'Mobile/BimbelOnline/PembahasanController.list_soal')


//bimbel online paket
Route.get('bimbel_online_paket_terbaru', 'Mobile/BimbelOnline/PaketController.list_paket_terbaru')
Route.post('bimbel_online_paket_terbaru_home', 'Mobile/BimbelOnline/PaketController.list_paket_terbaru_home')

//bimbel online bedah materi
Route.post('bimbel_online_free_bedah_materi/kelas', 'Mobile/BimbelOnline/BedahMateriController.kelas')
Route.post('bimbel_online_free_bedah_materi', 'Mobile/BimbelOnline/BedahMateriController.index')


// fress route revision =======================================================================================
Route.post('bo/gratis/list_kelas', 'Mobile/BimbelOnline/Gratis/gratisController.list_kelas')
Route.post('bo/gratis/list_mata_pelajaran_fitur', 'Mobile/BimbelOnline/Gratis/gratisController.list_mata_pelajaran_fitur')
Route.post('bo/gratis/list_mata_pelajaran_from_tingkat', 'Mobile/BimbelOnline/Gratis/gratisController.list_mata_pelajaran_from_tingkat')
Route.post('bo/gratis/submit_latihan', 'Mobile/BimbelOnline/Gratis/gratisController.submit_latihan')
Route.post('bo/gratis/submit_store_submit', 'Mobile/BimbelOnline/Gratis/gratisController.submit_store_submit')
Route.post('bo/gratis/get_id_examp', 'Mobile/BimbelOnline/Gratis/gratisController.get_id_examp')
Route.post('bo/gratis/video/list', 'Mobile/BimbelOnline/Gratis/gratisController.video_list')
Route.post('bo/gratis/video/list/kelas', 'Mobile/BimbelOnline/Gratis/gratisController.video_list_kelas')


Route.post('bo/langganan/change_data', 'Mobile/BimbelOnline/Langganan/langgananController.change_data')
Route.post('bo/langganan/paket/list', 'Mobile/BimbelOnline/Langganan/langgananController.list_paket')
Route.post('bo/langganan/paket/list/upgrade', 'Mobile/BimbelOnline/Langganan/langgananController.list_paket_upgrade')
Route.post('bo/langganan/paket/duration/list', 'Mobile/BimbelOnline/Langganan/langgananController.duration_list')
Route.post('bo/langganan/paket/duration/selectDuration', 'Mobile/BimbelOnline/Langganan/langgananController.selectDuration')


Route.post('bo/langganan/paket/order', 'Mobile/BimbelOnline/Langganan/orderController.order')
Route.post('bo/langganan/paket/order/trial', 'Mobile/BimbelOnline/Langganan/orderController.orderTrial')

Route.post('bo/langganan/paket/list/user', 'Mobile/BimbelOnline/Langganan/langgananController.list_paket_have_user')


Route.post('bo/langganan/latihan/tingkat', 'Mobile/BimbelOnline/Langganan/latihanController.tingkat')
Route.post('bo/langganan/latihan/tingkat/kategori_latihan', 'Mobile/BimbelOnline/Langganan/latihanController.tingkatKategoriLatihan')
Route.post('bo/langganan/latihan/tingkat/mata_pelajaran', 'Mobile/BimbelOnline/Langganan/latihanController.tingkatMataPelajaran')
Route.post('bo/langganan/latihan/tingkat/request_data', 'Mobile/BimbelOnline/Langganan/latihanController.tingkatRequestData')
Route.post('bo/langganan/latihan/tingkat/submit_data', 'Mobile/BimbelOnline/Langganan/latihanController.tingkatSubmitData')

Route.post('bo/langganan/latihan/kategori_latihan', 'Mobile/BimbelOnline/Langganan/latihanController.kategoriLatihan')
Route.post('bo/langganan/latihan/tahun_mata_pelajaran', 'Mobile/BimbelOnline/Langganan/latihanController.tahunMataPelajaran')
Route.post('bo/langganan/latihan/mata_pelajaran', 'Mobile/BimbelOnline/Langganan/latihanController.mataPelajaran')
Route.post('bo/langganan/latihan/request_data', 'Mobile/BimbelOnline/Langganan/latihanController.requestData')
Route.post('bo/langganan/latihan/submit_data', 'Mobile/BimbelOnline/Langganan/latihanController.submitData')

// test latihan
Route.post('bo/langganan/latihan/test/get_data', 'Mobile/BimbelOnline/Langganan/latihanController.testGetSoal')

//fitur langganan
Route.post('bo/langganan/fitur/menu', 'Mobile/BimbelOnline/Langganan/fiturController.menu')
Route.post('bo/langganan/fitur/video/list', 'Mobile/BimbelOnline/Langganan/fiturController.videoList')
Route.post('bo/langganan/fitur/video/filter/tingkat', 'Mobile/BimbelOnline/Langganan/fiturController.videoFilterTingkat')
Route.post('bo/langganan/fitur/video/filter/mata_pelajaran', 'Mobile/BimbelOnline/Langganan/fiturController.videoFilterMataPelajaran')
Route.post('bo/langganan/fitur/pembahasan/list', 'Mobile/BimbelOnline/Langganan/fiturController.pembahasanList')
Route.post('bo/langganan/fitur/pembahasan/list/soal', 'Mobile/BimbelOnline/Langganan/fiturController.pembahasanListSoal')
Route.post('bo/langganan/fitur/bedah_materi', 'Mobile/BimbelOnline/Langganan/fiturController.bedahMateriList')
Route.post('bo/langganan/fitur/history/list', 'Mobile/BimbelOnline/Langganan/fiturController.historyList')
