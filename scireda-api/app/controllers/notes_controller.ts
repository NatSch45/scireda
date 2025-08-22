import Folder from '#models/folder'
import Network from '#models/network'
import Note from '#models/note'
import { Authenticator } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class NotesController {
  async createNote({ request, response, auth }: HttpContext) {
    const schema = vine.object({
      title: vine.string().minLength(1),
      content: vine.string().minLength(1),
      networkId: vine.number(),
      parentId: vine.number().optional(),
    })

    try {
      const noteData = await vine.validate({
        schema,
        data: request.all(),
      })

      // Check if networkId belongs to the authenticated user's network
      const network = await Network.findOrFail(noteData.networkId)
      if (network.userId !== auth.user!.id) {
        return response.unauthorized({
          message: 'You are not authorized to create a note in this network',
        })
      }

      // Check if parent is contained in the same network
      if (noteData.parentId) {
        const parentFolder = await Folder.findOrFail(noteData.parentId)
        if (Number(parentFolder.networkId) !== noteData.networkId) {
          console.log(
            'Parent folder networkId:',
            typeof parentFolder.networkId,
            ' Note networkId:',
            typeof noteData.networkId
          )
          return response.badRequest({ message: 'Mismatched network IDs' })
        }
      }

      const note = await Note.create(noteData)
      return response.created(note)
    } catch (error) {
      console.error('Error creating note:', error)
      return response.internalServerError({ message: 'Failed to create note' })
    }
  }

  async updateNote({ params, request, response, auth }: HttpContext) {
    const noteId = params.id

    const schema = vine.object({
      title: vine.string().minLength(1).optional(),
      content: vine.string().minLength(1).optional(),
      networkId: vine.number().optional(),
      parentId: vine.number().optional(),
    })

    try {
      const noteData = await vine.validate({
        schema,
        data: request.all(),
      })

      const note = await Note.query().where('id', noteId).preload('network').firstOrFail()

      // Check ownership
      if (note.network.userId !== auth.user!.id) {
        return response.unauthorized({ message: 'You are not authorized to update this note' })
      }

      note.merge(noteData)
      await note.save()
      return response.ok(note)
    } catch (error) {
      console.error('Error updating note:', error)
      return response.internalServerError({ message: 'Failed to update note' })
    }
  }

  async deleteNote({ params, response, auth }: HttpContext) {
    const noteId = params.id

    try {
      const note = await Note.query().where('id', noteId).preload('network').firstOrFail()

      // Check ownership
      if (note.network.userId !== auth.user!.id) {
        return response.unauthorized({ message: 'You are not authorized to delete this note' })
      }

      await note.delete()
      return response.noContent()
    } catch (error) {
      console.error('Error deleting note:', error)
      return response.notFound({ message: 'Note not found' })
    }
  }

  async getTopLevelNotesByNetwork({ request, response, auth }: HttpContext) {
    const networkId = request.input('networkId')
    if (!(await this.checkNetworkOwnership(auth, networkId))) {
      return response.unauthorized({ message: 'You are not authorized to access this network' })
    }

    try {
      const notes = await Note.query().where('networkId', networkId).whereNull('parentId') // Fetch only top-level notes
      return response.ok(notes)
    } catch (error) {
      console.error('Error fetching notes:', error)
      return response.internalServerError({ message: 'Failed to fetch notes' })
    }
  }

  async getNotesByFolder({ request, response, auth }: HttpContext) {
    // Retrieve the folder to check existence and ownership
    const folder = await Folder.findOrFail(request.input('folderId'))
    if (!(await this.checkNetworkOwnership(auth, folder.networkId))) {
      return response.unauthorized({ message: 'You are not authorized to access this folder' })
    }

    try {
      const notes = await Note.query()
        .where('parentId', folder.id) // Fetch notes in the specified folder
        .preload('network')
      return response.ok(notes)
    } catch (error) {
      console.error('Error fetching notes:', error)
      return response.internalServerError({ message: 'Failed to fetch notes' })
    }
  }

  async checkNetworkOwnership(auth: Authenticator<any>, networkId: number): Promise<boolean> {
    try {
      const network = await Network.findOrFail(networkId)

      // Check ownership
      return network.userId === auth.user!.id
    } catch (error) {
      console.error('Error checking network ownership:', error)
      return false
    }
  }
}
