'use strict'
const Database = use('Database')
const Helpers = use('Helpers')

class Ts_ContentController {
	// get master
	async getKelas ({request,response}){
		const data = await Database
			.select('id_kelas','kelas')
			.table('v2.ms_kelas')
			.where('active',true)
			.orderBy('sort','ASC')
		return response.json(data)
	}

	async getJurusan ({request,response}){
		const data = await Database
			.select('id_jurusan','jurusan')
			.table('v2.ms_jurusan')
			.orderBy('sort','ASC')
		return response.json(data)
	}

	async getfeature ({response}){
		const data = await Database
			.select('id_feature','feature')
			.table('v2.ms_feature')
			.orderBy('sort','ASC')
		return response.json(data)
	}

	async getSemester ({response}){
		const data = await Database
			.select('id_semester','semester')
			.table('v2.ms_semester')
			.orderBy('sort','ASC')
		return response.json(data)
	}

	async getUjian ({response}){
		const data = await Database
			.select('id_ujian','ujian')
			.table('v2.ms_ujian')
			.orderBy('sort','ASC')
		return response.json(data)
	}

	async getBidangStudi ({response}){
		const data = await Database
			.select('id_bidang_studi','bidang_studi')
			.table('v2.ms_bidang_studi')
			.orderBy('sort','ASC')
		return response.json(data)
	}

	async getBidangStudiId ({response,params}){
		const data = await Database
			.select('bidstud.id_bidang_studi','bidstud.bidang_studi')
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_bidang_studi as bidstud','content.id_bidang_studi','bidstud.id_bidang_studi')
			.where('id_kelas',params.kelas)
			.where('id_feature',params.feature)
			.orderBy('bidstud.sort','ASC')
			.groupBy('bidstud.id_bidang_studi','bidstud.bidang_studi')
		return response.json(data)
	}


	async getTopik ({response}){
		const data = await Database
			.select('id_topik','topik','sort')
			.table('v2.ms_topik')
			.orderBy('sort','ASC')
		return response.json(data)
  	}

  	async getKumpulan({ response }) {
	    const data = await Database
	      .table('v2.ts_kumpulan')
	      .orderBy('sort', 'ASC')
    	return response.json(data)
  	}

  	async updateKumpulan({request,response}){
  		const Inputs = request.only(['id_kumpulan','kumpulan'])
  		const Update = await Database
  			.table('v2.ts_kumpulan')
  			.where('id_kumpulan',Inputs.id_kumpulan)
  			.update({ 
  				kumpulan : Inputs.kumpulan,
  			})
  	}

	async getjurusancontent ({response,params}){
		const data = await Database
			.select('content.id_jurusan','jurusan.jurusan')
			.table('v2.ts_content as content')
			.innerJoin('v2.ms_jurusan as jurusan','content.id_jurusan','jurusan.id_jurusan')
			.where('content.id_kelas',params.id)
			.groupBy('content.id_jurusan','jurusan.jurusan')
		return response.json(data)
	}

	async StoreContentKelas ({request,response}){
		const Inputs = request.only(['id_kelas','id_jurusan','created_by'])
		const store = await Database
			.insert({
				id_kelas		: Inputs.id_kelas,
				id_jurusan		: Inputs.id_jurusan,
				created_by		: Inputs.created_by,
				created_at 	 	: new Date(),
				updated_at 	 	: new Date(),
			})
			.table('v2.ts_content')
		return response.json('sukses')
	}

