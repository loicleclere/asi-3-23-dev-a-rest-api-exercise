export const up = async (knex) => {
  await knex.schema.createTable("permissions", (table) => {
    table.increments("id").primary()
    table.integer("role_id").unsigned().references("id").inTable("role")
    table.string("resource_type").notNullable()
    table.boolean("can_read").defaultTo(false)
    table.boolean("can_create").defaultTo(false)
    table.boolean("can_update").defaultTo(false)
    table.boolean("can_delete").defaultTo(false)
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("permissions")
}