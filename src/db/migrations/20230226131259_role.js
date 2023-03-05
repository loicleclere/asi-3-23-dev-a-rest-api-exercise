export const up = async (knex) => {
  await knex.schema.createTable("role", (table) => {
    table.increments("id").primary()
    table.text("name").notNullable()
    table.text("description").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("role")
}