'use strict'
const Database = use('Database')
const Kelas = use('App/Models/Kelas')
const Maon = use('App/Models/MatpelOnline')
const Soal = use('App/Models/Soal')
const Helpers = use('Helpers')
const randomstring = use("randomstring");



class BimbelController {

    async Tambahkelas({ response, request }) {
        const kelasInfo = request.only(['kelas'])
        const kelas = new Kelas()
        kelas.kelas = kelasInfo.kelas
        await kelas.save()
        return response.json(kelas)
    }

    async kelas({ response }) {
        const kelas = await Database
            .table('in_kelas_online')
            .orderBy('kelas', 'ASC')
        return response.json(kelas)
    }

    async editmatpel({ response, request }) {
        const kelas = request.input('kelas')
        const silabus = request.input('silabus')
        const jumlah_soal = request.input('jumlah_soal')
        const mata_pelajaran = request.input('mata_pelajaran')
        const editmatpel = await Database
            .table('in_matpel_online')
            .where('silabus', silabus)
            .where('kelas', kelas)
            .where('mata_pelajaran', mata_pelajaran)
            .update('jumlah_soal', jumlah_soal)
        return response.json(editmatpel)
    }

    async editwaktu({ response, request }) {
        const kelas = request.input('kelas')
        const waktu = request.input('waktu')
        const mata_pelajaran = request.input('mata_pelajaran')
        const editwaktu = await Database
            .table('in_matpel_online')
            .where('kelas', kelas)
            .where('mata_pelajaran', mata_pelajaran)
            .update('waktu', waktu)
        return response.json(editwaktu)
    }

    async editwaktuInsoal({ response, request }) {
        const kelas = request.input('kelas')
        const waktu = request.input('waktu')
        const mata_pelajaran = request.input('mata_pelajaran')
        const editwaktu = await Database
            .table('in_soal')
            .where('kelas', kelas)
            .where('nama_matpel', mata_pelajaran)
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
        const kelas = request.input('kelas')
        const matapelajaran = request.input('matapelajaran')
        const list = await Database
            .select('jumlah_soal', 'silabus', 'waktu', 'kelas', 'mata_pelajaran')
            .table('in_matpel_online')
            .where('kelas', kelas)
            .where('mata_pelajaran', matapelajaran)
            .orderBy('kelas', 'ASC')
        return response.json(list)
    }

    async Countmatpelbykelas({ response, request }) {
        const kelas = request.input('kelas')
        const matapelajaran = request.input('matapelajaran')
        const list = await Database
            .table('in_soal')
            .where('kelas', kelas)
            .where('nama_matpel', matapelajaran)
            .getCount('nama_matpel')
        return response.json(list)
    }

    async getMataPelajaran({ response, request }) {
        const kelas = request.input('kelas')
        const getmatpel = await Database
            .select('mata_pelajaran')
            .table('in_matpel_online')
            .where('kelas', kelas)
            .groupBy('mata_pelajaran')
        return response.json(getmatpel)
    }

    async getSilabus({ response, request }) {
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')
        const getsilabus = await Database
            .select('silabus')
            .table('in_matpel_online')
            .where('kelas', kelas)
            .where('mata_pelajaran', mata_pelajaran)
        return response.json(getsilabus)
    }

    async setSoal({ request, response }) {
        const soal = new Soal()
        const soalInfo = request.only(['kelas', 'nama_matpel', 'kurikulum', 'jawaban', 'waktu', 'silabus', 'soal', 'pembahasan'])

        soal.kelas = soalInfo.kelas
        soal.nama_matpel = soalInfo.nama_matpel
        soal.kurikulum = soalInfo.kurikulum
        soal.jawaban = soalInfo.jawaban
        soal.waktu = soalInfo.waktu
        soal.silabus = soalInfo.silabus
        soal.soal = soalInfo.soal
        soal.pembahasan = soalInfo.pembahasan

        await soal.save()
        return response.status(201).json(soal)

    }

    async getmaxsoal({ response, request }) {
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')
        const silabus = request.input('silabus')
        const count = await Database
            .select('*')
            .table('in_soal')
            .where('kelas', kelas)
            .where('nama_matpel', mata_pelajaran)
            .where('silabus', silabus)
            .getCount('soal')
        return response.json(count)
    }

    async getsoaltampil({ response, request }) {
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')
        const silabus = request.input('silabus')
        const count = await Database
            .select('jumlah_soal')
            .table('in_matpel_online')
            .where('kelas', kelas)
            .where('mata_pelajaran', mata_pelajaran)
            .where('silabus', silabus)
        return response.json(count)
    }

    async Countsoal({ response, request, params }) {
        const count = await Database
            .from('in_soal')
            .where('kelas', '=', params.kelas.replace(/%20/g, ' '))
            .where('nama_matpel', params.mata_pelajaran.replace(/%20/g, ' '))
            .where('silabus', params.bab.replace(/%20/g, ' '))
            .count('id_soal')
            .first()
        return response.json(count)
    }

    async Countwaktu({ response, request, params }) {
        const count = await Database
            .select('waktu')
            .from('in_matpel_online')
            .where('kelas', '=', params.kelas.replace(/%20/g, ' '))
            .where('mata_pelajaran', params.mata_pelajaran.replace(/%20/g, ' '))
            .first()
        return response.json(count)
    }

    async getwaktu({ response, request, params }) {
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')
        const getwaktu = await Database
            .select('waktu')
            .table('in_matpel_online')
            .where('kelas', kelas)
            .where('mata_pelajaran', mata_pelajaran)
            .first()
        return response.json(getwaktu)
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
            .table('in_soal')
            .orderBy('kelas')
            .where('kurikulum', '01')
        return response.json(soal)
    }

    async soalbykelas({ response, request, params }) {
        const kelas = request.input('kelas')
        const soal = await Database
            .select('*')
            .table('in_soal')
            .where('kelas', kelas)
            .orderBy('kelas')
        return response.json(soal)
    }

    async soalbymatapelajaran({ response, request, params }) {
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')
        const soal = await Database
            .select('*')
            .table('in_soal')
            .where('kelas', kelas)
            .where('nama_matpel', mata_pelajaran)
            .orderBy('kelas')
        return response.json(soal)
    }

    async soalbysilabus({ response, request, params }) {
        const kelas = request.input('kelas')
        const silabus = request.input('silabus')
        const mata_pelajaran = request.input('mata_pelajaran')
        const soal = await Database
            .select('*')
            .table('in_soal')
            .where('kelas', kelas)
            .where('silabus', silabus)
            .where('nama_matpel', mata_pelajaran)
            .orderBy('kelas')
        return response.json(soal)
    }

    async listmurid({ response }) {
        const listmurid = await Database
            .select('id_user')
            .table('in_soal_examp as examp')
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
            .table('in_soal_examp as examp')
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
            .table('in_soal_examp as examp')
            .innerJoin('in_pelanggan as pelanggan', 'examp.id_user', 'pelanggan.id_pelanggan')
            .where('id_user', id_user)
            .where('status', 'Selesai')
            .limit(5)
            .orderBy('examp.updated_at','DESC')
        return response.json(listmurid)
    }

    async hapus_soal ({ response,request }) {
        const id_soal = request.input('id_soal')
        const hapus = await Database 
            .table('in_soal_langganan')
            .where('id_soal',id_soal)
            .delete() 

        const hapus_execute = await Database 
            .table('in_soal_execute_langganan')
            .where('id_soal', id_soal)
            .delete() 
            
        return response.json('berhasil')    
    }


}

module.exports = BimbelController