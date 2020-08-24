'use strict'
const Database = use('Database')
const Product = use('App/Models/Product')
const ImageProduk = use('App/Models/ImageProduk')
const randomstring = use("randomstring")
const Logger = use('Logger')


class BelanjaController {

    async persyaratan({ params, response }) {
        let List = await Database.from('in_persyaratan_mitra')         
                .where('id_mitra', params.id_mitra)   
                .count()
                .first()
        if (List.count < 1) {

            const Data = await Database
              .table('in_persyaratan_mitra')
              .insert({
                id_mitra: params.id_mitra,
                id_ms_kategori: params.id_mitra_produk,
                created_at: new Date(),
                updated_at: new Date(),
            })


            let List = await Database.from('in_persyaratan_mitra')         
                .where('id_mitra', params.id_mitra)   
                .first()
            return response.json(List)

        }else{

            let List = await Database.from('in_persyaratan_mitra')         
                .where('id_mitra', params.id_mitra)   
                .first()
            return response.json(List)
        }

        
    }

    async persyaratan_store({ request, response }) {

        const Inputs    = request.only(['id_mitra','nama_bank','nama_pemilik_rekening','no_rekening'])
        const Data = await Database
          .table('in_persyaratan_mitra')
          .where('id_mitra', Inputs.id_mitra)
          .update({
            nama_bank: Inputs.nama_bank,
            pemilik_rekening: Inputs.nama_pemilik_rekening,
            no_rekening: Inputs.no_rekening,

        })   

        return Data;    
    }

    async list_product({ request, response }) {         

        const pagination = request.only(['page', 'limit','order','id_mitra'])

        const page = parseInt(pagination.page) ;
        const limit = parseInt(pagination.limit);
        const order = pagination.order; 
        const id_mitra = pagination.id_mitra; 
    
        const Data = await Database
        .select('nama_produk','stok','status_product','id_produk')
        .from('in_produk')
        .where('id_mitra','=', id_mitra) 
        .where('id_master_kategori','=', '24')
        .orderBy(order,'desc')
        // .paginate(page, limit)

        return response.json(Data)

    }


    async create_first({ params, response }) {         

        function appendLeadingZeroes(n){
            if(n <= 9){
              return "0" + n;
            }
            return n
        }
  
        let current_datetime = new Date()
        let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())        
  
        const lastProduk = await Database.select(Database.raw('substr(id_produk,11,30) as id_produk'))
          .from('in_produk')
          .orderBy(Database.raw('substr(id_produk,11,30)'), 'desc')
          .first();
        let lastProdukNumber = null;
        if (lastProduk ) {      
            lastProdukNumber = 'PD'+ formatted_date + ++lastProduk.id_produk;
        } else {
            lastProdukNumber = 'PD'+ formatted_date +'1000000001';      
        }

        const CountRow      = await Database
            .query()
            .table('in_produk')      
            .where('id_mitra','=',params.id_mitra)
            .where('id_master_kategori','=','24')
            .where('status_product', 'new')
            .count()
            .first()

        if (CountRow.count == 0) {

            const product               = new Product()
            product.id_produk           = lastProdukNumber
            product.id_mitra            = params.id_mitra
            product.id_master_kategori  = '24'
            product.nama_produk         = 'draf product'
            product.alamat              = 'draf product'
            product.status_product      = 'new'
            await product.save()

            return response.status(201).json(product)

        } else {
            const product      = await Database
            .query()
            .table('in_produk')      
            .where('id_mitra','=',params.id_mitra)
            .where('id_master_kategori','=','24')
            .where('status_product', 'new')
            .first()

            return response.status(201).json(product)
        }        
                        

    }

    async list_category({response }) {         
       
        const Data = await Database
        .from('in_ms_kategori_belanja')
        .where('sub_kategori','Produk')

        return response.status(201).json(Data)

    }

    async list_sub_category({params, response }) {         
       
        const Data = await Database
        .from('in_ms_kategori_belanja')
        .where('sub_kategori',params.sub_id.replace(/%20/g, ' '))

        return response.status(201).json(Data)

    }

    async store_product_belanja({request, response }) {         
       
        const Inputs = request.only(['id_product', 'nama_barang','kategori_barang','harga','stok','kondisi_barang','barang_import','keterangan','lat','long']);

        try {
            const Data = await Product.find(Inputs.id_product)
            Data.nama_produk    = Inputs.nama_barang;
            Data.kategori_barang= Inputs.kategori_barang;
            Data.negara         = "Indonesia";
            Data.lat            = Inputs.lat;
            Data.long           = Inputs.long;
            Data.harga          = Inputs.harga;
            Data.stok           = Inputs.stok;
            Data.kondisi_barang = Inputs.kondisi_barang;
            Data.barang_import  = Inputs.barang_import;
            Data.keterangan     = Inputs.keterangan;
            Data.status_product = 'Aktif';
            await Data.save() // slug re-generated
            return response.status(201).json({
                status: "Finish",
                error: 'not error',
            });
        }
        catch(error) {
            return response.status(201).json({
                status: "Gagal",
                error: error,
            });
        }
    }


    async store_image_product({request, response }) {         
       
        const Inputs = request.only(['id_produk', 'gambar_produk']);
        try {
            const product               = new ImageProduk();
            product.id_produk           = Inputs.id_produk;
            product.gambar_produk       = Inputs.gambar_produk;
            await product.save()
            return response.status(201).json({
                status: "Finish",
                error: product,
            });
        }
        catch(error) {
            return response.status(201).json({
                status: "Gagal",
                error: error,
            });
        }
    }

    async remove_image_product({request, response }) {         
       
        const Inputs = request.only(['id_gambar']);
        try {
            const Data = await ImageProduk.find(Inputs.id_gambar)
            await Data.delete()
            return response.status(201).json({
                status: "Finish",
                error: Inputs.id_gambar,
            });
        }
        catch(error) {
            return response.status(201).json({
                status: "Gagal",
                error: error,
            });
        }
    }

    async remove_all_image_product({params, response }) {         

        try {
            
            const affectedRows = await Database
              .table('in_gambar_produk')
              .where('id_produk', params.id)
              .delete()
            return response.status(201).json({
                status: "Finish",
                error: 'false',
            });
        }
        catch(error) {
            return response.status(201).json({
                status: "Gagal",
                error: error,
            });
        }
    }


    async edit ({ response,params }) {

        const detail_produk = await Database
            .table('in_produk')
            .where('id_produk',params.id)
            .first()
                
        return response.json(detail_produk) 
    }


    async gambar ({ response,params }) {

        const detail_produk = await Database
            .table('in_gambar_produk')
            .where('id_produk',params.id)

        //log activity
        Logger.info('upload gambar')

                
        return response.json(detail_produk) 
    }

}

module.exports = BelanjaController