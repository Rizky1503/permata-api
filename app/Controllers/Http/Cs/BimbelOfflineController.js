'use strict'
const Database = use('Database')
const Product = use('App/Models/Product')
const randomstring = use("randomstring")
const Encryption = use('Encryption')
const Helpers = use('Helpers')

class BimbelOfflineController {

    async listMitra({ response, request }) {
        const listmitra = await Database
            .select('mitra.id_mitra', 'mitra.nama', 'mitra.email', 'mitra.no_telpon')
            .from('in_mitra as mitra')
            .leftJoin('in_produk as produk', 'mitra.id_mitra', 'produk.id_mitra')
            .leftJoin('in_ms_kategori as kategori', 'produk.id_master_kategori', 'kategori.id_master_kategori')
            .orderBy('mitra.id_mitra', 'ASC')
            .groupBy('mitra.id_mitra')
        return response.json(listmitra)
    }

    async getmitra({ response }) {
        const getmitra = await Database
            .select('id_mitra', 'nama')
            .from('in_mitra')
        return response.json(getmitra)
    }

    async provinsi({ response }) {
        const provinsi = await Database
            .select('provinsi')
            .table('in_alamat')
            .groupBy('provinsi')
            .orderBy('provinsi', 'ASC')
        return response.json(provinsi)
    }

    async kota({ response, request }) {
        const kotaInput = request.input('kota')
        const kota = await Database
            .select('kota')
            .table('in_alamat')
            .where('provinsi', kotaInput)
            .orderBy('kota', 'ASC')
            .groupBy('kota')
        return response.json(kota)
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

        const productInfo = request.only(['id_produk', 'id_mitra', 'id_master_kategori', 'nama_produk', 'alamat', 'provinsi', 'kota', 'nama_pic', 'no_telpon', 'kontak_pic', 'status_product', 'total_murid', 'email', 'parent'])

        const foto = request.file('foto')
        let filenamefoto = ""

        const product = new Product()

        if (foto !== null) {
            let path = "images/document/produk/" + lastProdukNumber
            filenamefoto = randomstring.generate(7) + "." + foto.toJSON().extname;
            await foto.move(Helpers.publicPath(path), {
                name: filenamefoto,
                overwrite: true
            })
            product.foto_product = filenamefoto
        }

        product.id_produk = lastProdukNumber
        product.id_mitra = productInfo.id_mitra
        product.id_master_kategori = productInfo.id_master_kategori
        product.nama_produk = productInfo.nama_produk
        product.alamat = productInfo.alamat
        product.provinsi = productInfo.provinsi
        product.kota = productInfo.kota
        product.nama_pic = productInfo.nama_pic
        product.no_telpon = productInfo.no_telpon
        product.kontak_pic_wa = productInfo.kontak_pic
        product.status_product = productInfo.status_product
        product.total_murid = productInfo.total_murid
        product.email = productInfo.email
        product.parent = productInfo.parent
        await product.save()
        return response.status(201).json(product)
    }

    async storeMitra({ request, response }) {
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
        const mitra = new Mitra()

        const mitraInfo = request.only(['id_mitra', 'nama', 'no_telpon', 'email', 'alamat', 'password', 'kota'])

        const enPassword = Encryption.encrypt(mitraInfo.password)

        mitra.id_mitra = lastmitraid
        mitra.nama = mitraInfo.nama
        mitra.no_telpon = mitraInfo.no_telpon
        mitra.email = mitraInfo.email
        mitra.alamat = mitraInfo.alamat
        mitra.password = enPassword
        mitra.kota = mitraInfo.kota


        //cekTelpon
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

    async listPusat({ response }) {
        const listpusat = await Database
            .select('*')
            .from('in_produk')
            .where('id_master_kategori', '23')
        return response.json(listpusat)
    }



}

module.exports = BimbelOfflineController