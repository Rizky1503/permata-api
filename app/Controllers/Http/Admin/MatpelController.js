'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class MatpelController {

    async kelas({ response }) {
        const kelas = await Database
            .query()
            .table('in_soal')
            .groupBy('kelas')
            .pluck('kelas')
        return response.json(kelas)
    }

    async mapel({ params, response }) {
        const mapel = await Database
            .query()
            .table('in_soal')
            .where('kelas', params.id.replace(/%20/g, ' '))
            .groupBy('nama_matpel')
            .pluck('nama_matpel')
        return response.json(mapel)
    }


    async silabus({ params, response }) {

        const mapel = await Database
            .query()
            .table('in_soal')
            .select('kelas', 'nama_matpel', 'silabus', 'keterangan')
            .where('kelas', params.kelas.replace(/%20/g, ' '))
            .where('nama_matpel', params.mapel.replace(/%20/g, ' '))
            .groupBy('kelas', 'nama_matpel', 'silabus', 'keterangan')
        return response.json(mapel)
    }


    async confirm_silabus({ params, response }) {

        const silabus = params.silabus.replace(/%20/g, ' ')
        const confirm = await Database
            .table('in_matpel_online')
            .where('kelas', params.kelas.replace(/%20/g, ' '))
            .where('mata_pelajaran', params.mapel.replace(/%20/g, ' '))
            .whereIn('silabus', silabus.split(','))

        return response.json(confirm)
    }

    async soal({ params, response }) {

        const soal = await Database
            .table('in_soal')
            .where('kelas', params.kelas.replace(/%20/g, ' '))
            .where('nama_matpel', params.mapel.replace(/%20/g, ' '))
            .where('silabus', params.silabus.replace(/%20/g, ' '))
            .whereNotNull('soal')
            .whereNotNull('jawaban')
            .orderByRaw('random()')
            .limit(params.limit)

        return response.json(soal)
    }

    async temp({ request, response }) {

        const temps = request.only(['id_soal', 'id_user', 'waktu', 'jawaban_betul'])

        const Cek = await Database
            .table('in_soal_temp')
            .where('id_soal', temps.id_soal)
            .where('id_user', temps.id_user)
            .where('waktu', temps.waktu)
            .count()
            .first()

        if (Cek.count == 0) {
            const data = await Database
                .table('in_soal_temp')
                .insert({
                    id_soal: temps.id_soal,
                    id_user: temps.id_user,
                    waktu: temps.waktu,
                    jawaban_betul: Encryption.encrypt(temps.jawaban_betul)
                })
        }
        return response.status(201).json("Success")

    }

    async remove_temp({ params, response }) {

        const affectedRows = await Database
            .table('in_soal_temp')
            .where('id_user', params.id_user)
            .delete()
    }

    async confirm({ params, response }) {

        const jumlahSoal = await Database
            .table('in_soal_temp')
            .where('id_user', params.id_user)
            .count()
            .first()


        const TotalWaktu = await Database
            .from('in_soal_temp')
            .where('id_user', params.id_user)
            .sum('waktu as total_waktu')
            .first()

        const SemuaSoal = await Database
            .from('in_soal_temp')
            .where('id_user', params.id_user)


        if (TotalWaktu.total_waktu === null) {

            return response.json({
                jumlahSoal: jumlahSoal,
                TotalWaktu: '0',
                data: SemuaSoal,
            })

        } else {

            return response.json({
                jumlahSoal: jumlahSoal,
                TotalWaktu: TotalWaktu.total_waktu,
                data: SemuaSoal,
            })
        }
    }


    async process({ request, response }) {

        const processData = request.only(['id_user', 'keterangan', 'waktu_test', 'status'])

        const Cek = await Database
            .table('in_soal_examp')
            .where('id_user', processData.id_user)
            .where('waktu_test', processData.waktu_test)
            .where('status', processData.status)
            .count()
            .first()

        if (Cek.count == 0) {
            const data = await Database
                .table('in_soal_examp')
                .insert({
                    id_user: processData.id_user,
                    keterangan: processData.keterangan,
                    waktu_test: processData.waktu_test,
                    status: processData.status,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning('id_examp')
            return data[0];
        } else {
            return "0"
        }

    }


    async processSoal({ request, response }) {

        const processData = request.only(['id_soal', 'jawaban_betul', 'id_user', 'id_examp'])

        const Cek = await Database
            .table('in_soal_execute')
            .where('id_soal', processData.id_soal)
            .where('id_user', processData.id_user)
            .where('id_examp', processData.id_examp)
            .count()
            .first()

        if (Cek.count == 0) {
            const data = await Database
                .table('in_soal_execute')
                .insert({
                    id_soal: processData.id_soal,
                    jawaban_betul: processData.jawaban_betul,
                    id_user: processData.id_user,
                    id_examp: processData.id_examp,
                })
        }

        return response.status(201).json("Success")
    }

}

module.exports = MatpelController