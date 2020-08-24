'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Video extends Model {

	static get table () {
		return 'v2.ts_video'
	}
	
	static get primaryKey () {
		return 'id_video'
	}

	static boot () {
	    super.boot()
	    this.addTrait('@provider:Lucid/Slugify', {
	      fields: { slug: 'title' },
	      strategy: 'dbIncrement',
	      disableUpdates: false
	    })
  	}
}

module.exports = Video
