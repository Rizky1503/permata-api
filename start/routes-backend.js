'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/


/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const Helpers = use('Helpers')

//CS
Route.group(() => {

    //Private
    Route.get('private', 'Cs/PrivateController.getData')
    Route.put('private/:id', 'Cs/PrivateController.StatusUpdate')
    Route.get('private/id/:id', 'Cs/PrivateController.ById')
    Route.get('private/getidmitra/:id', 'Cs/PrivateController.GetIdMitra')
    Route.get('private/requested', 'Cs/PrivateController.MuridRequested')
    Route.get('private/pending', 'Cs/PrivateController.MuridPending')
    Route.get('private/cekpembayaran', 'Cs/PrivateController.MuridCekPembayaran')
    Route.get('private/inprogres', 'Cs/PrivateController.MuridInProgres')
    Route.get('private/konfirmasi', 'Cs/PrivateController.MuridKonfirmasiUlang')
    Route.get('private/registrasi', 'Cs/PrivateController.MuridRegistrasiUlang')
    Route.get('private/close', 'Cs/PrivateController.MuridClose')
    Route.post('private/deal', 'Cs/PrivateController.Proses')
    Route.get('private/rekomend/:id', 'Cs/PrivateController.Rekomended')
    Route.post('private/notif', 'Cs/PrivateController.StoreNotif')
    Route.post('private/listguru', 'Cs/PrivateController.Listguru')
    Route.get('private/pertemuan/:id', 'Cs/PrivateController.Pertemuan')
    Route.get('private/pertemuanke/:id', 'Cs/PrivateController.Pertemuanke')
    Route.post('private/simpanpertemuan', 'Cs/PrivateController.SimpanPertemuan')
    Route.get('private/bukti/:id', 'Cs/PrivateController.Buktipembayaran')
    Route.put('private/updatepembayaran/:id', 'Cs/PrivateController.Updatepembayaran')
    Route.get('private/kota', 'Cs/PrivateController.Kota')
    Route.post('private/updatemurid', 'Cs/PrivateController.Updatemurid')
    Route.post('private/getmitra', 'Cs/PrivateController.GetMitra')
    Route.get('private/getguru', 'Cs/PrivateController.GetGuru')
    Route.get('private/getguruforkota/:id', 'Cs/PrivateController.GetGuruforKota')
    Route.get('private/getgurufortingkat/:id', 'Cs/PrivateController.GetGuruforTingkat')
    Route.get('private/getgurudetail/:id', 'Cs/PrivateController.GetGuruDetail')
    Route.get('private/detailguru/:id', 'Cs/PrivateController.DetailGuru')
    Route.get('private/getjadwalguru/:id', 'Cs/PrivateController.GetJadwalGuru')
    Route.post('private/UpdateStatusGuru', 'Cs/PrivateController.UpdateStatusGuru')
    Route.get('private/getgurustatus/:id', 'Cs/PrivateController.GetGuruStatus')
    Route.get('private/getgurupertemuan/:id', 'Cs/PrivateController.GetGuruPertemuan')
    Route.get('private/kelas', 'Cs/PrivateController.GetKelas')
    Route.get('private/countkelas', 'Cs/PrivateController.countbykelas')
    Route.get('private/matapelajaran', 'Cs/PrivateController.GetMataPelajaran')
    Route.get('private/jabodetabekme', 'Cs/PrivateController.GetKotaJabodetabek')
    Route.get('private/pilihanguru/:id', 'Cs/PrivateController.PilihanGuru')
    Route.get('private/tanggalpembayaran/:id', 'Cs/PrivateController.TanggalUploadPembayaran')
    Route.get('private/selectguru/:id', 'Cs/PrivateController.selectguru')
    Route.get('private/statusguru/:id', 'Cs/PrivateController.statusguru')
    Route.get('private/guruadamuridatautidak/:id', 'Cs/PrivateController.guruadamuridatautidak')
    Route.get('private/guruInorder/:id', 'Cs/PrivateController.guruInorder')
    Route.post('private/UpdatePertemuan/:id', 'Cs/PrivateController.UpdatePertemuan')
    Route.post('private/notifikasi', 'Cs/PrivateController.notifikasi')
    Route.get('private/countnotifikasiRequested', 'Cs/PrivateController.countnotifikasiRequested')
    Route.get('private/countnotifikasiPending', 'Cs/PrivateController.countnotifikasiPending')
    Route.get('private/countnotifikasiPembayaran', 'Cs/PrivateController.countnotifikasiPembayaran')
    Route.get('private/countnotifikasiProgres', 'Cs/PrivateController.countnotifikasiProgres')
    Route.get('private/countnotifikasiKonfirmasi', 'Cs/PrivateController.countnotifikasiKonfirmasi')
    Route.get('private/countnotifikasiregistrasi', 'Cs/PrivateController.countnotifikasiregistrasi')
    Route.get('private/countnotifikasiClose', 'Cs/PrivateController.countnotifikasiClose')
    Route.get('private/countNotifikasiReceive/:id', 'Cs/PrivateController.countNotifikasiReceive')
    Route.get('private/countNotifikasiRequested/:id', 'Cs/PrivateController.countNotifikasiRequested')
    Route.post('private/updatenotifterbaca', 'Cs/PrivateController.updatenotifterbaca')
    Route.get('private/check_jadwal/:id', 'Cs/PrivateController.check_jadwal')
    Route.get('private/jadwallast/:id', 'Cs/PrivateController.jadwallast')
    Route.get('private/GetGuruAktif', 'Cs/PrivateController.GetGuruAktif')
    Route.get('private/GetGuruTidakAktif', 'Cs/PrivateController.GetGuruTidakAktif')
    Route.get('private/detailpembayaran/:id', 'Cs/PrivateController.detailpembayaran')
    Route.get('private/dashboard', 'Cs/PrivateController.dashboard')
    Route.get('private/exportallguru', 'Cs/PrivateController.ExportAllGuru')
    Route.get('private/exportaktifguru', 'Cs/PrivateController.ExportAktifGuru')
    Route.get('private/exporttidakaktifguru', 'Cs/PrivateController.ExportTidakAktifGuru')
    Route.post('private/new_invoice','Cs/PrivateController.new_invoice')



    //Bimbel
    Route.post('bimbel/tambahkelas', 'Cs/BimbelController.Tambahkelas')
    Route.get('bimbel/kelas', 'Cs/BimbelController.kelas')
    Route.post('bimbel/editmatpel', 'Cs/BimbelController.editmatpel')
    Route.post('bimbel/editwaktu', 'Cs/BimbelController.editwaktu')
    Route.post('bimbel/editwaktuInsoal', 'Cs/BimbelController.editwaktuInsoal')
    Route.get('bimbel/listmatpel', 'Cs/BimbelController.listmatpel')
    Route.post('bimbel/listmatpelbykelas', 'Cs/BimbelController.listmatpelbykelas')
    Route.post('bimbel/Countmatpelbykelas', 'Cs/BimbelController.Countmatpelbykelas')
    Route.post('bimbel/getmaxsoal', 'Cs/BimbelController.getmaxsoal')
    Route.post('bimbel/getmatpel', 'Cs/BimbelController.getMataPelajaran')
    Route.post('bimbel/setsoal', 'Cs/BimbelController.setSoal')
    Route.post('bimbel/getsilabus', 'Cs/BimbelController.getSilabus')
    Route.get('bimbel/countsoal/:kelas/:mata_pelajaran/:bab', 'Cs/BimbelController.Countsoal')
    Route.get('bimbel/countwaktu/:kelas/:mata_pelajaran', 'Cs/BimbelController.Countwaktu')
    Route.post('bimbel/getwaktu', 'Cs/BimbelController.getwaktu')
    Route.get('bimbel/soalbyall', 'Cs/BimbelController.soalbyall')
    Route.post('bimbel/soalbykelas', 'Cs/BimbelController.soalbykelas')
    Route.post('bimbel/soalbymatapelajaran', 'Cs/BimbelController.soalbymatapelajaran')
    Route.post('bimbel/soalbysilabus', 'Cs/BimbelController.soalbysilabus')
    Route.post('bimbel/countlastSoal', 'Cs/BimbelController.countlastSoal')
    Route.get('bimbel/listmurid', 'Cs/BimbelController.listmurid')
    Route.get('bimbel/exlistmurid/:id', 'Cs/BimbelController.exlistmurid')
    Route.post('bimbel/detailmurid', 'Cs/BimbelController.detailmurid')
    Route.post('bimbel/getsoaltampil', 'Cs/BimbelController.getsoaltampil')
    Route.get('bimbel/nilaimurid/:id', 'Cs/BimbelController.nilaimurid')
    Route.post('bimbel/hapus_soal', 'Cs/BimbelController.hapus_soal')


    //Bimbel NoLog
    Route.get('bimbelNolog/getkelas', 'Cs/BimbelNologController.getkelas')
    Route.post('bimbelNolog/getmatpel', 'Cs/BimbelNologController.getmatpel')
    Route.post('bimbelNolog/storeSoal', 'Cs/BimbelNologController.storeSoal')


    //Mitra
    Route.get('mitra/listmitra', 'Cs/MitraController.listMitra')
    Route.get('mitra/listmitraprivate', 'Cs/MitraController.listmitraprivate')
    Route.post('mitra/storemitra', 'Cs/MitraController.storeMitra')
    Route.post('mitra/updatemitra', 'Cs/MitraController.updateMitra')
    Route.get('mitra/gettingkat', 'Cs/MitraController.getTingkat')
    Route.post('mitra/getmatapelajaran', 'Cs/MitraController.getMataPelajaran')
    Route.get('mitra/getkota', 'Cs/MitraController.getKota')
    Route.post('mitra/storeproduk', 'Cs/MitraController.storeProduk')
    Route.post('mitra/storeharga', 'Cs/MitraController.storeHarga')
    Route.get('mitra/getmitra/:id', 'Cs/MitraController.getmitra')
    Route.get('mitra/dashboard', 'Cs/MitraController.dashboard')
    Route.get('mitra/listpelanggan', 'Cs/MitraController.listpelanggan')
    Route.post('mitra/sendmail','Cs/MitraController.email_send_mitra') 
    Route.get('mitra/listmitra/:id', 'Cs/MitraController.listMitraId')
    Route.get('mitra/password', 'Cs/MitraController.lihatpassword')

    //BimbelOffline
    Route.get('bimbeloffline/getmitra', 'Cs/BimbelOfflineController.getmitra')
    Route.get('bimbeloffline/provinsi', 'Cs/BimbelOfflineController.provinsi')
    Route.post('bimbeloffline/kota', 'Cs/BimbelOfflineController.kota')
    Route.post('bimbeloffline/storeProduk', 'Cs/BimbelOfflineController.storeProduk')
    Route.get('bimbeloffline/listPusat', 'Cs/BimbelOfflineController.listPusat')
    Route.post('bimbeloffline/storeMitra', 'Cs/BimbelOfflineController.storeMitra')

    //GratosSoalNolog
    Route.get('gratisNoLog/tingkat', 'Cs/BimbelGratisController.GetTingkat')
    Route.post('gratisNoLog/matpel', 'Cs/BimbelGratisController.GetMatpel')
    Route.get('gratisNoLog/soal', 'Cs/BimbelGratisController.SoalGratis')
    Route.post('gratisNoLog/soalfiltertingkat', 'Cs/BimbelGratisController.SoalGratisFilterTingkat')
    Route.post('gratisNoLog/soalfiltermatpel', 'Cs/BimbelGratisController.SoalGratisFilterMatpel')
    Route.post('gratisNoLog/hapussoal', 'Cs/BimbelGratisController.HapusSoal')
    Route.post('bimbel/IdMatpel', 'Cs/BimbelGratisController.IdMatpel')


    //Kepala Sekolah
    Route.post('kepsek/store_mitra', 'Cs/KepsekController.store_mitra')
    Route.get('kepsek/list_mitra' , 'Cs/KepsekController.list_mitra')
    Route.post('kepsek/listmurid', 'Cs/KepsekController.listmurid')
    Route.post('kepsek/detailmurid', 'Cs/KepsekController.detailmurid')
    Route.post('kepsek/listsekolah', 'Cs/KepsekController.listsekolah')
    Route.post('kepsek/tambah_sekolah', 'Cs/KepsekController.tambah_sekolah')
    Route.post('kepsek/count_sekolah', 'Cs/KepsekController.count_sekolah')
    Route.get('kepsek/asalsekolahmurid', 'Cs/KepsekController.asalsekolahmurid')
    Route.post('kepsek/daftarsekolah', 'Cs/KepsekController.daftarsekolah')
    Route.post('kepsek/daftarsekolahtingkat', 'Cs/KepsekController.daftarsekolahtingkat')
    Route.post('kepsek/updatesekolahmurid', 'Cs/KepsekController.updatesekolahmurid')

    //pelanggan
    Route.get('pelanggan/survey_pelanggan' , 'Cs/PelangganController.survey_pelanggan')
    Route.get('pelanggan/count_survey_pelanggan/:sumber' , 'Cs/PelangganController.count_survey_pelanggan')
    Route.get('pelanggan/count_survey_pelanggan_lainnya' , 'Cs/PelangganController.count_survey_pelanggan_lainnya')
    Route.get('pelanggan/list_pelanggan' , 'Cs/PelangganController.list_pelanggan')
    Route.get('pelanggan/day_register' , 'Cs/PelangganController.day_register')
    
    Route.get('pelanggan/list_login_location' , 'Cs/PelangganController.list_login_location')
    Route.post('pelanggan/store_login_location' , 'Cs/PelangganController.store_login_location')

    Route.get('pelanggan/question' , 'Cs/PelangganController.question')

    //duplicate
    Route.get('pelanggan/duplicate_soal_gratis' , 'Cs/PelangganController.duplicate_soal_gratis')
    Route.get('pelanggan/duplicate_matpel_gratis' , 'Cs/PelangganController.duplicate_matpel_gratis')
    
        
    
    
}).prefix('api/v1/cs')

//admin
Route.group(() => {

    //Kategori
    Route.post('bimbeloffline/getmitra', 'Cs/BimbelOfflineController.getmitra')

}).prefix('api/v1/admin')

