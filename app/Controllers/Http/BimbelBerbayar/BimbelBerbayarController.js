'use strict'
const Database = use('Database')
const Kelas = use('App/Models/Kelas')
const Maon = use('App/Models/MatpelOnline')
const Soal = use('App/Models/SoalBerbayar')
const Helpers = use('Helpers')
const randomstring = use("randomstring");
const Payment = use('App/Models/Payment')
const Order = use('App/Models/Order')
const NotifikasiMember = use('App/Models/NotifikasiMember')
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

class BimbelBerbayarController {
    
    //upload soal
    async paket ({ response }) {
        const paket = await Database
            .select('jenis_paket')
            .table('in_matpel_online_langganan')
            .orderBy('jenis_paket', 'ASC')
            .whereNotNull('jenis_paket')
            .groupBy('jenis_paket')
        return response.json(paket)
    }

    //upload soal
    async tingkat({ response }) {
        const kelas = await Database
            .select('tingkat')
            .table('in_matpel_online_langganan')
            .orderBy('tingkat', 'ASC')
            .groupBy('tingkat')
        return response.json(kelas)
    }

     async getjenis({ response, request }) {
        const tingkat     = request.input('tingkat')
        const getjenis  = await Database
            .select('jenis_paket')
            .table('in_matpel_online_langganan')
            .where('tingkat', tingkat)
            .groupBy('jenis_paket')
            .orderBy('jenis_paket','ASC')
        return response.json(getjenis)
    }

    async getmapel({  response,request }){
        const tingkat   = request.input('tingkat')
        const jenis     = request.input('jenis')
        const getjenis  = await Database
            .select('mata_pelajaran')
            .table('in_matpel_online_langganan')
            .where('tingkat', tingkat)
            .where('jenis_paket', jenis)
            .groupBy('mata_pelajaran')
            .orderBy('mata_pelajaran','ASC')
        return response.json(getjenis)
    }

    async getkelas({ response, request }) {
        const tingkat           = request.input('tingkat')
        const jenis_paket       = request.input('jenis_paket')
        const getmatpel         = await Database
            .select('kelas')
            .table('in_matpel_online_langganan')
            .where('tingkat', tingkat)
            .where('jenis_paket', jenis_paket)
            .groupBy('kelas')
            .orderBy('kelas','ASC')
        return response.json(getmatpel)
    }

