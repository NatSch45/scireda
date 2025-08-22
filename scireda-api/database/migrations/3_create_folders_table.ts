import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'folders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.string('name').notNullable()

      table.bigInteger('network_id').notNullable()
      table.foreign('network_id').references('networks.id')

      table.bigInteger('parent_id').nullable()
      table.foreign('parent_id').references('folders.id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
