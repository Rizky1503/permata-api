'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const fs = require('fs');
const moment = require('moment');


class HistoryController {

	async list ({request, response, view}) {

		const data		= request.only(['id_pelanggan','page']);
		const page  	= data.page;
		const limit     = 5;

		const allSoal = await Database
			.table('v2.ts_soal_examp as examp')
			.innerJoin('v2.ts_soal_execute as soal_execute', 'soal_execute.id_examp', 'examp.id_examp')
			.where('id_pelanggan', data.id_pelanggan)
			.where('finish', true)
			.count()
			.first()

		const allVideo = await Database
			.table('v2.ts_video_submit')
			.where('id_pelanggan', data.id_pelanggan)
			.count()
			.first()

		const allRingkasan = await Database
			.table('v2.ts_ringkasan_materi_submit')
			.where('id_pelanggan', data.id_pelanggan)
			.count()
			.first()

		const result = ({
			soal_dikerjalan : allSoal.count + ' Selesai',
			video 			: allVideo.count + ' Ditonton', 
			ringkasan 		: allRingkasan.count + ' Dilihat' 
		})

		const allHitory = await Database
			.select('content.id_kelas','kelas','id_pelanggan', 'sort')
			.table('v2.ts_soal_examp as examp')
			.innerJoin('v2.ts_content as content', 'content.id_content', 'examp.id_content')
			.innerJoin('v2.ms_kelas as kelas', 'kelas.id_kelas', 'content.id_kelas')
			.where('id_pelanggan', data.id_pelanggan)
			.where('finish', true)
			.groupBy('content.id_kelas','kelas','id_pelanggan', 'sort')
			.orderBy('sort', 'ASC')
			.paginate(page,limit)

		const hitory = allHitory.data;

		for (var iresult = 0; iresult < hitory.length; iresult++) {
			
			const mata_pelajaran = await Database
			.select('content.id_bidang_studi','bidang_studi', 'sort')
			.table('v2.ts_soal_examp as examp')
			.innerJoin('v2.ts_content as content', 'content.id_content', 'examp.id_content')
			.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')
			.where('id_pelanggan', hitory[iresult].id_pelanggan)
			.where('content.id_kelas', hitory[iresult].id_kelas)
			.where('finish', true)
			.groupBy('content.id_bidang_studi','bidang_studi', 'sort')
			.orderBy('sort', 'ASC')
			hitory[iresult].mata_pelajaran = mata_pelajaran
			for (var ipelajaran = 0; ipelajaran < mata_pelajaran.length; ipelajaran++) {
				mata_pelajaran[ipelajaran].id_kelas = hitory[iresult].id_kelas
				mata_pelajaran[ipelajaran].kelas = hitory[iresult].kelas
			}
		}

		return response.json({
			status 		: 'true',
			responses 	: '200',
			result 		: result,		
			data 		: hitory		
		})
	}	

	async more ({request, response, view}) {

		const data		= request.only(['id_pelanggan','id_kelas','id_bidang_studi','page']);
		const page  	= data.page;
		const limit     = 5;

		const allMataPelajaran = await Database
			.select('content.id_bidang_studi','bidang_studi', 'sort')
			.table('v2.ts_soal_examp as examp')
			.innerJoin('v2.ts_content as content', 'content.id_content', 'examp.id_content')
			.innerJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'content.id_bidang_studi')
			.where('id_pelanggan', data.id_pelanggan)
			.where('content.id_kelas', data.id_kelas)
			.where('finish', true)
			.groupBy('content.id_bidang_studi','bidang_studi', 'sort')
			.orderBy('sort', 'ASC')

		const dataSemua = await Database
			.select('id_examp','topik', 'kumpulan','examp.created_at')
			.table('v2.ts_soal_examp as examp')
			.innerJoin('v2.ts_content as content', 'content.id_content', 'examp.id_content')
			.innerJoin('v2.ms_topik as topik', 'topik.id_topik', 'content.id_topik')
			.leftJoin('v2.ts_kumpulan as kumpulan', 'kumpulan.id_kumpulan', 'examp.id_kumpulan')
			.where('id_pelanggan', data.id_pelanggan)
			.where('content.id_kelas', data.id_kelas)
			.where('content.id_bidang_studi', data.id_bidang_studi)
			.where('finish', true)
			.orderBy('examp.created_at', 'DESC')
			.paginate(page,limit)
		const allData = dataSemua.data


		for (var iresult = 0; iresult < allData.length; iresult++) {
			
			if (allData[iresult].kumpulan) {
				allData[iresult].title = "Latihan Soal "+allData[iresult].kumpulan
			}else{
				allData[iresult].title = "Latihan Soal "+allData[iresult].topik				
			}

			const soal = await Database
			.select('jawaban_user','jawaban')
			.table('v2.ts_soal_execute as soal_execute')
			.innerJoin('v2.ts_soal as soal', 'soal.id_soal', 'soal_execute.id_soal')
			.where('id_examp',allData[iresult].id_examp)
			const final = soal.map((data) => {
				const flag = []
				if (data.jawaban_user === null) {
					flag.push('blank')
				}else if(data.jawaban_user == data.jawaban) {
					flag.push('betul')
				}else{
					flag.push('salah')
				}			
			  	return {
			  		...data,
			  		flag : flag[0]
			  	};
			});
			var betul = final.filter(function(d) {
			    return d.flag === 'betul';
			});
			var salah = final.filter(function(d) {
			    return d.flag === 'salah';
			});
			var blank = final.filter(function(d) {
			    return d.flag === 'blank';
			});
			allData[iresult].more = [{
					'icon'  : 'ios-arrow-dropright-circle',
					'title' : 'Betul',
					'value' : betul.length+' dari '+soal.length+' Soal',
				},{
					'icon'  : 'ios-arrow-dropright-circle',
					'title' : 'Salah',
					'value' : salah.length+' dari '+soal.length+' Soal',
				},{
					'icon'  : 'ios-arrow-dropright-circle',
					'title' : 'Tidak Dijawab',
					'value' : blank.length+' dari '+soal.length+' Soal',
				},{
					'icon'  : 'ios-arrow-dropright-circle',
					'title' : 'Tanggal Latihan',
					'value' : moment(allData[iresult].created_at).format('LLLL'),
				}
			]
		}

		const result = ({
			mataPelajaran : allMataPelajaran,
			nilai : allData,
		})


		return response.json({
			status 		: 'true',
			responses 	: '200',	
			data 		: result		
		})
	}	
}

module.exports = HistoryController
