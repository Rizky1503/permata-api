'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const randomstring = use("randomstring");
const Order = use('App/Models/OrderModel')
const request = require('request');
const moment = require('moment');
class freeController {

	async Menu ({response}) {
		const menu = await Database
			.query()
		  	.table('in_menu')
		  	.where('product', 'BO')
		  	.where('active', '1')
		  	.orderBy('orderBy','ASC')
		return response.json({
			status : 'true',
			responses : '200',
			data:menu			
		})
	}

	async tingkat ({response}) {
		const tingkat = await Database
			.query()
			.select('kelas as label','kelas as value',)
		  	.table('in_soal_langganan')
		  	.groupBy('kelas')
		return response.json({
			status : 'true',
			responses : '200',
			data:tingkat			
		})
	}

	async mata_pelajaran ({request, response}) {
		const input = request.only(['tingkat']);
		const mapel = await Database
			.query()
			.select('kelas as label','kelas as value',)
		  	.table('in_soal_langganan')
		  	.where('tingkat', input.tingkat)
		  	.groupBy('kelas')
		return response.json({
			status : 'true',
			responses : '200',
			data:mapel			
		})
	}

	async store_temp ({request, response}) {

		const temps	= request.only(['tingkat', 'matpel','id_user', 'jenis_paket'])

		const affectedRows = await Database
	  	.table('in_soal_temp_langganan')
	  	.where('id_user', temps.id_user)
	  	.where('jenis_paket', temps.jenis_paket)
	  	.delete()
		
		const MatPelOnline 	= await Database
		.query()
	  	.table('in_matpel_online_langganan')
	  	.where('tingkat', temps.tingkat)
	  	.where('kelas', temps.matpel)
	  	.where('jenis_paket', temps.jenis_paket)
	  	.where('jumlah_soal','!=',0)	

	  	var Tampung_Data = [];
	  	for (var i = 0; i < MatPelOnline.length; i++) {	  		
	  		
	  		const soal = await Database
		  	.table('in_soal_langganan')
		  	.where('tingkat', MatPelOnline[i].tingkat)
		  	.where('kelas', MatPelOnline[i].kelas)
		  	.where('nama_matpel', MatPelOnline[i].mata_pelajaran)
		  	.where('jenis_paket', MatPelOnline[i].jenis_paket)
			.whereNotNull('soal')
			.whereNotNull('jawaban')
			.orderByRaw('random()')
			.limit(MatPelOnline[i].jumlah_soal)			
	  		Tampung_Data.push(soal);	
  		}	

  		for (var i = 0; i < Tampung_Data.length; i++) {

  			for (var no = 0; no < Tampung_Data[i].length; no++) {

  				const data_store_temp = await Database
				  .table('in_soal_temp_langganan')
				  .insert({
				  	id_soal: Tampung_Data[i][no].id_soal, 
				  	id_user: temps.id_user,
				  	waktu: Tampung_Data[i][no].waktu,
				  	jawaban_betul: Encryption.encrypt(Tampung_Data[i][no].jawaban),
				  	jenis_paket: Tampung_Data[i][no].jenis_paket, 
				})
  			}
  		}

  		const GetTime = await Database
	  	.table('in_soal_temp_langganan')
	  	.where('id_user', temps.id_user)
	  	.where('jenis_paket', temps.jenis_paket)
	  	.sum('waktu')
	  	.first()

  		return response.json({
			status : 'true',
			responses : '200',
			data:MatPelOnline,
			menit:GetTime.sum		
		})
	}


