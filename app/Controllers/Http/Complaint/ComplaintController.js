'use strict'
const Complaint = use('App/Models/Complaint')


class ComplaintController {

	async store ({request, response}) {

		const productInfo 				= request.only(['id_tiket','id_user_complaint','jenis_produk','keterangan','status']);
		const ComplaintData 			= new Complaint();
		ComplaintData.id_tiket 			= productInfo.id_tiket;
		ComplaintData.id_user_complaint = productInfo.id_user_complaint;
		ComplaintData.jenis_produk 		= productInfo.jenis_produk;
		ComplaintData.keterangan 		= productInfo.keterangan;
		ComplaintData.status 			= productInfo.status;
		await ComplaintData.save()

		return ComplaintData;
	}
	
}

module.exports = ComplaintController
