'use strict'

const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");
const Mitra = use('App/Models/Mitra')
const Harga = use('App/Models/Harga')
const Product = use('App/Models/Product')
const Encryption = use('Encryption')
const Mail = use('Mail')

class MitraController {

    async dashboard({response}){
        const database = await Database
            .select ('created_at')
            .from ('in_mitra')
            .orderBy('created_at','DESC')
            .first()

        return response.json(database)
    }

    async listpelanggan ({response}) {   
        const listpelanggan = await Database
            .select ('nama','email','alamat','no_telpon','created_at')
            .from('in_pelanggan')
            .orderBy('id_pelanggan','DESC')
        return response.json(listpelanggan)    
    }

    async listMitra({ response, request }) {
        const listmitra = await Database
            .select('mitra.id_mitra', 'mitra.nama', 'mitra.email', 'mitra.no_telpon', 'mitra.kota', 'produk.kota as kota', 'kategori.kategori', 'mitra.created_at')
            .from('in_mitra as mitra')
            .leftJoin('in_produk as produk', 'mitra.id_mitra', 'produk.id_mitra')
            .leftJoin('in_ms_kategori as kategori', 'produk.id_master_kategori', 'kategori.id_master_kategori')
            .whereNull('kategori.kategori')
            .orderBy('mitra.id_mitra', 'DESC')
        return response.json(listmitra)
    }

    async listMitraId({ response, request, params }) {
        const listmitra = await Database
            .select('mitra.*')
            .from('in_mitra as mitra')
            .where('mitra.id_mitra',params.id)

        // const decode = Encryption.decrypt('7b67e226404b1fe7b3c3db5a9d524dbe/aWnxwLIkvfIxMKyIo+q7A==')    
        return response.json(listmitra)
    }

    async lihatpassword({response,request}){
        const pass = request.input('pass') 
        const lihatpassword =  Encryption.decrypt('918b6824f4736f8439931152cff8240azXHbjR/wUGCNsFb1Vcc2FQ==')
        return lihatpassword
        return response.json(lihatpassword)
    }

    async listmitraprivate({ response, request }) {
        const listmitra = await Database
            .select('mitra.id_mitra', 'mitra.nama', 'mitra.email', 'mitra.no_telpon', 'mitra.kota', 'produk.kota as kota', 'kategori.kategori','produk.created_at')
            .from('in_mitra as mitra')
            .leftJoin('in_produk as produk', 'mitra.id_mitra', 'produk.id_mitra')
            .leftJoin('in_ms_kategori as kategori', 'produk.id_master_kategori', 'kategori.id_master_kategori')
            .where('kategori.kategori', 'Privat')
            .orderBy('mitra.id_mitra', 'DESC')
        return response.json(listmitra)
    }

    async getmitra({ response, params }) {
        const getmitra = await Database
            .select('nama')
            .from('in_mitra')
            .where('id_mitra', params.id)
        return response.json(getmitra)
    }

    async storeMitra({ response, request }) {
        function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }

        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() + '' + appendLeadingZeroes(current_datetime.getMonth() + 1) + '' + appendLeadingZeroes(current_datetime.getDate())

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

