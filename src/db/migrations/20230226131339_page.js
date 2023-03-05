export const up = async (knex) => {
  await knex.schema.createTable("page", (table) => {
    table.increments("id").primary()
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("urlSlug").notNullable().unique()
    table.integer("author_id").unsigned().references("id").inTable("users")
    table.integer("editor_id").unsigned().references("id").inTable("users")
    table.dateTime("publishedDate").nullable()
    table.text("status").notNullable().defaultTo("draft")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("page")
}