	async store_submit ({request, response}) {

		const processData	= request.only(['id_user', 'keterangan', 'waktu_test','jenis_paket'])

		const Cek = await Database
	  	.table('in_soal_examp_langganan')
	  	.where('id_user', processData.id_user)
	  	.where('status', 'Mulai')
	  	.where('jenis_paket', processData.jenis_paket)
	  	.count()
	  	.first()

	  	if (Cek.count == 0) {

			const send_data_examp = await Database
		  	.table('in_soal_examp_langganan')
		  	.insert({
			  	id_user: processData.id_user, 
			  	keterangan: processData.keterangan,
			  	waktu_test: processData.waktu_test,
			  	status: 'Mulai',
			  	jenis_paket: processData.jenis_paket,
			  	created_at: new Date(),
			  	updated_at: new Date()
			})
			.returning('id_examp')	

			const get_data_temp = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', processData.id_user)
		  	.where('jenis_paket', processData.jenis_paket)

		  	for (var i = 0; i < get_data_temp.length; i++) {		  		
		  		const send_data_execute = await Database
				  .table('in_soal_execute_langganan')
				  .insert({
				  	id_soal: get_data_temp[i].id_soal, 
				  	jawaban_betul: get_data_temp[i].jawaban_betul,
				  	id_user: processData.id_user,
				  	id_examp: send_data_examp[0],
				})
		  	}

		  	return response.json({
				status : 'true',
				responses : '200',
				data:"Completed",
			})
		}else{
			return response.json({
				status : 'true',
				responses : '200',
				data:"No Completed",
			})
		}


	}

	async check_kondition({request, response}){
		const data	= request.only(['id_user','tingkat','jenis_paket','no_invoice'])
		const Cek = await Database
	  	.table('in_soal_examp_langganan')
	  	.where('id_user', data.id_user)
	  	.where('status', 'Mulai')
	  	.where('jenis_paket', data.jenis_paket)
	  	.orderBy('id_examp','DESC')
	  	.first()

		const JenisTes = await Database
			.query()
			.select('kelas')
		  	.table('in_soal_langganan')
		  	.where('tingkat', data.tingkat)
		  	.where('jenis_paket', data.jenis_paket)
		  	.groupBy('kelas')
		  	.orderBy('kelas')
		  	
		const CheckPassingGrade = await Database
			.query()
		  	.table('in_soal_examp_langganan')
		  	.where('id_user', data.id_user)
		  	.where('jenis_paket', data.jenis_paket)
		  	.orderBy('id_examp','DESC')
			.first()

	  	return response.json({
			status : 'true',
			responses : '200',
			data:Cek,
			jenis_tes: JenisTes,
			CheckData: CheckPassingGrade,
		})
	}

	async profile({request, response}){
		const data	= request.only(['id_user','jenis_paket'])
		const Cek = await Database
	  	.table('in_soal_examp_langganan')
	  	.where('id_user', data.id_user)
	  	.where('status', 'Mulai')
	  	.where('jenis_paket', data.jenis_paket)
	  	.orderBy('id_examp')
	  	.first()

	  	return response.json({
			status : 'true',
			responses : '200',
			data:Cek
		})
	}


	async test_list_number ({request, response}) {

		const temps	= request.only(['id_examp'])	
		const SoalData 	= await Database
		.query()
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', temps.id_examp)
	  	.orderBy('in_soal_execute_langganan.id_soal_execute')

	  	const Satu_Soal = await Database
		.query()
	  	.table('in_soal_execute_langganan')
	  	.innerJoin('in_soal_langganan', 'in_soal_langganan.id_soal', 'in_soal_execute_langganan.id_soal')
	  	.where('id_examp', temps.id_examp)
	  	.orderBy('in_soal_execute_langganan.id_soal_execute')
	  	.first()

	  	return response.json({
			status 		: 'true',
			responses 	: '200',
			Satu_Soal	: Satu_Soal,	
			data 		: SoalData			
		})
	}

	async click_number ({request, response}) {

		const temps	= request.only(['id_soal_execute'])			
	  	const Satu_Soal = await Database
		.query()
	  	.table('in_soal_execute_langganan')
	  	.innerJoin('in_soal_langganan', 'in_soal_langganan.id_soal', 'in_soal_execute_langganan.id_soal')
	  	.where('id_soal_execute', temps.id_soal_execute)
	  	.orderBy('in_soal_execute_langganan.id_soal_execute')
	  	.first()

	  	const check_sebelumnya = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Satu_Soal.id_examp)
	  	.where('id_soal_execute', '<', temps.id_soal_execute)
	  	.count()
	  	.first()

