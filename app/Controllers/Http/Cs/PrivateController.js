'use strict '
const Database = use('Database')
const CsPrivate = use('App/Models/Order')
const CsPrivateDeal = use('App/Models/InOrder')
const Notif = use('App/Models/Notif')
const Pertemuan = use('App/Models/Pertemuan')
const Payment = use('App/Models/Payment')
const Order = use('App/Models/Order')


class PrivateController {
    async dashboard({response}){
        const database = await Database
            .select ('updated_at')
            .from ('in_order')
            .orderBy('updated_at','DESC')
            .first()

        return response.json(database)
    }

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

    async getData({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('product','Private')
        return response.json(prdbrat)
    }

    async ById({ response, params }) {
        const idorder = params.id
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .where('id_order', idorder)
            .orderBy('id_order', 'DESC')
        return response.json(prdbrat)
    }

     async GetIdMitra({ response, params }) {
        const idorder = params.id
        const prdbrat = await Database
            .select('produk.id_mitra','order.id_user_order')
            .table('in_order as order')
            .innerJoin('in_produk as produk','order.id_product_order','produk.id_produk')
            .where('id_order', idorder)
            .orderBy('id_order', 'DESC')
        return response.json(prdbrat)
    }

    async MuridRequested({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('status_order', 'Requested')
            .where('product','Private')
        return response.json(prdbrat)
    }

    async MuridPending({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('status_order', 'Pending')
            .where('product','Private')
        return response.json(prdbrat)
    }


    async MuridCekPembayaran({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('status_order', 'Cek_Pembayaran')
            .where('product','Private')
        return response.json(prdbrat)
    }

    async MuridInProgres({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('status_order', 'In Progres')
            .where('product','Private')
        return response.json(prdbrat)
    }

    async MuridRegistrasiUlang({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('status_order', 'Registrasi_Ulang')
            .where('product','Private')
        return response.json(prdbrat)
    }

    async MuridKonfirmasiUlang({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('status_order', 'Konfirmasi_Ulang')
            .where('product','Private')
        return response.json(prdbrat)
    }

    async MuridClose({ response, params }) {
        const prdbrat = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .orderBy('id_order', 'DESC')
            .where('status_order', 'Close')
            .where('product','Private')
        return response.json(prdbrat)
    }


    async PilihanGuru({ response, params }) {
        const noInvoice = params.id
        const pilihanguru = await Database
            .select('in_mitra.nama')
            .table('in_order_deal')
            .innerJoin('in_produk', 'in_order_deal.id_produk', 'in_produk.id_produk')
            .innerJoin('in_mitra', 'in_produk.id_mitra', 'in_mitra.id_mitra')
            .where('id_order', noInvoice)
            .orderBy('id_order', 'DESC')
            .limit(1)
        return response.json(pilihanguru)
    }

    async TanggalUploadPembayaran({ response, params }) {
        const noInvoice = params.id
        const tanggaluploadpembayaran = await Database
            .select('created_at')
            .table('in_payment')
            .where('id_invoice', noInvoice)
            .orderBy('created_at', 'DESC')
            .limit(1)
        return response.json(tanggaluploadpembayaran)
    }


    async StatusUpdate({ params, request, response }) {

        const privateInfo = request.only(['status_order', 'ProcessBy', 'id_product_order', 'keterangan'])
        let csprivate = await CsPrivate.find(params.id)
        if (!csprivate) {
            return response.status(404).json({ data: 'Resource not found' })
        }
        csprivate.status_order = privateInfo.status_order
        csprivate.ProcessBy = privateInfo.ProcessBy
        csprivate.id_product_order = privateInfo.id_product_order
        csprivate.keterangan_nilai = privateInfo.keterangan
        await csprivate.save()
        return response.status(200).json(csprivate)
    }

    async Proses({ request, response }) {
        const csprivatedeal = new CsPrivateDeal()
        const csprivatedealInfo = request.only(['id_order', 'id_produk', 'amount', 'description'])
        csprivatedeal.id_order = csprivatedealInfo.id_order
        csprivatedeal.id_produk = csprivatedealInfo.id_produk
        csprivatedeal.amount = csprivatedealInfo.amount
        csprivatedeal.description = csprivatedealInfo.description
        await csprivatedeal.save()
        return response.status(201).json(csprivatedeal)
    }

    async Rekomended({ response, params }) {
        const idorder = params.id
        const rekom = await Database
            .select('*')
            .table('in_order_private as private')
            .where('id_order', idorder)
            .innerJoin('in_mitra as mitra', 'private.id_mitra', 'mitra.id_mitra')
            .innerJoin('in_produk as produk', 'private.id_produk', 'produk.id_produk')
        return response.json(rekom)

    }

    async StoreNotif({ request, response }) {
        const notifInfo = request.only(['id_order', 'id_pelanggan', 'id_mitra', 'keterangan', 'status', 'module'])
        const notif = new Notif()
        notif.id_order = notifInfo.id_order
        notif.id_pelanggan = notifInfo.id_pelanggan
        notif.id_mitra = notifInfo.id_mitra
        notif.keterangan = notifInfo.keterangan
        notif.status = notifInfo.status
        notif.module = notifInfo.module
        await notif.save()
        return response.status(201).json(notif)
    }

    async SelectGuru({ request, response }) {
        const keterangan = request.only(['jenis_kelamin', 'tingkat', 'mata_pelajaran', 'kota', 'level'])
        const req = await Database
            .select('*')
            .table('in_produk')
            .where('jenis_kelamin', keterangan.jenis_kelamin)
            .where('module', keterangan.tingkat)
            .where('sub_module', keterangan.mata_pelajaran)
            .where('kota', keterangan.kota)
        return response.json(req)
    }

    async Listguru({ response, request }) {
        const Listguru = request.only(['tingkat', 'mata_pelajaran'])
        const list = await Database
            .select('in_mitra.nama', 'in_mitra.no_telpon', 'in_mitra.id_mitra', 'in_produk.kota', 'in_produk.module', 'in_produk.sub_module', 'in_produk.jenis_kelamin', 'in_produk.id_produk', 'in_produk.harga')
            .table('in_produk')
            .innerJoin('in_mitra', 'in_produk.id_mitra', 'in_mitra.id_mitra')
            .where('in_produk.module', Listguru.tingkat)
            .where('in_produk.sub_module', Listguru.mata_pelajaran)
            .where('in_produk.status_product', 'Aktif')
        if (list == "") {
            return response.json('not_found')
        } else {
            return response.json(list)
        }

    }

    async Pertemuan({ response, params }) {
        const idorder = params.id
        const pertemuan = await Database
            .select('*')
            .table('in_pertemuan as pertemuan')
            .leftJoin('in_pelanggan as pelanggan', 'pertemuan.id_user_order', 'pelanggan.id_pelanggan')
            .where('id_invoice', idorder)
            .whereNull('status')
            .limit(1)
            .orderBy('id_pertemuan', 'ASC')
        return response.json(pertemuan)
    }

    async GetGuruPertemuan({ response, params }) {
        const idmitra = params.id
        const GetGuruPertemuan = await Database
            .select('nama')
            .table('in_mitra')
            .where('id_mitra', idmitra)
        return response.json(GetGuruPertemuan)
    }

    async Pertemuanke({ response, params }) {
        const idorder = params.id
        const pertemuan = await Database
            .select('*')
            .table('in_pertemuan as pertemuan')
            .whereNotNull('status')
            .where('id_invoice', idorder)
            .getCount('pertemuan_ke')
        return response.json(pertemuan)
    }

    async new_invoice({request, response, params}){
        function appendLeadingZeroes(n){
                if(n <= 9){
                  return "0" + n;
                }
                return n
        }
        
        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())            
        const lastProduk = await Database.select(Database.raw('substr(id_order,12,30) as id_order'))
            .from('in_order')
            .orderBy(Database.raw('substr(id_order,12,30)'), 'desc')
            .first();
        let lastProdukNumber = null;      
        if (lastProduk ) {    
            lastProdukNumber = 'INV'+ formatted_date + ++lastProduk.id_order;
        } else {      
            lastProdukNumber = 'INV'+ formatted_date +'1000000001';   
        }


       const orderins = request.only(['id_user_order', 'id_product_order', 'status_order', 'product', 'keterangan','kondisi']);

       const order = new Order();
        order.id_order = lastProdukNumber
        order.id_user_order = orderins.id_user_order 
        order.id_product_order = orderins.id_product_order
        order.status_order = orderins.status_order
        order.product = orderins.product
        order.keterangan = orderins.keterangan
        order.kondisi = orderins.kondisi

        await order.save()
        return response.json(order)
     }

    async SimpanPertemuan({ request, response, params }) {        
        const pertemuaninfo = request.only(['id_invoice', 'id_user_order', 'id_produk', 'pertemuan_ke', 'id_mitra','status']);

        if(pertemuaninfo.status = "baru"){

            const pertemuan = new Pertemuan();

            pertemuan.id_invoice = pertemuaninfo.id_invoice
            pertemuan.id_user_order = pertemuaninfo.id_user_order
            pertemuan.id_produk = pertemuaninfo.id_produk
            pertemuan.id_mitra = pertemuaninfo.id_mitra
            pertemuan.pertemuan_ke = pertemuaninfo.pertemuan_ke


            const cekPertemuan = await Database
                .select('*')
                .table('in_pertemuan')
                .where('id_invoice', pertemuaninfo.id_invoice)

            await pertemuan.save()

            return response.status(201).json(pertemuan)

        }else{

            const deletepertemuan = await Database
                .table('in_pertemuan')
                .where('id_user_order', pertemuaninfo.id_user_order)
                .whereNull('status')
                .whereNull('absen_guru')
                .delete()

            const pertemuan = new Pertemuan();

            pertemuan.id_invoice = pertemuaninfo.id_invoice
            pertemuan.id_user_order = pertemuaninfo.id_user_order
            pertemuan.id_produk = pertemuaninfo.id_produk
            pertemuan.id_mitra = pertemuaninfo.id_mitra
            pertemuan.pertemuan_ke = pertemuaninfo.pertemuan_ke


            const cekPertemuan = await Database
                .select('*')
                .table('in_pertemuan')
                .where('id_invoice', pertemuaninfo.id_invoice)

            await pertemuan.save()

            return response.status(201).json(pertemuan)
        }
    }

    async UpdatePertemuan({ request, response, params }) {
        const id_mitra = request.input('id_mitra')
        const id_invoice = params.id

        const pertemuan = await Database
            .table('in_pertemuan')
            .where('id_invoice', id_invoice)
            .where('status', null)
            .update('id_mitra', id_mitra)

        return response.status(201).json(pertemuan)
    }

    async Buktipembayaran({ response, params }) {
        const idorder = params.id
        const bukti = await Database
            .select('*')
            .table('in_payment')
            .where('id_invoice', idorder)
            .where('status', 'Requested')
            .limit(1)
        return response.json(bukti)
    }

    async Updatepembayaran({ params, request, response }) {
        const id_invoice = params.id
        const status = request.input('status')
        const payment = await Database
            .table('in_payment')
            .where('id_invoice', id_invoice)
            .update('status', status)
        return response.json(payment)

    }

    async Kota({ response }) {
        const kota = await Database
            .select('kota')
            .table('in_alamat')
            .groupBy('kota')
        return response.json(kota)
    }

    async Updatemurid({ response, request }) {
        const id_pelanggan = request.input('id_pelanggan')
        const nama = request.input('nama')
        const alamat = request.input('alamat')
        const kota = request.input('kota')
        const no_telpon = request.input('no_telpon')
        const updatemurid = await Database
            .table('in_pelanggan')
            .where('id_pelanggan', id_pelanggan)
            .update({ nama: nama, alamat: alamat, kota: kota, no_telpon: no_telpon })
        return response.status(200).json(updatemurid)
    }

    async GetMitra({ response, request }) {
        const id_produk = request.input('id_produk')
        const getmitra = await Database
            .select('id_mitra')
            .table('in_produk')
            .where('id_produk', id_produk)
            .first()
        return response.json(getmitra)
    }

    async GetGuruDetail({ response, params }) {
        const id_mitra = params.id
        const Getgurudetail = await Database
            .select('mitra.id_mitra', 'mitra.nama', 'mitra.alamat', 'mitra.no_telpon', 'mitra.email', 'mitra.no_rek', 'mitra.foto', 'mitra.cv','mitra.sertifikat', 'mitra.pemilik_rek', 'produk.id_produk', 'produk.status_product', 'harga.*')
            .table('in_produk as produk')
            .innerJoin('in_harga as harga', 'produk.id_produk', 'harga.id_produk')
            .innerJoin('in_mitra as mitra', 'produk.id_mitra', 'mitra.id_mitra')
            .where('mitra.id_mitra', id_mitra)
        return response.json(Getgurudetail)
    }

    async GetGuru({ response }) {
        const Getguru = await Database
            .table('in_mitra')
            .select('in_mitra.id_mitra', 'in_mitra.nama', 'in_mitra.no_telpon')
            .innerJoin('in_produk', 'in_mitra.id_mitra', 'in_produk.id_mitra')
            .where('id_master_kategori','19')
            .groupBy('in_mitra.id_mitra', 'in_mitra.nama')
            .orderBy('in_mitra.id_mitra','DESC')
        return response.json(Getguru)
    }

    async ExportAllGuru({ response }) {
        const Getguru = await Database
            .table('in_mitra')
            .select('in_mitra.id_mitra', 'in_mitra.nama', 'in_mitra.no_telpon', 'in_produk.module', 'in_produk.kota')
            .innerJoin('in_produk', 'in_mitra.id_mitra', 'in_produk.id_mitra')
            .orderBy('in_mitra.nama','ASC')
        return response.json(Getguru)
    }

    async GetGuruAktif({ response }) {
        const Getguru = await Database
            .table('in_mitra')
            .select('in_mitra.id_mitra', 'in_mitra.nama', 'in_mitra.no_telpon')
            .innerJoin('in_produk', 'in_mitra.id_mitra', 'in_produk.id_mitra')
            .whereNot('in_produk.pengalaman', '')
            .where('status_product', 'Aktif')
            .groupBy('in_mitra.id_mitra', 'in_mitra.nama')
        return response.json(Getguru)
    }

     async ExportAktifGuru({ response }) {
        const Getguru = await Database
            .table('in_mitra')
            .select('in_mitra.id_mitra', 'in_mitra.nama', 'in_mitra.no_telpon', 'in_produk.module', 'in_produk.kota')
            .innerJoin('in_produk', 'in_mitra.id_mitra', 'in_produk.id_mitra')
            .where('status_product', 'Aktif')
            .orderBy('in_mitra.nama','ASC')
        return response.json(Getguru)
    }

    async GetGuruTidakAktif({ response }) {
        const Getguru = await Database
            .table('in_mitra')
            .select('in_mitra.id_mitra', 'in_mitra.nama', 'in_mitra.no_telpon')
            .innerJoin('in_produk', 'in_mitra.id_mitra', 'in_produk.id_mitra')
            .whereNot('in_produk.pengalaman', '')
            .where('status_product', 'Tidak Aktif')
            .groupBy('in_mitra.id_mitra', 'in_mitra.nama')
        return response.json(Getguru)
    }

    async ExportTidakAktifGuru({ response }) {
        const Getguru = await Database
            .table('in_mitra')
            .select('in_mitra.id_mitra', 'in_mitra.nama', 'in_mitra.no_telpon', 'in_produk.module', 'in_produk.kota')
            .innerJoin('in_produk', 'in_mitra.id_mitra', 'in_produk.id_mitra')
            .where('status_product', 'Tidak Aktif')
            .orderBy('in_mitra.nama','ASC')
        return response.json(Getguru)
    }

    async GetGuruStatus({ response, params }) {
        const id_mitra = params.id
        const Getguru = await Database
            .table('in_produk')
            .select('status_product')
            .where('id_mitra', id_mitra)
            .groupBy('status_product')
        return response.json(Getguru)
    }

    async GetGuruforKota({ response, params }) {
        const id_mitra = params.id
        const GetGuruforKota = await Database
            .select('kota')
            .table('in_produk')
            .where('id_mitra', id_mitra)
            .groupBy('kota')
        return response.json(GetGuruforKota)
    }

    async GetGuruforTingkat({ response, params }) {
        const id_mitra = params.id
        const GetGuruforTingkat = await Database
            .select('module')
            .table('in_produk')
            .where('id_mitra', id_mitra)
            .groupBy('module')
        return response.json(GetGuruforTingkat)
    }

    async UpdateStatusGuru({ response, params, request }) {
        const status = request.input('status')
        const id_produk = request.input('id_produk')
        const Getguru = await Database
            .table('in_produk')
            .where('id_produk', id_produk)
            .update('status_product', status)
        return response.json(Getguru)
    }

    async DetailGuru({ response, params }) {
        const id_mitra = params.id
        const DetailGuru = await Database
            .select('id_produk', 'module', 'sub_module', 'kota', 'pengalaman', 'total_murid', 'harga', 'gaji_saat_ini', 'status_product')
            .table('in_produk')
            .where('id_mitra', id_mitra)
            .groupBy('id_produk', 'module', 'sub_module', 'kota', 'pengalaman', 'total_murid', 'harga', 'gaji_saat_ini', 'status_product')
        return response.json(DetailGuru)
    }


    async GetJadwalGuru({ response, params }) {
        const id_produk = params.id
        const DetailGuru = await Database
            .select('hari', 'jam')
            .table('in_harga')
            .where('id_produk', id_produk)
        return response.json(DetailGuru)
    }

    async GetKelas({ response }) {
        const kelas = await Database
            .select('kategori')
            .table('in_matpel')
            .groupBy('kategori')
        return response.json(kelas)
    }

    async GetMataPelajaran({ response }) {
        const GetMataPelajaran = await Database
            .select('nama_matpel')
            .table('in_matpel')
            .groupBy('nama_matpel')
        return response.json(GetMataPelajaran)
    }

    async GetKotaJabodetabek({ response }) {
        const GetKotaJabodetabek = await Database
            .select('kota')
            .table('in_alamat_verifikasi')
            .groupBy('kota')
        return response.json(GetKotaJabodetabek)
    }

    async countbykelas({ response, request }) {
        const count = await Database
            .select('*')
            .table('in_order as order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            // .whereRaw('product = ?', ['Private'])
            .orderBy('id_order', 'ASC')
            // .getCount('id_order')
        return response.json(count)
    }

    async selectguru({ response, params }) {
        const idproduk = params.id
        const selectguru = await Database
            .select('in_mitra.nama', 'in_mitra.id_mitra', 'in_produk.id_produk')
            .table('in_produk')
            .innerJoin('in_mitra', 'in_produk.id_mitra', 'in_mitra.id_mitra')
            .where('id_produk', idproduk)
            .first()
        return response.json(selectguru)
    }

    async statusguru({ response, params }) {
        const idmitra = params.id
        const statusguru = await Database
            .select('status_product')
            .table('in_produk')
            .where('id_mitra', idmitra)
            .where('status_product', 'Aktif')
            .groupBy('status_product')
            .getCount('status_product')
        return response.json(statusguru)
    }

    async guruadamuridatautidak({ response, params }) {
        const id_mitra = params.id
        const guruadamuridatautidak = await Database.from('in_pertemuan').where('id_mitra', id_mitra)
        if (guruadamuridatautidak != "") {
            return response.json(1)
        } else {
            return response.json(0)
        }
    }

    async guruInorder({ response, params }) {
        const no_invoice = params.id
        const guruInorder = await Database
            .select('in_mitra.nama', 'in_produk.id_produk')
            .from('in_order')
            .where('id_order', no_invoice)
            .innerJoin('in_produk', 'in_order.id_product_order', 'in_produk.id_produk')
            .innerJoin('in_mitra', 'in_produk.id_mitra', 'in_mitra.id_mitra')
        return response.json(guruInorder)

    }

    async notifikasi({ response, request }) {
        let current_datetime = new Date()
        const id_user_receive_notifikasi = request.input('id_user_receive_notifikasi')
        const id_user_request_notifikasi = request.input('id_user_request_notifikasi')
        const id_invoice = request.input('id_invoice')
        const produk_notifikasi = request.input('produk_notifikasi')
        const keterangan = request.input('keterangan')
        const status_notifikasi = request.input('status_notifikasi')

        const notifikasii = await Database
            .insert({
                id_user_receive_notifikasi: id_user_receive_notifikasi,
                id_user_request_notifikasi: id_user_request_notifikasi,
                id_invoice: id_invoice,
                produk_notifikasi: produk_notifikasi,
                keterangan: keterangan,
                status_notifikasi: status_notifikasi,
                created_at: current_datetime,
                updated_at: current_datetime
            })
            .into('in_notifikasi_member')

        return response.json(notifikasii)
    }

    async countNotifikasiRequested({ response, params }) {
        const id_pelanggan = params.id
        const countNotifikasi = await Database
            .from('in_notifikasi_member')
            .where('id_user_request_notifikasi', id_pelanggan)
            .where('status_notifikasi', 'Baru')
            .getCount('id_notifikasi')
        return response.json(countNotifikasi)
    }

    async countNotifikasiReceive({ response, params }) {
        const id_pelanggan = params.id
        const countNotifikasi = await Database
            .from('in_notifikasi_member')
            .where('id_user_receive_notifikasi', id_pelanggan)
            .where('status_notifikasi', 'Baru')
            .getCount('id_notifikasi')
        return response.json(countNotifikasi)
    }

    async countnotifikasiRequested({ response }) {
        const countnotifikasi = await Database
            .select('*')
            .from('in_order')
            .where('status_order', 'Requested')
            .where('product','Private')
            .getCount('id_order')
        return response.json(countnotifikasi)
    }

    async countnotifikasiPending({ response }) {
        const countnotifikasi = await Database
            .select('*')
            .from('in_order')
            .where('status_order', 'Pending')
            .where('product','Private')
            .getCount('id_order')
        return response.json(countnotifikasi)
    }

    async countnotifikasiPembayaran({ response }) {
        const countnotifikasi = await Database
            .select('*')
            .from('in_order')
            .where('product','Private')
            .where('status_order', 'Cek_Pembayaran')
            .getCount('id_order')
        return response.json(countnotifikasi)
    }

    async countnotifikasiProgres({ response }) {
        const countnotifikasi = await Database
            .select('*')
            .from('in_order')
            .where('status_order', 'In Progres')
            .where('product','Private')
            .getCount('id_order')
        return response.json(countnotifikasi)
    }

    async countnotifikasiKonfirmasi({ response }) {
        const countnotifikasi = await Database
            .select('*')
            .from('in_order')
            .where('status_order', 'Konfirmasi_Ulang')
            .where('product','Private')
            .getCount('id_order')
        return response.json(countnotifikasi)
    }

    async countnotifikasiregistrasi({ response }) {
        const countnotifikasi = await Database
            .select('*')
            .from('in_order')
            .where('status_order', 'Registrasi_Ulang')
            .where('product','Private')
            .getCount('id_order')
        return response.json(countnotifikasi)
    }

    async countnotifikasiClose({ response }) {
        const countnotifikasi = await Database
            .select('*')
            .from('in_order')
            .where('status_order', 'Close')
            .where('product','Private')
            .getCount('id_order')
        return response.json(countnotifikasi)
    }

    async updatenotifterbaca({ response, request }) {
        const notifterbaca = await Database
            .table('in_notifikasi_member')
            .where('status_notifikasi', 'Baru')
            .where('id_user_request_notifikasi', request.input('id_pelanggan'))
            .update('status_notifikasi', 'Tidak')
        return response.json(notifterbaca)
    }

    async jadwallast({ params, response }) {

        let List = await Database
            .select('in_pertemuan.*', 'in_pelanggan.nama as nama_pelanggan', 'in_mitra.nama as nama_mitra')
            .from('in_pertemuan')
            .innerJoin('in_pelanggan', 'in_pertemuan.id_user_order', 'in_pelanggan.id_pelanggan')
            .innerJoin('in_mitra', 'in_pertemuan.id_mitra', 'in_mitra.id_mitra')
            .where('id_invoice', params.id)
            .whereNotNull('status')
            .orderBy('id_pertemuan', 'ASC')

        return response.json(List)

    }

    async detailpembayaran({ response, params }) {
        const detailpembayran = await Database
            .select('order.keterangan', 'deal.amount', 'deal.description', 'pelanggan.nama as nama_murid', 'mitra.nama as nama_mitra')
            .from('in_order as order')
            .innerJoin('in_order_deal as deal', 'order.id_order', 'deal.id_order')
            .innerJoin('in_pelanggan as pelanggan', 'order.id_user_order', 'pelanggan.id_pelanggan')
            .innerJoin('in_produk as produk', 'order.id_product_order', 'produk.id_produk')
            .innerJoin('in_mitra as mitra', 'produk.id_mitra', 'mitra.id_mitra')
            .where('order.id_order', params.id)
        return response.json(detailpembayran)
    }


}

module.exports = PrivateController