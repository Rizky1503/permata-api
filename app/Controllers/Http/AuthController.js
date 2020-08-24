'use strict'
const User = use('App/Models/User');
const Database = use('Database')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const Env = use('Env')
const moment = require('moment'); // require
const Mail = use('Mail')

class AuthController {

   	async login({ request, auth }) {
  		const { email, password } = request.all()
  		return auth.authenticator('jwt').withRefreshToken().attempt(email, password)
	}


  	async revokeUserToken ({ auth, response}) {
  		return await auth.newRefreshToken().generateForRefreshToken('785546acb086fdde5e05bc11c7e2c6abkxoqKUNsSgz3gK7htj84R9HEqiTtAOlSYq6cdxEXx+TKmv2JuXWNfdUhLPBrhnM/')

	    const apiToken = auth.getAuthHeader()
		  await auth
		    .authenticator('jwt')
		    .revokeTokens([apiToken])
		  return response.send({ message: 'Logout successfully!'})
	}

	async getPelanggan ({ request, response}) {

		const requestData = request.only(['id_pelanggan']);
		const pelanggan = await Database
			.select('nama','email','foto','email_verified')		
			.table('in_pelanggan')
			.where('id_pelanggan', requestData.id_pelanggan)
			.first()
		if (pelanggan) {
			if (pelanggan.foto) {
				pelanggan.foto = Env.get('URL_RESOURCE','https://resource.permatamall.com/api/v1/')+'images/profile/pelanggan/'+pelanggan.foto;
			}else{
				pelanggan.foto = 'https://www.accountingweb.co.uk/sites/all/modules/custom/sm_pp_user_profile/img/default-user.png'
			}
		}


  		return response.json({
			status : 'true',
			responses : '200',
			data:pelanggan			
		}) 
	}

	async registrasi ({ request, response}) {

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
		
		const pelanggan 		= new Pelanggan()
		const pelangganInfo 	= request.only(['nama_lengkap','email','kelas','password'])
		const enPassword 		= Encryption.encrypt(pelangganInfo.password)
		pelanggan.id_pelanggan 	= lastpelangganid
		pelanggan.nama 			= pelangganInfo.nama_lengkap
		pelanggan.email 		= pelangganInfo.email
		pelanggan.kelas 		= pelangganInfo.kelas
		pelanggan.password 		= enPassword
		// pelanggan.email_verified= new Date()
	
		//cek email
		const cekEmail = await Database.from('in_pelanggan').where('email',pelangganInfo.email)
		if(cekEmail != ""){	
			return response.json({status : 'already_exist'})	
		}else{
			await pelanggan.save()
			return response.status(200).json({
				pelanggan,
				status: 'true',
		  	})	
		} 
	}

	async registrasiKelas ({ request, response}) {

		const dataKelas = await Database
			.query()			
			.table('v2.ms_kelas')
			.orderBy('sort', 'ASC')

		const result = [];
		for (var i = 0; i < dataKelas.length; i++) {
			if (i % 4 == 0) {
				const resultKelas = await Database
				.select('id_kelas','kelas', 'icon')			
				.table('v2.ms_kelas')
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

		const kurikulum = ([{
			id_kurikulum :1,
			kurikulum    : 'K13'
		}])

		const resultData = ({
			result     : result,
			kurikulum  : kurikulum,
			active     : 1
		})

	    return response.json({
			status : 'true',
			responses : '200',
			data:resultData			
		}) 
	}

	async getVersion ({ request, response}) {

		const data = request.only(['version'])
		return response.status(200).json({
			version_app: 4194410,
			version_app_name: '1.0.0',
	  	})
	}

	async forgot ({ request, response}) {

		const data = request.only(['email'])
		const email = await Database
            .from('in_pelanggan')
            .where('email', data.email)
            .first()
        if (email) {        	
        	var date 	= new Date();
			var nowTime = moment(date).format("DMYYYYhmm");
			var newTime = moment(date).add('m', 5).format("DMYYYYhmm");
			var otp 	= Math.floor(1000 + Math.random() * 999999);

			const insertOTP = await Database.raw(`INSERT INTO v2.ts_otp (
				 email, 
				 otp, 
				 expired
				) SELECT '`+data.email+`', '`+otp+`', '`+newTime+`'
				WHERE NOT EXISTS (
					SELECT * FROM v2.ts_otp 
				    WHERE email = '`+data.email+`' 
				    AND expired > '`+nowTime+`'
				)
			`)

			if (insertOTP) {
				const getOtp = await Database
	            .from('v2.ts_otp')
	            .where('email', data.email)
	            .where('expired', '>', nowTime)
	            .first()

	            let dataEmail = {
                    nama        : 'Member PermataBelajar', 
                    kode   		: getOtp.otp
                } 
                await Mail.send('users.forgot_password_belajar', dataEmail , (message) => {
                    message
                    .to(getOtp.email)
                    .from('noreply@permatamall.com', "Permata Mall")
                    .subject('Lupa Password')
                })

				return response.json({
					status : 'true',
					responses : 200,
					data:"Email Berhasil dikirim"			
				})
			}else{
				return response.json({
					status : 'true',
					responses : 201,
					data:"System sedang gangguan, silahkan hubungi ke contact support kami di 0811-811-306"			
				})
			}
        }else{
        	return response.json({
				status : 'true',
				responses : 500,
				data:"Email tidak ditemukan, Pastikan penulisan email benar"			
			})
        }

	}

	async forgotVerify ({ request, response}) {

		const data = request.only(['email', 'otp'])
		var date 	= new Date();
		var nowTime = moment(date).format("DMYYYYhmm");
		
        const dataOtp = await Database
            .from('v2.ts_otp')
            .where('email', data.email)
            .where('otp', data.otp)
            .first()

        if (dataOtp) {
        	if (dataOtp.expired > nowTime) {
        		const dataPelanggan = await Database
	            .from('in_pelanggan')
	            .where('email', data.email)
	            .first()

	            if (dataPelanggan) {
	            	return response.json({
						status : 'true',
						responses : 200,
						data: Encryption.encrypt(dataPelanggan.id_pelanggan)
					})
	            }else{
	           		return response.json({
						status : 'true',
						responses : 500,
						data:"System sedang gangguan, silahkan hubungi ke contact support kami di 0811-811-306"			
					}) 	
	            }
        	}else{
	        	return response.json({
					status : 'true',
					responses : 500,
					data:"Kode Pin telah kedaluarsa, silahkan kirim ulang kode"			
				})        		
        	}
        }else{
        	return response.json({
				status : 'true',
				responses : 500,
				data:"Kode Pin tidak ditemukan"			
			})
        }

	}


	async forgotChange ({ request, response}) {

		const data = request.only(['token', 'password'])
		const dataPelanggan = await Database
	        .from('in_pelanggan')
	        .where('id_pelanggan', Encryption.decrypt(data.token))
	        .update({
	        	password: Encryption.encrypt(data.password)
	        })
	    if (dataPelanggan == 1) {
	    	const pelanggan = await Database
		        .from('in_pelanggan')
		        .where('id_pelanggan', Encryption.decrypt(data.token))
		        .first()
	    	return response.json({
				status : 'true',
				responses : 200,
				// data:pelanggan	
				data:"Kata sandi berhasil diubah, demi keamanan akun silahkan login kembali"	
			})
	    }else{
	    	return response.json({
				status : 'true',
				responses : 500,
				data:"Gagal ubah Kata Sandi, Pastikan sandi yang dimasukan sama"			
			})
	    }
	}

	async loginPelanggan ({request, response}) {

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

}

module.exports = AuthController
