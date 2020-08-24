'use strict'
const Participant = use('App/Models/Participant')
const Database = use('Database')

class ParticipantController {

	async index ({response}) {
	
		let participant = await Participant.all()
		return response.json(participant)
	}

	async store ({request, response}) {

		function appendLeadingZeroes(n){
			if(n <= 9){
			  return "0" + n;
			}
			return n
		  }
  
		  let current_datetime = new Date()
		  let formatted_date = current_datetime.getFullYear() +''+ appendLeadingZeroes(current_datetime.getMonth() + 1) +''+ appendLeadingZeroes(current_datetime.getDate())		
  
		  const lastPartiIDcipant = await Database.select(Database.raw('substr(id_participant,11,30) as id_participant'))
			  .from('in_participant')
			  .orderBy(Database.raw('substr(id_participant,11,30)'), 'desc')
			  .first();
  
		  let lastPartiIDcipantNumber = null;
  
		  if (lastPartiIDcipant ) {
  
			lastPartiIDcipantNumber = 'PR'+ formatted_date + ++lastPartiIDcipant.id_participant;
		  } else {
  
			lastPartiIDcipantNumber = 'PR'+ formatted_date +'1000000001';
  
		  }

		const participantInfo = request.only(['id_participant', 'email', 'no_telpon', 'nama', 'TTL', 'jenis_kelamin', 'kelas'])
		const photo = request.file('photo')
		let filename = ""
		const participant = new Participant()
		if(photo !== null){ 
			let path 	= "images/participant"
			filename  =   randomstring.generate(7) +"."+  photo.toJSON().extname;
			await photo.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			participant.photo 			= filename
		}
		participant.id_participant 		= lastPartiIDcipantNumber
		participant.email				= participantInfo.email
		participant.no_telpon 			= participantInfo.no_telpon
		participant.nama 				= participantInfo.nama
		participant.TTL 				= participantInfo.TTL
		participant.jenis_kelamin 		= participantInfo.jenis_kelamin
		participant.kelas 				= participantInfo.kelas
		await participant.save()
		return response.status(201).json(participant)		
	}


	async show ({params, response}) {
		const participant = await Participant.find(params.id)
		return response.json(participant)
	}


	async update ({params, request, response}) {
		const participantInfo = request.only(['id_participant', 'email', 'no_telpon', 'nama', 'TTL', 'jenis_kelamin', 'kelas'])
		const photo = request.file('photo')
		let filename = ""
		const participant 	= await Participant.find(params.id)
		if (!participant) {
			return response.status(404).json({data: 'Resource not found'})
		}
		if(photo !== null){ 
			let path 	= "images/participant"
			filename  =   randomstring.generate(7) +"."+  photo.toJSON().extname;
			await photo.move(Helpers.publicPath(path), {
			  name : filename, 
			  overwrite: true
			})
			participant.photo 			= filename
		}
		participant.id_participant 		= participantInfo.id_participant
		participant.email				= participantInfo.email
		participant.no_telpon 			= participantInfo.no_telpon
		participant.nama 				= participantInfo.nama
		participant.TTL 				= participantInfo.TTL
		participant.jenis_kelamin 		= participantInfo.jenis_kelamin
		participant.kelas 				= participantInfo.kelas
		await participant.save()
		return response.status(200).json(participant)
	}


	async delete ({params, response}) {

		const participant = await Participant.find(params.id)
		if (!participant) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await participant.delete()
		return response.status(204).json(null)
	}
}

module.exports = ParticipantController
