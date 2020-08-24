'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')
var ImageKit = require("imagekit");

var imagekit = new ImageKit({
    publicKey : "public_P9cO9h1sNXj18aNt5wZ8J3LKCpQ=",
    privateKey : "private_D+ZR78QVbTF6nhfcJG7kvrtCgG0=",
    urlEndpoint : "https://ik.imagekit.io/pmjr/"
});


class ListController {

	async mataPelajaran ({request, response}) {

		const data	= request.only(['id_kelas','id_feature','id_jurusan', 'id_kelas'])  
		// const dataKelas = await Database
		// 	.table('v2.ts_content as content')
		// 	.select('content.id_feature','feature')
		// 	.innerJoin('v2.ms_feature as feature', 'feature.id_feature', 'content.id_feature')	
		// 	.where('id_kelas', data.id_kelas)
		// 	.groupBy('content.id_feature','feature')

		// for (var iresult = 0; iresult < dataKelas.length; iresult++) {

		// 	const dataMataPelajaran = await Database
		// 		.table('v2.ts_content as content')
		// 		.select('content.id_bidang_studi','bidang_studi', 'sort')
		// 		.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')	
		// 		.where('id_kelas', data.id_kelas)
		// 		.where('id_feature', dataKelas[iresult].id_feature)
		// 		.groupBy('content.id_bidang_studi','bidang_studi', 'sort')
		// 		.orderBy('sort', 'ASC')
		// 	dataKelas[iresult].mataPelajaran = dataMataPelajaran

		// 	for (var imatpel = 0; imatpel < dataMataPelajaran.length; imatpel++) {

		// 		const dataTopik = await Database
		// 			.table('v2.ts_content as content')
		// 			.select('content.id_topik','topik', 'sorting')
		// 			.innerJoin('v2.ms_topik as topik', 'topik.id_topik', 'content.id_topik')	
		// 			.where('id_kelas', data.id_kelas)
		// 			.where('id_feature', dataKelas[iresult].id_feature)
		// 			.where('id_bidang_studi', dataMataPelajaran[imatpel].id_bidang_studi)
		// 			.groupBy('content.id_topik','topik', 'sorting')
		// 			.orderBy('sorting', 'ASC')

		// 		dataMataPelajaran[imatpel].dataTopik = dataTopik
		// 	}
		// }

		// return dataKelas

		const id_kelas 		= data.id_kelas;
		const id_feature 	= data.id_feature;
		const id_jurusan 	= data.id_jurusan;

		const dataJurusan = await Database
			.select('content.id_jurusan','jurusan', 'sort')
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_jurusan as jurusan', 'jurusan.id_jurusan', 'content.id_jurusan')		
			.where('id_kelas',id_kelas)
			.where('id_feature',id_feature)
			.where('content.id_jurusan','!=', 0)
			.groupBy('content.id_jurusan','jurusan', 'sort')
			.orderBy('sort', 'ASC')

		const jurusan_active = id_jurusan == 0 ? dataJurusan[0] ? dataJurusan[0].id_jurusan : 0 : id_jurusan;

		const dataMataPelajaran = await Database
			.select('id_kelas','id_feature','sort', 'id_jurusan')			
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')		
			.where('id_kelas',data.id_kelas)
			.where('id_feature',id_feature)
			.where('id_jurusan',jurusan_active)
			.groupBy('id_kelas','id_feature','sort', 'id_jurusan')
			.orderBy('sort', 'ASC')

		const result = [];
		for (var i = 0; i < dataMataPelajaran.length; i++) {
			if (i % 4 == 0) {
				const resultMataPelajaran = await Database
				.select('bidang_studi.id_bidang_studi','bidang_studi','id_kelas', 'icon')		
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')		
				.where('id_kelas',dataMataPelajaran[i].id_kelas)
				.where('id_feature',dataMataPelajaran[i].id_feature)
				.where('id_jurusan',jurusan_active)
				.where('sort' , '>', dataMataPelajaran[i].sort - 1)
				.groupBy('bidang_studi.id_bidang_studi','bidang_studi','id_kelas')
				.orderBy('sort', 'ASC')
				.limit(4)

				for (var iresult = 0; iresult < resultMataPelajaran.length; iresult++) {
					resultMataPelajaran[iresult].image = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/menu/icon/'+resultMataPelajaran[iresult].icon
				}
				var feed = {page: i, data: resultMataPelajaran};
				result.push(feed);				
			}
		}

		const resultData = ({
			jurusan 		: dataJurusan,
			jurusan_active 	: jurusan_active,
			mata_pelajaran 	: result
		})

	    return response.json({
			status : 'true',
			responses : '200',
			data:resultData			
		})
	}

