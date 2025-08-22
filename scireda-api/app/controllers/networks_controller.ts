import Network from '#models/network'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class NetworksController {
  async getAllNetworks({ response, auth }: HttpContext) {
    try {
      const networks = await Network.query().where('userId', auth.user!.id)
      return response.ok(networks)
    } catch (error) {
      console.error('Error fetching networks:', error)
      return response.internalServerError({ message: 'Failed to fetch networks' })
    }
  }

  async createNetwork({ request, response, auth }: HttpContext) {
    const schema = vine.object({
      name: vine.string().minLength(1),
      userId: vine.string().uuid(),
    })

    try {
      const networkData = await vine.validate({
        schema,
        data: request.all(),
      })

      // Check if userId matches the authenticated user's id
      if (networkData.userId !== auth.user!.id) {
        return response.unauthorized({ message: 'User id does not match authenticated user' })
      }

      const network = await Network.create(networkData)
      return response.created(network)
    } catch (error) {
      console.error('Error creating network:', error)
      return response.internalServerError({ message: 'Failed to create network' })
    }
  }

  async updateNetwork({ params, request, response, auth }: HttpContext) {
    const networkId = params.id

    const schema = vine.object({
      name: vine.string().minLength(1),
    })

    try {
      const { name } = await vine.validate({
        schema,
        data: request.only(['name']),
      })

      const network = await Network.findOrFail(networkId)

      // Check ownership
      if (network.user.id !== auth.user!.id) {
        return response.unauthorized({ message: 'You are not authorized to update this network' })
      }

      network.name = name
      await network.save()
      return response.ok(network)
    } catch (error) {
      console.error('Error updating network:', error)
      return response.badRequest({ message: 'Failed to update network', errors: error.messages })
    }
  }

  async deleteNetwork({ params, response, auth }: HttpContext) {
    const networkId = params.id

    try {
      const network = await Network.findOrFail(networkId)

      // Check ownership
      if (network.userId !== auth.user!.id) {
        return response.unauthorized({ message: 'You are not authorized to delete this network' })
      }

      await network.delete()
      return response.noContent()
    } catch (error) {
      console.error('Error deleting network:', error)
      return response.notFound({ message: 'Network not found' })
    }
  }
}
