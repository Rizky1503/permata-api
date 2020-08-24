'use strict'
const Mitra = use('App/Models/Mitra')
const Database = use('Database')
const Encryption = use('Encryption')


class MitraController {

    async store({ request, response }) {

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

        const mitraInfo = request.only(['id_mitra', 'nama', 'no_telpon', 'email', 'alamat', 'password', 'kota'])

        const enPassword = Encryption.encrypt(mitraInfo.password)

        mitra.id_mitra  = lastmitraid
        mitra.nama      = mitraInfo.nama
        mitra.no_telpon = mitraInfo.no_telpon
        mitra.email     = mitraInfo.email
        mitra.alamat    = mitraInfo.alamat
        mitra.password  = enPassword
        mitra.kota      = mitraInfo.kota

        //cek email
        const cekEmail = await Database.from('in_mitra').where('email', mitraInfo.email)
        if (cekEmail != "") {
            return response.json('already_exist')
        } else {
            await mitra.save()
            return response.status(200).json(mitra)
        }
    }

    async cek({ response, params, request }) {
        const mitraInfo = request.only(['id_mitra'])
            //const cek = await Database.from('in_mitra').where('id_mitra',mitraInfo.id_mitra)
        const cek = await Database.from('in_mitra').where('id_mitra', params.id)
        if (cek != "") {
            return response.json('true')
        } else {
            return response.json('false')
        }
    }

    async cekLogin({ response, params, request }) {
        const mitra = new Mitra()
        const mitraInfo = request.only(['email', 'password'])
        const cekEmail = await Database.from('in_mitra').where('email', mitraInfo.email).first()

        if (cekEmail) {
            if (Encryption.decrypt(cekEmail.password) == mitraInfo.password) {
                return response.status(200).json({
                    cekEmail,
                    status: 'true',
                })
            } else {
                return response.json({ status: 'false' })
            }
        } else {
            return response.json({ status: 'false' })
        }
    }

     async store_google({ request, response }) {

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

        const mitraInfo = request.only(['id_mitra', 'nama', 'no_telpon', 'email', 'alamat', 'password', 'kota'])

        const enPassword = Encryption.encrypt(mitraInfo.password)

        mitra.id_mitra  = lastmitraid
        mitra.nama      = mitraInfo.nama
        mitra.no_telpon = mitraInfo.no_telpon
        mitra.email     = mitraInfo.email
        mitra.alamat    = mitraInfo.alamat
        mitra.password  = enPassword
        mitra.kota      = mitraInfo.kota

        //cek email
        const cekEmail = await Database.from('in_mitra').where('email', mitraInfo.email)
        if (cekEmail != "") {
            const data_mitra = await Database
                .select('*')
                .from('in_mitra')
                .where('email',mitraInfo.email)
                .first()

            return response.status(200).json(data_mitra)
        } else {
            await mitra.save()
            return response.status(200).json(mitra)
        }
    }
}

module.exports = MitraController