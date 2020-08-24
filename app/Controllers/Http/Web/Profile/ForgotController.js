'use strict'
const Database = use('Database')
const Env = use('Env')
const Encryption = use('Encryption')
const Mail = use('Mail')

class ForgotController {


    async Forgot({ request, response }) {
        const Info = request.only(['jenis_login', 'email'])

        if (Info.jenis_login == "Pelanggan") {

            const CheckLogin = await Database
            .from('in_pelanggan')
            .where('email', Info.email)
            .count()
            .first()

            function appendLeadingZeroes(n){
              if(n <= 9){
                return "0" + n;
              }
              return n
            }

            let current_datetime = new Date()
            let formatted_date = (current_datetime.getMonth() + 1) + "/"+ current_datetime.getDate() + "/" + current_datetime.getFullYear() + " " + (current_datetime.getHours() + 3) + ":" + current_datetime.getMinutes() + ":" + appendLeadingZeroes(current_datetime.getSeconds())
                    
            if (CheckLogin.count > 0) {
                
                const login = await Database
                .from('in_pelanggan')
                .where('email', Info.email)
                .first()

                const InserForgot = await Database
                  .table('in_forgot_password')
                  .insert({
                    jenis_member: Info.jenis_login,
                    id_member: Encryption.encrypt(login.id_pelanggan),
                    max_verified: formatted_date,
                  })
                  .returning('id_forgot')

                let data = {
                    nama        : login.nama, 
                    linkEmail   : Env.get('URL_DOMAIN_FRONTEND')+'change-password?token='+Encryption.encrypt(InserForgot[0])
                } 
                await Mail.send('users.forgot_password', data , (message) => {
                    message
                    .to(login.email)
                    .from('noreply@permatamall.com', "Permata Mall")
                    .subject('Lupa Password')
                })

                return response.json("Berhasil");
            }else{
                return response.json("tidak");
            }

        }else{
            const CheckLogin = await Database
            .from('in_mitra')
            .where('email', Info.email)
            .count()
            .first()

            function appendLeadingZeroes(n){
              if(n <= 9){
                return "0" + n;
              }
              return n
            }

            let current_datetime = new Date()
            let formatted_date = (current_datetime.getMonth() + 1) + "/"+ current_datetime.getDate() + "/" + current_datetime.getFullYear() + " " + (current_datetime.getHours() + 3) + ":" + current_datetime.getMinutes() + ":" + appendLeadingZeroes(current_datetime.getSeconds())
        
            
            if (CheckLogin.count > 0) {
                
                const login = await Database
                .from('in_mitra')
                .where('email', Info.email)
                .first()

                const InserForgot = await Database
                  .table('in_forgot_password')
                  .insert({
                    jenis_member: Info.jenis_login,
                    id_member: Encryption.encrypt(login.id_mitra),
                    max_verified: formatted_date,
                  })
                  .returning('id_forgot')

                let data = {
                    nama        : login.nama, 
                    linkEmail   : Env.get('URL_DOMAIN_FRONTEND')+'change-password?token='+Encryption.encrypt(InserForgot[0])
                } 
                await Mail.send('users.forgot_password', data , (message) => {
                    message
                    .to(login.email)
                    .from('noreply@permatamall.com', "Permata Mall")
                    .subject('Lupa Password')
                })

                return response.json("Berhasil");
            }else{
                return response.json("tidak");
            }
        }
    }


    async Change({ request, response }) {
        const Info = request.only(['token','password'])
        function appendLeadingZeroes(n){
          if(n <= 9){
            return "0" + n;
          }
          return n
        }
        let current_datetime = new Date()
        let formatted_date = (current_datetime.getMonth() + 1) + "/"+ current_datetime.getDate() + "/" + current_datetime.getFullYear() + " " + (current_datetime.getHours()) + ":" + current_datetime.getMinutes() + ":" + appendLeadingZeroes(current_datetime.getSeconds())
        const Cek = await Database
        .from('in_forgot_password')
        .where('id_forgot', Encryption.decrypt(Info.token))
        .count()
        .first()
        if (Cek.count > 0) {
            const data = await Database
            .from('in_forgot_password')
            .where('id_forgot', Encryption.decrypt(Info.token))
            .first()

            if (data.jenis_member == "Pelanggan") {
                const change = await Database
                .from('in_pelanggan')
                .where('id_pelanggan', Encryption.decrypt(data.id_member))
                .update({
                    password : Encryption.encrypt(Info.password)
                })

                return response.json("Berhasil");
            }else{
                const change = await Database
                .from('in_mitra')
                .where('id_mitra', Encryption.decrypt(data.id_member))
                .update({
                    password : Encryption.encrypt(Info.password)
                })

                return response.json("Berhasil");
            }
        }else{
            
            return response.json("Gagal");
        }
    }

}

module.exports = ForgotController