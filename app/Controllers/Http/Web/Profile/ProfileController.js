'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const Mail = use('Mail')
const Helpers = use('Helpers')


class ProfileController {

    async pelanggan({ params, response }) {

        let Profile = await Database
            .from('in_pelanggan')
            .where('id_pelanggan', params.id)
            .first()

        return response.json(Profile)
    }


    async email_verified_pelanggan({ params, response }) {

        let Profile = await Database.from('in_pelanggan')
            .where('id_pelanggan', params.id)
            .whereNull('email_verified')
            .count()
            .first()
        if (Profile.count > 0) {
            return response.json({
                data: true
            })
        } else {
            return response.json({
                data: false
            })
        }
    }


    async pelangganOrtu({ request, response }) {

        const Profiles = request.only(['nama_ortu', 'no_telp_ortu', 'id_user', 'asal_sekolah'])

        let Profile = await Database
            .table('in_pelanggan')
            .where('id_pelanggan', Profiles.id_user)
            .update({ nama_ortu: Profiles.nama_ortu, telpon_ortu: Profiles.no_telp_ortu, asal_sekolah: Profiles.asal_sekolah })

    }



    async mitraJoin({ params, response }) {

        let Order = await Database.from('in_order')
            .select('id_produk')
            .innerJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
            .where('id_order', params.id)
            .first()

        let Product = await Database.from('in_produk')
            .select('in_mitra.id_mitra', 'in_mitra.nama', 'in_mitra.no_telpon', 'in_mitra.alamat', 'in_mitra.foto')
            .innerJoin('in_mitra', 'in_produk.id_mitra', 'in_mitra.id_mitra')
            .where('id_produk', Order.id_produk)
            .first()

        return response.json(Product)
    }


    async email_verified_mitra({ params, response }) {

        let Profile = await Database.from('in_mitra')
            .where('id_mitra', params.id)
            .whereNull('email_verified')
            .count()
            .first()

        if (Profile.count > 0) {
            return response.json({
                data: true
            })
        } else {
            return response.json({
                data: false
            })
        }

    }


    async getPassword({ params, response }) {

        let Profile = await Database.from('in_mitra')
            .where('id_mitra', params.id_mitra)
            .first()
        return response.json(Encryption.decrypt(Profile.password))
    }

    async cek_password ({ request, response }){
        const check = request.only(['id_user'])  
        const cek = await Database
            .select('password')
            .from('in_pelanggan')
            .where('id_pelanggan',check.id_user)
            .first()

        return response.json(Encryption.decrypt(cek.password))    
    }

    async changepassword({ request, response }) {

        const password = request.only(['id_user', 'password'])  

        let Profile = await Database.from('in_mitra')
            .where('id_mitra', password.id_user)
            .update('password', Encryption.encrypt(password.password))

        return response.json("Berhasil")

    }

    async changepassword_pelanggan({ request, response }) {

        const password = request.only(['id_user', 'password'])  

        let Profile = await Database.from('in_pelanggan')
            .where('id_pelanggan', password.id_user)
            .update('password', Encryption.encrypt(password.password))

        return response.json("Berhasil")

    }


    async email_send_pelanggan({ request, response }) {

        const password = request.only(['id_user', 'link'])
        let Profile = await Database.from('in_pelanggan')
            .where('id_pelanggan', password.id_user)
            .whereNull('email_verified')
            .first()
            .count()

        if (Profile.count > 0) {

            let Profiles = await Database.from('in_pelanggan')
                .where('id_pelanggan', password.id_user)
                .first()

            let data = { name: Profiles.nama, link: password.link }
            
            await Mail.send('users.register', data, (message) => {
                message
                    .to(Profiles.email)
                    .from('noreply@permatabelajar.com', "PermataBelajar")
                    .subject('Konfirmasi Alamat Email')
            })

            return response.json("Berhasil");

        } else {
            return response.json("Gagal");
        }
    }

    async email_send_mitra({ request, response }) {

        const password = request.only(['id_user', 'link'])

        const Profile = await Database
            .from('in_mitra')
            .where('id_mitra', password.id_user)
            .whereNull('email_verified')
            .first()
            .count()

        if (Profile.count > 0) {

            let Profiles = await Database.from('in_mitra')
                .where('id_mitra', password.id_user)
                .first()
            let data = { name: Profiles.nama, link: password.link }
            await Mail.send('users.register', data, (message) => {
                message
                    .to(Profiles.email)
                    .from('noreply@permatamall.com', "Permata Mall")
                    .subject('Konfirmasi Alamat Email')
            })

            return response.json("Berhasil");

        } else {
            return response.json("Gagal");
        }
    }