	async ListContentKelas({response}){
		const data = await Database
			.select('ms_kelas.kelas','v2.ts_content.id_kelas','v2.ms_kelas.sort')
			.innerJoin('v2.ms_kelas','v2.ts_content.id_kelas','v2.ms_kelas.id_kelas')
			.table('v2.ts_content')
			.where('ms_kelas.active',true)
			.groupBy('ms_kelas.kelas','v2.ts_content.id_kelas','v2.ms_kelas.sort')
			.orderBy('v2.ms_kelas.sort','ASC')

			for (var keyJurusan = 0; keyJurusan < data.length; keyJurusan++) {
				const Jurusan = await Database
					.select('v2.ts_content.id_jurusan','v2.ms_jurusan.jurusan','v2.ms_jurusan.sort')
					.table('v2.ts_content')
					.innerJoin('v2.ms_jurusan','v2.ts_content.id_jurusan','v2.ms_jurusan.id_jurusan')
					.where('id_kelas',data[keyJurusan].id_kelas)
					.groupBy('v2.ts_content.id_jurusan','v2.ms_jurusan.jurusan','v2.ms_jurusan.sort')
					.orderBy('v2.ms_jurusan.sort','ASC')
				data[keyJurusan]['jurusan'] = Jurusan;
			}

		return response.json(data);
	}

	async StoreContentFitur ({request,response}){
		const Inputs = request.only(['kelas','jurusan','tahun','feature','created_by'])
		
		const list = await Database
			.table('v2.ts_content')
			.where('id_kelas',Inputs.kelas)
			.where('id_jurusan',Inputs.jurusan)
			.where('tahun',Inputs.tahun)
			.where('id_feature','0')
			.count()
			.first()

		if (list.count < 1) {
			const store = await Database
				.insert({
					id_kelas    : Inputs.kelas,
					id_jurusan	: Inputs.jurusan,
					id_feature  : Inputs.feature,
					tahun		: Inputs.tahun == 0 ? null : Inputs.tahun,
					created_by	: Inputs.created_by,
					created_at 	: new Date(),
					updated_at 	: new Date(),
				})
				.table('v2.ts_content')
		}else{
			const Update = await Database
				.table('v2.ts_content')
				.where('id_kelas',Inputs.kelas)
				.where('id_jurusan',Inputs.jurusan)
				.where('tahun',Inputs.tahun)
				.where('id_feature','0')
				.update({ 
					id_feature : Inputs.feature,
					updated_at : new Date(), 
					created_by : Inputs.created_by,
				})
		}

		
		return response.json('sukses')
	}

	async ListContentFitur({response,params}){
		const list = await Database 
			.select('content.id_jurusan','jurusan','content.id_feature','feature','tahun')
			.table('v2.ts_content as content')
			.where('id_kelas',params.id)
			.innerJoin('v2.ms_jurusan as jurusan','content.id_jurusan','jurusan.id_jurusan')
			.innerJoin('v2.ms_feature as fitur','content.id_feature','fitur.id_feature')
			.groupBy('content.id_jurusan','jurusan','feature','content.id_feature','tahun')

		return response.json(list)

	}

