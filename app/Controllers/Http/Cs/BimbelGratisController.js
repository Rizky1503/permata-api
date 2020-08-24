'use strict'
const Database = use('Database')
const Kelas = use('App/Models/Kelas')
const Maon = use('App/Models/MatpelOnline')
const Soal = use('App/Models/Soal')
const Helpers = use('Helpers')
const randomstring = use("randomstring");


class BimbelGratisController {

    // lihat soal
    async GetTingkat ({ response }){
        const tingkat = await Database
            .select('kelas')
            .from('in_matpel_online_gratis_nolog')
            .groupBy('kelas')
            .orderBy('kelas','ASC')
        return response.json(tingkat)
    }

    async GetMatpel ({ response,request }){
        const tingkat = request.input('tingkat')
        const matpel = await Database
            .select('mata_pelajaran')
            .from('in_matpel_online_gratis_nolog')
            .where('kelas',tingkat)
            .groupBy('mata_pelajaran')
            .orderBy('mata_pelajaran','ASC')
        return response.json(matpel)
    }

    async IdMatpel ({ response,request }){
        const kelas = request.input('kelas')
        const mata_pelajaran = request.input('mata_pelajaran')
        const matpel = await Database
            .select('id_matpel')
            .from('in_matpel_online_gratis_nolog')
            .where('kelas',kelas)
            .where('mata_pelajaran',mata_pelajaran)
            .first()
        return response.json(matpel)
    }

    async SoalGratis ({ response }){
        const soal = await Database
            .select('*')
            .from('in_soal_gratis_nolog')
            .orderBy('id_soal','ASC')
        return response.json(soal)
    }

    async SoalGratisFilterTingkat ({ response,request }){
        const tingkat = request.input('tingkat')
        const soal = await Database
            .select('*')
            .from('in_soal_gratis_nolog')
            .where('kelas',tingkat)
            .orderBy('id_soal','ASC')
        return response.json(soal)
    }

    async SoalGratisFilterMatpel ({ response,request }){
        const tingkat = request.input('tingkat')
        const matpel = request.input('matpel')
        const soal = await Database
            .select('*')
            .from('in_soal_gratis_nolog')
            .where('kelas',tingkat)
            .where('nama_matpel',matpel)
            .orderBy('id_soal','ASC')
        return response.json(soal)
    }

    async HapusSoal ({ response,request }){
        const id_soal = request.input('id_soal')
        const hapus = await Database
            .table('in_soal_gratis_nolog')
            .where('id_soal',id_soal)
            .delete()
    }

}

module.exports = BimbelGratisController