'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')

class SoalController {

	async request ({request, response}) {

		const data	= request.only(['id_content','id_pelanggan'])  
		const id_content 		= data.id_content;
		const id_pelanggan 		= data.id_pelanggan;

		const dataContent = await Database
			.table('v2.ts_content')
			.where('id_content',id_content)
			.first()
		if (dataContent) {			
			const soal = await Database
			.table('v2.ts_soal')
			.where('id_content',id_content)
			.limit(dataContent.limit)
			.orderByRaw('random()')

			const insertData = await Database.raw("\
				INSERT INTO v2.ts_soal_examp (id_pelanggan, id_content) SELECT '"+id_pelanggan+"', "+id_content+" \
				WHERE NOT EXISTS (\
					SELECT * FROM v2.ts_soal_examp WHERE id_pelanggan='"+id_pelanggan+"'AND id_content = "+id_content+" AND finish = FALSE\
				)RETURNING id_examp")
			if (insertData.rows[0]) {
				for (var i = 0; i < soal.length; i++) {
					const insertExecute = await Database
					  .table('v2.ts_soal_execute')
					  .insert({
					  	id_examp: insertData.rows[0].id_examp, 
					  	id_soal: soal[i].id_soal 
					  })
				}		
			    return response.json({
					status : 'true',
					responses : '200',
					data:"data insert success"			
				})							

			}else{
			    return response.json({
					status : 'true',
					responses : '201',
					data:"data already status false"			
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


	async latihanResult ({request, response}) {

		const data	= request.only(['id_content','id_pelanggan', 'page'])  
		const id_content 		= data.id_content;
		const id_pelanggan 		= data.id_pelanggan;
		const page 				= data.page;

		const getExamp = await Database
			.table('v2.ts_soal_examp')
			.where('id_content',id_content)
			.where('id_pelanggan',id_pelanggan)
			.where('finish',false)
			.first()

		if (getExamp) {
			if (page == 0 || page == 1) {
				const getSoal = await Database
					.select('id_execute','title', 'soal','pembahasan','free', 'jawaban', 'jawaban_user', 'id_examp')
					.table('v2.ts_soal_execute as soal_execute')
					.innerJoin('v2.ts_soal as soal', 'soal.id_soal', 'soal_execute.id_soal')
					.where('id_examp',getExamp.id_examp)
					.orderBy('id_execute','ASC')
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
					.select('id_execute','title', 'soal','pembahasan','free', 'jawaban', 'jawaban_user', 'id_examp')
					.table('v2.ts_soal_execute as soal_execute')
					.innerJoin('v2.ts_soal as soal', 'soal.id_soal', 'soal_execute.id_soal')
					.where('id_examp',getExamp.id_examp)
					.orderBy('id_execute','ASC')
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

	async latihanAnswer ({request, response}) {

		const data	= request.only(['id_execute','jawaban'])  
		const id_execute 		= data.id_execute;
		const jawaban 			= data.jawaban;

		const updateJawaban = await Database
			.table('v2.ts_soal_execute')
			.where('id_execute',id_execute)
			.update({
				jawaban_user : jawaban
			})

		return response.json({
			status : 'true',
			responses : '200',
			data:'Success Answer'			
		})
	}

	async latihanFinish ({request, response}) {

		const data	= request.only(['id_examp'])  
		const id_examp 			= data.id_examp;

		const soal = await Database
			.table('v2.ts_soal_execute as soal_execute')
			.innerJoin('v2.ts_soal as soal', 'soal.id_soal', 'soal_execute.id_soal')
			.where('id_examp',id_examp)
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

		const result = ({
			betul : betul.length,
			salah : salah.length,
			blank : blank.length
		})

		const updateExamp = await Database
			.table('v2.ts_soal_examp')
			.where('id_examp',id_examp)
			.update({
				finish : true
			})

		return response.json({
			status : 'true',
			responses : '200',
			data: result			
		})
	}


	async requestSemester ({request, response}) {

		const data	= request.only(['id_content','id_kumpulan','id_pelanggan'])  
		const id_content 		= data.id_content;
		const id_kumpulan 		= data.id_kumpulan;
		const id_pelanggan 		= data.id_pelanggan;

		const dataContent = await Database
			.table('v2.ts_content')
			.where('id_content',id_content)
			.first()

		if (dataContent) {			
			const soal = await Database
			.table('v2.ts_soal')
			.where('id_content',id_content)
			.where('id_kumpulan',id_kumpulan)

			const insertData = await Database.raw("\
				INSERT INTO v2.ts_soal_examp (id_pelanggan, id_content, id_kumpulan) SELECT '"+id_pelanggan+"', "+id_content+" , "+id_kumpulan+" \
				WHERE NOT EXISTS (\
					SELECT * FROM v2.ts_soal_examp WHERE id_pelanggan='"+id_pelanggan+"'AND id_content = "+id_content+" AND id_kumpulan = "+id_kumpulan+" AND finish = FALSE\
				)RETURNING id_examp")
			if (insertData.rows[0]) {
				for (var i = 0; i < soal.length; i++) {
					const insertExecute = await Database
					  .table('v2.ts_soal_execute')
					  .insert({
					  	id_examp: insertData.rows[0].id_examp, 
					  	id_soal: soal[i].id_soal 
					  })
				}		
			    return response.json({
					status : 'true',
					responses : '200',
					data:"data insert success"			
				})							

			}else{
			    return response.json({
					status : 'true',
					responses : '201',
					data:"data already status false"			
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


	async latihanResultSemester ({request, response}) {

		const data				= request.only(['id_content', 'id_kumpulan','id_pelanggan', 'page'])  
		const id_content 		= data.id_content;
		const id_kumpulan 		= data.id_kumpulan;
		const id_pelanggan 		= data.id_pelanggan;
		const page 				= data.page;

		const getExamp = await Database
			.table('v2.ts_soal_examp')
			.where('id_content',id_content)
			.where('id_kumpulan',id_kumpulan)
			.where('id_pelanggan',id_pelanggan)
			.where('finish',false)
			.first()
		if (getExamp) {
			if (page == 0 || page == 1) {
				const getSoal = await Database
					.select('id_execute','title', 'soal','pembahasan','free', 'jawaban', 'jawaban_user', 'id_examp')
					.table('v2.ts_soal_execute as soal_execute')
					.innerJoin('v2.ts_soal as soal', 'soal.id_soal', 'soal_execute.id_soal')
					.where('id_examp',getExamp.id_examp)
					.orderBy('id_execute','ASC')
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
					.select('id_execute','title', 'soal','pembahasan','free', 'jawaban', 'jawaban_user', 'id_examp')
					.table('v2.ts_soal_execute as soal_execute')
					.innerJoin('v2.ts_soal as soal', 'soal.id_soal', 'soal_execute.id_soal')
					.where('id_examp',getExamp.id_examp)
					.orderBy('id_execute','ASC')
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


	
}

module.exports = SoalController
