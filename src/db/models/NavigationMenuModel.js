import { NotFoundError } from "../../errors.js"
import BaseModel from "./BaseModel.js"
import { deleteMenuItems } from "./NavigationMenuItemsModel.js"

class NavigationMenuModel extends BaseModel {
  static get tableName() {
    return "navigation_menus"
  }

  static get relationMappings() {
    return {
      children: {
        relation: BaseModel.HasManyRelation,
        modelClass: NavigationMenuModel,
        join: {
          from: "navigation_menus.parent_id",
          to: "navigation_menus.id",
        },
      },
    }
  }
}

async function checkIfMenuExists(id) {
  const menu = await NavigationMenuModel.query().findById(id)

  if (menu) {
    return menu
  }

  throw new NotFoundError
}

async function getMenuTree(parentId = null) {
  const rows = await NavigationMenuModel.query().where("parent_id", parentId)

  const menuTree = []

  for (const row of rows) {
    const children = await getMenuTree(row.id)

    const menu = {
      id: row.id,
      name: row.name,
      children: children,
    }

    menuTree.push({ navigationMenu: menu })
  }

  return menuTree
}

async function deleteMenu(menuId) {
  const menus = await NavigationMenuModel.query().where("parent_id", menuId)

  for (const menu of menus) {
    await deleteMenuItems(menu.id)
    await deleteMenu(menu.id)
  }

  await deleteMenuItems(menuId)
  await NavigationMenuModel.query().deleteById(menuId)

  return
}


export default NavigationMenuModel
export { checkIfMenuExists, getMenuTree, deleteMenu }
