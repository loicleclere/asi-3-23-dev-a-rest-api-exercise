const FieldTypes = ["single_line_text", "multi_line_text", "radio", "select", "checkbox"]

export const up = async (knex) => {
  await knex.schema.createTable("form_fields", (table) => {
    table.increments("id").primary()
    table.integer("form_id").unsigned().references("id").inTable("forms")
    table.string("name").notNullable()
    table.enum("type", FieldTypes).notNullable()
    table.text("options")
    table.string("label").notNullable()
    table.string("default_value")
    table.text("ordered_fields").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("form_fields")
}