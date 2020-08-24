'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const woodlotCustomLogger = require('woodlot').customLogger;
const moment = require('moment');
const woodlot = new woodlotCustomLogger({
    streams: ['./logs/'+moment().format('YYYY')+'/'+moment().format('YYYY-MM')+'/report-daily-'+moment().format('YYYY-MM-DD')+'.log'],
    stdout: false,
    userAnalytics: {
        platform: true,
        country: true
    },
    format: {
        type: 'json',
        options: {
          cookies: true,
          headers: true,
            spacing: 4,
            separator: '\n'
        }
    }
});

class Ts_MasterController {
	
	async KelasTopik({ response }) {
		const data = await Database
			.select('kelas.kelas','kelas.id_kelas')
			.from('v2.ts_content as content')
			.innerJoin('v2.ms_kelas as kelas','content.id_kelas','kelas.id_kelas')
			.groupBy('kelas.kelas','kelas.id_kelas')
			.orderBy('kelas.sort')
		return response.json(data)
	}

	async getBidangStudi({ response,params }){
		const data = await Database
			.select('matpel.bidang_studi','matpel.id_bidang_studi')
			.from('v2.ts_content as content')
			.innerJoin('v2.ms_bidang_studi as matpel','content.id_bidang_studi','matpel.id_bidang_studi')
			.where('content.id_kelas',params.id)
			.groupBy('matpel.bidang_studi','matpel.id_bidang_studi')
			.orderBy('matpel.sort')
		return response.json(data)
	}

	async TopikMatpel({params,response}){
		if (params.id == 99) {
			const data = await Database
			.raw("select topik.id_topik,topik.topik,topik.sort from v2.ms_topik topik WHERE NOT EXISTS(select 1 from v2.ts_content content WHERE topik.id_topik = content.id_topik order by topik.sort)")
			return response.json(data.rows)
		}else{
			const data = await Database
				.select('topik.id_topik','topik.topik','topik.sort')
				.table('v2.ts_content as content')
				.leftJoin('v2.ms_topik as topik','topik.id_topik','content.id_topik')
				.where('content.id_bidang_studi',params.matpel)
				.where('content.id_kelas',params.kelas)
				.whereNotNull('topik.id_topik')
				.groupBy('topik.id_topik')
				.orderBy('topik.sort','ASC')
			return response.json(data)
		}	
	}

	async topik ({request,response}){
		const data = await Database
			.table('v2.ms_topik')
			.orderBy('id_topik','DESC')
			.first()	

		let sort = null;	  
		if (!data){
			sort = '111'
		}else{
			sort = parseFloat(data.sort) + parseFloat(1)
		}

		const Inputs = request.only(['topik','created_by'])

		const check = await Database
			.table('v2.ms_topik')
			.where('topik',Inputs.topik)
			.first()
			.count()

		if(check.count < 1){
			const store = await Database
				.insert({
					topik			: Inputs.topik,
					sort			: sort,
					created_by 	 	: Inputs.created_by,
				})
				.table('v2.ms_topik')
			return response.json('sukses')
		}else{
			return response.json('data telah tersedia')
		}
	}

	async DeleteTopik ({params,response,request}){
		const select = await Database	
			.table('v2.ms_topik')
			.where('id_topik',params.id)
			.first()

		const data = JSON.stringify(select)
		
		const delet = await Database
			.table('v2.ms_topik')
			.where('id_topik',params.id)
			.delete()	

		woodlot.err('data'+ data + 'di hapus oleh user id ' + params.user + ' on url '+ request.headers().host + request.url());
	}

	async UpdateSortTopik ({params,request}){
		const Inputs = request.only(['sort','id_topik','created_by'])
		const update = await Database
			.table('v2.ms_topik')
			.where('id_topik',Inputs.id_topik)
			.update({
				sort 	   : Inputs.sort,
				created_by : Inputs.created_by,
			})	
	}

	async TopikId ({params,response}){
		const data = await Database
			.select('topik','id_topik')
			.table('v2.ms_topik')
			.where('id_topik',params.id)
			.first()
		return response.json(data)
	}

	async UpdateTopik({request}){
		const Inputs = request.only(['topik','id_topik','created_by'])
		const update = await Database
			.table('v2.ms_topik')
			.where('id_topik',Inputs.id_topik)
			.update({
				topik 	   : Inputs.topik,
				created_by : Inputs.created_by,
			})	
	}

	async TampilSortTopik({request,response}){
		const data = request.only(['id_kelas','id_bidang_studi'])
		const getContent = await Database
			.select('id_kelas','id_bidang_studi', 'content.id_topik', 'topik','sorting')		
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_topik as topik', 'topik.id_topik', 'content.id_topik')	
			.where('id_kelas', data.id_kelas)
			.where('id_bidang_studi', data.id_bidang_studi)
			.where('content.id_topik','!=', 0)
			.groupBy('id_kelas','id_bidang_studi', 'content.id_topik', 'topik','sorting')
			.orderBy('sorting','ASC')

		return response.json(getContent)
	}

	async sortTopikContent({response,params}){
		const data = await Database
			.select('id_kelas','id_bidang_studi')
			.from('v2.ts_content')
			.where('id_kelas',params.satu)
			.whereNotNull('id_bidang_studi')
			// .whereIn('id_bidang_studi',[1])
			.whereNotNull('id_topik')
			.orderBy('id_kelas')
			.groupBy('id_kelas','id_bidang_studi')

		for (var i = 0; i < data.length; i++) {
			const topik = await Database
				.select('content.id_topik')
				.from('v2.ts_content as content')
				.where('id_kelas',data[i].id_kelas)
				.where('id_bidang_studi',data[i].id_bidang_studi)
				.innerJoin('v2.ms_topik as topik','content.id_topik','topik.id_topik')
				.orderBy('topik.id_topik')

				for (var a = 0; a < topik.length; a++){
					let id_topik = 1;
					let num_topik = String(a);

					if (num_topik.length == 1) {
						id_topik = 1 + num_topik 
					}else if(num_topik.length > 1){
						let subs_topik  = String(a).substr(0,1)
						id_topik       = 1 + parseFloat(subs_topik) +  String(a).substr(1,2) 
					}

					let id_kelas = 0;
					if (String(data[i].id_kelas).length == 1) {
						id_kelas       = 1 + String(data[i].id_kelas)
					}else if (String(data[i].id_kelas).length > 1){
						let subs_kelas = String(data[i].id_kelas).substr(0,1)
						id_kelas       = 1 + parseFloat(subs_kelas) +  String(data[i].id_kelas).substr(1,2) 
					}

					let id_matpel = 0;
					if (String(data[i].id_bidang_studi).length == 1) {
						id_matpel       = 1 + String(data[i].id_bidang_studi)
					}else if (String(data[i].id_bidang_studi).length > 1){
						let subs_kelas  = String(data[i].id_bidang_studi).substr(0,1)
						id_matpel       = 1 + parseFloat(subs_kelas) +  String(data[i].id_bidang_studi).substr(1,2) 
					}

					let sort = String(id_kelas) + String(id_matpel) + String(id_topik)
					topik[a]['sort']  = sort

					let wid_kelas  = data[i].id_kelas
					let wid_matpel = data[i].id_bidang_studi
					let wid_topik  = topik[a].id_topik

					const update = await Database
						.table('v2.ts_content')
						.where('id_kelas',wid_kelas)
						.where('id_bidang_studi',wid_matpel)
						.where('id_topik',wid_topik)
						.update({
							sorting : sort,
						})
				}
					
			data[i]['topik'] = topik;	
		}	
		return response.json(data)
	}
}

module.exports = Ts_MasterController
