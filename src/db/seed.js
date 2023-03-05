import { faker } from "@faker-js/faker"
import config from "../config.js"
import RoleModel from "../db/models/RoleModel.js"
import knex from "knex"
import BaseModel from "../db/models/BaseModel.js"
import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import hashPassword from "../hashPassword.js"
import UserModel from "./models/UserModel.js"
import PageModel from "./models/PageModel.js"
import NavigationMenItemsModel from "./models/NavigationMenuItemsModel.js"
import FormsModel from "./models/FormsModel.js"
import FormsFieldsModel from "./models/FormsFieldsModel.js"

const db = knex(config.db)
BaseModel.knex(db)

const roles = [
  {
    name: "admin",
    description: "Administrator",
  },
  {
    name: "manager",
    description: "Manager",
  },
  {
    name: "editor",
    description: "Editor",
  },
]

const permissions = [
  {
    role_id: 1,
    resource_type: "users",
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
  },
  {
    role_id: 2,
    resource_type: "users",
    can_read: true,
    can_create: false,
    can_update: true,
    can_delete: false,
  },
  {
    role_id: 3,
    resource_type: "users",
    can_read: true,
    can_create: false,
    can_update: true,
    can_delete: false,
  },
  {
    role_id: 1,
    resource_type: "page",
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
  },
  {
    role_id: 2,
    resource_type: "page",
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
  },
  {
    role_id: 3,
    resource_type: "page",
    can_read: true,
    can_create: false,
    can_update: true,
    can_delete: false,
  },
  {
    role_id: 1,
    resource_type: "menu",
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
  },
  {
    role_id: 2,
    resource_type: "menu",
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
  },
  {
    role_id: 3,
    resource_type: "menu",
    can_read: true,
    can_create: false,
    can_update: false,
    can_delete: false,
  },
  {
    role_id: 1,
    resource_type: "forms",
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
  },
  {
    role_id: 2,
    resource_type: "forms",
    can_read: true,
    can_create: true,
    can_update: true,
    can_delete: true,
  },
  {
    role_id: 3,
    resource_type: "forms",
    can_read: true,
    can_create: false,
    can_update: false,
    can_delete: false,
  },
]

const createRoles = async () => {
  for (const role of roles) {
    await RoleModel.query().insert(role)
  }
}

const createPermissions = async () => {
  for (const permission of permissions) {
    await db("permissions").insert(permission)
  }
}

const createMenu = async () => {
  const mainMenu = await NavigationMenuModel.query().insert({
    name: "Menu principal",
  })

  let listOfParentUsed = []

  for (let i = 0; i < 9; i++) {
    const parentMenus = await NavigationMenuModel.query().whereNotNull("parent_id").whereNotIn("id", listOfParentUsed)
    const parentMenuIds = parentMenus.map(menu => menu.id)

    const menu = await NavigationMenuModel.query().insert({
      name: faker.lorem.words(),
      parent_id: parentMenuIds.length > 0 ? parentMenuIds[Math.floor(Math.random() * parentMenuIds.length)] : mainMenu.id
    })

    listOfParentUsed.push(menu.parent_id)
  }
}

const createUsers = async () => {
  for (let i = 0; i < 10; i++) {
    const [passwordHash, passwordSalt] = hashPassword("azeAZE123!@#")
    await UserModel.query().insert({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      passwordHash,
      passwordSalt,
      role_id: Math.floor(Math.random() * 3) + 1,
    })
  }
}

const createPages = async () => {
  for (let i = 0; i < 5; i++) {
    await PageModel.query().insert({
      title: faker.lorem.words(),
      content: faker.lorem.paragraphs(),
      urlSlug: faker.lorem.slug(),
      editor_id: Math.floor(Math.random() * 10) + 1,
      publishedDate: faker.date.past(),
      status: "published",
    })
  }
  for (let i = 0; i < 5; i++) {
    await PageModel.query().insert({
      title: faker.lorem.words(),
      content: faker.lorem.paragraphs(),
      urlSlug: faker.lorem.slug(),
      author_id: Math.floor(Math.random() * 10) + 1,
      status: "draft",
    })
  }
}

const createMenuItem = async () => {
  for (let i = 0; i < 10; i++) {
    await NavigationMenItemsModel.query().insert({
      navigation_menu_id: Math.floor(Math.random() * 10) + 1,
      page_id: Math.floor(Math.random() * 10) + 1,
      order: Math.floor(Math.random() * 10) + 1,
    })
  }
}

const createForms = async () => {
  for (let i = 0; i < 10; i++) {
    await FormsModel.query().insert({
      name: faker.lorem.words(),
    })
  }
}

const FieldTypes = ["single_line_text", "multi_line_text", "radio", "select", "checkbox"]

const createFormFields = async () => {
  for (let i = 0; i < 10; i++) {
    await FormsFieldsModel.query().insert({
      form_id: Math.floor(Math.random() * 10) + 1,
      name: faker.lorem.words(),
      type: FieldTypes[Math.floor(Math.random() * FieldTypes.length)],
      options: "",
      label: faker.lorem.words(),
      default_value: "",
      ordered_fields: "",
    })
  }
}

await createRoles()
await createPermissions()
await createMenu()
await createUsers()
await createPages()
await createMenuItem()
await createForms()
await createFormFields()

process.exit(0)