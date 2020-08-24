'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const fs = require('fs');
const moment = require('moment');
const convertRupiah = require('rupiah-format')
const Env = use('Env')


class ProfileController {

	async langganan ({request, response, view}) {

		const input = request.only(['id_user'])
		const data_transaksi = await Database
			.query()
		  	.select('invoice','order.id_paket','order.id_price','tab_order','status_order','expired','nama_paket','price','duration','type')
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket as paket','paket.id_paket','order.id_paket')
			.innerJoin('v2.tscn_price as price','price.id_price','order.id_price')
		  	.where('id_pelanggan', input.id_user)
		  	.where('tab_order', 'Selesai')
		  	.where('status_order', 'Approved')
		for (var i = 0; i < data_transaksi.length; i++) {
			const price 		= data_transaksi[i].price != 0 ? convertRupiah.convert(data_transaksi[i].price)+' / ' : '';
			data_transaksi[i].nama_paket = data_transaksi[i].nama_paket+' '+data_transaksi[i].duration+' '+data_transaksi[i].type;								
			data_transaksi[i].expired 	= 'Berakhir '+moment(data_transaksi[i].expired).format('D MMMM Y');			
			data_transaksi[i].command 	= 'Selengkapnya';			
		}

		return response.json({
			status : 'true',
			responses : '200',
			data:data_transaksi,	
		})
	}	

	async list ({request, response, view}) {

		const input = request.only(['id_user'])
		const data_transaksi = await Database
			.query()
		  	.table('in_pelanggan')
		  	.where('id_pelanggan', input.id_user)
		  	.first()

		const dataMenu = [{
			title : 'Umum',
			data  : [{
				icon 	: 'history',
					title 	: 'Histori Belajar',
					page 	: 'HistoryPage',
					params  : ''
				},
				{
					icon 	: 'comment-question-outline',
					title 	: 'Tanya Soal',
					page 	: 'tanyaSoalPage',
					params  : ''
				},
				// {
				// 	icon 	: 'auto-fix',
				// 	title 	: 'Kode Referal',
				// 	page 	: 'SettingsWebView',
				// params  : 'https://privacy.permatamall.com/pengembangan.html'
				// },{
				// 	icon 	: 'ticket-percent',
				// 	title 	: 'Kupon & Diskon',
				// 	page 	: 'SettingsWebView',
				// params  : 'https://privacy.permatamall.com/pengembangan.html'
				// }
			]
		},{
			title : 'Tentang',
			data  : [{
					icon 	: 'alarm-bell',
					title 	: 'Hubungi Kami',
					page 	: 'SettingsWebView',
					params  : 'https://tawk.to/chat/5db2b51378ab74187a5b7af7/default'
				},{
					icon 	: 'alert-circle-outline',
					title 	: 'Tentang Kami',
					page 	: 'SettingsWebView',
					params  : 'https://privacy.permatamall.com/pengembangan.html'
				}
			]
		},{
			title : 'Lainnya',
			data  : [{
					icon 	: 'comment-question-outline',
					title 	: 'Kebijakan Privasi',
					page 	: 'SettingsWebView',
					params  : 'https://privacy.permatamall.com/syarat.html'
				},{
					icon 	: 'lock-question',
					title 	: 'Syarat dan Ketentuan',
					page 	: 'SettingsWebView',
					params  : 'https://privacy.permatamall.com/ketentuan.html'
				}
			]
		}]

		return response.json({
			status : 'true',
			responses : '200',
			data:data_transaksi,	
			dataMenu:dataMenu,	
		})
	}

	async tanyaSoal ({request, response, view}) {

		const data		= request.only(['id_pelanggan','page']);
		const page  	= data.page;
		const limit     = 5;	


		const question = await Database
		.select('response')
		.table('v2.ts_question')
		.where('id_pelanggan',data.id_pelanggan)

		var dijawab = question.filter(function(d) {
		    return d.response === true;
		});
		var menunggu = question.filter(function(d) {
		    return d.response === false;
		});

		const allQuestion = await Database
			.select('title', 'kelas','bidang_studi','keterangan', 'question.updated_at')
			.table('v2.ts_question as question')
			.leftJoin('v2.ms_kelas as kelas', 'kelas.id_kelas', 'question.id_kelas')
			.leftJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'question.id_bidang_studi')
			.where('id_pelanggan', data.id_pelanggan)
			.where('response', true)
			.orderBy('question.updated_at', 'DESC')
			.paginate(page,limit)

		const filterQuestion = allQuestion.data;

		for (var iresult = 0; iresult < filterQuestion.length; iresult++) {
			
			filterQuestion[iresult].title 		= filterQuestion[iresult].kelas+' '+filterQuestion[iresult].bidang_studi+' ('+filterQuestion[iresult].title+')';
			filterQuestion[iresult].updated_at 	= moment(filterQuestion[iresult].updated_at).format('LLLL');
		}
		const header = ({
			semua    	: question.length +' Soal',
			dijawab  	: dijawab.length +' Soal',
			menunggu 	: menunggu.length +' Soal',
			notifikasi 	: filterQuestion
		})

