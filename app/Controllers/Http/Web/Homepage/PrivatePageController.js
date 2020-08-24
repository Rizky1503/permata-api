'use strict'
const Database = use('Database')
const Helpers = use('Helpers')


class PrivatePageController {

	async index ({params, response}) {

		const Tingkat =  params.id.replace(/%20/g, ' ')

		if (Tingkat == "SMA") {
			const affectedRows = await Database
			.query()
		  	.table('in_silabus')		 
		  	.where('tingkat', params.id.replace(/%20/g, ' ')) 
		  	.groupBy('silabus')
	  		.pluck('silabus')
		  	return response.status(200).json(affectedRows);
		}else{
			const affectedRows = await Database
				.query()
			  	.table('in_matpel')		 
			  	.where('kategori', params.id.replace(/%20/g, ' ')) 
			  	.groupBy('nama_matpel')
		  		.pluck('nama_matpel')
		  	return response.status(200).json(affectedRows);
		}		
	}
	

	async listKelas ({response}) {
		let kategori = await Database.from('in_matpel')
		.orderBy('urutan','ASC')
		.groupBy('kategori','urutan')
		.pluck('kategori','urutan')
		return response.json(kategori)
	}

	async silabus ({params, response}) {

		let Silabus = await Database.from('in_silabus')
		.where('tingkat', params.tingkat.replace(/%20/g, ' '))
		.where('matpel', params.matpel.replace(/%20/g, ' '))
		.groupBy('silabus')
		.pluck('silabus')
		return response.json(Silabus)
	}

	
}

module.exports = PrivatePageController
