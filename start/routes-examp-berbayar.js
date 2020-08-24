'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const Helpers = use('Helpers')
//Tryout Examp Bimbel Online
Route.group(() => {

	Route.post('online', 'Web/Frontend/TestOnlineController.order_online')    
	Route.get('getkelas/:jenis_paket/:id', 'Web/Frontend/TestOnlineController.getkelas') 
	Route.get('pembahasan/:id_user', 'Web/Frontend/TestOnlineController.nilai')  
	Route.get('report/profile/:id_user', 'Web/Frontend/TestOnlineController.profile') 

	// Route.get('report/start/:id_examp/:id_user', 'Web/Frontend/TestOnlineController.start')
	Route.post('report/start', 'Web/Frontend/TestOnlineController.start')
	Route.post('report/start_next_prev', 'Web/Frontend/TestOnlineController.start_next_prev')

	Route.post('test_data', 'Web/Frontend/TestOnlineController.test_data') 

	Route.post('kategori_pilihan', 'Web/Frontend/TestOnlineController.kategori_pilihan')   
	Route.get('check_payment/:id', 'Web/Frontend/TestOnlineController.check_payment')   
	Route.post('get_data_paket_berbayar', 'Web/Frontend/TestOnlineController.get_data_paket') 
	Route.post('get_jenis_latihan/berbayar', 'Web/Frontend/TestOnlineController.get_jenis_latihan') 

	Route.post('get_tahun', 'Web/Frontend/TestOnlineController.get_tahun')   
	Route.post('get_matpel', 'Web/Frontend/TestOnlineController.get_matpel')   
	Route.get('payment_manual', 'Web/Frontend/TestOnlineController.payment_manual')   
	Route.get('payment_online', 'Web/Frontend/TestOnlineController.payment_online')   
	Route.post('getOrder', 'Web/Frontend/TestOnlineController.get_order_and_order_deal')   
	Route.post('data_pelanggan', 'Web/Frontend/TestOnlineController.data_pelanggan') 
	Route.get('voucher/:id','Web/Frontend/TestOnlineController.voucher')  
	Route.post('update_deal_web','Web/Frontend/TestOnlineController.update_deal_web')  
	
	Route.post('update_order', 'Web/Frontend/TestOnlineController.update_order')   
	Route.post('delete_payment_order', 'Web/Frontend/TestOnlineController.delete_payment_order')   
	Route.post('input_payment', 'Web/Frontend/TestOnlineController.input_payment')   
	Route.get('get_payment/:id', 'Web/Frontend/TestOnlineController.get_payment')   
	Route.post('cek_in_payment', 'Web/Frontend/TestOnlineController.cek_in_payment')   
	Route.post('private_order', 'Web/Frontend/TestOnlineController.private_order')  

	Route.post('store_asal_sekolah', 'Web/Frontend/TestOnlineController.store_asal_sekolah')   
	Route.post('kota_sekolah', 'Web/Frontend/TestOnlineController.kota_sekolah')   

	Route.post('rejected', 'Web/Frontend/TestOnlineController.rejected')   
	Route.post('payment_method', 'Web/Frontend/TestOnlineController.payment_method')   
	Route.post('cancel_payment', 'Web/Frontend/TestOnlineController.cancel_payment')   
	Route.post('amount_cost_ordel_deal', 'Web/Frontend/TestOnlineController.amount_cost_ordel_deal') 

	
	Route.post('send_mail_pembayaran', 'Web/Frontend/TestOnlineController.send_mail_pembayaran')   

	//bedah materi pelajaran
	Route.post('get_matpel_bedahmateri', 'Web/Frontend/TestOnlineController.get_matpel_bedahmateri')   
	Route.post('get_silabus_bedahmateri', 'Web/Frontend/TestOnlineController.get_silabus_bedahmateri')   
	Route.post('get_file_bedahmateri', 'Web/Frontend/TestOnlineController.get_file_bedahmateri')   
	

}).prefix('api/v1/langganan/examp')