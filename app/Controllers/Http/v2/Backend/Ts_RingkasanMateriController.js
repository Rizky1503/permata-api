'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Env = use('Env')
// var ImageKit = require("imagekit");
// var imagekit = new ImageKit({
//     publicKey : Env.get('CDN_publickey','public_P9cO9h1sNXj18aNt5wZ8J3LKCpQ='),
//     privateKey : Env.get('CDN_privateKey','private_D+ZR78QVbTF6nhfcJG7kvrtCgG0='),
//     urlEndpoint : Env.get('CDN_urlEndpoint','https://ik.imagekit.io/pmjr/'),
// });

class Ts_RingkasanMateriController {

	async storeRingkasanMateri ({request,response}){
		const Inputs = request.only(['id_content','title','file','created_by','status','base_image'])
		
		if(Inputs.status == '0'){
			const store = await Database
				.insert({
					id_content		: Inputs.id_content,
					title			: Inputs.title,
					file			: Inputs.file,
					free			: true,
					created_by		: Inputs.created_by,
					created_at 	 	: new Date(),
					updated_at 	 	: new Date(),
				})
				.table('v2.ts_ringkasan_materi')
		}else{
			const store = await Database
				.insert({
					id_content		: Inputs.id_content,
					title			: Inputs.title,
					file			: Inputs.file,
					created_by		: Inputs.created_by,
					created_at 	 	: new Date(),
					updated_at 	 	: new Date(),
				})
				.table('v2.ts_ringkasan_materi')
		}
	}

	async listRingkasanMateri ({params,response}){
		const list = await Database
			.table('v2.ts_ringkasan_materi')
			.where('id_content',params.id)
			.orderBy('title','ASC')
		return list;
	}

	async deleteRingkasanMateri({request}){
		const Inputs = request.only(['id_ringkasan_materi'])
		const hapus = await Database
			.table('v2.ts_ringkasan_materi')
			.where('id_ringkasan_materi',Inputs.id_ringkasan_materi)
			.delete()
	}

}

module.exports = Ts_RingkasanMateriController