	async topikBelajar ({request, response}) {


		// const upload = imagekit.upload({
		//     file  				: 'https://ik.imagekit.io/pmjr/home/slider/tes-masuk-ptn_qCW3oGHVqy.jpg', //required
		//     fileName 			: "my_file_name.jpg",   //required
		//     folder 				: 'ringkasan-materi/',
		//     useUniqueFileName 	: 'false'	
		// }).then(response => {
		// 	return response
		// }).catch(error => {
		// 	return error
		// });


		// return upload

		// var imageURL = imagekit.url({
		//     path : "/home/slider/tes-masuk-ptn_qCW3oGHVqy.jpg",
		//     // transformation : [{
		//     //     "height" : "300",
		//     //     "width" : "400"	
		//     // }]
		//     transformation : [{
		//     	overlayImage 	: "logo-icon_SamsmoUr6XN.png",
		//     	overlayWidth 	: 30,
		//     	overlayX 		: 30,
		//     	overlayY 		: 20,
		//     }]
		// });

		// return imageURL

		const data	= request.only(['id_feature','id_jurusan','id_kelas','id_bidang_studi', 'id_pelanggan'])  

		const accessLangganan = await Database
			.select('invoice')
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket_available as paket_available', 'paket_available.id_paket', 'order.id_paket')		
			.where('order.id_pelanggan', data.id_pelanggan)
			.where('order.tab_order', 'Selesai')
			.where('order.status_order', 'Approved')
			.where('paket_available.id_kelas', data.id_kelas)
			.first()


		const dataTopik = await Database
			.select('content.id_content','topik', 'sort')			
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_topik as topik', 'topik.id_topik', 'content.id_topik')	
			.leftJoin('v2.ts_ringkasan_materi as ringkasan_materi', 'ringkasan_materi.id_content', 'content.id_content')	
			.where('id_feature',data.id_feature)
			.where('id_jurusan',data.id_jurusan)
			.where('id_kelas',data.id_kelas)
			.where('id_bidang_studi',data.id_bidang_studi)
			.groupBy('content.id_content','topik', 'sort')
			.orderBy('sorting', 'ASC')
			
		for (var i = 0; i < dataTopik.length; i++) {

			const resultSubTopik = await Database					
			.table('v2.ts_content as content')
			.select('content.id_content','id_ringkasan_materi','title', 'file', 'free')
			.leftJoin('v2.ts_ringkasan_materi as ringkasan_materi', 'ringkasan_materi.id_content', 'content.id_content')		
			.where('content.id_content',dataTopik[i].id_content)
			.orderBy('ringkasan_materi.id_ringkasan_materi', 'ASC')
			for (var iclass = 0; iclass < resultSubTopik.length; iclass++) {
				const number_of_file 				= iclass + 1;
				resultSubTopik[iclass].url 			= Env.get('URL_API','https://api.permatamall.com/api/v2/')+'belajar/home/ringkasan-materi/view/'+resultSubTopik[iclass].file;
				resultSubTopik[iclass].file 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/ringkasan-materi/'+resultSubTopik[iclass].file;
				if (resultSubTopik[iclass].free) {
					resultSubTopik[iclass].access 	= true;									
				}else{
					const  envData 		= Env.get('BebasAkses','');
					const bebas_akses   = envData.split(',')
					if (accessLangganan) {
						resultSubTopik[iclass].access = true;
					}else if(bebas_akses.includes(data.id_kelas.toString())){
						resultSubTopik[iclass].access = true;
					}else{
						resultSubTopik[iclass].access 	= false;				
					}
				} 

				const getRead = await Database					
				.table('v2.ts_ringkasan_materi_submit as ringkasan_materi')				
				.where('id_ringkasan_materi', resultSubTopik[iclass].id_ringkasan_materi)
				.where('id_content', resultSubTopik[iclass].id_content)
				.where('id_pelanggan', data.id_pelanggan)
				.count()
				.first()
				resultSubTopik[iclass].read         = getRead.count;


				//quizz
				const quizRingkasa = await Database					
				.table('v2.ts_quiz')
				.where('id_content', dataTopik[i].id_content)
				.where('uuid', resultSubTopik[iclass].id_ringkasan_materi)
				.count()
				.first()

				resultSubTopik[iclass].quiz = quizRingkasa.count
				resultSubTopik[iclass].quizText = 'Kerjakan Quiz'

			}

			const countRingkasan = await Database					
			.table('v2.ts_ringkasan_materi')
			.where('id_content', dataTopik[i].id_content)
			.count()
			.first()

			if (countRingkasan.count > 0) {
				dataTopik[i].available = true;
			}else{
				dataTopik[i].available = false;						
			}

			//quizz
			const quiz = await Database					
			.table('v2.ts_quiz')
			.where('id_content', dataTopik[i].id_content)
			.count()
			.first()

			const quizSubmit = await Database					
			.table('v2.ts_quiz_submit')
			.where('id_content', dataTopik[i].id_content)
			.where('id_pelanggan', data.id_pelanggan)
			.count()
			.first()
			dataTopik[i].file 		= resultSubTopik;
			dataTopik[i].quiz 		= 0;			
			dataTopik[i].quizSubmit = quizSubmit.count;			
		}

		const mergeData = dataTopik.map((data) => {
			const allRead 	= data.file.length;
			const read 		= data.file.length > 0 ? data.file.map(value => value.read).reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0;
			const unread    = [];
			if (allRead == read) {
				unread.push(1)
			}else{
				unread.push(0)
			}

		  	return {
		  		...data,
		  		final : data.quizSubmit == data.quiz && unread[0] == 1 ? true : false,
		  		final : read
		  	};
		});

	    return response.json({
			status : 'true',
			responses : '200',
			data:mergeData,
			textInformation: 'RINGKASAN MATERI AKAN DIUPLOAD SECARA BERTAHAP'	
		})
	}

