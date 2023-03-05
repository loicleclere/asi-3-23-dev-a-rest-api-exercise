export const up = async (knex) => {
  await knex.schema.createTable("navigation_menu_items", (table) => {
    table.increments("id").primary()
    table.integer("navigation_menu_id").unsigned().references("id").inTable("navigation_menus")
    table.integer("page_id").unsigned().references("id").inTable("page")
    table.integer("order").unsigned().notNullable()
  })
}
export const down = async (knex) => {
  await knex.schema.dropTableIfExists("navigation_menu_items")
}