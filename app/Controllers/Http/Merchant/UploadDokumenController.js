'use strict'
const UploadDokumen = use('App/Models/UploadDokumen')
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class UploadDokumenController {

	async index ({response}) {
	
		let uploaddokumen = await UploadDokumen.all()
		return response.json(uploaddokumen)
	}



	async store ({request, response}) {

		const uploaddokumen 		 = new UploadDokumen()
		const uploaddokumenInfo 	 = request.only(['id_merchant', 'id_persyaratan', 'status', 'keterangan', 'nama_doc'])
		const upload_docs 			 = request.file('upload_docs')
		let filename = ""

		uploaddokumen.id_merchant	 = uploaddokumenInfo.id_merchant
		
		if(upload_docs !== null){ 
			let path 	= "images/DokumenMerchant/"+uploaddokumenInfo.id_merchant
			filename  =   randomstring.generate(7) +"."+  upload_docs.toJSON().extname;
			await upload_docs.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			uploaddokumen.upload_docs = filename
		}
		
		uploaddokumen.id_persyaratan = uploaddokumenInfo.id_persyaratan
		uploaddokumen.status		 = uploaddokumenInfo.status
		uploaddokumen.keterangan 	 = uploaddokumenInfo.keterangan
		uploaddokumen.nama_doc 		= uploaddokumenInfo.nama_doc
		await uploaddokumen.save()
		return response.status(201).json(uploaddokumen)	

	}


	async show ({params, response}) {
	
		const uploaddokumen = await UploadDokumen.find(params.id)
		return response.json(uploaddokumen)
	
	}


	async update ({params, request, response}) {
		const uploaddokumen = await UploadDokumen.find(params.id)

		const uploaddokumenInfo 	 = request.only(['id_merchant', 'id_persyaratan', 'status', 'keterangan', 'nama_doc'])
		const upload_docs 			 = request.file('upload_docs')
		let filename = ""

		if (!uploaddokumen) {
			return response.status(404).json({data: 'Resource not found'})
		}
		
		uploaddokumen.id_merchant	 = uploaddokumenInfo.id_merchant
		
		if(upload_docs !== null){ 
			let path 	= "images/DokumenMerchant/"+uploaddokumenInfo.id_merchant
			filename  =   randomstring.generate(7) +"."+  upload_docs.toJSON().extname;
			await upload_docs.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			uploaddokumen.upload_docs = filename
		}
		
		uploaddokumen.id_persyaratan = uploaddokumenInfo.id_persyaratan
		uploaddokumen.status		 = uploaddokumenInfo.status
		uploaddokumen.keterangan 	 = uploaddokumenInfo.keterangan
		uploaddokumen.nama_doc 		= uploaddokumenInfo.nama_doc
		await uploaddokumen.save()
		return response.status(201).json(uploaddokumen)	

	}


	async delete ({params, response}) {

		const uploaddokumen = await UploadDokumen.find(params.id)
		if (!uploaddokumen) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await uploaddokumen.delete()
		return response.status(204).json(uploaddokumen)
	}

	async showIdMerchant ({params, response}) {

		const uploaddokumen = await UploadDokumen.query().where('id_merchant', params.id).fetch()
		return response.json(uploaddokumen)
					
	}
	

	async checkAlredy ({params, response}) {

		const checkDocument = await UploadDokumen.query().where('id_merchant', params.id_merchant).where('id_persyaratan', params.id_persyaratan).fetch()
		return response.json(checkDocument)
					
	}	
}

module.exports = UploadDokumenController
