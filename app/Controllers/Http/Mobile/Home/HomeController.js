'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')


class HomeController {

	async intro ({request, response}) {
		const data =[
	      {
		    key: 'video_belajar',
		    title: 'Video Belajar',
		    text: 'video belajar yang menarik , mudah dimengerti dan disertai dengan kuis pada setiap video',
		    // image: {uri : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/intro/teacher1.png'},
		    image: {uri : 'https://ik.imagekit.io/pmjr/template/intro/guru_s-fseP9bvj7.png'},
		    bg: '#2aaa4d',
		  },
		  {
		    key: 'soal_latihan',
		    title: 'Soal & Latihan',
		    text: 'kumpulan soal latihan terbaik dengan pembahasan yang SMART , tersedia untuk UTBK-SBMPTN , Ujian Sekolah dan lainnya',
		    // image: {uri : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/intro/notes1.png'},
		    image: {uri : 'https://ik.imagekit.io/pmjr/template/intro/soal_AVFCwFY1tc.png'},
		    bg: '#2aaa4d',
		  },
		  {
		    key: 'ringkasan-materi',
		    title: 'Ringkasan Materi',
		    text: 'ringkasan materi pelajaran lengkap dan dibahas secara mendalam sesuai dengan kurikulum nasional',
		    // image: {uri : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/intro/open-book1.png'},
		    image: {uri : 'https://ik.imagekit.io/pmjr/template/intro/ringkasan_3SGN1HcJ5.png'},
		    bg: '#2aaa4d',
		  }
	    ]

	    return response.json({
			status : 'true',
			responses : '200',
			data:data			
		})
	}

	async slider ({request, response}) {
		const banners =[
	      {
	        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/slider/tunggu-baru.jpg',
	        page: 'null'
	      },
	      {
	        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/slider/ajakan-pindah.jpg',
	        page: 'null'
	      },
	      {
	        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/slider/sd-smp-sma permatamall.jpg',
	        page: 'null'
	      }, 
	      {
	        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/slider/tes-masuk-ptn-permatamall.jpg',
	        page: 'null',
	      }
	    ]

	    return response.json({
			status : 'true',
			responses : '200',
			data:banners			
		})
	}

	async menu ({request, response}) {
		const data =[
	      {
	        icon: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/menu/icon-free.png',
	        title: 'Coba Gratis',
	        page: 'Pengembangan',
	      },
	      {
	        icon: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/menu/icon-bimbel.png',
	        title: 'Bimbel Online',
	        page: 'Pengembangan',
	      }, 
	      {
	        icon: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'mobile/icon/home/menu/icon-lainya.png',
	        title: 'Lainnya',
	        page: 'Pengembangan',
	      }
	    ]

	    return response.json({
			status : 'true',
			responses : '200',
			data:data			
		})
	}

	async panduan ({request, response}) {
		const data = request.only(['flag']);

		const panduanData = []
		if (data.flag == 'gratis') {
			const panduan = [
		      {
		        title: '1. Pilih Mata Pelajaran',
		      },
		      {
		        title: '2. Pilih Jawaban yang menurut Anda paling benar',
		      }, 
		      {
		        title: '3. Klik Tombol Lihat Jawaban untuk melihat jawaban',
		      }, 
		      {
		        title: '4. Klik Tombol SELESAI jika ingin menyelesaikan latihan',
		      }
		    ]
		    panduanData.push(panduan);
		    
		}else if (data.flag == 'langganan') {
			const panduan = [
		      {
		        title: '1. Pilih Mata Pelajaran',
		      },
		      {
		        title: '2. Pilih Jawaban yang menurut Anda paling benar',
		      }, 
		      {
		        title: '3. Klik Tombol Lihat Jawaban untuk melihat jawaban',
		      }, 
		      {
		        title: '4. Klik Tombol SELESAI jika ingin menyelesaikan latihan',
		      }
		    ]
		    panduanData.push(panduan);
		}		
	    return response.json({
			status : 'true',
			responses : '200',
			data:panduanData[0]			
		})
	}
	
}

module.exports = HomeController
