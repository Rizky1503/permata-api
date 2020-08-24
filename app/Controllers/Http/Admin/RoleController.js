'use strict'
const Role = use('App/Models/Role')


class RoleController {

	async index ({response}) {

		let role = await Role.all()
		return response.json(role)
	}

	async store ({request, response}) {

		const roleInfo 	= request.only(['role'])
		const role 		= new Role()
		role.role 		= roleInfo.role
		await role.save()
		return response.status(201).json(role)		
	}


	async show ({params, response}) {
	
		const role = await Role.find(params.id)
		return response.json(role)
	
	}


	async update ({params, request, response}) {

		const roleInfo 	= request.only(['role'])
		const role 		= await Role.find(params.id)
		if (!role) {
			return response.status(404).json({data: 'Resource not found'})
		}
		role.role 		= roleInfo.role
		await role.save()
		return response.status(201).json(role)	
	}


	async delete ({params, response}) {

		const role = await Role.find(params.id)
		if (!role) {
			return response.status(404).json({data: 'Resource not found'})
		}
		await role.delete()
		return response.status(204).json(null)
	}
}

module.exports = RoleController
