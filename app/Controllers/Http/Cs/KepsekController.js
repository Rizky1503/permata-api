'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const randomstring = use("randomstring");


class KepsekController {

//tambah mitra
    async store_mitra({response,request}){
        function appendLeadingZeroes(n) {
            if (n <= 9) {
                return "0" + n;
            }
            return n
        }

        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() + '' + appendLeadingZeroes(current_datetime.getMonth() + 1) + '' + appendLeadingZeroes(current_datetime.getDate())

        const lastProduk = await Database.select(Database.raw('substr(nip,11,30) as nip'))
            .from('in_user')
            .orderBy(Database.raw('substr(nip,11,30)'), 'desc')
            .first();

        let lastProdukNumber = null;

        if (lastProduk) {

            lastProdukNumber = 'MT' + formatted_date + ++lastProduk.nip;
        } else {

            lastProdukNumber = 'MT' + formatted_date + '1000000001';

        }

        const Inputs = request.only(['nama','password','no_telpon'])
        const data = await Database
            .table('in_user')
            .insert({
                nip : lastProdukNumber,
                nama: Inputs.nama, 
                no_telpon : Inputs.no_telpon,
                password: Inputs.password, 
                id_role: '4',  
            })

    }

//count asal sekolah
    async count_sekolah({response,request}){
        const Inputs = request.only(['tingkat_sekolah','nama_sekolah','alamat_sekolah'])
        const count = await Database
            .count()
            .first()    
            .table('in_user_tampung_sekolah')
            .where('tingkat_sekolah',Inputs.tingkat_sekolah)
            .where('nama_sekolah',Inputs.nama_sekolah)
            .where('alamat_sekolah',Inputs.alamat_sekolah)
        return response.json(count)
    }

//list mitra
    async list_mitra({response,request}){
        const data = await Database
            .select('nip','nama')
            .from('in_user')
            .where('id_role','4')
        return response.json(data)
    }

//tambah sekolah mitra
    async tambah_sekolah({response,request}){
        const Inputs = request.only(['id_user','tingkat_sekolah','nama_sekolah','alamat_sekolah'])
        const data = await Database
            .table('in_user_tampung_sekolah')
            .insert({
                id_user: Inputs.id_user, 
                tingkat_sekolah: Inputs.tingkat_sekolah, 
                nama_sekolah: Inputs.nama_sekolah, 
                alamat_sekolah: Inputs.alamat_sekolah, 
            })
    } 

//list sekolah mitra
    async listsekolah ({response,request}){
        const Inputs = request.only(['id'])
        const listsekolah = await Database
            .select('tingkat_sekolah','nama_sekolah','alamat_sekolah')
            .from('in_user_tampung_sekolah')
            .where('id_user', Inputs.id )
            .orderBy('nama_sekolah','ASC')
        return response.json(listsekolah)
    }

//list murid terdaftar
    async listmurid ({response,request}){
        const Inputs = request.only(['tingkat_sekolah','asal_sekolah','kota_sekolah'])
        const list = await Database
            .select('in_asal_sekolah.id_order','in_order.id_user_order')
            .table('in_asal_sekolah')
            .innerJoin('in_order','in_asal_sekolah.id_order','in_order.id_order')
            .innerJoin('in_pelanggan','in_order.id_user_order','in_pelanggan.id_pelanggan')
            .where('in_order.status_order','In Progres')
            .where('in_asal_sekolah.tingkat_sekolah',Inputs.tingkat_sekolah)
            .where('in_asal_sekolah.asal_sekolah',Inputs.asal_sekolah)
            .where('in_asal_sekolah.kota_sekolah',Inputs.kota_sekolah)
        return response.json(list)
    }

//nama murid dari list murid
    async detailmurid ({ response,request }){
        const Inputs = request.only(['id_pelanggan'])
        const murid = await Database
            .select('*')
            .from('in_pelanggan')
            .where('id_pelanggan',Inputs.id_pelanggan)
        return response.json(murid)
    }

//asal sekolah murid
    async asalsekolahmurid ({ response,request }){
        const data = await Database
            .select('in_asal_sekolah.id_order',
                    'in_asal_sekolah.tingkat_sekolah',
                    'in_asal_sekolah.asal_sekolah',
                    'in_asal_sekolah.kota_sekolah',
                    'in_order.keterangan',
                    'in_order.kondisi',
                    'in_pelanggan.nama',
                    'in_pelanggan.email',
                    'in_pelanggan.no_telpon',
                   )
            .from('in_asal_sekolah')
            .innerJoin('in_order','in_asal_sekolah.id_order','in_order.id_order')
            .innerJoin('in_pelanggan','in_order.id_user_order','in_pelanggan.id_pelanggan')
            .orderBy('in_asal_sekolah.id_order','ASC')
        return response.json(data)
    }

// daftar sekolah per kota
    async daftarsekolah ({ response,request }){
        const Inputs = request.only(['kota_sekolah'])
        const data = await Database
            .select('tingkat_sekolah','asal_sekolah')
            .from('in_asal_sekolah')
            .where('kota_sekolah', Inputs.kota_sekolah)
            .groupBy('tingkat_sekolah','asal_sekolah')
        return response.json(data)
    }

// daftar sekolah per kota dan tingkat
    async daftarsekolahtingkat ({ response,request }){
        const Inputs = request.only(['tingkat_sekolah','kota_sekolah'])
        const data = await Database
            .select('tingkat_sekolah','asal_sekolah')
            .from('in_asal_sekolah')
            .where('tingkat_sekolah', Inputs.tingkat_sekolah)
            .where('kota_sekolah', Inputs.kota_sekolah)
            .groupBy('tingkat_sekolah','asal_sekolah')
        return response.json(data)
    }  

//update sekolah murid
    async updatesekolahmurid ({response,request}){
        const Inputs = request.only(['asal_sekolah_new','asal_sekolah_old','tingkat_sekolah'])
        const data = await Database
            .table('in_asal_sekolah')
            .where('asal_sekolah', Inputs.asal_sekolah_old)
            .where('tingkat_sekolah', Inputs.tingkat_sekolah)
            .update({ asal_sekolah : Inputs.asal_sekolah_new })
    }  

}

module.exports = KepsekController