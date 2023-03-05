export const up = async (knex) => {
  await knex.schema.createTable("navigation_menus", (table) => {
    table.increments("id").primary()
    table.string("name").notNullable()
    table.integer("parent_id").unsigned().references("id").inTable("navigation_menus").nullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("navigation_menus")
}