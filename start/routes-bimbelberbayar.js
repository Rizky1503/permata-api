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

    Route.get('paket', 'BimbelBerbayar/BimbelBerbayarController.paket')
    Route.get('tingkat', 'BimbelBerbayar/BimbelBerbayarController.tingkat')
    Route.post('jenis', 'BimbelBerbayar/BimbelBerbayarController.getjenis')
    Route.post('getkelas', 'BimbelBerbayar/BimbelBerbayarController.getkelas')
    Route.post('getmapel', 'BimbelBerbayar/BimbelBerbayarController.getmapel')
    Route.post('getmatapelajaran', 'BimbelBerbayar/BimbelBerbayarController.getmatapelajaran')
    Route.post('getwaktu', 'BimbelBerbayar/BimbelBerbayarController.getwaktu')
    Route.post('getmaxsoal', 'BimbelBerbayar/BimbelBerbayarController.getmaxsoal')
    Route.post('getsoaltampil', 'BimbelBerbayar/BimbelBerbayarController.getsoaltampil')
    Route.post('tambahkelas', 'BimbelBerbayar/BimbelBerbayarController.Tambahkelas')
    Route.post('editmatpel', 'BimbelBerbayar/BimbelBerbayarController.editmatpel')
    Route.post('editwaktu', 'BimbelBerbayar/BimbelBerbayarController.editwaktu')
    Route.post('editwaktuInsoal', 'BimbelBerbayar/BimbelBerbayarController.editwaktuInsoal')
    Route.get('listmatpel', 'BimbelBerbayar/BimbelBerbayarController.listmatpel')
    Route.post('listmatpelbykelas', 'BimbelBerbayar/BimbelBerbayarController.listmatpelbykelas')
    Route.post('Countmatpelbykelas', 'BimbelBerbayar/BimbelBerbayarController.Countmatpelbykelas')
    Route.post('setsoal', 'BimbelBerbayar/BimbelBerbayarController.setSoal')
    Route.get('countsoal/:kelas/:mata_pelajaran/:bab', 'BimbelBerbayar/BimbelBerbayarController.Countsoal')
    Route.get('countwaktu/:kelas/:mata_pelajaran', 'BimbelBerbayar/BimbelBerbayarController.Countwaktu')
    Route.get('soalbyall', 'BimbelBerbayar/BimbelBerbayarController.soalbyall')
    Route.post('soalbykelas', 'BimbelBerbayar/BimbelBerbayarController.soalbykelas')
    Route.post('filterTingkat', 'BimbelBerbayar/BimbelBerbayarController.filterTingkat')
    Route.post('filterJenis', 'BimbelBerbayar/BimbelBerbayarController.filterJenis')
    Route.post('filterMatpel', 'BimbelBerbayar/BimbelBerbayarController.filterMatpel')
    Route.post('filterTahun', 'BimbelBerbayar/BimbelBerbayarController.filterTahun')
    Route.post('hapus_soal', 'BimbelBerbayar/BimbelBerbayarController.hapus_soal')
    Route.post('count_soal_for_delete', 'BimbelBerbayar/BimbelBerbayarController.count_soal_for_delete')
    Route.get('count_soal_langganan', 'BimbelBerbayar/BimbelBerbayarController.count_soal_langganan')
 
    
    Route.post('soalbymatapelajaran', 'BimbelBerbayar/BimbelBerbayarController.soalbymatapelajaran')
    Route.post('soalbysilabus', 'BimbelBerbayar/BimbelBerbayarController.soalbysilabus')
    Route.post('countlastSoal', 'BimbelBerbayar/BimbelBerbayarController.countlastSoal')
    Route.get('listmurid', 'BimbelBerbayar/BimbelBerbayarController.listmurid')
    Route.get('exlistmurid/:id', 'BimbelBerbayar/BimbelBerbayarController.exlistmurid')
    Route.post('detailmurid', 'BimbelBerbayar/BimbelBerbayarController.detailmurid')
    Route.get('nilaimurid/:id', 'BimbelBerbayar/BimbelBerbayarController.nilaimurid')
    Route.get('listpembayaran', 'BimbelBerbayar/BimbelBerbayarController.listpembayaran')
    Route.get('muridrequested', 'BimbelBerbayar/BimbelBerbayarController.muridrequested')
    Route.post('muridrequestedfilter', 'BimbelBerbayar/BimbelBerbayarController.muridrequestedfilter')
    Route.get('listpembayaran/:id', 'BimbelBerbayar/BimbelBerbayarController.listpembayaranId')

    Route.post('konfirmasipembayaranpayment/:id', 'BimbelBerbayar/BimbelBerbayarController.konfirmasipembayaranpayment')
    Route.post('konfirmasipembayaranorder/:id', 'BimbelBerbayar/BimbelBerbayarController.konfirmasipembayaranorder')
    Route.post('kirimnotifikasipembayaran/:id', 'BimbelBerbayar/BimbelBerbayarController.kirimnotifikasipembayaran')

    Route.post('rejectedpembayaranpayment/:id', 'BimbelBerbayar/BimbelBerbayarController.rejectedpembayaranpayment')
    Route.post('rejectedpembayaranorder/:id', 'BimbelBerbayar/BimbelBerbayarController.rejectedpembayaranorder')
    Route.post('kirimnotifikasipembayaranrejected/:id', 'BimbelBerbayar/BimbelBerbayarController.kirimnotifikasipembayaranrejected')

    Route.get('muridlangganan', 'BimbelBerbayar/BimbelBerbayarController.muridlangganan')
    Route.get('muridlangganan/:id', 'BimbelBerbayar/BimbelBerbayarController.muridlangganandetail')

    Route.get('get_jenis_paket', 'BimbelBerbayar/BimbelBerbayarController.get_jenis_paket')

    //bedah materi
    Route.post('bedahmateri/store_matpel_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.store_matpel_bedah_materi')
    Route.get('bedahmateri/view_matpel_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.view_matpel_bedah_materi')
    Route.get('bedahmateri/get_tingkat_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.get_tingkat_bedah_materi')
    Route.post('bedahmateri/get_matpel_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.get_matpel_bedah_materi')
    Route.post('bedahmateri/get_silabus_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.get_silabus_bedah_materi')
    Route.post('bedahmateri/get_id_matpel_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.get_id_matpel_bedah_materi')
    Route.post('bedahmateri/store_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.store_bedah_materi')
    Route.get('bedahmateri/view_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.view_bedah_materi')
    Route.post('bedahmateri/delete_file_bedah_materi', 'BimbelBerbayar/BimbelBerbayarController.delete_file_bedah_materi')

}).prefix('api/v1/cs/bimbel/berbayar')
