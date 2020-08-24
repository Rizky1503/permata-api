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

// destkop
Route.group(() => {
	Route.post('pelanggan', 'Mobile/Auth/LoginController.login')
}).prefix('api/v2/auth/login')

//content
Route.group(() => {
	//get master
	Route.get('getKelas','Ts_ContentController.getKelas')
	Route.get('getJurusan','Ts_ContentController.getJurusan')
	Route.get('getfeature','Ts_ContentController.getfeature')
	Route.get('getSemester','Ts_ContentController.getSemester')
	Route.get('getUjian','Ts_ContentController.getUjian')
	Route.get('getBidangStudi','Ts_ContentController.getBidangStudi')
	Route.get('getBidangStudiId/:kelas/:feature','Ts_ContentController.getBidangStudiId')
	Route.get('getTopik','Ts_ContentController.getTopik')

  Route.get('getjurusancontent/:id', 'Ts_ContentController.getjurusancontent')

  Route.get('getKumpulan', 'Ts_ContentController.getKumpulan')
  Route.post('updateKumpulan', 'Ts_ContentController.updateKumpulan')


    // Store
    Route.post('StoreContentKelas','Ts_ContentController.StoreContentKelas')
    Route.post('StoreContentFitur','Ts_ContentController.StoreContentFitur')
    Route.post('StoreContentMateri','Ts_ContentController.StoreContentMateri')

    // View
    Route.get('ListContentKelas','Ts_ContentController.ListContentKelas')
    Route.get('ListContentFitur/:id','Ts_ContentController.ListContentFitur')
    Route.post('ListContentMateri','Ts_ContentController.ListContentMateri')

    // delete
    Route.get('deleteContentMateri/:id','Ts_ContentController.deleteContentMateri')

    // 
    Route.get('getSortTopik/:kelas/:matpel/:topik','Ts_ContentController.getSortTopik')
    

    // update
    Route.post('UpdateSort','Ts_ContentController.UpdateSort')

}).prefix('api/v2/content').namespace('v2/Backend')

//Ringkasan Materi
Route.group(() => {
	
	// store materi
	Route.post('storeRingkasanMateri','Ts_RingkasanMateriController.storeRingkasanMateri')

	// view materi
	Route.get('listRingkasanMateri/:id','Ts_RingkasanMateriController.listRingkasanMateri')

	// delete materi
	Route.post('deleteRingkasanMateri','Ts_RingkasanMateriController.deleteRingkasanMateri')

}).prefix('api/v2/ringkasan').namespace('v2/Backend')

//Soal
Route.group(() => {
	// store soal
	Route.post('storeSoal','Ts_SoalController.storeSoal')

	// view soal
	Route.get('listSoal/:id','Ts_SoalController.listSoal')

	// Delete Soal
	Route.get('deleteSoal/:id','Ts_SoalController.deleteSoal')

}).prefix('api/v2/soal').namespace('v2/Backend')

//Video
Route.group(() => {
	// store video
	Route.post('storeVideo','Ts_videoController.storeVideo')

	// view video
	Route.get('listVideo/:id','Ts_videoController.listVideo')

	// Delete Video
	Route.get('deleteVideo/:id','Ts_videoController.deleteVideo')
	
}).prefix('api/v2/video').namespace('v2/Backend')

//Kuis
Route.group(() => {
	// store Kuis
	Route.post('storekuis','Ts_quizController.storekuis')

	// view Kuis
	Route.get('listkuis/:id/:uuid','Ts_quizController.listkuis')

	// Delete Kuis
	Route.get('deletekuis/:id','Ts_quizController.deletekuis')
	
}).prefix('api/v2/kuis').namespace('v2/Backend')

//Recruitment
Route.group(() => {
	// store Recruitment
	Route.post('storerecruitment','Ts_RecruitmentController.storerecruitment')

	// view Recruitment
	Route.get('ListRecruitment','Ts_RecruitmentController.ListRecruitment')
	
}).prefix('api/v2/recruitment').namespace('v2/Backend')

//master
Route.group(() => {
	Route.post('topik','Ts_MasterController.topik')
	Route.get('DeleteTopik/:id/:user','Ts_MasterController.DeleteTopik')
	Route.post('UpdateSortTopik','Ts_MasterController.UpdateSortTopik')
	Route.get('TopikId/:id','Ts_MasterController.TopikId')
	Route.post('UpdateTopik','Ts_MasterController.UpdateTopik')
	Route.get('TopikMatpel/:kelas/:matpel','Ts_MasterController.TopikMatpel')
	Route.get('KelasTopik','Ts_MasterController.KelasTopik')
	Route.get('getBidangStudi/:id','Ts_MasterController.getBidangStudi')
	Route.get('sortTopikContent/:satu','Ts_MasterController.sortTopikContent')
	Route.post('TampilSortTopik','Ts_MasterController.TampilSortTopik')
	
}).prefix('api/v2/master').namespace('v2/Backend')


//tscn paket
Route.group(() => {
	Route.get('ListPaket','Tscn_PaketController.ListPaket')
	Route.post('SetActive','Tscn_PaketController.SetActive')
}).prefix('api/v2/paket').namespace('v2/Backend')