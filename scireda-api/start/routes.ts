/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.get('me', '#controllers/auth_controller.me')

    router
      .group(() => {
        router.post('register', '#controllers/auth_controller.register')
        router.post('login', '#controllers/auth_controller.login')
        router.post('logout', '#controllers/auth_controller.logout')
      })
      .prefix('/auth')

    router
      .group(() => {
        router.get('top-level', '#controllers/notes_controller.getTopLevelNotesByNetwork')
        router.get('', '#controllers/notes_controller.getNotesByFolder')
        router.post('', '#controllers/notes_controller.createNote')
        router.put(':id', '#controllers/notes_controller.updateNote')
        router.delete(':id', '#controllers/notes_controller.deleteNote')
      })
      .prefix('/notes')
      .use(middleware.auth({ guards: ['api'] }))

    router
      .group(() => {
        router.get('top-level', '#controllers/folders_controller.getTopLevelFolders')
        router.get(':id', '#controllers/folders_controller.getFolderContent')
        router.post('', '#controllers/folders_controller.createFolder')
        router.delete(':id', '#controllers/folders_controller.deleteFolder')
      })
      .prefix('/folders')
      .use(middleware.auth({ guards: ['api'] }))

    router
      .group(() => {
        router.get('', '#controllers/networks_controller.getAllNetworks')
        router.post('', '#controllers/networks_controller.createNetwork')
        router.put(':id', '#controllers/networks_controller.updateNetwork')
        router.delete(':id', '#controllers/networks_controller.deleteNetwork')
      })
      .prefix('/networks')
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('/scireda-api')