    async email_confirm_pelanggan({ params, response }) {
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
            .where('id_pelanggan', params.id)
            .update({ email_verified: formatted_date })

        return Profile;
    }


    async email_confirm_mitra({ params, response }) {
        function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }
        let current_datetime = new Date()
        let formatted_date = (current_datetime.getMonth() + 1) + "/" + current_datetime.getDate() + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + appendLeadingZeroes(current_datetime.getSeconds())
        let Profile = await Database
            .table('in_mitra')
            .where('id_mitra', params.id)
            .update({ email_verified: formatted_date })

        return Profile;
    }


    async mitra({ params, response }) {
        let Profile = await Database
            .table('in_mitra')
            .where('id_mitra', params.id)
            .first()

        return Profile;
    }


    async changeprofile({ request, response }) {

        const Inputs = request.only(['nama_lengkap', 'no_telpon', 'jenis_kelamin', 'nama_pemilih_rekening', 'no_pemilik_rekening', 'kota', 'alamat', 'id_mitra', 'foto_profile'])

        const affectedRows = await Database
            .table('in_mitra')
            .where('id_mitra', Inputs.id_mitra)
            .update({
                nama: Inputs.nama_lengkap,
                alamat: Inputs.alamat,
                no_telpon: Inputs.no_telpon,
                no_rek: Inputs.no_pemilik_rekening,
                pemilik_rek: Inputs.nama_pemilih_rekening,
                foto_profile: Inputs.foto_profile,
                jenis_kelamin: Inputs.jenis_kelamin,
                kota: Inputs.kota,
            })
        return response.status(200).json(affectedRows);
    }


    async changeprofileExceptFoto({ request, response }) {

        const Inputs = request.only(['nama_lengkap', 'no_telpon', 'jenis_kelamin', 'nama_pemilih_rekening', 'no_pemilik_rekening', 'kota', 'alamat', 'id_mitra'])

        const affectedRows = await Database
            .table('in_mitra')
            .where('id_mitra', Inputs.id_mitra)
            .update({
                nama: Inputs.nama_lengkap,
                alamat: Inputs.alamat,
                no_telpon: Inputs.no_telpon,
                no_rek: Inputs.no_pemilik_rekening,
                pemilik_rek: Inputs.nama_pemilih_rekening,
                jenis_kelamin: Inputs.jenis_kelamin,
                kota: Inputs.kota,
            })

        return response.status(200).json(affectedRows);
    }

    async change_profile({ request, response }) {

        const Inputs = request.only(['foto', 'nama', 'no_telp', 'alamat', 'id_pelanggan'])

        const affectedRows = await Database
            .table('in_pelanggan')
            .where('id_pelanggan', Inputs.id_pelanggan)
            .update({
                nama: Inputs.nama,
                alamat: Inputs.alamat,
                no_telpon: Inputs.no_telp,
                foto: Inputs.foto,
            })

        return response.status(200).json(affectedRows);
    }

    async check_telephone({response,params}){
       const check = await Database
           .from('in_pelanggan')
           .where('id_pelanggan', params.id_mitra)
           .whereNull('no_telpon')
           .count()
           .first()
        return response.json(check)
    }

    async store_telephone({ response,request }){
        const Inputs = request.only(['no_telp','id_pelanggan'])
        const store = await Database
            .table('in_pelanggan')
            .where('id_pelanggan', Inputs.id_pelanggan)
            .update('no_telpon', Inputs.no_telp)
        return response.json(store)
    }

    async store_lat_long({ response,request }){
        const current_datetime = new Date()
        const Inputs = request.only(['lat','long','id_pelanggan'])
        const submit_data_location = await Database
          .table('in_login_location')
          .insert({
            id_pelanggan: Inputs.id_pelanggan,
            latitude: Inputs.lat, 
            longatitude: Inputs.long, 
            created_at: new Date(),         
            updated_at: new Date(),         
        })
    }

}

module.exports = ProfileController