'use strict'
const Database = use('Database')
const Helpers = use('Helpers')
const Gambar = use('App/Models/Product')
const Basket = use('App/Models/Basket')
const Alamat = use('App/Models/Alamat')
const Order = use('App/Models/OrderModel')


class BelanjaController {

	async kategori({ response, request }) {
        const kategori = await Database
        	.select('kategori')
        	.from('in_ms_kategori_belanja')
        	.where('flag','Produk')
        	.groupBy('kategori')
        	.limit(5)
        return response.json(kategori)	
    }

     async cek_keranjang ({response,params,request}) {
        const cekkeranjang = await Database
            .select('id_pelanggan')
            .from('in_basket')
            .where('id_produk',params.id_pr)
            .where('id_pelanggan',params.id_pg)
            .where('status','Requested')
            .getCount('id_pelanggan')

        const keranjang = await Database
            .select ('qty','harga','total_harga')
            .from('in_basket') 
            .where('id_produk',params.id_pr)
            .where('id_pelanggan',params.id_pg)

        if (cekkeranjang < 1 ) { 
            return response.json({status: 'tidak ada'}) 
        }else{
            return response.json({
                status: 'ada',
                keranjang : keranjang 
            })
        }      
    }

    async keranjang ({response,request,params}){

        const basket = new Basket()
            const keranjangInfo = request.only(['id_produk','harga','qty','total_harga','id_mitra'])
            basket.id_produk = keranjangInfo.id_produk
            basket.id_pelanggan = params.id
            basket.qty = keranjangInfo.qty
            basket.harga = keranjangInfo.harga
            basket.total_harga = keranjangInfo.total_harga
            basket.id_mitra = keranjangInfo.id_mitra
            basket.status = 'Requested'

        await basket.save()
        return response.status(201).json(basket)
    }

    async update_keranjang ({response,params,request}){
        const keranjangInfo = request.only(['qty','total_harga','id_produk','id_pelanggan','id_mitra'])
        const update = await Database
            .table('in_basket')
            .where('id_produk', keranjangInfo.id_produk)
            .where('id_pelanggan', keranjangInfo.id_pelanggan)
            .update('qty', keranjangInfo.qty)
            .update('total_harga', keranjangInfo.total_harga)
    }

    async list_keranjang_mitra ({response,params}){
        const list_keranjang_mitra = await Database
              .select('in_basket.id_mitra','in_mitra.nama')
              .from('in_basket')
              .innerJoin('in_mitra','in_basket.id_mitra','in_mitra.id_mitra')
              .where('id_pelanggan',params.id)
              .where('status','Requested')
              .orderBy('in_basket.created_at','ASC')
        return response.json(list_keranjang_mitra)
    }

    async list_keranjang ({response,params}){
        const list_keranjang = await Basket
            .query()
            .with('relationProduk')
            .where('id_pelanggan',params.id)
            .where('id_mitra',params.id_mr)
            .where('status','Requested')
            .fetch()
        // return response.json(list_keranjang.relationProduk.slug)    
        return response.json(list_keranjang)          
    }

    async hapus_produk ({response,request}){
        const deleteInfo = request.only(['id_produk','id_pelanggan'])
        const hapus_produk = await Database
            .table('in_basket',deleteInfo)
            .where('id_pelanggan',deleteInfo.id_pelanggan)
            .where('id_produk',deleteInfo.id_produk)
            .delete()
    }

    async produk ({response,request}){
    	const produk = await Gambar
    		.query()
            .with('gambarproduk')
            .where('id_master_kategori','24')
            .where('status_product','Aktif')
            .limit(4)
            .fetch()
    	return response.json(produk)	
    }

    async gambar_produk ({response,request}){
    	const gambar = await Gambar.find(1)
    	const posts = await gambar
    		.gambarproduk()
    		.fetch()
    	return response.json(posts)	
    }

    async detail_produk ({ response,request,params }) {
    	const detail_produk = await Gambar
	    	.query()
            .with('mitra')
            .with('gambarproduk')
	    	.where('id_master_kategori','24')
	    	.where('slug',params.id)
            .fetch()
    
	    return response.json(detail_produk)	
    }

    async provinsi ({response}) {
        let provinsi = await Alamat
        .query()
        .select('provinsi')
        .groupBy('provinsi')
        .pluck('provinsi')
        .orderBy('provinsi','ASC')        
        return response.json(provinsi)
    }

