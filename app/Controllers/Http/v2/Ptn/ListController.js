'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')

class ListController {

	async jurusan ({request, response}) {

		const data	= request.only(['id_kelas','id_feature','tahun'])  

		const id_kelas 		= data.id_kelas;
		const id_feature 	= data.id_feature;
		const tahun 		= data.tahun.replace("Tahun ", "");

		const dataTahun = await Database
			.select('tahun')
			.table('v2.ts_content as content')
			.where('id_kelas',id_kelas)
			.where('id_feature',id_feature)
			.groupBy('tahun')
			.orderBy('tahun', 'ASC')

		const tahunActive = tahun == 0 ? dataTahun[0] ? dataTahun[0].tahun : tahun : tahun;

		const dataJurusan = await Database
			.select('id_kelas','id_feature','sort', 'content.id_jurusan','jurusan')			
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_jurusan as jurusan', 'jurusan.id_jurusan', 'content.id_jurusan')		
			.where('id_kelas',data.id_kelas)
			.where('id_feature',id_feature)
			.where('tahun',tahunActive)
			.groupBy('id_kelas','id_feature','sort', 'content.id_jurusan', 'jurusan')
			.orderBy('sort', 'ASC')

		const result = [];
		for (var i = 0; i < dataJurusan.length; i++) {
			if (i % 2 == 0) {
				const resuiltJurusan = await Database
				.select('jurusan.id_jurusan','jurusan','id_kelas', 'icon')		
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_jurusan as jurusan', 'jurusan.id_jurusan', 'content.id_jurusan')				
				.where('id_kelas',dataJurusan[i].id_kelas)
				.where('id_feature',dataJurusan[i].id_feature)
				.where('tahun',tahunActive)
				.where('sort' , '>', dataJurusan[i].sort - 1)
				.groupBy('jurusan.id_jurusan','jurusan','id_kelas')
				.orderBy('sort', 'ASC')
				.limit(2)

				for (var iresult = 0; iresult < resuiltJurusan.length; iresult++) {
					resuiltJurusan[iresult].image = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/menu/icon/'+resuiltJurusan[iresult].icon
				}
				var feed = {page: i, data: resuiltJurusan};
				result.push(feed);				
			}
		}

		for (var iresult = 0; iresult < dataTahun.length; iresult++) {
			dataTahun[iresult].tahun = 'Tahun '+dataTahun[iresult].tahun
		}

		const resultData = ({
			tahunData 		: dataTahun,
			tahun 			: 'Tahun '+tahunActive,
			jurusan 		: result
		})

	    return response.json({
			status : 'true',
			responses : '200',
			data:resultData			
		})
	}

	async mataPelajaran ({request, response}) {

		const data	= request.only(['id_kelas','id_feature','tahun', 'id_jurusan'])  

		const id_kelas 		= data.id_kelas;
		const id_feature 	= data.id_feature;
		const tahun 		= data.tahun.replace("Tahun ", "");
		const id_jurusan 	= data.id_jurusan;

		const dataMataPelajaran = await Database
			.select('id_kelas','id_feature','sort', 'id_jurusan')			
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')		
			.where('id_kelas',data.id_kelas)
			.where('id_feature',id_feature)
			.where('tahun',tahun)
			.where('id_jurusan',id_jurusan)
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
				.where('tahun',tahun)
				.where('id_jurusan',dataMataPelajaran[i].id_jurusan)
				.where('sort' , '>', dataMataPelajaran[i].sort - 1)
				.groupBy('bidang_studi.id_bidang_studi','bidang_studi','id_kelas')
				.orderBy('sort', 'ASC')
				.limit(4)

				for (var iresult = 0; iresult < resultMataPelajaran.length; iresult++) {
					if (resultMataPelajaran[iresult].id_bidang_studi == 13) {
						resultMataPelajaran[iresult].bidang_studi = "MATEMATIKA"
					}else if (resultMataPelajaran[iresult].id_bidang_studi == 2) {
						resultMataPelajaran[iresult].bidang_studi = "MATEMATIKA DASAR"
					}
					resultMataPelajaran[iresult].image = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/menu/icon/'+resultMataPelajaran[iresult].icon
				}
				var feed = {page: i, data: resultMataPelajaran};
				result.push(feed);				
			}
		}

	    return response.json({
			status : 'true',
			responses : '200',
			data:result			
		})
	}

	async featureList ({request, response}) {

		const data	= request.only(['id_kelas','id_feature','tahun', 'id_jurusan', 'id_bidang_studi', 'active'])  

		const id_kelas 			= data.id_kelas;
		const id_feature 		= data.id_feature;
		const tahun 			= data.tahun.replace("Tahun ", "");
		const id_jurusan 		= data.id_jurusan;
		const id_bidang_studi 	= data.id_bidang_studi;
		const active 			= data.active;

		const resultContent = await Database
			.table('v2.ts_content as content')
			.where('id_kelas', id_kelas)
			.where('id_feature', id_feature)
			.where('tahun', tahun)
			.where('id_jurusan', id_jurusan)
			.where('id_bidang_studi', id_bidang_studi)
			.first()


		if (resultContent) {

			const result = [];			
			if (active == 0) {
				const video = await Database
					.table('v2.ts_video')
					.where('id_content', resultContent.id_content)
				for (var i = 0; i < video.length; i++) {
					video[i].read = false;
					video[i].file 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/video/play/'+video[i].file;
					video[i].banner 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/video/banner/'+video[i].banner;

				}
				result.push(video)
			}else if (active == 1) {
				const ringkasanMateri = await Database
					.table('v2.ts_ringkasan_materi')
					.where('id_content', resultContent.id_content)
				for (var i = 0; i < ringkasanMateri.length; i++) {
					ringkasanMateri[i].read = false;
					ringkasanMateri[i].file 		= Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/image/ringkasan-materi/'+ringkasanMateri[i].file;
				}
				result.push(ringkasanMateri)

			}else{

				 
				const dataPrimary = await Database
				.leftJoin('v2.ms_kelas as kelas', 'kelas.id_kelas', 'content.id_kelas')		
				.leftJoin('v2.ms_feature as feature', 'feature.id_feature', 'content.id_feature')		
				.leftJoin('v2.ms_jurusan as jurusan', 'jurusan.id_jurusan', 'content.id_jurusan')		
				.leftJoin('v2.ms_bidang_studi as bid_studi', 'bid_studi.id_bidang_studi', 'content.id_bidang_studi')		
				.table('v2.ts_content as content')
				.where('id_content', resultContent.id_content)				
				.first()

				const countSoal = await Database
					.table('v2.ts_soal')
					.where('id_content', resultContent.id_content)
					.count()
					.first()

				const soal = ([{
					id_content 	: dataPrimary.id_content,
					kelas 		: dataPrimary.kelas,
					feature 	: dataPrimary.feature,
					tahun 		: dataPrimary.tahun,
					ujian       : dataPrimary.jurusan,
					bid_studi   : dataPrimary.bidang_studi, 
					free 		: true,
					jumlah 		: countSoal.count,
					jumlah_soal : resultContent.limit + ' dari ' + countSoal.count + ' Soal Tersedia',
					nullCommand : "jumlah soal belum tersedia, kami akan update secara bertahap untuk latihan soal ini"
				}])
				result.push(soal)
			}

			return response.json({
				status : 'true',
				responses : '200',
				data:result[0]		
			})
		}else{
			return response.json({
				status : 'true',
				responses : '500',
				data:[]			
			})
		}		
	}

	
}

module.exports = ListController
