export const up = async (knex) => {
  await knex.schema.createTable("forms", (table) => {
    table.increments("id").primary()
    table.string("name").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("forms")
}