    async kota ({params, response}) {
        let kota = await Alamat
        .query()
        .select('kota')
        .where('provinsi', '=', params.id.replace(/%20/g, ' '))
        .groupBy('kota')
        .pluck('kota')
        .orderBy('kota','ASC')
        return response.json(kota)
    
    }

    async cost ({params, response}) {
        let kode_pos = await Alamat
        .query()
        .select('kode_pos')
        .where('kota', '=', params.id.replace(/%20/g, ' '))
        .groupBy('kode_pos')
        .pluck('kode_pos')
        .orderBy('kode_pos','ASC')
        return response.json(kode_pos)  

    }

    async pembayaran ({ request,response }){
        function appendLeadingZeroes(n){
            if(n <= 9){
              return "0" + n;
            }
            return n
        }
     
        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())      
     
        const lastProduk = await Database.select(Database.raw('substr(id_order,12,30) as id_order'))
            .from('in_order')
            .orderBy(Database.raw('substr(id_order,12,30)'), 'desc')
            .first();

        let lastProdukNumber = null;
     
        if (lastProduk ) {
     
            lastProdukNumber = 'INV'+ formatted_date + ++lastProduk.id_order;
        } else {
     
            lastProdukNumber = 'INV'+ formatted_date +'1000000001';
     
        }

        const requested  = request.only(['id_pelanggan','id_mitra','keterangan','key'])

        const InsertData = new Order()
                        InsertData.id_order        = lastProdukNumber,
                        InsertData.id_user_order   = requested.id_pelanggan,
                        InsertData.id_mitra        = requested.id_mitra,
                        InsertData.product         = 'Belanja',
                        InsertData.status_order    = 'Requested',
                        InsertData.keterangan      = requested.keterangan,
                        InsertData.kondisi         = requested.keterangan,
                    await InsertData.save()

        const store = await Database
            .table('in_basket')
            .where('id_pelanggan',requested.key)
            .where('id_mitra',requested.id_mitra)
            .where('status','Requested')
            .update('id_invoice',lastProdukNumber)
            .update('status','Pending')
            .update('id_pelanggan',requested.id_pelanggan)

        const Notification_CS= await Database
        .table('in_notifikasi_member')
        .insert({
            id_user_request_notifikasi: requested.id_pelanggan,
            id_user_receive_notifikasi:'',
            id_invoice:InsertData.id_order,
            produk_notifikasi:'Privat',
            status_notifikasi:'Baru',
            keterangan:'requested les privat',
            created_at: current_datetime,
            updated_at: current_datetime,
        })

        const Notification_Mitra= await Database
        .table('in_notifikasi_member')
        .insert({
            id_user_request_notifikasi:'',
            id_user_receive_notifikasi:requested.id_mitra,
            id_invoice:InsertData.id_order,
            produk_notifikasi:'Privat',
            status_notifikasi:'Baru',
            keterangan:'requested les privat',
            created_at: current_datetime,
            updated_at: current_datetime,
        })

        return response.json(InsertData)

    }

    async list_bayar ({ response, params }) {
        const list_keranjang = await Basket
            .query()
            .with('relationProduk')
            .where('id_pelanggan',params.id_pg)
            .where('id_mitra',params.id_mr)
            .where('id_invoice',params.id_inv)
            .where('status','Pending')
            .fetch()

        const harga = await Database
            .select('keterangan')
            .from('in_order')
            .where('id_order',params.id_inv)
            .where('id_user_order',params.id_pg)
            .where('id_mitra',params.id_mr)

        return response.json({ list_keranjang : list_keranjang,
                                harga : harga })
    }

    async update_order ({ response,request,params }){
        const requested  = request.only(['id_pelanggan','id_invoice'])

        const update_order = await Database
            .table('in_order')
            .where('id_order',requested.id_invoice)
            .where('id_user_order',requested.id_pelanggan)
            .update('status_order','Pending')

        const update_basket = await Database
            .table('in_basket')
            .where('id_invoice',requested.id_invoice)
            .update('status','Bayar')

        const ambil_produk = await Database
        .select('id_produk','qty')
        .from('in_basket')
        .where('id_invoice',requested.id_invoice)

        for (var i = 0; i < ambil_produk.length; i++) {
            let ambil = ambil_produk[i].id_produk
            let qty = ambil_produk[i].qty

        const stock = await Database
            .select('stok')
            .from('in_produk')
            .where('id_produk',ambil)
            .first()

        const kurang = stock.stok - qty;

        const update = await Database
            .table('in_produk')
            .where('id_produk',ambil)
            .update('stok', kurang)        
        }   
    }

    
}
module.exports = BelanjaController