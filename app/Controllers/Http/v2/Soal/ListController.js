'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')

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


	async mataPelajaranSemester ({request, response}) {

		const data	= request.only(['id_feature','id_jurusan','id_kelas','id_bidang_studi'])  

		const dataSemester = await Database
			.select('content.id_content', 'content.id_semester', 'semester', 'sort')			
			.table('v2.ts_content as content')
			.leftJoin('v2.ms_semester as semester', 'semester.id_semester', 'content.id_semester')	
			.where('id_feature',data.id_feature)
			.where('id_jurusan',data.id_jurusan)
			.where('id_kelas',data.id_kelas)
			.where('id_bidang_studi',data.id_bidang_studi)
			.groupBy('content.id_content', 'content.id_semester', 'semester', 'sort')
			.orderBy('sort', 'ASC')

		for (var i = 0; i < dataSemester.length; i++) {
			if (dataSemester[i].id_semester == 0) {
				dataSemester[i].semester 	= 'BAB';			
				dataSemester[i].page 		= 'topikLatihanSoalPages';			
			}else{
				dataSemester[i].page 		= 'semesterLatihanSoalPages';							
			}
		}

		var result = dataSemester.filter((arr, index, self) => index === self.findIndex((t) => (t.semester === arr.semester)))

	    return response.json({
			status : 'true',
			responses : '200',
			data:result			
		})
	}
	
	async topikBelajar ({request, response}) {

		const data	= request.only(['id_content', 'id_pelanggan'])
		const id_content 		= data.id_content;
		const id_pelanggan 		= data.id_pelanggan;

		const dataRequest = await Database
			.table('v2.ts_content as content')
			.where('id_content',data.id_content)  

		if (dataRequest.length > 0) {

			const accessLangganan = await Database
				.select('invoice')
				.table('v2.tscn_order as order')
				.innerJoin('v2.tscn_paket_available as paket_available', 'paket_available.id_paket', 'order.id_paket')		
				.where('order.id_pelanggan', data.id_pelanggan)
				.where('order.tab_order', 'Selesai')
				.where('order.status_order', 'Approved')
				.where('paket_available.id_kelas', dataRequest[0].id_kelas)
				.first()


			const dataTopik = await Database
				.select('content.id_content','topik', 'limit', 'sort', 'free')			
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_topik as topik', 'topik.id_topik', 'content.id_topik')	
				.leftJoin('v2.ts_soal as soal', 'soal.id_content', 'content.id_content')	
				.where('id_kelas',dataRequest[0].id_kelas)
				.where('id_feature',dataRequest[0].id_feature)
				.where('id_jurusan',dataRequest[0].id_jurusan)
				.where('id_semester',dataRequest[0].id_semester)
				.where('id_ujian',dataRequest[0].id_ujian)
				.where('id_bidang_studi',dataRequest[0].id_bidang_studi)
				.groupBy('content.id_content','topik', 'limit', 'sort', 'free')
				.orderBy('sorting', 'ASC')

				for (var i = 0; i < dataTopik.length; i++) {
					const resultSubTopik = await Database					
					.table('v2.ts_soal')
					.where('id_content',dataTopik[i].id_content)
					.count()
					.first()
					if (resultSubTopik.count > 0) {

						dataTopik[i].available = true;
					}else{
						dataTopik[i].available = false;						
					}

					const  envData 		= Env.get('BebasAkses','');
					const bebas_akses   = envData.split(',')
					if (accessLangganan) {
						dataTopik[i].free = true;
					}else if(bebas_akses.includes(dataRequest[0].id_kelas.toString())){
						dataTopik[i].free = true;						
					}

					dataTopik[i].title = 'BAB';						
				}

			return response.json({
				status : 'true',
				responses : '200',
				data:dataTopik,
				textInformation: 'LATIHAN SOAL AKAN DIUPLOAD SECARA BERTAHAP'		
			})

		}else{
			return response.json({
				status : 'true',
				responses : '200',
				data:[],
				textInformation: 'LATIHAN SOAL AKAN DIUPLOAD SECARA BERTAHAP'		
			})
		}
	}



	async topikMataPelajaran ({request, response}) {

		const data	= request.only(['id_content'])  
		const id_content 		= data.id_content;
		const limitPage 		= 4;

		const dataRequest = await Database
			.table('v2.ts_content as content')
			.where('id_content',data.id_content)

		if (dataRequest.length > 0) {
			const dataMataPelajaran = await Database
				.select('content.id_content', 'id_kelas','id_feature','sort', 'id_jurusan', 'content.id_bidang_studi')			
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')		
				.where('id_kelas',dataRequest[0].id_kelas)
				.where('id_feature',dataRequest[0].id_feature)
				.where('id_jurusan',dataRequest[0].id_jurusan)
				.where('id_semester',dataRequest[0].id_semester)
				.where('id_ujian',dataRequest[0].id_ujian)
				.groupBy('content.id_content', 'id_kelas','id_feature','sort', 'id_jurusan', 'content.id_bidang_studi')
				.orderBy('sort', 'ASC')

			var resultMataPelajaran = dataMataPelajaran.filter((arr, index, self) => index === self.findIndex((t) => (t.id_bidang_studi === arr.id_bidang_studi)))


			const result = [];
			for (var i = 0; i < dataMataPelajaran.length; i++) {

				const resultMataPelajaran = await Database
				.select('id_content','bidang_studi.id_bidang_studi','bidang_studi','id_kelas', 'icon')		
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')		
				.where('content.id_content',dataMataPelajaran[i].id_content)
				.first()
				if (resultMataPelajaran.icon) {
					resultMataPelajaran.image = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/menu/icon/'+resultMataPelajaran.icon
				}else{
					resultMataPelajaran.image =  ''
				}

				result.push(resultMataPelajaran);				
			}

			var tampungData = result.filter((arr, index, self) => index === self.findIndex((t) => (t.id_bidang_studi === arr.id_bidang_studi)))

			const resultData = [];
			for (var i = 0; i < tampungData.length; i++) {
				if (i % limitPage == 0) {
					var feed = {page: i, data: 'resultDataMataPelajaran'};
					resultData.push(feed);				
				}				
			}

			function paginate(array, page_size, page_number) {
			  return array.slice((page_number - 1) * page_size, page_number * page_size);
			}

			const finalData = [];
			for (var i = 1; i <= resultData.length; i++) {
				var feedFinal = {page: i, data: paginate(tampungData, limitPage, i)};
				finalData.push(feedFinal);					
			}
			return response.json({
				status : 'true',
				responses : '200',
				data:finalData
			})
		}else{
			return response.json({
				status : 'true',
				responses : '200',
				data:[]
			})
		}
	}


	async ujianBelajar ({request, response}) {

		const data	= request.only(['id_content', 'id_pelanggan'])
		const id_pelanggan 		= data.id_pelanggan;
		const id_content 		= data.id_content;

		const coditionQuery 			= `AND exists (select * from v2.ms_ujian as ujian where content.id_ujian = ujian.id_ujian)
			AND exists (
				select * from v2.ts_soal as soal
				where soal.id_content = content.id_content
				AND exists (select * from v2.ts_kumpulan as kumpulan where kumpulan.id_kumpulan = soal.id_kumpulan)
		)`
		const queryRequest = await Database.raw(`SELECT * from v2.ts_content as content WHERE id_content = `+id_content)
		const dataRequest = queryRequest.rows

		if (dataRequest.length > 0) {

			const dataUjianTemp = await Database	
				.select('content.id_content','ujian', 'ujian.sort')
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_ujian as ujian', 'ujian.id_ujian', 'content.id_ujian')
				.leftJoin('v2.ts_soal as soal', 'soal.id_content', 'content.id_content')
				.leftJoin('v2.ts_kumpulan as kumpulan', 'kumpulan.id_kumpulan', 'soal.id_kumpulan')
				.where('id_feature',dataRequest[0].id_feature)
				.where('id_kelas',dataRequest[0].id_kelas)
				.where('id_bidang_studi',dataRequest[0].id_bidang_studi)				
				.where('id_jurusan',dataRequest[0].id_jurusan)
				.where('id_semester',dataRequest[0].id_semester)
				.groupBy('content.id_content','ujian', 'ujian.sort')
				.orderBy('sort', 'ASC')

			var dataUjian = dataUjianTemp.filter((arr, index, self) => index === self.findIndex((t) => (t.ujian === arr.ujian)))


			const ujianActive = id_content == 0 ? dataUjian[0] ? dataUjian[0].id_content : 0 : id_content;


			const dataUjianActive = await Database		
				.select('content.id_content','ujian', 'limit', 'ujian.sort')
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_ujian as ujian', 'ujian.id_ujian', 'content.id_ujian')	
				.leftJoin('v2.ts_soal as soal', 'soal.id_content', 'content.id_content')
				.leftJoin('v2.ts_kumpulan as kumpulan', 'kumpulan.id_kumpulan', 'soal.id_kumpulan')
				.where('content.id_content',ujianActive)
				.groupBy('content.id_content','ujian', 'limit', 'ujian.sort')
				.orderBy('sort', 'ASC')		

			const queryKumpulan = await Database.raw(`SELECT content.id_content, kumpulan.id_kumpulan, kumpulan.kumpulan, kumpulan.sort, kumpulan.free from v2.ts_content as content
				INNER JOIN v2.ms_ujian as ujian on ujian.id_ujian = content.id_ujian
				LEFT JOIN v2.ts_soal as soal on soal.id_content = content.id_content
				LEFT JOIN v2.ts_kumpulan as kumpulan on kumpulan.id_kumpulan = soal.id_kumpulan
				WHERE content.id_content = `+ujianActive+`
				AND soal.id_kumpulan IS NOT NULL
				AND exists (select * from v2.ts_kumpulan as kumpulan where kumpulan.id_content = content.id_content)
				GROUP BY content.id_content, kumpulan.id_kumpulan, kumpulan.kumpulan, kumpulan.sort, kumpulan.free
				ORDER BY sort ASC`)

			const kumpulan = queryKumpulan.rows

			const accessLangganan = await Database
				.select('invoice')
				.table('v2.tscn_order as order')
				.innerJoin('v2.tscn_paket_available as paket_available', 'paket_available.id_paket', 'order.id_paket')		
				.where('order.id_pelanggan', id_pelanggan)
				.where('order.tab_order', 'Selesai')
				.where('order.status_order', 'Approved')
				.where('paket_available.id_kelas', dataRequest[0].id_kelas)
				.first()


			for (var iresult = 0; iresult < kumpulan.length; iresult++) {
				const jumlahSoal = await Database		
				.table('v2.ts_soal')
				.where('id_content',kumpulan[iresult].id_content)
				.where('id_kumpulan',kumpulan[iresult].id_kumpulan)
				.whereNotNull('id_kumpulan')
				.count()
				.first()
				kumpulan[iresult].kumpulan = kumpulan[iresult].kumpulan + " ("+jumlahSoal.count+" Soal)";
				const  envData 		= Env.get('BebasAkses','');
				const bebas_akses   = envData.split(',')
				if (accessLangganan) {
					kumpulan[iresult].free = true;
				}else if(bebas_akses.includes(dataRequest[0].id_kelas.toString())){
					kumpulan[iresult].free = true;						
				}
			}

			const result = ({
				ujian 			: dataUjian,
				ujianActive 	: ujianActive,
				dataUjian 		: dataUjianActive[0] ? dataUjianActive[0].ujian : '',
				kumpulan 		: kumpulan
			})

			return response.json({
				status : 'true',
				responses : '200',
				data:result,
				textInformation: 'LATIHAN SOAL AKAN DIUPLOAD SECARA BERTAHAP'		
			})

		}else{
			const result = ({
				ujianActive : 0,
				ujian 		: [],
				dataUjian 	: '',
				kumpulan 	: []
			})

			return response.json({
				status : 'true',
				responses : '200',
				data:result,
				textInformation: 'LATIHAN SOAL AKAN DIUPLOAD SECARA BERTAHAP'		
			})
		}		
	}


	
}

module.exports = ListController
