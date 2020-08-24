'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')

class PaketController {

	async list_old ({response}) {
		const paket = await Database
			.select('in_soal_langganan_paket.*','in_soal_langganan_paket_harga.amount')
		  	.table('in_soal_langganan_paket')
		  	.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
		  	.orderBy('in_soal_langganan_paket.short','ASC')

		const dataVoucher = [{
			id_tutor: 1,
			tutor: '1. Pilih Paket / Kelas yang ingin dibeli dan lama berlangganan'
		},{
			id_tutor: 2,
			tutor: '2. Pilih kode voucher #HARDIKNAS untuk 30 pendaftar pertama (pastikan harga terpotong)'
		},{
			id_tutor: 3,
			tutor: '3. Pilih Metode Pembayaran (Transfer Manual atau Online Payment (BNI, PERMATA, GOPAY)'
		}]

		return response.json({
            	paket_ready  : 'login dulu',
            	paket 		 : paket,
            	voucher 	 : dataVoucher,
        	}) 
	}

	async detail_old ({params, response}) {
		const paket = await Database
			.query()
		  	.table('in_paket_bimbel_online')
		  	.where('id_paket', params.id)
		  	.first()
		return response.json(paket)
	}

	async list ({response,params}) {
		const id_ready = await Database
			.select('id_package_user')
			.table('in_order')
			.where('id_user_order',params.id)
			.where('status_order','In Progres')
			.whereNotNull('id_package_user')
			.where('product','BO')

		if (id_ready.length > 0) {
			var Tampung_id_ready = [];
	        for (var i = 0; i < id_ready.length; i++) {
	            Tampung_id_ready.push(id_ready[i].id_package_user);                        
	        }
			      
		    const findDuplicates  = arr => arr.filter((item, index) => arr.indexOf(item) == index)
		    const alreadyId       = findDuplicates(Tampung_id_ready);

		    const paket_ready = await Database
			  	.select('in_soal_langganan_paket.*','in_soal_langganan_paket_harga.amount')
			  	.table('in_soal_langganan_paket')
			  	.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
			  	.whereIn('in_soal_langganan_paket.id_paket',alreadyId)
			  	.orderBy('in_soal_langganan_paket.short','ASC')


			const paket = await Database
			  	.select('in_soal_langganan_paket.*','in_soal_langganan_paket_harga.amount')
			  	.table('in_soal_langganan_paket')
			  	.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
			  	.whereNotIn('in_soal_langganan_paket.id_paket',alreadyId)
			  	.orderBy('in_soal_langganan_paket.short','ASC')

			const dataVoucher = [{
				id_tutor: 1,
				tutor: '1. Pilih Paket / Kelas yang ingin dibeli dan lama berlangganan'
			},{
				id_tutor: 2,
				tutor: '2. Pilih kode voucher #HARDIKNAS untuk 30 pendaftar pertama (pastikan harga terpotong)'
			},{
				id_tutor: 3,
				tutor: '3. Pilih Metode Pembayaran (Transfer Manual atau Online Payment (BNI, PERMATA, GOPAY)'
			}]

			return response.json({
	            	paket_ready  : paket_ready,
	            	paket 		 : paket,
	            	voucher 	 : dataVoucher,
	        	}) 
		}else{
			const paket = await Database
				.select('in_soal_langganan_paket.*','in_soal_langganan_paket_harga.amount')
			  	.table('in_soal_langganan_paket')
			  	.innerJoin('in_soal_langganan_paket_harga','in_soal_langganan_paket.id_paket','in_soal_langganan_paket_harga.id_paket')
			  	.orderBy('in_soal_langganan_paket.short','ASC')

			const dataVoucher = [{
				id_tutor: 1,
				tutor: '1. Pilih Paket / Kelas yang ingin dibeli dan lama berlangganan'
			},{
				id_tutor: 2,
				tutor: '2. Pilih kode voucher #HARDIKNAS untuk 30 pendaftar pertama (pastikan harga terpotong)'
			},{
				id_tutor: 3,
				tutor: '3. Pilih Metode Pembayaran (Transfer Manual atau Online Payment (BNI, PERMATA, GOPAY)'
			}]

			return response.json({
	            	paket_ready  : 'login dulu',
	            	paket 		 : paket,
	            	voucher 	 : dataVoucher,
	        	}) 
		}
	}


	async detail ({params, response}) {
		const paket = await Database
			.query()
		  	.table('in_soal_langganan_paket')
		  	.where('id_paket', params.id)
		  	.first()

		const order = await Database
			.query()
			.table('in_order')
			.where('id_package_user',params.id)
			.where('id_user_order',params.pelanggan)

		return response.json({
	            	paket  : paket,
	            	order  : order,
	        	}) 
	}

	async duration_paket({params,response}){
		const duration = await Database
			.select('id','brief','duration')
			.table('in_soal_langganan_paket_harga')
			.where('id_paket', params.id)
			.orderBy('duration','ASC')
		return response.json(duration)
	}

	async detail_paket({request,response}){
		const Inputs    = request.only(['id_paket'])
		const duration = await Database
			.query()
			.table('in_soal_langganan_paket_harga')
			.where('id', Inputs.id_paket)
			.first()
		return response.json(duration)
	}


	async paket_aktif ({request, response}) {
		const Inputs    = request.only(['id_pelanggan','tingkat','mata_pelajaran', 'harga'])   
        const Data      = await Database
        .query()
        .table('in_order')      
        .where('id_user_order','=',Inputs.id_pelanggan)
        // .whereIn('status_order', ['Pending','In Progres','Cek_Pembayaran','Rejected'])
        .where('product','=','BO')
        .where('status_order','In Progres')
        .where('keterangan', Inputs.tingkat)
        .where('kondisi', Inputs.mata_pelajaran)
        .first()
        .count()
		return response.json(Data)
	}

	

	async cek_berlangganan ({params, response}) {

		const Data      = await Database
        .query()
        .table('in_order')      
        .where('id_user_order', params.id_user)
        .where('product', 'Bimbel Online')
        .where('status_order', 'In Progres')
        .count()
        .first()

        return response.json(Data)
	}
}

module.exports = PaketController