     async getmatapelajaran({ response, request }) {
        
        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')
        const jenis_paket = request.input('jenis_paket')

        const getmatapelajaran = await Database
            .select('mata_pelajaran')
            .table('in_matpel_online_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)
            .where('jenis_paket', jenis_paket)
            .groupBy('mata_pelajaran')
            .orderBy('mata_pelajaran','ASC')
        return response.json(getmatapelajaran)
    }

    async getwaktu({ response, request, params }) {

        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')
        const jenis_paket = request.input('jenis_paket')
        
        const getwaktu = await Database
            .select('waktu')
            .table('in_matpel_online_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)  
            .where('jenis_paket', jenis_paket)
            .first()
        return response.json(getwaktu)
    }

    async getmaxsoal({ response, request }) {
     
        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')
        const jenis = request.input('jenis')
        const tahun = request.input('tahun')
       
        const count = await Database
            .select('*')
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)
            .where('jenis_paket', jenis)
            .where('nama_matpel', mata_pelajaran)
            .where('tahun_soal', tahun)
            .getCount('soal')
        return response.json(count)
    }

     async getsoaltampil({ response, request }) {

        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')

        const count = await Database
            .select('jumlah_soal')
            .table('in_matpel_online_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)
            .where('mata_pelajaran', mata_pelajaran)
        return response.json(count)
    }


    async setSoal({ request, response }) {
        const soal = new Soal()
        const soalInfo = request.only(['jenis_soal', 'tahun_soal', 'kelas', 'nama_matpel', 'kurikulum', 'jawaban', 'waktu', 'silabus', 'soal', 'pembahasan','created_by'])

        soal.jenis_paket    = soalInfo.jenis_soal
        soal.tahun_soal     = soalInfo.tahun_soal
        soal.tingkat        = soalInfo.kelas
        soal.kelas          = soalInfo.nama_matpel
        soal.kurikulum      = soalInfo.kurikulum
        soal.jawaban        = soalInfo.jawaban
        soal.waktu          = soalInfo.waktu
        soal.nama_matpel    = soalInfo.silabus
        soal.soal           = soalInfo.soal
        soal.pembahasan     = soalInfo.pembahasan
        soal.created_by     = soalInfo.created_by

        await soal.save()
        return response.status(201).json(soal)

    }

//

    async Tambahkelas({ response, request }) {
        const kelasInfo = request.only(['kelas'])
        const kelas = new Kelas()
        kelas.kelas = kelasInfo.kelas
        await kelas.save()
        return response.json(kelas)
    }

    

    async editmatpel({ response, request }) {
        const kelas = request.input('kelas')
        const silabus = request.input('silabus')
        const jumlah_soal = request.input('jumlah_soal')
        const mata_pelajaran = request.input('mata_pelajaran')

        const editmatpel = await Database
            .table('in_matpel_online_langganan')
            .where('tingkat', kelas)
            .where('kelas', mata_pelajaran)
            .where('mata_pelajaran', silabus)
            .update('jumlah_soal', jumlah_soal)
        
        return response.json(editmatpel)
    }

    async editwaktu({ response, request }) {
        const kelas = request.input('kelas')
        const waktu = request.input('waktu')
        const mata_pelajaran = request.input('mata_pelajaran')
        const editwaktu = await Database
            .table('in_matpel_online_langganan')
            .where('tingkat', kelas)
            .where('kelas', mata_pelajaran)
            .update('waktu', waktu)
        return response.json(editwaktu)
    }

    async editwaktuInsoal({ response, request }) {
        const kelas = request.input('kelas')
        const waktu = request.input('waktu')
        const mata_pelajaran = request.input('mata_pelajaran')
        const editwaktu = await Database
            .table('in_soal_langganan')
            .where('tingkat', kelas)
            .where('kelas', mata_pelajaran)
            .update('waktu', waktu)
        return response.json(editwaktu)
    }

    async listmatpel({ response }) {
        const list = await Database
            .select('mata_pelajaran', 'kelas')
            .table('in_matpel_online')
            .groupBy('mata_pelajaran', 'kelas')
            .where('kelas', 'kelas')
            .orderBy('kelas')
        return response.json(list)
    }

    async listmatpelbykelas({ response, request }) {

        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')
        
        const list = await Database
            .select('jumlah_soal', 'tingkat', 'waktu', 'kelas', 'mata_pelajaran')
            .table('in_matpel_online_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)
            .orderBy('kelas', 'ASC')
        return response.json(list)
    }

    async Countmatpelbykelas({ response, request }) {

        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')

        const list = await Database
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)
            .getCount('nama_matpel')
        return response.json(list)
    }

    async Countsoal({ response, request, params }) {
        const count = await Database
            .from('in_soal_langganan')
            .where('tingkat', '=', params.kelas.replace(/%20/g, ' '))
            .where('kelas', params.mata_pelajaran.replace(/%20/g, ' '))
            .where('nama_matpel', params.bab.replace(/%20/g, ' '))
            .count('id_soal')
            .first()
        return response.json(count)
    }

    async Countwaktu({ response, request, params }) {
        const count = await Database
            .select('waktu')
            .from('in_matpel_online_langganan')
            .where('kelas', '=', params.kelas.replace(/%20/g, ' '))
            .where('mata_pelajaran', params.mata_pelajaran.replace(/%20/g, ' '))
            .first()
        return response.json(count)
    }

    

    async countlastSoal({ response, request }) {
        const kelas = request.input('kelas')
        const silabus = request.input('silabus')
        const mata_pelajaran = request.input('mata_pelajaran')
        const countlastSoal = await Database
            .select('*')
            .table('in_soal')
            .where('kelas', kelas)
            .where('silabus', silabus)
            .where('nama_matpel', mata_pelajaran)
            .getCount('soal')
        return response.json(countlastSoal)
    }

    async soalbyall({ response, request, params }) {
        const soal = await Database
            .select('*')
            .table('in_soal_langganan')
            .orderBy('kelas')
        return response.json(soal)
    }

    async soalbykelas({ response, request, params }) {
        const tingkat = request.input('tingkat')
        const soal = await Database
            .select('*')
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .orderBy('kelas')
        return response.json(soal)
    }

    async filterTingkat({ response, request, params }) {
        const tingkat = request.input('tingkat')
        const soal = await Database
            .select('*')
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .orderBy('created_at','ASC')
        return response.json(soal)
    }

    async filterJenis({ response, request, params }) {
        const tingkat = request.input('tingkat')
        const jenis = request.input('jenis')
        const soal = await Database
            .select('*')
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .where('jenis_paket', jenis)
            .orderBy('created_at','ASC')
        return response.json(soal)
    }

    async filterMatpel({ response, request, params }) {
        
        const tingkat = request.input('tingkat')
        const jenis = request.input('jenis')
        const matpelajaran = request.input('matpel')

        const soal = await Database
            .select('*')
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .where('jenis_paket', jenis)
            .where('nama_matpel', matpelajaran)
            .orderBy('created_at','ASC')
        return response.json(soal)
    }

    async filterTahun({ response, request, params }) {
        
        const tingkat = request.input('tingkat')
        const jenis = request.input('jenis')
        const matpelajaran = request.input('matpel')
        const tahun = request.input('tahun')

        const soal = await Database
            .select('*')
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .where('jenis_paket', jenis)
            .where('nama_matpel', matpelajaran)
            .where('tahun_soal', tahun)
            .orderBy('created_at','ASC')
        return response.json(soal)
    }

    async count_soal_for_delete ({ response,request }){
        const id_soal = request.input('id_soal')

        const count = await Database
            .table('in_soal_execute_langganan')
            .where('id_soal',id_soal)
            .count()
            .first()

        if (count.count > 0){
            return response.json({
                status : 'true',
                responses : '201',
                data: 'soal tidak bisa di hapus'           
            })
        }else{
            return response.json({
                status : 'true',
                responses : '200',
                data: 'soal bisa di hapus'           
            })
        }
    } 


    async hapus_soal ({ response,request }) {
        const id_soal = request.input('id_soal')
        
        const hapus = await Database 
            .table('in_soal_langganan')
            .where('id_soal',id_soal)
            .delete()
        
        const id_examp = await Database
            .select('id_examp')
            .from('in_soal_execute_langganan')
            .where('id_soal', id_soal)
            .first()
        
        const update_examp = await Database
            .table('in_soal_examp_langganan')
            .where('id_examp', id_examp.id_examp)
            .update({ status: 'Selesai'})
        
        const hapus_execute = await Database 
            .table('in_soal_execute_langganan')
            .where('id_soal', id_soal)
            .delete() 
            
        return response.json('berhasil')    
    }

    
    async soalbymatapelajaran({ response, request, params }) {
        
        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')

        const soal = await Database
            .select('*')
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)
            .orderBy('kelas')
        return response.json(soal)
    }

    async soalbysilabus({ response, request, params }) {
        
        const tingkat = request.input('tingkat')
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')

        const soal = await Database
            .select('*')
            return response.json({
                status : 'true',
                responses : '200',
                data:menu           
            })
            .table('in_soal_langganan')
            .where('tingkat', tingkat)
            .where('kelas', kelas)
            .where('nama_matpel', mata_pelajaran)
            // .orderBy('kelas')
        return response.json(soal)
    }

    async listmurid({ response }) {
        const listmurid = await Database
            .select('id_user')
            .table('in_soal_examp_langganan')
            .groupBy('id_user')
        return response.json(listmurid)
    }

    async exlistmurid({ response, params }) {
        const id_produk = params.id
        const exlistmurid = await Database
            .select('*')
            .table('in_pelanggan')
            .where('id_pelanggan', id_produk)
        return response.json(exlistmurid)
    }

    async detailmurid({ response, request }) {
        const id_user = request.input('id_user')
        const listmurid = await Database
            .select('examp.updated_at','keterangan','total_nilai','passing_grade')
            .table('in_soal_examp_langganan as examp')
            .innerJoin('in_pelanggan as pelanggan', 'examp.id_user', 'pelanggan.id_pelanggan')
            .where('id_user', id_user)
            .where('status', 'Selesai')
            .orderBy('examp.updated_at','DESC')
        return response.json(listmurid)
    }

    async nilaimurid({ response, request, params }) {
        const id_user = params.id
        const listmurid = await Database
            .select('examp.updated_at','keterangan','total_nilai','passing_grade')
            .table('in_soal_examp_langganan as examp')
            .innerJoin('in_pelanggan as pelanggan', 'examp.id_user', 'pelanggan.id_pelanggan')
            .where('id_user', id_user)
            .where('status', 'Selesai')
            .limit(5)
            .orderBy('examp.updated_at','DESC')
        return response.json(listmurid)
    }

    async listpembayaran({response}){
        const listpembayaran = await Database
            .select('in_order.id_order as id_invoice','in_order_deal.amount','in_order.id_user_order','in_order.kondisi','in_order.updated_at','in_payment.nama_pengirim','in_payment.nama_bank','in_payment.upload_file')
            .from('in_payment')
            .innerJoin('in_order','in_payment.id_invoice','in_order.id_order')
            .innerJoin('in_order_deal','in_payment.id_invoice','in_order_deal.id_order')
            .where('in_order.product','BO')
            .where('in_order.status_order','Cek_Pembayaran')
            .orderBy('updated_at','DESC')
         return response.json(listpembayaran)   
    }

    async listpembayaranId({ response,params }){
        const id_user = params.id
        const listpembayaran = await Database
            .select('in_order.updated_at','in_order.id_user_order')
            .from('in_order')
            .where('id_order',params.id)
         return response.json(listpembayaran)   
    }

    //KONFIRMASI PEMBAYARAN
    async konfirmasipembayaranpayment({request,params,response}){        
        const payment = await Payment.find(params.id)
        if (!payment) {
            return response.status(404).json({data: 'Resource not found'})
        }
        payment.status = 'Konfirmasi'
        await payment.save()
    }

    async konfirmasipembayaranorder({request,params,response}){         
        const order = await Order.find(params.id)
        if (!order) {
            return response.status(404).json({data: 'Resource not found'})
        }

        order.status_order = 'In Progres'
        await order.save()
    }

    async kirimnotifikasipembayaran ({request,params,response}){

        const id_pelanggan = request.input('id_pelanggan')
        const notif = new NotifikasiMember()

        notif.id_invoice = params.id
        notif.id_user_receive_notifikasi = id_pelanggan
        notif.produk_notifikasi = 'Bimbel Online'
        notif.status_notifikasi = 'Baru'
        notif.keterangan = 'In Progres'

        await notif.save()
    }

    //REJECTED PEMBAYARAN
    async rejectedpembayaranpayment({request,params,response}){        
        const payment = await Payment.find(params.id)
        if (!payment) {
            return response.status(404).json({data: 'Resource not found'})
        }
        payment.status = 'Rejected'
        await payment.save()
    }

    async rejectedpembayaranorder({request,params,response}){         
        const order = await Order.find(params.id)
        if (!order) {
            return response.status(404).json({data: 'Resource not found'})
        }

        order.status_order = 'Rejected'
        await order.save()
    }

    async kirimnotifikasipembayaranrejected ({request,params,response}){

        const id_pelanggan = request.input('id_pelanggan')
        const notif = new NotifikasiMember()

        notif.id_invoice = params.id
        notif.id_user_receive_notifikasi = id_pelanggan
        notif.produk_notifikasi = 'Bimbel Online'
        notif.keterangan = 'Rejected'
        notif.status_notifikasi = 'Baru'

        await notif.save()
    }

    async muridlangganan ({response}){
        const muridlangganan = await Database
            .select(
                'in_order.id_user_order',
                'in_order.keterangan',
                'in_order.kondisi',
                'in_order.created_at as created_at_order',
                'in_order.expired_bimbel_online',
                'in_pelanggan.nama',
                'in_pelanggan.no_telpon',
                'in_asal_sekolah.asal_sekolah',
                'in_asal_sekolah.kota_sekolah')
            .from('in_order')
            .innerJoin('in_pelanggan','in_order.id_user_order','in_pelanggan.id_pelanggan')
            .innerJoin('in_asal_sekolah','in_order.id_order','in_asal_sekolah.id_order')
            .where('in_order.status_order','In Progres')            
            .where('in_order.product','BO')
        return response.json(muridlangganan)    
    }

    async muridrequested ({response}){
        const muridlangganan = await Database
            .select(
                'in_order.*',
                'in_pelanggan.nama',
                'in_pelanggan.no_telpon',
                'in_pelanggan.email',
                'in_asal_sekolah.asal_sekolah',
                'in_asal_sekolah.kota_sekolah',
                'in_survey.sumber',
                'in_soal_langganan_paket.nama_paket'
                )
            .from('in_order')
            .innerJoin('in_pelanggan','in_order.id_user_order','in_pelanggan.id_pelanggan')
            .leftJoin('in_asal_sekolah','in_order.id_order','in_asal_sekolah.id_order')
            .leftJoin('in_survey','in_order.id_user_order','in_survey.id_pelanggan')
            .leftJoin('in_soal_langganan_paket','in_order.id_package_user','in_soal_langganan_paket.id_paket')
            .where('in_order.product','BO')
            .whereNot('in_order.id_user_order','PG201910021000000017')
            .orderBy('in_order.id_order','DESC')
        return response.json(muridlangganan)    
    }

    async muridrequestedfilter ({response, request}){
        const kelas = request.input('kelas')
        const muridlangganan = await Database
            .select(
                'in_order.id_order',
                'in_order.id_user_order',
                'in_order.keterangan',
                'in_order.kondisi',
                'in_order.created_at as created_at_order',
                'in_order.expired_bimbel_online',
                'in_order.status_order',
                'in_order.payment_channel',
                'in_pelanggan.nama',
                'in_pelanggan.no_telpon',
                'in_pelanggan.email',
                'in_asal_sekolah.asal_sekolah',
                'in_asal_sekolah.kota_sekolah',
                'in_survey.sumber'
                )
            .from('in_order')
            .innerJoin('in_pelanggan','in_order.id_user_order','in_pelanggan.id_pelanggan')
            .leftJoin('in_asal_sekolah','in_order.id_order','in_asal_sekolah.id_order')
            .leftJoin('in_survey','in_order.id_user_order','in_survey.id_pelanggan')
            .where('in_order.product','BO')
            .where('in_order.kondisi', kelas )
            .whereNot('in_order.id_user_order','PG201910021000000017')
            .orderBy('in_order.id_order','DESC')

        const count = await Database
            .from('in_order')
            .innerJoin('in_pelanggan','in_order.id_user_order','in_pelanggan.id_pelanggan')
            .leftJoin('in_asal_sekolah','in_order.id_order','in_asal_sekolah.id_order')
            .where('in_order.product','BO')
            .where('in_order.kondisi', kelas )
            .whereNot('in_order.id_user_order','PG201910021000000017')
            .count()

        return response.json({
                murid : muridlangganan,
                count : count,
            })  
    }

    async muridlangganandetail ({response,params}){
        const muridlangganan = await Database
            .select(
                'in_order.id_user_order',
                'in_order.keterangan',
                'in_order.kondisi',
                'in_order.created_at as created_at_order',
                'in_order.expired_bimbel_online',
                'in_pelanggan.nama',
                'in_pelanggan.email',
                'in_pelanggan.alamat',
                'in_pelanggan.no_telpon',
                'in_pelanggan.asal_sekolah',
                'in_pelanggan.nama_ortu',
                'in_pelanggan.telpon_ortu',
                )
            .from('in_order')
            .innerJoin('in_pelanggan','in_order.id_user_order','in_pelanggan.id_pelanggan')
            .where('status_order','In Progres')
            .where('product','Bimbel Online')
            .where('in_order.id_user_order',params.id)
        return response.json(muridlangganan)    
    }

    async get_jenis_paket ({ response }){
        const data = await Database
            .select('jenis_paket')
            .from('in_paket_bimbel_online')
            .groupBy('jenis_paket')
            .orderBy('jenis_paket','ASC')
        return response.json(data)
    }

    async store_matpel_bedah_materi ({response,request}){
        const Inputs = request.only(['tingkat','matapelajaran','silabus'])
        const mata_pelajaran = await Database
             .table('in_bedah_mata_pelajaran')
             .insert({
                tingkat: Inputs.tingkat,
                matapelajaran: Inputs.matapelajaran,
                silabus: Inputs.silabus,
            })
        return response.json(200)
    }

    async view_matpel_bedah_materi ({response}){
        const data = await Database
            .select('*')
            .from('in_bedah_mata_pelajaran')
            .orderBy('tingkat','ASC')
        return response.json(data)
    }

    async get_tingkat_bedah_materi({response}){
        const data = await Database
            .select('tingkat')
            .from('in_bedah_mata_pelajaran')
            .orderBy('tingkat','ASC')
            .groupBy('tingkat')
        return response.json(data)
    }

    async get_matpel_bedah_materi({request,response}){
        const Inputs = request.only(['tingkat'])
        const data = await Database
            .select('matapelajaran')
            .from('in_bedah_mata_pelajaran')
            .where('tingkat',Inputs.tingkat)
            .orderBy('matapelajaran','ASC')
            .groupBy('matapelajaran')
        return response.json(data)
    }

    async get_silabus_bedah_materi({request,response}){
        const Inputs = request.only(['tingkat','matapelajaran'])
        const data = await Database
            .select('silabus')
            .from('in_bedah_mata_pelajaran')
            .where('tingkat',Inputs.tingkat)
            .where('matapelajaran',Inputs.matapelajaran)
            .orderBy('silabus','ASC')
            .groupBy('silabus')
        return response.json(data)
    }

    async get_id_matpel_bedah_materi({request,response}){
        const Inputs = request.only(['tingkat','matapelajaran','silabus'])
        const data = await Database
            .select('id')
            .from('in_bedah_mata_pelajaran')
            .where('tingkat',Inputs.tingkat)
            .where('matapelajaran',Inputs.matapelajaran)
            .where('silabus',Inputs.silabus)
            .first()
        return response.json(data)
    }

    async store_bedah_materi({request,response}){
        const Inputs = request.only(['id_matapelajaran','file_bedah_soal'])
        const data = await Database
             .table('in_bedah_file')
             .insert({
                id_bedah_mata_pelajaran: Inputs.id_matapelajaran,
                file_bedah_soal: Inputs.file_bedah_soal,
            })

    }

    async view_bedah_materi ({response}){
        const data = await Database
            .select('in_bedah_file.file_bedah_soal','in_bedah_file.id_bedah_soal','in_bedah_mata_pelajaran.*')
            .from('in_bedah_file')
            .innerJoin('in_bedah_mata_pelajaran','in_bedah_file.id_bedah_mata_pelajaran','in_bedah_mata_pelajaran.id')
        return response.json(data)
    }

    async delete_file_bedah_materi ({response,request}){
        const Inputs = request.only(['id_bedah_soal'])
        const data = await Database
            .table('in_bedah_file')
            .where('id_bedah_soal',Inputs.id_bedah_soal)
            .delete()
    }

    async count_soal_langganan({response,request}){
        const daata = await Database
            .select('tingkat','nama_matpel','jenis_paket','tahun_soal')
            .table('in_soal_langganan')
            .groupBy('tingkat','nama_matpel','jenis_paket','tahun_soal')
            .orderBy('tingkat','ASC')
            .orderBy('nama_matpel','ASC')
            .orderBy('tahun_soal','ASC')
            .orderBy('jenis_paket','ASC')
            .count('soal')
        return response.json(daata)
    }

    async duplicate_soal(request,response){
        const data = await Database
            .select('*')
            .table('in_soal_gratis_nolog')
            .where('kelas','12 SMA IPS')
            .where('nama_matpel','MATEMATIKA')
        return response.json(data)
    }


}

module.exports = BimbelBerbayarController