'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')
const moment = require('moment');
const bebasAkses = use('App/Helpers/bebasAkses')

class HomeController {

	async slider ({request, response}) {

		const banners =[
	      {
	        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/slider/produk.jpg',
	        page: 'Null'
	      },{
	        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/slider/sd-smp-sma.jpg',
	        page: 'Null'
	      }, 
	      {
	        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/slider/tes-masuk-ptn.jpg',
	        page: 'Null',
	      }
	    ]

	    return response.json({
			status : 'true',
			responses : '200',
			data:banners			
		})
	}

	async listKelas ({request, response}) {

		const requestData = request.only(['id_kelas', 'nama_kelas']);

		const id_kelas 		= requestData.id_kelas == 0 ? 11 : requestData.id_kelas
		const nama_kelas 	= requestData.nama_kelas == 'Pilih Kelas' ? 'KELAS 4' : requestData.nama_kelas

		const dataKelas = await Database
			.query()			
			.table('v2.ms_kelas')
			.where('active', true)
			.orderBy('sort', 'ASC')
			
		const result = [];
		for (var i = 0; i < dataKelas.length; i++) {
			if (i % 4 == 0) {
				const resultKelas = await Database
				.select('id_kelas','kelas','icon')			
				.table('v2.ms_kelas')
				.where('active', true)
				.where('sort' , '>', dataKelas[i].sort - 1)
				.orderBy('sort', 'ASC')
				.limit(4)				
				for (var iresult = 0; iresult < resultKelas.length; iresult++) {
					resultKelas[iresult].image = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/menu/icon/'+resultKelas[iresult].icon;
				}
				var feed = {page: i, data: resultKelas};
				result.push(feed);				
			}
		}

		const resultData = ({
			id_kelas   : id_kelas,
			nama_kelas : nama_kelas,
			result     : result
		})

	    return response.json({
			status : 'true',
			responses : '200',
			data:resultData			
		})
	}

	async listFeature ({request, response}) {

		const requestData = request.only(['id_kelas','id_pelanggan']);

		const featureData = [];

		if (requestData.id_kelas == 1) {
			const dataFeature = await Database
			.query()			
			.table('v2.ms_feature')
			.whereIn('id_feature', [1,2,5,6])
			.orderBy('sort', 'ASC')		
			featureData.push(dataFeature)
		}else{
			const dataFeature = await Database
			.query()			
			.table('v2.ms_feature')
			.whereNotIn('id_feature', [1,2])
			.orderBy('sort', 'ASC')		
			featureData.push(dataFeature)	
		}

		const dataContent = await Database
			.query()			
			.table('v2.ts_content')
			.where('id_kelas', requestData.id_kelas)
		const tampungContent = [];
	  	for (var i = 0; i < dataContent.length; i++) {
	  		tampungContent.push(dataContent[i].id_feature);	  			  		
  		}
		const result = [];
		for (var i = 0; i < featureData[0].length; i++) {
			if (i % 4 == 0) {				
				const featureResult = [];
				if (requestData.id_kelas == 1) {
					const resultFeature = await Database
					.select('id_feature','feature', 'pages','icon', 'background')			
					.table('v2.ms_feature')				
					.whereIn('id_feature', [1,2,5,6])
					.where('sort' , '>', featureData[0][i].sort - 1)
					.orderBy('sort', 'ASC')
					.limit(4)
					featureResult.push(resultFeature)
				}else{
					const resultFeature = await Database
					.select('id_feature','feature', 'pages','icon', 'background')			
					.table('v2.ms_feature')				
					.whereNotIn('id_feature', [1,2])
					.where('sort' , '>', featureData[0][i].sort - 1)
					.orderBy('sort', 'ASC')
					.limit(4)
					featureResult.push(resultFeature)
				}

				for (var iresult = 0; iresult < featureResult[0].length; iresult++) {
					featureResult[0][iresult].image = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/menu/icon/'+featureResult[0][iresult].icon;
					featureResult[0][iresult].background = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/menu/background/'+featureResult[0][iresult].background;
					if (tampungContent.includes(featureResult[0][iresult].id_feature)) {
						featureResult[0][iresult].active = 1
					}else{
						featureResult[0][iresult].active = 0
					}					
				}
				var feed = {page: i, data: featureResult[0]};
				result.push(feed);				
			}
		}

		const checkPaket = await Database
			.table('v2.tscn_order as order')
			.innerJoin('v2.tscn_paket_available as paket_available', 'paket_available.id_paket', 'order.id_paket')		
			.where('order.id_pelanggan', requestData.id_pelanggan)
			.where('order.tab_order', 'Selesai')
			.where('order.status_order', 'Approved')
			.where('paket_available.id_kelas', requestData.id_kelas)
			.first()

		let title 	= '';
		let status 	= '';
		let command	= '';
		let page	= '';

		const  envData 		= Env.get('BebasAkses','');
		const bebas_akses   = envData.split(',')

		if (checkPaket) {
			title	= "Berlangganan Sampai "+moment(checkPaket.expired).format('D MMMM Y');
			status 	= true
			command = ""
		}else if(bebas_akses.includes(requestData.id_kelas.toString())){
			title	= "* Gratis Selama Promosi";
			status 	= true
			command = ""
		}else{

			const dataPaket = await Database.raw(`select nama_paket, price, duration, type 
				from v2.tscn_paket as paket 
				inner join v2.tscn_price as price on price.id_paket = paket.id_paket 
				inner join v2.tscn_paket_available as paket_available on paket_available.id_paket = paket.id_paket 
				inner join v2.ms_kelas as ms_kelas on ms_kelas.id_kelas = paket_available.id_kelas 
				where paket.active = true
				and paket.kategori in ('Gratis')
				and paket_available.id_kelas = `+requestData.id_kelas+`
				and not exists (select * from v2.tscn_order where v2.tscn_order.id_pelanggan = '`+requestData.id_pelanggan+`' and v2.tscn_order.id_paket = paket.id_paket)`)
			
			if (dataPaket.rows.length > 0) {
				title	= "Gratis 2 Hari Untuk SMA";
				status 	= false;
				command = "Aktifkan";
				page    = "transaksiPage";
			}else{
				title	= " ";
				status 	= false;
				command = "Berlangganan";
				page    = "paketPages";
			}
		}

		const dataLangganan = ({
			title: title,
			langganan: status,
			command: command,
			page: page,
		})			

		const dataResult = ({
			dataLangganan : dataLangganan,
			paket: '',
			langganan: true,
			feature: result,
		})

	    return response.json({
			status : 'true',
			responses : '200',
			data:dataResult			
		})
	}

