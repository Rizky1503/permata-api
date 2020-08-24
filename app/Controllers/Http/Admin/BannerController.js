'use strict'
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class IklanController {

    async index({ response }) {

        let iklan = await Iklan.all()
        return response.json(iklan)
    }

    async store({ request, response }) {
        let current_datetime = new Date()

        const status = request.input('status')
        const banner = request.file('banner')
        let filename = ""

        if (banner !== null) {
            let path = "images/Banner"
            filename = randomstring.generate(7) + "." + banner.toJSON().extname;
            await banner.move(Helpers.publicPath(path), {
                name: filename,
                overwrite: true
            })
            iklan.banner = filename
        }

        const banner = await Database
            .insert({
                status: 'Tidak Aktif'
            })
            .into('in_banner')
        return response.status(201).json(banner)
    }


}
module.exports = IklanController