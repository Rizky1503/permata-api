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
    Route.get('/log', 'LogController.index').as('v2.log.view')
    Route.get('/log/:tahun', 'LogController.bulan').as('v2.log.view.bulan')
    Route.get('/log/:tahun/:bulan', 'LogController.hari').as('v2.log.view.hari')
    Route.get('/log/:tahun/:bulan/:hari', 'LogController.view').as('v2.log.view.view')
}).prefix('api/v2/view').namespace('v2/')


Route.group(() => {
    Route.post('login', 'AuthController.login')
    Route.post('forgot', 'AuthController.forgot')
    Route.post('forgot/verify', 'AuthController.forgotVerify')
    Route.post('forgot/change', 'AuthController.forgotChange')
    Route.post('registrasi', 'AuthController.registrasi')
    Route.post('registrasi/kelas', 'AuthController.registrasiKelas')
    Route.post('revokeUserToken', 'AuthController.revokeUserToken').middleware(['auth:jwt'])
    Route.post('user/pelanggan', 'AuthController.getPelanggan').middleware(['auth:jwt'])
    Route.post('user/pelanggan/version', 'AuthController.getVersion')
}).prefix('api/v2/auth')


Route.group(() => {
    Route.get('expired-permatabelajar', 'CrontJobsController.expired')
}).prefix('api/v2/cront-job').namespace('v2')


Route.group(() => {
    Route.post('home/slider', 'HomeController.slider')
    Route.post('home/kelas', 'HomeController.listKelas')
    Route.post('home/feature', 'HomeController.listFeature')
    Route.post('home/feature/lainya', 'HomeController.listFeatureLainya')
}).prefix('api/v2/belajar/').middleware(['auth:jwt']).namespace('v2')



// ringkasan materi
Route.group(() => {
    Route.post('mata-pelajaran', 'ListController.mataPelajaran')
    Route.post('topik-belajar', 'ListController.topikBelajar')
    Route.post('topik-belajar/new', 'ListController.topikBelajarNew')
    Route.post('submit/read', 'ListController.submitRead')
}).prefix('api/v2/belajar/home/ringkasan-materi').middleware(['auth:jwt']).namespace('v2/RingkasanMateri')
// ringkasan materi
Route.group(() => {
    Route.get('/view/:url', 'ListController.viewRingkasanMateri').as('v2.ringkasan-materi.view')
}).prefix('api/v2/belajar/home/ringkasan-materi').namespace('v2/RingkasanMateri')

// video
Route.group(() => {
    Route.post('mata-pelajaran', 'ListController.mataPelajaran')
    Route.post('topik-belajar', 'ListController.topikBelajar')
    Route.post('submit/read', 'ListController.submitRead')
    Route.post('latihan/result', 'ListController.latihanResult')
    Route.post('latihan/answer', 'ListController.answerResult')
}).prefix('api/v2/belajar/home/video').middleware(['auth:jwt']).namespace('v2/Video')


// latihan soal
Route.group(() => {
    Route.post('mata-pelajaran', 'ListController.mataPelajaran')
    Route.post('mata-pelajaran/semester', 'ListController.mataPelajaranSemester')
    Route.post('topik-belajar', 'ListController.topikBelajar')
    Route.post('topik/mata-pelajaran', 'ListController.topikMataPelajaran')
    Route.post('submit/request', 'SoalController.request')
    Route.post('latihan/result', 'SoalController.latihanResult')
    Route.post('latihan/answer', 'SoalController.latihanAnswer')
    Route.post('latihan/finish', 'SoalController.latihanFinish')
    //semester
    Route.post('ujian', 'ListController.ujianBelajar')
    Route.post('submit/semester/request', 'SoalController.requestSemester')
    Route.post('semester/latihan/result', 'SoalController.latihanResultSemester')
}).prefix('api/v2/belajar/home/soal').middleware(['auth:jwt']).namespace('v2/Soal')


// sbmptn
Route.group(() => {
    Route.post('jurusan', 'ListController.jurusan')
    Route.post('mata-pelajaran', 'ListController.mataPelajaran')
    Route.post('feature-list', 'ListController.featureList')
    Route.post('latihan-soal/request', 'SoalController.request')
    Route.post('latihan-soal/result', 'SoalController.latihanResult')
    Route.post('latihan-soal/answer', 'SoalController.latihanAnswer')
    Route.post('latihan-soal/finish', 'SoalController.latihanFinish')
}).prefix('api/v2/belajar/home/ptn').middleware(['auth:jwt']).namespace('v2/Ptn')


// transaksi
Route.group(() => {
    Route.post('list', 'TransaksiController.list')
}).prefix('api/v2/transaksi').middleware(['auth:jwt']).namespace('v2/Transaksi')

Route.group(() => {
    Route.get('list', 'TransaksiController.pelanggan')
}).prefix('api/v2/pelanggan').namespace('v2/Transaksi')

Route.group(() => {
    Route.post('list', 'PaketController.list')
    Route.post('list/filter', 'PaketController.filter')
    Route.post('order/status', 'OrderController.Status')
    Route.post('order/requested', 'OrderController.Requested')
    Route.post('order/voucher', 'OrderController.voucher')
    Route.post('order/voucher/execute', 'OrderController.voucherExecute')
    Route.post('order/checkout/submit', 'OrderController.checkoutSubmit')
    Route.post('order/payment/list', 'OrderController.paymentList')
    Route.post('order/payment/submit', 'OrderController.paymentSubmit')
    Route.post('order/payment/bukti-pembayaran', 'OrderController.buktiPembayaran')
    Route.post('order/payment/manual/change-payment', 'OrderController.PaymentRemove')
    Route.post('order/finish/status', 'OrderController.finishStatus')
}).prefix('api/v2/transaksi/paket').middleware(['auth:jwt']).namespace('v2/Transaksi')


Route.group(() => {
    Route.post('response', 'PaymentController.response')
}).prefix('api/v2/transaksi/payment/midtrans').namespace('v2/Transaksi')

Route.group(() => {
    Route.post('list', 'ListController.list')
}).prefix('api/v2/notification').middleware(['auth:jwt']).namespace('v2/Notifikasi')

Route.group(() => {
    Route.post('list', 'HistoryController.list')
    Route.post('more', 'HistoryController.more')
}).prefix('api/v2/profile/history').middleware(['auth:jwt']).namespace('v2/Profile')

Route.group(() => {
    Route.post('langganan', 'ProfileController.langganan')
    Route.post('list', 'ProfileController.list')
    Route.post('tanya-soal', 'ProfileController.tanyaSoal')
    Route.post('tanya-soal/filter', 'ProfileController.tanyaSoalFilter')
    Route.post('tanya-soal/mata-pelajaran', 'ProfileController.tanyaSoalMataPelajaran')
    Route.post('tanya-soal/submit', 'ProfileController.tanyaSoalSubmit')
}).prefix('api/v2/profile').middleware(['auth:jwt']).namespace('v2/Profile')

