import Folder from '#models/folder'
import Network from '#models/network'
import Note from '#models/note'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class FoldersController {

    async getTopLevelFolders({ request, response, auth }: HttpContext) {

        const networkId = request.input('networkId')

        try {
            // Check if networkId belongs to the authenticated user's network
            const network = await Network.findOrFail(networkId)
            if (network.userId !== auth.user!.id) {
                return response.unauthorized({ message: 'You are not authorized to access this network' })
            }

            const folders = await Folder.query()
                .where('networkId', networkId)
                .whereNull('parentId')
                .preload('notes')
                .preload('subFolders')

            return response.ok(folders)

        } catch (error) {
            console.error('Error fetching top-level folders:', error)
            return response.internalServerError({ message: 'Failed to fetch top-level folders' })
        }
    }

    async getFolderContent({ params, response, auth }: HttpContext) {
        const folderId = params.id

        try {
            const folder = await Folder.query()
                .where('id', folderId)
                .preload('network')
                .preload('notes')
                .preload('subFolders')
                .firstOrFail()

            // Check ownership
            if (folder.network.userId !== auth.user!.id) {
                return response.unauthorized({ message: 'You are not authorized to access this folder' })
            }

            return response.ok(folder)

        } catch (error) {
            console.error('Error fetching folder content:', error)
            return response.internalServerError({ message: 'Failed to fetch folder content' })
        }
    }

    async createFolder({ request, response, auth }: HttpContext) {
        
        const schema = vine.object({
            name: vine.string().minLength(1),
            networkId: vine.number(),
            parentId: vine.number().optional()
        })

        try {
            const folderData = await vine.validate({
                schema,
                data: request.all(),
            })

            // Check if networkId belongs to the authenticated user's network
            const network = await Network.findOrFail(folderData.networkId)
            if (network.userId !== auth.user!.id) {
                return response.unauthorized({ message: 'You are not authorized to create a folder in this network' })
            }

            const folder = await Folder.create(folderData)
            return response.created(folder)

        } catch (error) {
            console.error('Error creating folder:', error)
            return response.internalServerError({ message: 'Failed to create folder' })
        }
    }

    async updateFolder({ params, request, response, auth }: HttpContext) {
        const folderId = params.id

        const schema = vine.object({
            name: vine.string().minLength(1),
            networkId: vine.number(),
            parentId: vine.number().optional()
        })

        try {
            const folderData = await vine.validate({
                schema,
                data: request.all(),
            })

            // Check if networkId belongs to the authenticated user's network
            const network = await Network.findOrFail(folderData.networkId)
            if (network.userId !== auth.user!.id) {
                return response.unauthorized({ message: 'You are not authorized to update a folder in this network' })
            }

            const folder = await Folder.findOrFail(folderId)
            folder.merge(folderData)
            await folder.save()

            return response.ok(folder)

        } catch (error) {
            console.error('Error updating folder:', error)
            return response.internalServerError({ message: 'Failed to update folder' })
        }
    }

    async deleteFolder({ params, request, response, auth }: HttpContext) {
        const folderId = params.id
        const forceDelete = request.input('force', false)

        try {
            const folder = await Folder.query()
                .where('id', folderId)
                .preload('network')
                .preload('notes')
                .preload('subFolders')
                .firstOrFail()

            // Check ownership
            if (folder.network.userId !== auth.user!.id) {
                return response.unauthorized({ message: 'You are not authorized to delete this folder' })
            }

            // Check deletion constraints
            const canDelete = this.canDeleteFolder(folder, forceDelete)
            if (!canDelete.allowed) {
                return response.badRequest({ message: canDelete.reason })
            }

            // Delete notes if force delete is enabled
            if (forceDelete && folder.notes.length > 0) {
                await Note.query().where('parentId', folder.id).delete()
            }

            await folder.delete()
            return response.noContent()

        } catch (error) {
            console.error('Error deleting folder:', error)
            return response.notFound({ message: 'Folder not found' })
        }
    }

    private canDeleteFolder(folder: Folder, forceDelete: boolean): { allowed: boolean, reason?: string } {
        // Can't delete folders with subfolders
        if (folder.subFolders.length > 0) {
            return { 
                allowed: false, 
                reason: 'Can\'t delete a folder that has subfolders' 
            }
        }

        // Can't delete folders with notes unless force delete is enabled
        if (folder.notes.length > 0 && !forceDelete) {
            return { 
                allowed: false, 
                reason: 'Can\'t delete this folder without forceDelete' 
            }
        }

        return { allowed: true }
    }
}