import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"
import PageModel from "./PageModel.js"

class PageHistoryModel extends BaseModel {
  static tableName = "page_history"

  static get relationMappings() {
    return {
      users: {
        modelClass: UserModel,
        relation: BaseModel.BelongsToOneRelation,
        join: {
          from: "page_history.updated_by",
          to: "users.id",
        },
      },
      page: {
        modelClass: PageModel,
        relation: BaseModel.BelongsToOneRelation,
        join: {
          from: "page_history.page_id",
          to: "page.id",
        },
      }
    }
  }
}

export default PageHistoryModel