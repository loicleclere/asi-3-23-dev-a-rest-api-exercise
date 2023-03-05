import { NotFoundError } from "../../errors.js"
import BaseModel from "./BaseModel.js"
import NavigationMenuItemsModel from "./NavigationMenuItemsModel.js"
import PageHistoryModel from "./PageHistoryModel.js"
import UserModel from "./UserModel.js"

class PageModel extends BaseModel {
  static tableName = "page"

  static get relationMappings() {
    return {
      users: {
        modelClass: UserModel,
        relation: BaseModel.HasManyRelation,
        join: {
          from: "page.author_id",
          to: "users.id",
        },
      },
      pageHistory: {
        modelClass: PageHistoryModel,
        relation: BaseModel.HasManyRelation,
        join: {
          from: "page.id",
          to: "page_history.page_id",
        },
      },
    }
  }
}

async function deletePage(pageId) {
  const menuItems = await NavigationMenuItemsModel.query().where("page_id", pageId)
  const pageHistory = await PageHistoryModel.query().where("page_id", pageId)

  for (const menuItem of menuItems) {
    await NavigationMenuItemsModel.query().deleteById(menuItem.id)
  }

  for (const history of pageHistory) {
    await PageHistoryModel.query().deleteById(history.id)
  }

  await PageModel.query().deleteById(pageId)

  return
}

const checkIfPageExists = async (id) => {
  const page = await PageModel.query().findById(id)

  if (page) {
    return page
  }

  throw new NotFoundError
}

const checkIfPageExistsBySlug = async (urlSlug) => {
  const page = await PageModel.query().where("urlSlug", urlSlug).first()

  if (page) {
    return page
  }

  return
}

export default PageModel
export { deletePage, checkIfPageExists, checkIfPageExistsBySlug }