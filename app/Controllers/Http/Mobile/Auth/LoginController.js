'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const randomstring = use("randomstring");

class LoginController {

	async login ({request, response}) {

		const pelangganInfo = request.only(['username','password'])
		const cekEmail = await Database.from('in_pelanggan').where('email',pelangganInfo.username).first() 
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

	async login_with_other ({request, response}) {

		const pelangganInfo = request.only(['email','name'])
		const cekEmail = await Database.from('in_pelanggan').where('email',pelangganInfo.email).first() 
		if (!cekEmail) {
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
			const enPassword 		= Encryption.encrypt(current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1))
			pelanggan.id_pelanggan 	= lastpelangganid
			pelanggan.nama 			= pelangganInfo.name
			pelanggan.email 		= pelangganInfo.email
			pelanggan.password 		= enPassword
			await pelanggan.save()
			const pelanggan_data = await Database.from('in_pelanggan').where('email',pelangganInfo.email).first() 
			return response.status(200).json({
				pelanggan_data,
				status: 'true',
		  	})	

		}else{
			const pelanggan_data = await Database.from('in_pelanggan').where('email',pelangganInfo.email).first() 
			return response.status(200).json({
				pelanggan_data,
				status: 'true',
		  	})	
		}
	}


	async registrasi ({request, response}) {

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
		const pelangganInfo 	= request.only(['nama_lengkap','no_telpon','email','password','alamat'])
		const enPassword 		= Encryption.encrypt(pelangganInfo.password)
		pelanggan.id_pelanggan 	= lastpelangganid
		pelanggan.nama 			= pelangganInfo.nama_lengkap
		pelanggan.no_telpon 	= pelangganInfo.no_telpon
		pelanggan.email 		= pelangganInfo.email
		pelanggan.alamat 		= pelangganInfo.alamat
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

	async verify_email ({request, response}) {

		const pelangganInfo = request.only(['id_pelanggan'])
		function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }
        let current_datetime = new Date()
        let formatted_date = (current_datetime.getMonth() + 1) + "/" + current_datetime.getDate() + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + appendLeadingZeroes(current_datetime.getSeconds())
        let Profile = await Database
            .table('in_pelanggan')
            .where('id_pelanggan', pelangganInfo.id_pelanggan)
            .update({ email_verified: formatted_date })

        return response.status(200).json({
			pelanggan,
			status: 'true',
	  	})
	}

	async verify_email_new ({request, response}) {

		const pelangganInfo = request.only(['id_pelanggan','no_telpon','latitude','longatitude'])
		function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }
        let current_datetime = new Date()
        let formatted_date = (current_datetime.getMonth() + 1) + "/" + current_datetime.getDate() + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + appendLeadingZeroes(current_datetime.getSeconds())
        let Profile = await Database
            .table('in_pelanggan')
            .where('id_pelanggan', pelangganInfo.id_pelanggan)
            .update({ 
            	email_verified: formatted_date,
            	no_telpon: pelangganInfo.no_telpon
            })

        const submit_data_location = await Database
		  .table('in_login_location')
		  .insert({
		  	id_pelanggan: pelangganInfo.id_pelanggan,
		  	latitude: pelangganInfo.latitude, 
		  	longatitude: pelangganInfo.longatitude,	
		  	created_at: new Date(),		  	
		  	updated_at: new Date(),		  	
		})

        return response.status(200).json({
			pelanggan,
			status: 'true',
	  	})
	}

	async check_phone_number ({request, response}) {

		const pelangganInfo = request.only(['no_telpon'])
		const CheckData = await Database.from('in_pelanggan')
		.where('no_telpon', pelangganInfo.no_telpon)
		.count()
		.first()
			
		return response.status(200).json({
			data:CheckData,
			status: 'true',
	  	})
	}

	async send_token_notification ({request, response}) {

		const pelangganInfo = request.only(['id_user','token_notification'])
		if (pelangganInfo.token_notification) {
			const CheckData = await Database.from('in_push_notification')
			.where('id_user',pelangganInfo.id_user)
			.where('token_notification',pelangganInfo.token_notification)
			.first()

			if (!CheckData) {
				const store_data = await Database
				  .table('in_push_notification')
				  .insert({
				  	id_user: pelangganInfo.id_user, 
				  	token_notification: pelangganInfo.token_notification,			  	
				})
			}			
		}	
		return "success";	
	}

	async forgot_password ({request, response}) {

		const pelangganInfo = request.only(['no_telpon'])			

		var request = require('request');
		var dataString = 'From=+62811811306&To=+6282123602714&Body=Hello World!';
		var options = {
		    url: 'https://<b807fe6831f70407f5c98b714e371c07240f0ed390cf6ff4>:<2cfef9c6954eede92dfc097999a20da8f4b66663c89db45e><api.exotel.com>/v1/Accounts/<ptpermatamallnusantara1>/Sms/send',
		    method: 'POST',
		    body: dataString
		};

		function callback(error, response, body) {
		    if (!error && response.statusCode == 200) {
		        console.log(body);
		    }
		}
		return request(options, callback);
		return pelangganInfo.no_telpon;	
	}

	async request_otp ({request, response}) {

		const Data = request.only(['no_telpon'])			


		const authy = require('authy')('IE52tOVSBfTsAvVmQ2P03VeXMlCfxxnc');

		const tampung_data = [];
		return authy.register_user('new_usersaas@email.com', Data);

		return tampung_data;


		// // Download the helper library from https://github.com/evilpacket/node-authy

		// // Your API key from twilio.com/console/authy/applications
		// // DANGER! This is insecure. See http://twil.io/secure
		// const authy = require('authy')('IE52tOVSBfTsAvVmQ2P03VeXMlCfxxnc');
		// const show  = authy.request_sms('245184938', function (err, res) {
		// 	return res;
		// });

		// return show
	}
	
}

module.exports = LoginController
