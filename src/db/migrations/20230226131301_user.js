export const up = async (knex) => {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary()
    table.text("firstName").notNullable()
    table.text("lastName").notNullable()
    table.text("email").notNullable().unique()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.integer("role_id").unsigned().references("id").inTable("role")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("user")
}