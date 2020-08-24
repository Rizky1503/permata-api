'use strict'
const Database = use('Database')
const Kelas = use('App/Models/Kelas')
const Maon = use('App/Models/MatpelOnline')
const Soal = use('App/Models/Soal')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class BimbelNologController {

    async getkelas({response,request}){
        const data = await Database
            .select('kelas')
            .table('in_matpel_online_gratis_nolog')
            .groupBy('kelas')
            .orderBy('kelas','ASC')
        return response.json(data)
    }

    async getmatpel({response,request}){
        const Inputs = request.only(['kelas'])
        const data = await Database
            .select('mata_pelajaran')
            .table('in_matpel_online_gratis_nolog')
            .where('kelas',Inputs.kelas)
            .groupBy('mata_pelajaran')
            .orderBy('mata_pelajaran','ASC')
        return response.json(data)
    }

    async storeSoal ({response,request}){
        const Inputs = request.only(['kelas','nama_matpel','no_urut','soal','pembahasan','jawaban','id_matpel'])
        const data = await Database
            .into('in_soal_gratis_nolog')
            .insert({
                id_matpel_online_gratis : Inputs.id_matpel,
                kelas: Inputs.kelas, 
                nama_matpel: Inputs.nama_matpel, 
                no_urut: Inputs.no_urut, 
                silabus: 'FREE',
                keterangan: 'Null' ,
                waktu: '4',
                kurikulum: 'Null',
                soal: Inputs.soal,
                pembahasan : Inputs.pembahasan,
                jawaban : Inputs.jawaban,
                soal.created_by : Inputs.created_by
            })
            
    }

}

module.exports = BimbelNologController