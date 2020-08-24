'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Env = use('Env')
const Mail = use('Mail')
const Mitra = use('App/Models/Mitra')


class AuthController {

	async login ({request, response}) {

		const mitraInfo = request.only(['username','password'])
		const cekEmail = await Database.from('in_mitra').where('email',mitraInfo.username).first() 
		if(cekEmail){
			if (Encryption.decrypt(cekEmail.password) == mitraInfo.password) {
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


	async registrasi ({request, response}) {

		function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }

        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())
        const lastMerIDchant = await Database.select(Database.raw('substr(id_mitra,11,30) as id_mitra'))
            .from('in_mitra')
            .orderBy(Database.raw('substr(id_mitra,11,30)'), 'desc')
            .first();
        let lastmitraid = null;
        if (lastMerIDchant) {
            lastmitraid = 'MT' + formatted_date + ++lastMerIDchant.id_mitra;
        } else {
            lastmitraid = 'MT' + formatted_date + '1000000001';
        }
        const mitra = new Mitra()
        const mitraInfo = request.only(['nama', 'no_telpon', 'email', 'alamat', 'password'])
        const enPassword = Encryption.encrypt(mitraInfo.password)
        mitra.id_mitra  = lastmitraid
        mitra.nama      = mitraInfo.nama
        mitra.no_telpon = mitraInfo.no_telpon
        mitra.email     = mitraInfo.email
        mitra.alamat    = mitraInfo.alamat
        mitra.password  = enPassword

        //cek email
        const cekEmail = await Database.from('in_mitra').where('email', mitraInfo.email)

        if(cekEmail != ""){	
			return response.json({status : 'already_exist'})	
		}else{
			await mitra.save()
			return response.status(200).json({
				mitra,
				status: 'true',
		  	})	
		}
			
	}

	async email_verify ({request, response}) {

		const mitraInfo = request.only(['id_mitra'])
		const cekEmail = await Database.from('in_mitra').where('id_mitra',mitraInfo.id_mitra).first()
		return response.json({
			status : 'true',
			data   : cekEmail,
		})	 		
	}

	async email_verify_send_code ({request, response}) {

		const mitraInfo = request.only(['id_mitra'])
		const cekEmail = await Database.from('in_mitra').where('id_mitra',mitraInfo.id_mitra).first()
		const number_otp = Math.floor(Math.pow(10, 5-1) + Math.random() * 9 * Math.pow(10, 5-1));
		var next_4_hourse = new Date();
		next_4_hourse.setHours(next_4_hourse.getHours() + 4);

		const Code_OTP = await Database
		  .table('in_otp')
		  .insert({
		  	flag: 'Mitra',
		  	id_request: mitraInfo.id_mitra,
		  	otp: number_otp,
		  	expired_date: next_4_hourse,
		  })

		// send email
		let data = {
            nama         : cekEmail.nama, 
            otp_number   : number_otp,
        } 
        await Mail.send('users.confirm_email_mitra', data , (message) => {
            message
            .to(cekEmail.email)
            .from('noreply@permatamall.com', "Permata Mall")
            .subject('Konfirmasi Alamat Email Mitra')
        })


		return response.json({
			status : 'true',
			data   : cekEmail,
		})	 		
	}

	async verify_otp ({request, response}) {

		const mitraInfo = request.only(['id_mitra','opt_number'])
		const cekOtp = await Database.from('in_otp')
		.where('id_request',mitraInfo.id_mitra)
		.where('otp', mitraInfo.opt_number)
		.first()

		if (cekOtp) {
			const date_now = new Date();
			if (date_now < cekOtp.expired_date) {
				const cekEmail = await Database.from('in_mitra')
				.where('id_mitra',mitraInfo.id_mitra)
				.update({
					email_verified: new Date()
				})

				return response.json({
					status : 'true',
					data   : "OTP_Berhasil_Dikonfirmasi",
				})
			}else{
				return response.json({
					status : 'true',
					data   : "OTP Kedaluarsa",
				})
			}
		}else{
			return response.json({
				status : 'true',
				data   : "OTP Tidak Ditemukan",
			})
		}			 		
	}
}

module.exports = AuthController