        const mitraInfo = request.only(['cv','foto','sertifikat','nama', 'email', 'no_telpon', 'jenis_kelamin', 'pemilik_rek', 'no_rek', 'kota', 'alamat'])
        //cek no telpon
        const cekNoTelpon = await Database.from('in_mitra').where('no_telpon', mitraInfo.no_telpon)
            //cek email
        const cekEmail = await Database.from('in_mitra').where('email', mitraInfo.email)
        if (cekNoTelpon != "") {
            return response.json('already_exist')
        } else if (cekEmail != "") {
            return response.json('already_exist')
        } else {
            const mitra = await Database
                .insert({
                    id_mitra: lastmitraid,
                    nama: mitraInfo.nama,
                    email: mitraInfo.email,
                    no_telpon: mitraInfo.no_telpon,
                    kota: mitraInfo.kota,
                    alamat: mitraInfo.alamat,
                    cv : mitraInfo.cv,
                    foto : mitraInfo.foto,
                    sertifikat : mitraInfo.sertifikat,
                    password: Encryption.encrypt(randomstring.generate(7)),
                    created_at: current_datetime,
                    updated_at: current_datetime,
                    email_verified: current_datetime,
                })
                .into('in_mitra')
                .returning('id_mitra')

            return response.json(mitra)
        }

    }

    async updateMitra({ response, request }) {
        const Inputs = request.only(['nama','alamat','no_telpon','email','cv','foto','sertifikat','id_mitra', 'jenis_kelamin', 'pemilik_rek', 'no_rek'])
        const updatemitra = await Database
            .table('in_mitra')
            .where('id_mitra', Inputs.id_mitra)
            .update({ 
                jenis_kelamin: Inputs.jenis_kelamin, 
                cv: Inputs.cv, 
                foto: Inputs.foto,
                sertifikat : Inputs.sertifikat,
                pemilik_rek: Inputs.pemilik_rek, 
                no_rek: Inputs.no_rek, 
                nama: Inputs.nama,
                no_telpon: Inputs.no_telpon,
                email: Inputs.email,
                alamat: Inputs.alamat
            })

        return response.json(updatemitra)
    }

    async email_send_mitra({ request, response }) {

        const password = request.only(['id_user', 'link'])

        const Profile = await Database
            .from('in_mitra')
            .where('id_mitra', password.id_user)
            .first()
            .count()

        if (Profile.count > 0) {
            let Profiles = await Database.from('in_mitra')
                .where('id_mitra', password.id_user)
                .first()
            let data = { name: Profiles.nama, password: Encryption.decrypt(Profiles.password) }
            await Mail.send('users.backend_register', data, (message) => {
                message
                    .to(Profiles.email)
                    .from('noreply@permatamall.com', "Permata Mall")
                    .subject('Password Mitra')
            })
            return response.json("Berhasil");
        } else {
            return response.json("Gagal");
        }
    }

    async storeProduk({ request, response }) {

        function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }

        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() + '' + appendLeadingZeroes(current_datetime.getMonth() + 1) + '' + appendLeadingZeroes(current_datetime.getDate())

        const lastProduk = await Database.select(Database.raw('substr(id_produk,11,30) as id_produk'))
            .from('in_produk')
            .orderBy(Database.raw('substr(id_produk,11,30)'), 'desc')
            .first();

        let lastProdukNumber = null;

        if (lastProduk) {

            lastProdukNumber = 'PD' + formatted_date + ++lastProduk.id_produk;
        } else {

            lastProdukNumber = 'PD' + formatted_date + '1000000001';

        }

        const productInfo = request.only(['id_produk', 'id_mitra', 'id_master_kategori', 'nama_produk', 'alamat', 'negara', 'provinsi', 'kota', 'kecamatan', 'kode_pos', 'nama_pic', 'no_telpon', 'kontak_pic', 'status_product', 'pengalaman', 'module', 'sub_module', 'jenis_kelamin', 'harga', 'total_murid', 'gaji_saat_ini'])
        const product = new Product()
        product.id_produk = lastProdukNumber
        product.id_mitra = productInfo.id_mitra
        product.id_master_kategori = productInfo.id_master_kategori
        product.nama_produk = productInfo.nama_produk
        product.alamat = productInfo.alamat
        product.negara = productInfo.negara
        product.provinsi = productInfo.provinsi
        product.kota = productInfo.kota
        product.kecamatan = productInfo.kecamatan
        product.kode_pos = productInfo.kode_pos
        product.nama_pic = productInfo.nama_pic
        product.no_telpon = productInfo.no_telpon
        product.kontak_pic_wa = productInfo.kontak_pic
        product.status_product = productInfo.status_product
        product.pengalaman = productInfo.pengalaman
        product.module = productInfo.module
        product.sub_module = productInfo.sub_module
        product.jenis_kelamin = productInfo.jenis_kelamin
        product.harga = productInfo.harga
        product.total_murid = productInfo.total_murid
        product.gaji_saat_ini = productInfo.gaji_saat_ini
        await product.save()
        return response.status(201).json(product)
    }

    async storeHarga({ request, response }) {

        const hargaInfo    = request.only(['id_produk','hari', 'jam', 'jenis', 'harga', 'dp', 'over_time', 'keterangan', 'id_fasilitas','jam_selesai'])
        const harga        = new Harga()
        
        harga.id_produk    = hargaInfo.id_produk
        harga.hari         = hargaInfo.hari
        harga.jam          = hargaInfo.jam
        harga.jam_selesai  = hargaInfo.jam_selesai
        harga.jenis        = hargaInfo.jenis
        harga.harga        = hargaInfo.harga
        harga.dp           = hargaInfo.dp
        harga.over_time    = hargaInfo.over_time
        harga.keterangan   = hargaInfo.keterangan
        harga.id_fasilitas = hargaInfo.id_fasilitas

        await harga.save()
        return response.status(201).json(harga) 

    }


    async getTingkat({ response, request }) {
        const gettingkat = await Database
            .select('kategori')
            .from('in_matpel')
            .groupBy('kategori')
        return response.json(gettingkat)
    }

    async getMataPelajaran({ response, request }) {
       const Tingkat =  request.input('kategori')

        if (Tingkat == "SMA") {
            const affectedRows = await Database
            .query()
            .table('in_silabus')         
            .where('tingkat', Tingkat) 
            .groupBy('silabus')
            .pluck('silabus')
            return response.status(200).json(affectedRows);
        }else{
            const affectedRows = await Database
                .query()
                .table('in_matpel')      
                .where('kategori', Tingkat) 
                .groupBy('nama_matpel')
                .pluck('nama_matpel')
            return response.status(200).json(affectedRows);

        }
    }

    async getKota({ response, request }) {
        const gettingkat = await Database
            .select('kota')
            .from('in_alamat')
            .groupBy('kota')
        return response.json(gettingkat)
    }

    async CekEmail({ response, request }) {
        const cekNoTelpon = await Database.from('in_mitra').where('no_telpon', mitraInfo.no_telpon)
            //cek email
        const cekEmail = await Database.from('in_mitra').where('email', mitraInfo.email)
        if (cekNoTelpon != "") {
            return response.json('already_exist')
        } else if (cekEmail != "") {
            return response.json('already_exist')
        } else {
            await mitra.save()
            return response.status(200).json(mitra)
        }

    }
}

module.exports = MitraController