'use strict'
const Pelanggan = use('App/Models/Pelanggan')
const Database = use('Database')
const Encryption = use('Encryption')


class PelangganController {

	async store ({request, response}) { 
		function appendLeadingZeroes(n){
		  if(n <= 9){
		    return "0" + n;
		  }
		  return n
		}

		let current_datetime = new Date()
		let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())		


		const lastMerIDchant = await Database.select(Database.raw('substr(id_pelanggan,11,30) as id_pelanggan'))
		    .from('in_pelanggan')
		    .orderBy(Database.raw('substr(id_pelanggan,11,30)'), 'desc')
		    .first();

        let lastpelangganid = null;


		if (lastMerIDchant ) {

		  lastpelangganid = 'PG'+ formatted_date + ++lastMerIDchant.id_pelanggan;
		} else {

		  lastpelangganid = 'PG'+ formatted_date +'1000000001';

		}
		
		const pelanggan 			= new Pelanggan()

		const pelangganInfo 		= request.only(['id_pelanggan', 'nama', 'no_telpon','email', 'alamat', 'password'])


		const enPassword = Encryption.encrypt(pelangganInfo.password)

		pelanggan.id_pelanggan 	 = lastpelangganid
		pelanggan.nama 			 = pelangganInfo.nama
		pelanggan.no_telpon 	 = pelangganInfo.no_telpon
		pelanggan.email 		 = pelangganInfo.email
		pelanggan.alamat 		 = pelangganInfo.alamat
		pelanggan.password 		 = enPassword
		pelanggan.kota 			 = pelangganInfo.kota
	
		//cek email
		const cekEmail = await Database.from('in_pelanggan').where('email',pelangganInfo.email)

		if(cekEmail != ""){	
			return response.json('already_exist')	
		}else{
			await pelanggan.save()
			return response.status(200).json(pelanggan)	
		}	
	}

	async cek ({response,params,request}){
		const pelangganInfo = request.only(['id_pelanggan'])
		//const cek = await Database.from('in_pelanggan').where('id_pelanggan',pelangganInfo.id_pelanggan)
		const cek = await Database.from('in_pelanggan').where('id_pelanggan',params.id)
		if(cek != ""){
			return response.json('true')	
		}else{
			return response.json('false')	
		}
	}

	async cekLogin ({response,request}){

		const pelangganInfo = request.only(['email','password'])
		const cekEmail = await Database.from('in_pelanggan').where('email',pelangganInfo.email).first() 
		if(cekEmail){
			if (Encryption.decrypt(cekEmail.password) == pelangganInfo.password) {
				return response.status(200).json({
					cekEmail,
					status: 'true',
			  	})		
			}else{
				return response.json({status : 'false'})	
			}

		}else{
			return response.json({status : 'false'})	
		}
	}

	//register/login google
	async store_google ({request, response}) { 
		function appendLeadingZeroes(n){
		  if(n <= 9){
		    return "0" + n;
		  }
		  return n
		}

		let current_datetime = new Date()
		let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())		


		const lastMerIDchant = await Database.select(Database.raw('substr(id_pelanggan,11,30) as id_pelanggan'))
		    .from('in_pelanggan')
		    .orderBy(Database.raw('substr(id_pelanggan,11,30)'), 'desc')
		    .first();

        let lastpelangganid = null;


		if (lastMerIDchant ) {

		  lastpelangganid = 'PG'+ formatted_date + ++lastMerIDchant.id_pelanggan;
		} else {

		  lastpelangganid = 'PG'+ formatted_date +'1000000001';

		}
		
		const pelanggan 			= new Pelanggan()

		const pelangganInfo 		= request.only(['id_pelanggan', 'nama', 'no_telpon','email', 'alamat', 'password'])


		const enPassword = Encryption.encrypt(pelangganInfo.password)

		pelanggan.id_pelanggan 	= lastpelangganid
		pelanggan.nama 			= pelangganInfo.nama
		pelanggan.no_telpon 	= pelangganInfo.no_telpon
		pelanggan.email 		= pelangganInfo.email
		pelanggan.alamat 		= pelangganInfo.alamat
		pelanggan.password 		= enPassword
		pelanggan.kota 			= pelangganInfo.kota
	
		//cek email
		const cekEmail = await Database.from('in_pelanggan').where('email',pelangganInfo.email)
		if(cekEmail != ""){	

			const data_pelanggan = await Database
				.select('*')
				.from('in_pelanggan')
				.where('email',pelangganInfo.email)
				.first()

			return response.status(200).json(data_pelanggan)	
		}else{
			await pelanggan.save()
			return response.status(200).json(pelanggan)	
		}	
	}
}

module.exports = PelangganController
