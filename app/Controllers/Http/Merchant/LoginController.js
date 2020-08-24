'use strict'
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: '013905a1',
    apiSecret: 'zfZxRPRmWqMoR8Cx',
});

const Database = use('Database')

class LoginController {


    async loginPost({ request, response }) {

        const Info = request.only(['nama', 'password'])
        const login = await Database
            .from('in_user')
            .where('nama', Info.nama)
            .first()
        if (login) {
            if (login.password == Info.password) {
                return response.status(200).json({ login, status: 'true', });
            } else {
                return response.json({ status: 'false' })
            }
        } else {
            return response.json({ status: 'false' })
        }


        // nexmo.verify.request({
        // 	number: params.id,
        // 	brand: 'UWA',
        // 	code_length: '6'
        // },(err, result) => {
        // 	// if (err) {
        // 	//     return err
        // 	// } else {
        // 	//     const verifyRequestId = result.request_id;
        // 	//     return response.json(verifyRequestId);
        // 	// }
        // 	return response.json("OTP Berhasil di Kirim")
        // });		


    }


    async registrasiPost({ params, response }) {

        nexmo.verify.request({
            number: params.id,
            brand: 'UWA',
            code_length: '6'
        }, (err, result) => {
            // if (err) {
            //     return err
            // } else {
            //     const verifyRequestId = result.request_id;
            //     return response.json(verifyRequestId);
            // }
            return response.json("OTP Berhasil di Kirim")
        });


    }


    async verifyPost({ params, response }) {

        nexmo.verify.check({
            request_id: 'REQUEST_ID',
            code: params.id
        }, (err, result) => {
            console.log(err ? err : result)
        });

        // return response.json("OTP Berhasil di Konfirmasi")

    }

}

module.exports = LoginController