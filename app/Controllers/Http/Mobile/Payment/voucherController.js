'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Encryption = use('Encryption')
const Pelanggan = use('App/Models/Pelanggan')
const randomstring = use("randomstring");
const Order = use('App/Models/OrderModel')
const fetch = require("node-fetch");
const base64 = require('base-64');
const moment = require('moment');

class voucherController {

	async list ({request, response}) {

		const data = request.only(['product','id_paket', 'id_pelanggan'])

		const use_voucher = await Database
			.query()
		  	.table('in_voucher_use')
		  	.innerJoin('in_voucher_already', 'in_voucher_already.id_voucher_already', 'in_voucher_use.id_voucher_already')	
		  	.where('in_voucher_already.id_paket',data.id_paket)
		  	.count()
		  	.first()

		const change_status_voucher = await Database
			.query()
		  	.table('in_voucher_already')
		  	.where('product',data.product)
		  	.where('active',1)
		  	.where('limit', '<=', use_voucher.count)
		  	.update({
		  		active: 0
		  	})

		const voucherList = await Database
			.select('in_voucher_already.id_voucher_already','in_voucher_already.id_voucher','in_voucher_already.limit','in_voucher_already.id_paket','in_voucher_already.product','in_voucher_already.active','in_voucher.flag','in_voucher.nominal','in_voucher.voucher_code','in_voucher.detail','in_voucher.term_condition','in_voucher.expired_date','in_soal_langganan_paket.nama_paket')
		  	.table('in_voucher_already')
		  	.innerJoin('in_voucher', 'in_voucher.id_voucher', 'in_voucher_already.id_voucher')	
		  	.innerJoin('in_soal_langganan_paket', 'in_soal_langganan_paket.id_paket', 'in_voucher_already.id_paket')	
		  	.where('start_date', '<=', new Date())
		  	.where('expired_date', '>=', new Date())
		  	.where('product',data.product)
		  	.where('active',1)

		for (var i = 0; i < voucherList.length; i++) {
			if (voucherList[i].flag == "diskon") {
				voucherList[i]['title'] = voucherList[i].voucher_code+" Diskon "+voucherList[i].nominal+"% " + voucherList[i].nama_paket;				
			}else if (voucherList[i].flag == "potongan") {
				voucherList[i]['title'] = voucherList[i].voucher_code+" Potongan Rp. "+voucherList[i].nominal +" "+ voucherList[i].nama_paket;
			}

			voucherList[i]['expired_date'] = "Berakhir sampai tanggal "+ moment(voucherList[i].expired_date).format('D MMMM Y')
		}

		const command = [];
		if (voucherList.length > 0) {
			command[0] = "Tersedia "+voucherList.length+" voucher untuk kamu"
		}else{
			command[0] = ''
		}
		const result = ({
			title : command[0],
			data  : voucherList,
		})		

		return response.json({
			status : 'true',
			responses : '200',
			data:result			
		})		
	}
	
}

module.exports = voucherController