	async StoreContentMateri ({request,response}){
		const Inputs = request.only(['kelas','jurusan','feature','bidang_studi','topik','kumpulan','semester','ujian','limit','tahun','status','created_by','sorting'])
		if (Inputs.tahun) {
			const list = await Database
				.table('v2.ts_content')
				.where('id_kelas',Inputs.kelas)
				.where('id_jurusan',Inputs.jurusan)
				.where('id_feature',Inputs.feature)
				.where('tahun',Inputs.tahun)
				.whereNull('id_bidang_studi')
				.first()
				.count()

			if (list.count > 1){
				const Update = await Database
					.table('v2.ts_content')
					.where('id_kelas',Inputs.kelas)
					.where('id_jurusan',Inputs.jurusan)
					.where('id_feature',Inputs.feature)
					.whereNull('id_bidang_studi')
					.update({ 
						id_bidang_studi : Inputs.bidang_studi,
						id_topik		: Inputs.topik,
						id_semester		: Inputs.semester,
						id_ujian 		: Inputs.ujian,
						limit			: Inputs.limit,
						tahun			: Inputs.tahun,
						sorting			: Inputs.sorting,
						updated_at 		: new Date(), 
						created_by 		: Inputs.created_by,
					})
			}else{
				const store = await Database
					.insert({
						id_kelas    	: Inputs.kelas,
						id_jurusan		: Inputs.jurusan,
						id_feature  	: Inputs.feature,
						id_bidang_studi : Inputs.bidang_studi,
						id_topik		: Inputs.topik,
						id_semester		: Inputs.semester,
						id_ujian 		: Inputs.ujian,
						limit			: Inputs.limit,
						tahun			: Inputs.tahun,
						sorting			: Inputs.sorting,
						created_by		: Inputs.created_by,
						created_at 		: new Date(),
						updated_at 		: new Date(),
					})
					.table('v2.ts_content')
			}
		}else{
			const list = await Database
				.table('v2.ts_content')
				.where('id_kelas',Inputs.kelas)
				.where('id_jurusan',Inputs.jurusan)
				.where('id_feature',Inputs.feature)
				.whereNull('id_bidang_studi')
				.first()
				.count()

			if (list.count > 1){
				const Update = await Database
					.table('v2.ts_content')
					.where('id_kelas',Inputs.kelas)
					.where('id_jurusan',Inputs.jurusan)
					.where('id_feature',Inputs.feature)
					.whereNull('id_bidang_studi')
					.update({ 
						id_bidang_studi : Inputs.bidang_studi,
						id_topik		: Inputs.topik == 0 ? null : Inputs.topik,
						id_semester		: Inputs.semester,
						id_ujian 		: Inputs.ujian,
						limit			: Inputs.limit,
						sorting			: Inputs.sorting,
						updated_at 		: new Date(), 
						created_by 		: Inputs.created_by,
					})
			}else{
				const store = await Database
					.insert({
						id_kelas    	: Inputs.kelas,
						id_jurusan		: Inputs.jurusan,
						id_feature  	: Inputs.feature,
						id_bidang_studi : Inputs.bidang_studi,
						id_topik		: Inputs.topik,
						id_semester		: Inputs.semester,
						id_ujian 		: Inputs.ujian,
						limit			: Inputs.limit,
						sorting			: Inputs.sorting,
						created_by		: Inputs.created_by,
						created_at 		: new Date(),
						updated_at 		: new Date(),
					})
					.table('v2.ts_content')

				if(Inputs.kumpulan){
					const getIdContent = await Database
						.table('v2.ts_content')
						.select('id_content')
						.where('id_kelas',Inputs.kelas)
						.where('id_jurusan',Inputs.jurusan)
						.where('id_feature',Inputs.feature)
						.where('id_bidang_studi',Inputs.bidang_studi)
						.where('id_semester',Inputs.semester)
						.where('id_ujian',Inputs.ujian)
						.where('limit',	Inputs.limit)
						.first()

					const data = await Database
						.table('v2.ts_kumpulan')
						.orderBy('id_kumpulan','DESC')
						.first()	

					let sort = null;	  
					if (!data){
						sort = '111'
					}else{
						sort = parseFloat(data.sort) + parseFloat(1)
					}

					const storeKumpulan = await Database
						.insert({
							id_content    	: getIdContent.id_content,
							kumpulan		: Inputs.kumpulan,
							free			: Inputs.status == 0 ? false : true,
							sort 			: sort,
						})
						.table('v2.ts_kumpulan')
					
				}
			}
				
		}	
	}

