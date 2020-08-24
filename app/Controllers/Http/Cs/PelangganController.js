'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class PelangganController {

    //list pelanggan

    async list_pelanggan ({response}){
       const id_user_order = await Database
            .select('id_user_order')
            .table('in_order')
            .groupBy('id_user_order')

        var Tampung_id_user = [];
        for (var i = 0; i < id_user_order.length; i++) {
            Tampung_id_user.push(id_user_order[i].id_user_order);                        
        }
      
      const findDuplicates  = arr => arr.filter((item, index) => arr.indexOf(item) == index)
      const alreadyUser       = findDuplicates(Tampung_id_user);
      
       const list = await Database
           .select('in_pelanggan.*','in_login_location.place')
           .table('in_pelanggan')
           .leftJoin('in_login_location','in_pelanggan.id_pelanggan','in_login_location.id_pelanggan')
           .whereNotIn('in_pelanggan.id_pelanggan',alreadyUser)
           .orderBy('in_pelanggan.id_pelanggan','DESC')
       return response.json(list)  
    }

    async list_login_location ({response}){
       const list = await Database
           .select('*')
           .table('in_login_location')
           .whereNull('place')
           .whereNotNull('latitude')
           .whereNotNull('longatitude')

        const count = await Database
           .table('in_login_location')
           .whereNull('place')
           .whereNotNull('latitude')
           .whereNotNull('longatitude')
           .count()
           .first()

       return response.json({
            list  : list,
            count : count
           }) 
    }

    async store_login_location({response,request}){
        const kota = request.input('kota')
        const id_pelanggan = request.input('id_pelanggan')
        const data = await Database
            .table('in_login_location')
            .where('id_pelanggan', id_pelanggan)
            .update({ place : kota })

    }

    // survey pelanggan
    async survey_pelanggan ({response}){
        const list = await Database
            .select('in_survey.sumber','in_pelanggan.*')
            .table('in_survey')
            .innerJoin('in_pelanggan','in_survey.id_pelanggan','in_pelanggan.id_pelanggan')
            .orderBy('in_survey.sumber','ASC')
        return response.json(list)
    }

    async count_survey_pelanggan ({params,response}){
        const list = await Database
            .table('in_survey')
            .where('sumber', params.sumber)
            .count()
            .first()
        return response.json(list)
    }

    async count_survey_pelanggan_lainnya ({params,response}){
        const list = await Database
            .table('in_survey')
            .whereNotIn('sumber', ['Facebook','Instagram','Brosur','Iklan'])
            .count()
            .first()
        return response.json(list)
    }

    async day_register({response}){
      const list = await Database.raw("select * from in_pelanggan where created_at BETWEEN '9/12/2019 23:59:59' and '10/12/2019 11:59:59'")
      return response.json(list.rows)
    }

    async duplicate_soal_gratis({request,response}){
        const data = await Database
            .select('*')
            .table('in_soal_gratis_nolog')
            .where('kelas','10 SMA IPS')
            // .whereNotIn('nama_matpel', ['BAHASA INDONESIA','EKONOMI','GEOGRAFI','BAHASA INGGRIS','SEJARAH','MATEMATIKA','SOSIOLOGI'])
            // .delete()
            
        // for (var i = 0; i < data.length; i++) {   
        //     const data1 = await Database
        //         .table('in_soal_gratis_nolog')
        //         .insert({
        //            no_urut      : data[i].no_urut,
        //            kelas        : '11 SMA IPA',
        //            nama_matpel  : data[i].nama_matpel,
        //            silabus      : data[i].silabus,
        //            keterangan   : data[i].keterangan,
        //            waktu        : data[i].waktu,
        //            kurikulum    : data[i].kurikulum,
        //            soal         : data[i].soal,
        //            jawaban      : data[i].jawaban,
        //            pembahasan   : data[i].pembahasan,
                   
        //         })  
        //     }

        return response.json(data)
    }

    async duplicate_matpel_gratis({response}){
        const data = await Database
            .select('*')
            .table('in_matpel_online_gratis_nolog')
            .where('kelas','11 SMA IPS')
            .whereNotIn('mata_pelajaran', ['BAHASA INDONESIA','EKONOMI','GEOGRAFI','BAHASA INGGRIS','SEJARAH','MATEMATIKA','SOSIOLOGI'])
            // .whereNotIn('mata_pelajaran', ['BAHASA INDONESIA','FISIKA','BIOLOGI','BAHASA INGGRIS','KIMIA','MATEMATIKA'])
            .delete()

            // for (var i = 0; i < data.length; i++) {   
            //     const data1 = await Database
            //         .table('in_matpel_online_gratis_nolog')
            //         .insert({
            //            kelas                :'11 SMA IPS',
            //            mata_pelajaran       :data[i].mata_pelajaran,
            //            jumlah_soal          :data[i].jumlah_soal,
            //            jumlah_soal_berbayar :data[i].jumlah_soal_berbayar,
            //            silabus              :data[i].silabus,
            //            waktu                :data[i].waktu,
            //         })  
            //     }

        return response.json(data)
    }

    // Pertanyaan Pelanggan
    async question ({response,request}){
      const data = await Database
        .query()
        .table('in_question')
        .orderBy('created_at','ASC')
      return response.json(data)
    }

}

module.exports = PelangganController