		const check_selanjutnya = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Satu_Soal.id_examp)
	  	.where('id_soal_execute', '>', temps.id_soal_execute)
	  	.count()
	  	.first()

	  	return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: Satu_Soal,
			sebelumnya  : check_sebelumnya.count,
			selanjutnya : check_selanjutnya.count,
		})
	}

	async answer ({request, response}) {

		const temps	= request.only(['id_soal_execute', 'jawaban'])

			const soalJawab = await Database
			.table('in_soal_execute_langganan')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({jawaban_user: temps.jawaban})

		const Check = await Database
			.table('in_soal_execute_langganan')
		  	.innerJoin('in_soal_langganan', 'in_soal_execute_langganan.id_soal', 'in_soal_langganan.id_soal')
		  	.where('id_soal_execute', temps.id_soal_execute)
		  	.first()

		if (Check.jawaban_user === null) {
			
			const nilai = 0
			const soal = await Database
			.table('in_soal_execute_langganan')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')

		}else if (Check.jawaban_user == Encryption.decrypt(Check.jawaban_betul)) {
			const nilai = 1
			const soal = await Database
			.table('in_soal_execute_langganan')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})			
			.returning('id_examp')

		}else{
			const nilai = 0
			const soal = await Database
			.table('in_soal_execute_langganan')
			.where('id_soal_execute', temps.id_soal_execute)
			.update({nilai: nilai})
			.returning('id_examp')

		}

		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: Check			
		})
	}

	async update_time ({request, response}) {

		const temps	= request.only(['id_examp'])

		const get_time = await Database
			.table('in_soal_examp_langganan')
		  	.where('id_examp', temps.id_examp)
		  	.first()

		if (get_time.waktu_test != 0) {
			const update_time = await Database
			.table('in_soal_examp_langganan')
			.where('id_examp', temps.id_examp)
			.update({
				waktu_test: get_time.waktu_test - 1
			})
		}

			
		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: "success"			
		})
	}


	async Finish ({request, response}) {

		const temps	= request.only(['id_examp'])
		const soal = await Database
			.table('in_soal_execute_langganan')
		  	.where('id_examp', temps.id_examp)
		  	.sum('nilai')
		  	.first()

		const TotalSoal = await Database
			.table('in_soal_execute_langganan')
		  	.where('id_examp', temps.id_examp)
		  	.count()
		  	.first()

		const benar = await Database
			.table('in_soal_execute_langganan')
		  	.where('id_examp', temps.id_examp)
		  	.where('nilai', '1')
		  	.count()
		  	.first()

		const salah = await Database
			.table('in_soal_execute_langganan')
		  	.where('id_examp', temps.id_examp)
		  	.whereNotNull('jawaban_user')
		  	.where('nilai', '0')
		  	.count()
		  	.first()


		const nullable = await Database
			.table('in_soal_execute_langganan')
		  	.where('id_examp', temps.id_examp)
		  	.whereNull('jawaban_user')
		  	.count()
		  	.first()

		const keterangan = ({
			benar: benar.count,
			salah: salah.count,
			tidak_jawab: nullable.count
		})

		const SoalTotal 			= TotalSoal.count * 4;
		const SoalTotalBenar 		= soal.sum;
		const SoalTotalCount 		= soal.sum / SoalTotal;
		const SoalTotalCountPercent = SoalTotalCount * 100;


		const Examp = await Database
			.table('in_soal_examp_langganan')
			.where('id_examp', temps.id_examp)
			.update({total_nilai: soal.sum, keterangan_akhir: keterangan, status: 'Selesai', passing_grade: SoalTotalCountPercent})


		const result = ({
			total_nilai: soal.sum,
			total_soal: TotalSoal.count,
			benar: benar.count,
			salah: salah.count,
			tidak_jawab: nullable.count
		})

		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: result			
		})
		return response.json(keterangan)
	}

	async Order({request, response}){

		const Inputs    = request.only(['id_pelanggan','tingkat','mata_pelajaran', 'harga'])   

        const CountRow      = await Database
        .query()
        .table('in_order')      
        .where('id_user_order','=',Inputs.id_pelanggan)
        .whereIn('status_order', ['Pending','In Progres','Cek_Pembayaran','Rejected'])
        .where('product','=','BO')
        .where('keterangan', Inputs.tingkat)
        .where('kondisi', Inputs.mata_pelajaran)
        .count()
        .first()

        const Data_Pelanggan  = await Database
        .query()
        .table('in_pelanggan')      
        .select('email_verified')
        .where('id_pelanggan',Inputs.id_pelanggan)
        .first()

        

        if (CountRow.count < 1) {
        	function appendLeadingZeroes(n){
				if(n <= 9){
				  return "0" + n;
				}
				return n
			}
	  
		  	let current_datetime = new Date()
		  	let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())			  
		  	const lastProduk = await Database.select(Database.raw('substr(id_order,12,30) as id_order'))
				.from('in_order')
				.orderBy(Database.raw('substr(id_order,12,30)'), 'desc')
				.first();
			let lastProdukNumber = null;	  
			if (lastProduk ) {	  
				lastProdukNumber = 'INV'+ formatted_date + ++lastProduk.id_order;
			} else {	  
				lastProdukNumber = 'INV'+ formatted_date +'1000000001';	  
			}

			function add_months(current_datetime, n) 
			{
			   return new Date(current_datetime.setMonth(current_datetime.getMonth() + n));      
			}			

			const InsertData = new Order()
		  		InsertData.id_order 				= lastProdukNumber,
		  		InsertData.id_user_order 			= Inputs.id_pelanggan,
		  		InsertData.product 					= 'BO',
		  		InsertData.status_order 			= 'In Progres',
		  		InsertData.keterangan 				= Inputs.tingkat,
		  		InsertData.kondisi 					= Inputs.mata_pelajaran,
		  		InsertData.expired_bimbel_online	= add_months(current_datetime, 7)
			await InsertData.save()		

			const InsertDataPayment      = await Database
		        .query()
		        .table('in_order_deal')
		        .insert({
		        	id_order: InsertData.id_order,
		        	amount: Inputs.harga,
		        	description: 'berlangganan Bimbel Online',
	        })      	

		    const GetDataPayment      = await Database
		        .query()
		        .table('in_order_deal')
		        .where('id_order', InsertData.id_order)
			    .first()

			const GetDataPaket = await Order
			  .query()
			  .select(['id_order as value', Database.raw("CASE WHEN keterangan = 'TINGKAT' THEN kondisi ELSE concat_ws(' ', keterangan,kondisi) END AS label")])
			  .where('id_user_order', Inputs.id_pelanggan)
			  .whereIn('status_order', ['Pending','Cek_Pembayaran','In Progres'])
			  .where('product', "BO")
			  .fetch()


			const bodytelegram = "<b>"+ moment().format('D MMMM YYYY, h:mm:ss a') +"</b>\
					<pre><code class='language-python'>Pemberitahuan Order Baru Bimbel Online <b>Permata Bimbel Online</b></code></pre>"

			request('https://api.telegram.org/bot942020580:AAHUSq902msIsMt5-GEXjNmuCt6H5tL9gHQ/sendMessage?chat_id=289385941&text='+bodytelegram+'&parse_mode=html', { json: true }, (err, res, body) => {		  
			});

		    return response.json({
		    	Data: InsertData,
		    	Data_pelanggan: Data_Pelanggan,
		    	DataPayment: GetDataPayment,
		    	GetDataPaket: GetDataPaket,
		    })

        }else{
        	const DataRow      = await Database
	        .query()
	        .table('in_order')      
	        .where('id_user_order',Inputs.id_pelanggan)
	        .where('product','BO')
	        .where('keterangan', Inputs.tingkat)
	        .where('kondisi', Inputs.mata_pelajaran)
	        .orderBy('id_order','DESC')
	        .first()

	        const GetDataPayment      = await Database
		        .query()
		        .table('in_order_deal')
		        .where('id_order', DataRow.id_order)
			    .first()

			const GetDataPaket = await Order
			  .query()
			  .select(['id_order as value', Database.raw("CASE WHEN keterangan = 'TINGKAT' THEN kondisi ELSE concat_ws(' ', keterangan,kondisi) END AS label")])
			  .where('id_user_order', Inputs.id_pelanggan)			  
			  .whereIn('status_order', ['Pending','Cek_Pembayaran','In Progres'])
			  .where('product', "BO")
			  .fetch()

	        return response.json({
		    	Data: DataRow,
		    	Data_pelanggan: Data_Pelanggan,
		    	DataPayment: GetDataPayment,
		    	GetDataPaket: GetDataPaket,
		    })
        }
	}

	async check_paket({request, response}){
		const Inputs    = request.only(['id_order'])   
		const DataCount      = await Database
        .query()
        .table('in_order')      
        .where('id_order',Inputs.id_order)
        .count()
        .first()

        if (DataCount.count > 0) {
        	const DataRow      = await Database
	        .query()
	        .table('in_order')      
	        .where('id_order',Inputs.id_order)
	        .first()


	        const GetDataMataPelajaran      = await Database
	        .query()
	        .select('jenis_paket')
	        .table('in_soal_langganan')
	        .where('tingkat', DataRow.kondisi)
	        .groupBy('jenis_paket')

	        return response.json({
		    	Data: DataRow,
		    	GetDataMataPelajaran: GetDataMataPelajaran,
		    })
        }else{
	        return response.json({
		    	Data: [],
		    	GetDataMataPelajaran: [],
		    })
        }        
	}

	async check_tahun({request, response}){
		const Inputs    = request.only(['jenis_paket','tingkat'])   

		const Data = await Database
			.table('in_soal_langganan')
			.select('tahun_soal as value','tahun_soal as label')
		  	.where('jenis_paket', Inputs.jenis_paket)
		  	.where('tingkat', Inputs.tingkat)
		  	.groupBy('tahun_soal')
			
		return response.json({
			status 		: 'true',
			responses 	: '200',	
			Data 		: Data			
		})
	}

	async check_mata_pelajaran({request, response}){
		const Inputs    = request.only(['jenis_paket','tingkat', 'tahun_soal'])   

		const Data = await Database
			.table('in_soal_langganan')
			.select('nama_matpel')
		  	.where('jenis_paket', Inputs.jenis_paket)
		  	.where('tingkat', Inputs.tingkat)
		  	.where('tahun_soal', Inputs.tahun_soal)
		  	.groupBy('nama_matpel')
			
		return response.json({
			status 		: 'true',
			responses 	: '200',	
			Data 		: Data			
		})
	}

	async submit_data({request, response}){
		const temps	= request.only(['id_user', 'tingkat', 'matpel','jenis_paket','tahun_soal','keterangan'])

		const affectedRows = await Database
	  	.table('in_soal_temp_langganan')
	  	.where('id_user', temps.id_user)
	  	.delete()	

	  	// ==============================================================================================

		const Cek = await Database
	  	.table('in_soal_examp_langganan')
	  	.where('id_user', temps.id_user)
	  	.where('status', 'Mulai')
	  	.where('jenis_paket', temps.jenis_paket)
	  	.where('keterangan', temps.keterangan)
	  	.count()
	  	.first()

	  	if (Cek.count == 0) {

	  		const MatPelOnline 	= await Database
			.query()
		  	.table('in_matpel_online_langganan')
		  	.where('tingkat', temps.tingkat)
		  	.where('kelas', temps.matpel)
		  	.where('jenis_paket', temps.jenis_paket)
		  	.where('jumlah_soal','!=',0)	

		  	var Tampung_Data = [];
		  	for (var i = 0; i < MatPelOnline.length; i++) {	  		
		  		
		  		const soal = await Database
			  	.table('in_soal_langganan')
			  	.where('tingkat', MatPelOnline[i].tingkat)
			  	.where('kelas', MatPelOnline[i].kelas)
			  	.where('nama_matpel', MatPelOnline[i].mata_pelajaran)
			  	.where('jenis_paket', MatPelOnline[i].jenis_paket)
			  	.where('tahun_soal', temps.tahun_soal)
				.whereNotNull('soal')
				.whereNotNull('jawaban')
				.orderByRaw('random()')
				.limit(MatPelOnline[i].jumlah_soal)			
		  		Tampung_Data.push(soal);	
	  		}	

	  		for (var i = 0; i < Tampung_Data.length; i++) {

	  			for (var no = 0; no < Tampung_Data[i].length; no++) {

	  				const data_store_temp = await Database
					  .table('in_soal_temp_langganan')
					  .insert({
					  	id_soal: Tampung_Data[i][no].id_soal, 
					  	id_user: temps.id_user,
					  	waktu: Tampung_Data[i][no].waktu,
					  	jawaban_betul: Encryption.encrypt(Tampung_Data[i][no].jawaban),
					  	jenis_paket: Tampung_Data[i][no].jenis_paket, 
					})
	  			}
	  		}

	  		const GetTime = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', temps.id_user)
		  	.where('jenis_paket', temps.jenis_paket)
		  	.sum('waktu')
		  	.first()

			const send_data_examp = await Database
		  	.table('in_soal_examp_langganan')
		  	.insert({
			  	id_user: temps.id_user, 
			  	keterangan: temps.keterangan,
			  	waktu_test: GetTime.sum,
			  	status: 'Mulai',
			  	jenis_paket: temps.jenis_paket,
			  	created_at: new Date(),
			  	updated_at: new Date()
			})
			.returning('id_examp')	

			const get_data_temp = await Database
		  	.table('in_soal_temp_langganan')
		  	.where('id_user', temps.id_user)

		  	for (var i = 0; i < get_data_temp.length; i++) {		  		
		  		const send_data_execute = await Database
				  .table('in_soal_execute_langganan')
				  .insert({
				  	no_urut: i + 1,
				  	id_soal: get_data_temp[i].id_soal, 
				  	jawaban_betul: get_data_temp[i].jawaban_betul,
				  	id_user: temps.id_user,
				  	id_examp: send_data_examp[0],
				})
		  	}
		  	return response.json({
				status : 'true',
				responses : '200',
				data:"Completed",
				keterangan: temps.keterangan
			})
		}else{
			return response.json({
				status : 'true',
				responses : '200',
				data:"No Completed",
				keterangan: temps.keterangan
			})
		}  		
	}


	async get_soal({request, response}){
		const temps	= request.only(['id_user', 'keterangan','jenis_paket'])		
		const Data_Examp = await Database
	  	.table('in_soal_examp_langganan')
	  	.where('id_user', temps.id_user)
	  	.where('status', 'Mulai')
	  	.where('jenis_paket', temps.jenis_paket)
	  	.where('keterangan', temps.keterangan)
	  	.orderBy('id_examp','DESC')
	  	.first()

		const Data_Execute_Count = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.count()
	  	.first()

		const Data_Soal_Pertama = await Database
	  	.table('in_soal_execute_langganan')
	  	.innerJoin('in_soal_langganan', 'in_soal_langganan.id_soal', 'in_soal_execute_langganan.id_soal')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.orderBy('id_soal_execute', 'ASC')
	  	.first()
		
		const check_sebelumnya = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.where('id_soal_execute', '<', Data_Soal_Pertama.id_soal_execute)
	  	.count()
	  	.first()

		const check_selanjutnya = await Database
	  	.table('in_soal_execute_langganan')
	  	.where('id_examp', Data_Examp.id_examp)
	  	.where('id_soal_execute', '>', Data_Soal_Pertama.id_soal_execute)
	  	.count()
	  	.first()


	  	const result = ({
			data_examp: Data_Examp,
			total_soal: Data_Execute_Count.count,
			soal_pertama: Data_Soal_Pertama,
			sebelumnya: check_sebelumnya.count,
			selanjutnya: check_selanjutnya.count,
		})

		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: result			
		})
	}
}

module.exports = freeController
