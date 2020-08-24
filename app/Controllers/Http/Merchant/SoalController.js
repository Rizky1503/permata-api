'use strict'
const Soal = use('App/Models/Soal')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class SoalController {

	async index ({response}) {
	
		let soal = await Soal.all()
		return response.json(soal)
	}


	async store ({request, response}) {

		const soal 		 = new Soal()
		const soalInfo 	 = request.only(['kategori','kelas', 'nama_matpel','kurikulum','jawaban','pembahasan'])
		const soal 		 = request.file('soal')
		let filename 	 = ""

		if(soal !== null){ 
			let path 	= "images/BankSoal"
			filename  =   randomstring.generate(7) +"."+  soal.toJSON().extname;
			await soal.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			  soal.soal = filename
		}

		soal.kategori 	 = soalInfo.kategori
		soal.kelas 		 = soalInfo.kelas
		soal.nama_matpel = soalInfo.nama_matpel
		soal.kurikulum 	 = soalInfo.kurikulum
		soal.jawaban 	 = soalInfo.jawaban
		soal.pembahasan	 = soalInfo.pembahasan
		await soal.save()
		return response.status(201).json(soal)	

	}


	async show ({params, response}) {
	
		const soal = await Soal.find(params.id)
		return response.json(soal)
	
	}


	async update ({params, request, response}) {

		const soal = await Soal.find(params.id)
		const soalInfo 	 = request.only(['kategori','kelas', 'nama_matpel','kurikulum','jawaban','pembahasan'])
		const soal 		 = request.file('soal')
		let filename 	 = ""
		
		if (!soal) {
			return response.status(404).json({data: 'Resource not found'})
		}

		if(soal !== null){ 
			let path 	= "images/BankSoal"
			filename  =   randomstring.generate(7) +"."+  soal.toJSON().extname;
			await soal.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			  soal.soal = filename
		}

		soal.kategori 	 = soalInfo.kategori
		soal.kelas 		 = soalInfo.kelas
		soal.nama_matpel = soalInfo.nama_matpel
		soal.kurikulum 	 = soalInfo.kurikulum
		soal.jawaban 	 = soalInfo.jawaban
		soal.pembahasan	 = soalInfo.pembahasan
		await soal.save()
		return response.status(200).json(soal)
	}


	async delete ({params, response}) {

		const soal 	= await Soal.find(params.id)
		if (!soal) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await soal.delete()
		return response.status(204).json(soal)
	}
}

module.exports = SoalController
