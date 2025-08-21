import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'note_links'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')

      table.bigInteger('source_note_id').references('notes.id')
      table.bigInteger('target_note_id').references('notes.id')
      table.unique(['source_note_id', 'target_note_id'])

      table.string('type')

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}