import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.string('title').notNullable()
      table.text('content').nullable()

      table.bigInteger('network_id').notNullable()
      table.foreign('network_id').references('networks.id')

      table.bigInteger('parent_id').nullable()
      table.foreign('parent_id').references('folders.id')

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}