	async topikBelajarNew ({request, response}) {

		const data	= request.only(['id_feature','id_jurusan','id_kelas','id_bidang_studi', 'id_pelanggan', 'page'])  
		const page  	= data.page;
		const limit     = 2;


		const accessLangganan = await Database
			.select('invoice')
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket_available as paket_available', 'paket_available.id_paket', 'order.id_paket')		
			.where('order.id_pelanggan', data.id_pelanggan)
			.where('order.tab_order', 'Selesai')
			.where('order.status_order', 'Approved')
			.where('paket_available.id_kelas', data.id_kelas)
			.first()


		const AlldataTopik = await Database
			.select('content.id_content','topik', 'sort')			
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_topik as topik', 'topik.id_topik', 'content.id_topik')	
			.leftJoin('v2.ts_ringkasan_materi as ringkasan_materi', 'ringkasan_materi.id_content', 'content.id_content')	
			.where('id_feature',data.id_feature)
			.where('id_jurusan',data.id_jurusan)
			.where('id_kelas',data.id_kelas)
			.where('id_bidang_studi',data.id_bidang_studi)
			.groupBy('content.id_content','topik', 'sort')
			.orderBy('sorting', 'ASC')
			.paginate(page,limit)

		const dataTopik = AlldataTopik.data;
			
		for (var i = 0; i < dataTopik.length; i++) {

			const resultSubTopik = await Database					
			.table('v2.ts_content as content')
			.select('content.id_content','id_ringkasan_materi','title', 'file', 'free')
			.leftJoin('v2.ts_ringkasan_materi as ringkasan_materi', 'ringkasan_materi.id_content', 'content.id_content')		
			.where('content.id_content',dataTopik[i].id_content)
			.orderBy('ringkasan_materi.id_ringkasan_materi', 'ASC')
			for (var iclass = 0; iclass < resultSubTopik.length; iclass++) {
				const number_of_file 				= iclass + 1;
				resultSubTopik[iclass].url 			= Env.get('URL_API','https://api.permatamall.com/api/v2/')+'belajar/home/ringkasan-materi/view/'+resultSubTopik[iclass].file;
				resultSubTopik[iclass].file 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/ringkasan-materi/'+resultSubTopik[iclass].file;
				if (resultSubTopik[iclass].free) {
					resultSubTopik[iclass].access 	= true;									
				}else{
					const  envData 		= Env.get('BebasAkses','');
					const bebas_akses   = envData.split(',')
					if (accessLangganan) {
						resultSubTopik[iclass].access = true;
					}else if(bebas_akses.includes(data.id_kelas.toString())){
						resultSubTopik[iclass].access = true;
					}else{
						resultSubTopik[iclass].access 	= false;				
					}
				} 

				const getRead = await Database					
				.table('v2.ts_ringkasan_materi_submit as ringkasan_materi')				
				.where('id_ringkasan_materi', resultSubTopik[iclass].id_ringkasan_materi)
				.where('id_content', resultSubTopik[iclass].id_content)
				.where('id_pelanggan', data.id_pelanggan)
				.count()
				.first()
				resultSubTopik[iclass].read         = getRead.count;


				//quizz
				const quizRingkasa = await Database					
				.table('v2.ts_quiz')
				.where('id_content', dataTopik[i].id_content)
				.where('uuid', resultSubTopik[iclass].id_ringkasan_materi)
				.count()
				.first()

				resultSubTopik[iclass].quiz = quizRingkasa.count
				resultSubTopik[iclass].quizText = 'Kerjakan Quiz'

			}

			const countRingkasan = await Database					
			.table('v2.ts_ringkasan_materi')
			.where('id_content', dataTopik[i].id_content)
			.count()
			.first()

			if (countRingkasan.count > 0) {
				dataTopik[i].available = true;
			}else{
				dataTopik[i].available = false;						
			}
			dataTopik[i].file 		= resultSubTopik;
			dataTopik[i].quiz 		= 0;			
			dataTopik[i].quizSubmit = 0;			

		}

		const mergeData = dataTopik.map((data) => {
			const allRead 	= data.file.length;
			const read 		= data.file.length > 0 ? data.file.map(value => value.read).reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0;
			const unread    = [];
			if (allRead == read) {
				unread.push(1)
			}else{
				unread.push(0)
			}

		  	return {
		  		...data,
		  		final : data.quizSubmit == data.quiz && unread[0] == 1 ? true : false,
		  		final : read
		  	};
		});

	    return response.json({
			status : 'true',
			responses : '200',
			data:mergeData,
			textInformation: 'RINGKASAN MATERI AKAN DIUPLOAD SECARA BERTAHAP'	
		})
	}


	async submitRead ({request, response}) {

		const data	= request.only(['id_content','id_ringkasan_materi','id_pelanggan'])  		

		const getData = await Database
			.query()
			.table('v2.ts_ringkasan_materi_submit')
			.where('id_ringkasan_materi',data.id_ringkasan_materi)
			.where('id_content',data.id_content)
			.where('id_pelanggan',data.id_pelanggan)
		if (getData.length == 0) {
			const insertData = await Database
			.table('v2.ts_ringkasan_materi_submit')
			.insert({
				id_ringkasan_materi :data.id_ringkasan_materi,
				id_content 			:data.id_content,
				id_pelanggan 		:data.id_pelanggan,
				created_at 			:new Date(),
				updated_at			:new Date()
			})
		}
	    return response.json({
			status : 'true',
			responses : '200',
			data:'inserted data read'			
		})
	}

	async viewRingkasanMateri ({params, response, view}) {
		const url = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/ringkasan-materi/'+params.url;
		return view.render('ringkasan-materi', {url: url})
	}
	
}

module.exports = ListController
