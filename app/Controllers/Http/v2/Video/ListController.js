'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')
const Redis = use('Redis')

class ListController {

	async mataPelajaran ({request, response}) {

		const data	= request.only(['id_kelas','id_feature','id_jurusan'])  
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

		const data	= request.only(['id_feature','id_jurusan','id_kelas','id_bidang_studi', 'id_pelanggan']) 

		const key  	=  data.id_feature+data.id_jurusan+data.id_kelas+data.id_bidang_studi+data.id_pelanggan

		// const solvTopik = await Redis.get('solvedPastQueryVideo'+key)
	 //    if (solvTopik) {
	 //    	return response.json({
		// 		status : 'true',
		// 		responses : '200',
		// 		data:JSON.parse(solvTopik)			
		// 	})
	 //    }

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
			.leftJoin('v2.ts_video as video', 'video.id_content', 'content.id_content')		
			.where('id_feature',data.id_feature)
			.where('id_jurusan',data.id_jurusan)
			.where('id_kelas',data.id_kelas)
			.where('id_bidang_studi',data.id_bidang_studi)
			.groupBy('content.id_content','topik', 'sort')
			.orderBy('sorting', 'ASC')


		for (var i = 0; i < dataTopik.length; i++) {

			const resultSubTopik = await Database					
			.table('v2.ts_content as content')
			.select('content.id_content','id_video', 'title', 'file', 'banner', 'free', 'timeline','duration')
			.leftJoin('v2.ts_video as video', 'video.id_content', 'content.id_content')	
			.where('content.id_content',dataTopik[i].id_content)
			.orderBy('video.id_video', 'ASC')
			for (var iclass = 0; iclass < resultSubTopik.length; iclass++) {
				const number_of_file 				= iclass + 1;
				resultSubTopik[iclass].file 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/video/play/'+resultSubTopik[iclass].file;
				resultSubTopik[iclass].banner 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/video/banner/'+resultSubTopik[iclass].banner;
				const getRead = await Database					
				.table('v2.ts_video_submit as video')				
				.where('id_video', resultSubTopik[iclass].id_video)
				.where('id_content', resultSubTopik[iclass].id_content)
				.where('id_pelanggan', data.id_pelanggan)
				.count()
				.first()
				resultSubTopik[iclass].read         = getRead.count;
				
				const  envData 		= Env.get('BebasAkses','');
				const bebas_akses   = envData.split(',')
				if (accessLangganan) {
					resultSubTopik[iclass].free         = true;
				}else if(bebas_akses.includes(data.id_kelas.toString())){
					resultSubTopik[iclass].free 		= true;
				}

				//quizz
				const quizVideo = await Database					
					.table('v2.ts_quiz')
					.where('id_content', dataTopik[i].id_content)
					.where('uuid', resultSubTopik[iclass].id_video)
					.count()
					.first()

					resultSubTopik[iclass].quiz = quizVideo.count
					resultSubTopik[iclass].quizText = 'Kerjakan Quiz'

			}

			const countVideo = await Database					
			.table('v2.ts_video')
			.where('id_content', dataTopik[i].id_content)
			.count()
			.first()

			if (countVideo.count > 0) {
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

		// await Redis.set('solvedPastQueryVideo'+key, JSON.stringify(mergeData))

	    return response.json({
			status : 'true',
			responses : '200',
			data:mergeData,
			textInformation: 'VIDEO AKAN DIUPLOAD SECARA BERTAHAP'	
		})
	}


	async submitRead ({request, response}) {

		const data	= request.only(['id_content','id_video','id_pelanggan'])  		

		const getData = await Database
			.query()
			.table('v2.ts_video_submit')
			.where('id_video',data.id_video)
			.where('id_content',data.id_content)
			.where('id_pelanggan',data.id_pelanggan)
		if (getData.length == 0) {
			const insertData = await Database
			.table('v2.ts_video_submit')
			.insert({
				id_video  			: data.id_video,
				id_content 			: data.id_content,
				id_pelanggan 		: data.id_pelanggan,
				created_at 			: new Date(),
				updated_at			: new Date()
			})
		}
	    return response.json({
			status : 'true',
			responses : '200',
			data:'inserted data read'			
		})
	}


	async latihanResult ({request, response}) {

		const data	= request.only(['id_content','uuid','id_pelanggan', 'page'])  
		const id_content 		= data.id_content;
		const uuid 				= data.uuid;
		const id_pelanggan 		= data.id_pelanggan;
		const page 				= data.page;

		const getQuiz = await Database
			.table('v2.ts_quiz')
			.where('id_content',id_content)
			.where('uuid',uuid)

		if (getQuiz.length > 0) {
			if (page == 0 || page == 1) {

				const getSoal = await Database
					.table('v2.ts_quiz')
					.where('id_content',id_content)
					.where('uuid',uuid)
					.orderBy('id_soal','ASC')
					.paginate(1,1)
				for (var i = 0; i < getSoal.data.length; i++) {
					getSoal.data[i].soal = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/soal/'+getSoal.data[i].soal;
					getSoal.data[i].pembahasan = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/pembahasan/'+getSoal.data[i].pembahasan;
				}

				return response.json({
					status : 'true',
					responses : '200',
					data:getSoal			
				})
			}else{
				const getSoal = await Database
					.table('v2.ts_quiz')
					.where('id_content',id_content)
					.where('uuid',uuid)
					.orderBy('id_soal','ASC')
					.paginate(page,1)
				for (var i = 0; i < getSoal.data.length; i++) {
					getSoal.data[i].soal = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/soal/'+getSoal.data[i].soal;
					getSoal.data[i].pembahasan = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/pembahasan/'+getSoal.data[i].pembahasan;
				}

				return response.json({
					status : 'true',
					responses : '200',
					data:getSoal			
				})
			}

		}else{
		    return response.json({
				status : 'true',
				responses : '500',
				data:[]			
			})			
		}
	}


	async answerResult ({request, response}) {
		const data	= request.only(['id_content','id_pelanggan', 'jawaban','jawaban_user'])  	

		let text = ''
		if (data.jawaban == data.jawaban_user) {
			text = 'Jawaban anda benar('+data.jawaban_user+'),';
		}else{
			text = 'Jawaban anda salah('+data.jawaban_user+'), untuk jawaban benar adalah ('+data.jawaban+'),';			
		}

		return response.json({
			status : 'true',
			responses : '200',
			textAnswer: '"'+text+' Lanjutkan belajar dengan membaca ringkasan materi, melihat video pembelajaran lainya, dan mengerjakan latihan soal"'		
		})			
	}


	
}

module.exports = ListController
