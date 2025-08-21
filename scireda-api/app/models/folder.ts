import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Network from './network.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Note from './note.js'

export default class Folder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare networkId: number

  @belongsTo(() => Network, {
    foreignKey: 'networkId',
  })
  declare network: BelongsTo<typeof Network>

  @column()
  declare parentId: number | null

  @belongsTo(() => Folder, {
    foreignKey: 'parentId',
  })
  declare parentFolder: BelongsTo<typeof Folder>

  // Notes relation
  @hasMany(() => Note, {
    foreignKey: 'parentId',
  })
  declare notes: HasMany<typeof Note>

  // Sub folders relation
  @hasMany(() => Folder, {
    foreignKey: 'parentId',
  })
  declare subFolders: HasMany<typeof Folder>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}