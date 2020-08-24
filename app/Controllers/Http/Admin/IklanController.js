'use strict'
const Iklan = use('App/Models/Iklan')
const Helpers = use('Helpers')
const randomstring = use("randomstring");

class IklanController {

    async index({ response }) {

        let iklan = await Iklan.all()
        return response.json(iklan)
    }

    async store({ request, response }) {

        const iklan = new Iklan()
        const judul = request.input('judul')
        const image_iklan = request.file('image_iklan')
        let filename = ""

        if (image_iklan !== null) {
            let path = "images/iklan"
            filename = randomstring.generate(7) + "." + image_iklan.toJSON().extname;
            await image_iklan.move(Helpers.publicPath(path), {
                name: filename,
                overwrite: true
            })
            iklan.image_iklan = filename
        }

        iklan.judul = judul

        await iklan.save()
        return response.status(201).json(iklan)
    }


    async show({ params, response }) {

        const iklan = await Iklan.find(params.id)
        return response.json(iklan)

    }


    async update({ params, request, response }) {

        const iklan = await Iklan.find(params.id)
        const judul = request.input('judul')
        const image_iklan = request.file('image_iklan')
        let filename = ""
        if (!iklan) {
            return response.status(404).json({ data: 'Resource not found' })
        }
        if (image_iklan !== null) {
            let path = "images/iklan"
            filename = randomstring.generate(7) + "." + image_iklan.toJSON().extname;
            await image_iklan.move(Helpers.publicPath(path), {
                name: filename,
                overwrite: true
            })
            iklan.image_iklan = filename
        }

        iklan.judul = judul

        await iklan.save()
        return response.status(201).json(iklan)

    }


    async delete({ params, response }) {

        const iklan = await Iklan.find(params.id)
        if (!iklan) {
            return response.status(404).json({ data: 'Resource not found' })
        }
        await iklan.delete()
        return response.status(204).json(null)
    }
}

module.exports = IklanController