	async listFeatureLainya ({request, response}) {

		const bannerVisiMisi = ([{
			title : '',
	        page: '',
	        color : '#27ae60',
	        image : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/visi-misi1.jpg',
	        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/permatamall11.jpg'
	    }])

		const featureLainya = ([{
			title    : 'Kenalan Dengan PermataBelajar',
			data 	 : [{
		        title : '',
		        page: 'HomeTutorial',
		        color: '#27ae60',
		        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-111.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-112.jpg'
		    },{
		        title : '',
		        page: 'HomeTutorial',
		        color: '#00cec9',
		        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-211.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-212.jpg'
		    },{
		        title : '',
		        page: 'HomeTutorial',
		        color: '#3867d6',
		        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-311.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-312.jpg'
		    },{
		        title : '',
		        page: 'HomeTutorial',
		        color: '#d35400',
		        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-411.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-412.jpg'
		    },{
		        title : '',
		        page: 'HomeTutorial',
		        color: '#d63031',
		        image: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-511.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/feature/a-512.jpg'
		    }]
		},{
			title    : 'Produk PermataBelajar Lainya',
			data 	 : [{
		        title : '',
		        page: 'HomeTutorial',
		        color : '#3742fa',
		        image : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/tes-minat-dan-bakat-cover.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/tes-minat-dan-bakat-isi.jpg'
		    },{
		        title : '',
		        page: 'HomeTutorial',
		        color : '#6ab04c',
		        image : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/tryout-cover.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/tryout-isi.jpg'
		    },{
		        title : '',
		        page: 'HomeTutorial',
		        color : '#2980b9',
		        image : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/les-offline1.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/les-offline11.jpg'
		    },{
		        title : '',
		        page: 'HomeTutorial',
		        color : '#16a085',
		        image : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/les-online1.jpg',
		        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/les-online11.jpg'
		    }]
		}])		

	    const bannerPermatamall = ([{
			title : '',
	        page: 'HomeTutorial',
	        color : '#27ae60',
	        image : Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/permatamall1.jpg',
	        background: Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'v2/home/produk/permatamall11.jpg'
	    }])

	    const result = ({
	    	bannerVisiMisi: bannerVisiMisi,
	    	featureLainya: featureLainya,
			bannerPermatamall: bannerPermatamall
	    })

	    return response.json({
			status : 'true',
			responses : '200',
			data:result			
		})
	}
	
}

module.exports = HomeController
