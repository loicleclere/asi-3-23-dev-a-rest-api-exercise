export const up = async (knex) => {
  await knex.schema.createTable("page_history", (table) => {
    table.increments("id").primary()
    table.integer("page_id").notNullable().references("id").inTable("page")
    table.integer("updated_by").unsigned().references("id").inTable("users")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("page")
}