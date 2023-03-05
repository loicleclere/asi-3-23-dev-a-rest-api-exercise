import NavigationMenuModel from "./NavigationMenuModel.js"
import BaseModel from "./BaseModel.js"
import PageModel from "./PageModel.js"

class NavigationMenuItemsModel extends BaseModel {
  static tableName = "navigation_menu_items"

  static get relationMappings() {
    return {
      navigationmenu: {
        modelClass: NavigationMenuModel,
        relation: BaseModel.BelongsToOneRelation,
        join: {
          from: "navigation_menu_items.navigation_menu_id",
          to: "navigation_menu.id",
        },
      }
    }
  }
}


async function deleteMenuItems(menuId) {
  const menuItems = await NavigationMenuItemsModel.query().where("navigation_menu_id", menuId)

  for (const menuItem of menuItems) {
    await NavigationMenuItemsModel.query().deleteById(menuItem.id)
  }

  return
}

const getMenuTree = async (parentId = null) => {
  const rows = await NavigationMenuModel.query().where("parent_id", parentId)

  const pages = await NavigationMenuItemsModel.query().where("navigation_menu_id", parentId)

  const menuTree = []

  for (const row of rows) {
    const children = await getMenuTree(row.id)

    const menu = {
      id: row.id,
      name: row.name,
      children: children,
    }

    menuTree.push({ menu: menu })
  }

  for (const page of pages) {
    const elPage = await PageModel.query().findById(page.page_id)
    const laPage = {
      id: page.id,
      title: elPage.title,
      urlSlug: elPage.urlSlug,
      author_id: elPage.author_id,
      status: elPage.status,
    }

    menuTree.push({ page: laPage })
  }

  return menuTree
}

export default NavigationMenuItemsModel
export { getMenuTree, deleteMenuItems }