		return response.json({
			status : 'true',
			responses : '200',
			data:header,	
		})
	}

	async tanyaSoalFilter ({request, response, view}) {

		const data		= request.only(['id_pelanggan','type','page']);
		const id_pelanggan  	= data.id_pelanggan;
		const type  			= data.type;
		const page  			= data.page;
		const limit     		= 5;	

		let whereIn = [];
		if (type == "jawab") {
			whereIn = [true];
		}else if(type == "nunggu"){
			whereIn = [false]
		}else{
			whereIn = [true, false]
		}

		const allQuestion = await Database
			.select('question.*', 'title', 'kelas','bidang_studi','keterangan', 'question.updated_at')
			.table('v2.ts_question as question')
			.leftJoin('v2.ms_kelas as kelas', 'kelas.id_kelas', 'question.id_kelas')
			.leftJoin('v2.ms_bidang_studi as bidang_studi', 'bidang_studi.id_bidang_studi', 'question.id_bidang_studi')
			.where('id_pelanggan', data.id_pelanggan)
			.whereIn('response', whereIn)
			.orderBy('question.updated_at', 'DESC')
			.paginate(page,limit)

		const filterQuestion = allQuestion.data;

		for (var iresult = 0; iresult < filterQuestion.length; iresult++) {
			
			filterQuestion[iresult].title 		= filterQuestion[iresult].kelas+' - '+filterQuestion[iresult].bidang_studi+' ('+filterQuestion[iresult].title+')';

			const today 						= moment().format('YMD')
			const database 						= moment(filterQuestion[iresult].created_at).format('YMD')
			if (today == database) {
				filterQuestion[iresult].created_at 	= moment(filterQuestion[iresult].created_at).format('LT');
			}else{
				filterQuestion[iresult].created_at 	= moment(filterQuestion[iresult].created_at).format('LLLL');
			}
			filterQuestion[iresult].updated_at 	= moment(filterQuestion[iresult].updated_at).format('LLLL');
		}

		return response.json({
			status : 'true',
			responses : '200',
			data:filterQuestion,	
		})
	}

	async tanyaSoalMataPelajaran ({request, response, view}) {

		const input = request.only(['id_user'])

		const id_kelas = []
		const order = await Database
			.select('kelas.id_kelas')
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket_available as paket_available','paket_available.id_paket','order.id_paket')
			.innerJoin('v2.ms_kelas as kelas','kelas.id_kelas','paket_available.id_kelas')
		  	.where('id_pelanggan', input.id_user)
		  	.where('tab_order', 'Selesai')
		  	.where('status_order', 'Approved')
		  	.groupBy('kelas.id_kelas')

		for (var i = 0; i < order.length; i++) {
			id_kelas.push(order[i].id_kelas.toString())
		}

		const  envData 		= Env.get('BebasAkses','');
		const bebas_akses   = envData.split(',')

		const kelasReady  	= id_kelas.concat(bebas_akses)

		const kelas = await Database
			.select('kelas.id_kelas as key','kelas as name')
			.table('v2.ms_kelas as kelas')
		  	.whereIn('id_kelas', kelasReady)
		  	.groupBy('kelas.id_kelas','kelas')
		  	.orderBy('sort','ASC')

		for (var i = 0; i < kelas.length; i++) {
			
			const bidang_studi = await Database
				.select('content.id_bidang_studi','bidang_studi as name')
				.table('v2.ts_content as content')
				.innerJoin('v2.ms_bidang_studi as bidang_studi','bidang_studi.id_bidang_studi','content.id_bidang_studi')
				.where('id_kelas', kelas[i].key)
				.groupBy('content.id_bidang_studi','bidang_studi')				
			kelas[i].children 	= bidang_studi;			
			for (var iclas = 0; iclas < bidang_studi.length; iclas++) {
				bidang_studi[iclas].key 	= kelas[i].key+'_'+bidang_studi[iclas].id_bidang_studi;		

			}
		}
		

		return response.json({
			status : 'true',
			responses : '200',
			data:kelas,	
		})
	}

	async tanyaSoalSubmit ({request, response, view}) {

		const input = request.only(['id_pelanggan','id_bidang_studi','title','pertanyaan', 'file'])
		const id_pelanggan 		= input.id_pelanggan
		const id_bidang_studi 	= input.id_bidang_studi ? input.id_bidang_studi[0] : ''
		const title 			= input.title
		const pertanyaan 		= input.pertanyaan
		const file 				= input.file

		try{
			const split   			= id_bidang_studi.split('_')
			const order = await Database
				.table('v2.ts_question as question')
				.insert({
					id_pelanggan 	: id_pelanggan,
					id_kelas 		: split[0] ? split[0] : 0,
					id_bidang_studi : split[1] ? split[1] : 0,
					title 			: title,
					pertanyaan 		: pertanyaan,
					file 			: file
				})
			return response.json({
				status : 'true',
				responses : 200,
				data:'Pertanyaan berhasil dikirim, silahkan kembali ke halaman Tanya Soal untuk melihat status pertanyaan yang di ajukan, Jika ada kendala terhadap aplikasi bisa langsung hubungi support kami di halaman profile -> hubungi kami',	
			})
		}catch(e){			

			return response.json({
				status : 'true',
				responses : 201,
				data:'Pertanyaan gagal dikirim,silahkan cek kembali form dan pastikan sudah lengkap, Jika ada kendala terhadap aplikasi bisa langsung hubungi support kami di halaman profile -> hubungi kami',	
			})
		}

	}	
}

module.exports = ProfileController