	async ListContentMateri({response,request}){
		const Inputs = request.only(['kelas','jurusan','feature','tahun','matpel'])

		const listGabungan = await Database
			.select('content.id_content','semester','ujian','bidang_studi','topik','limit','kumpulan','id_kumpulan','kumpulan.free','content.sorting as sort','topik.id_topik')
			.table('v2.ts_content as content')
			.where('id_kelas', Inputs.kelas)
			.where('id_jurusan', Inputs.jurusan)
			.where('id_feature', Inputs.feature)
			.where('content.id_bidang_studi', Inputs.matpel)
			.innerJoin('v2.ms_semester as semester','content.id_semester','semester.id_semester')
			.innerJoin('v2.ms_ujian as ujian','content.id_ujian','ujian.id_ujian')
			.innerJoin('v2.ms_bidang_studi as bidang_studi','content.id_bidang_studi','bidang_studi.id_bidang_studi')
			.leftJoin('v2.ms_topik as topik','content.id_topik','topik.id_topik')
			.leftJoin('v2.ts_kumpulan as kumpulan','content.id_content','kumpulan.id_content')
			.orderBy('content.sorting')

			for (var i = 0; i < listGabungan.length; i++) {
				const count = await Database
					.table('v2.ts_soal')
					.where('id_content',listGabungan[i].id_content)
					.count()
					.first()
				listGabungan[i]['count'] = count;
			}

		if (Inputs.tahun) {
		const list = await Database
			.select('content.id_content','bidang_studi','topik','limit','content.tahun','content.sorting as sort','topik.id_topik')
			.table('v2.ts_content as content')
			.where('id_kelas', Inputs.kelas)
			.where('id_jurusan', Inputs.jurusan)
			.where('id_feature', Inputs.feature)
			.where('tahun',Inputs.tahun)
			.where('content.id_bidang_studi', Inputs.matpel)
			.where('id_semester','0')
			.where('id_ujian','0')
			.innerJoin('v2.ms_bidang_studi as bidang_studi','content.id_bidang_studi','bidang_studi.id_bidang_studi')
			.leftJoin('v2.ms_topik as topik','content.id_topik','topik.id_topik')
			.orderBy('content.sorting','ASC')

			for (var i = 0; i < list.length; i++) {
				const count = await Database
					.table('v2.ts_soal')
					.where('id_content',list[i].id_content)
					.count()
					.first()
				list[i]['count'] = count;
			}

			return response.json({
				status 	  	  : 'true',
				responses 	  : '200',
				ListGabungan  : listGabungan,
				list 		  : list			
			})
		}else{
			const list = await Database
			.select('content.id_content','bidang_studi','topik','limit','content.tahun','content.sorting as sort','topik.id_topik')
			.table('v2.ts_content as content')
			.where('id_kelas', Inputs.kelas)
			.where('id_jurusan', Inputs.jurusan)
			.where('id_feature', Inputs.feature)
			.where('content.id_bidang_studi', Inputs.matpel)
			.where('id_semester','0')
			.where('id_ujian','0')
			.innerJoin('v2.ms_bidang_studi as bidang_studi','content.id_bidang_studi','bidang_studi.id_bidang_studi')
			.leftJoin('v2.ms_topik as topik','content.id_topik','topik.id_topik')
			.orderBy('content.sorting','ASC')

			for (var i = 0; i < list.length; i++) {
				const count = await Database
					.table('v2.ts_soal')
					.where('id_content',list[i].id_content)
					.count()
					.first()
				list[i]['count'] = count;
			}

			return response.json({
				status 	  	  : 'true',
				responses 	  : '200',
				ListGabungan  : listGabungan,
				list 		  : list			
			})
		}

		
	}

	async deleteContentMateri({params}){
		const hapus = await Database
			.table('v2.ts_content')
			.where('id_content',params.id)
			.delete()
	}

	async getSortTopik({params,response}){
		

		const existSorting = await Database
		    .from('v2.ts_content')
		    .where('id_kelas',params.kelas)
		    .where('id_bidang_studi',params.matpel)
		    .where('id_topik',params.topik)
		    .whereNotNull('sorting')
		    .orderBy('sorting','desc')
		    .first()
		let id = 0
		if (existSorting) {
			id = existSorting.sorting
		}else{

			const getLastSorting = await Database
		    .from('v2.ts_content')
		    .where('id_kelas',params.kelas)
		    .where('id_bidang_studi',params.matpel)
		    .whereNotNull('sorting')
		    .orderBy('sorting','DESC')
		    .first()

		    id = getLastSorting.sorting ? parseFloat(getLastSorting.sorting) + 1 : 11
		}

		return response.json(id)
	}

	async UpdateSort({request}){
		const Inputs = request.only(['id_bidstud','id_kelas','id_topik','sort'])
		const hapus = await Database
			.table('v2.ts_content')
			.where('id_bidang_studi',Inputs.id_bidstud)
			.where('id_kelas',Inputs.id_kelas)
			.where('id_topik',Inputs.id_topik)
			.update({
				sorting : Inputs.sort
			})
	}
}	

module.exports = Ts_ContentController
