import { NotFoundError } from "../../errors.js"
import BaseModel from "./BaseModel.js"
import RoleModel from "./RoleModel.js"
import PageHistoryModel from "./PageHistoryModel.js"
import PageModel, { deletePage } from "./PageModel.js"

class UserModel extends BaseModel {
  static tableName = "users"

  static get relationMappings() {
    return {
      role: {
        modelClass: RoleModel,
        relation: BaseModel.BelongsToOneRelation,
        join: {
          from: "users.role_id",
          to: "role.id",
        },
      },
      pageHistory: {
        modelClass: PageHistoryModel,
        relation: BaseModel.HasManyRelation,
        join: {
          from: "users.id",
          to: "page_history.author_id",
        },
      },
      page: {
        modelClass: PageModel,
        relation: BaseModel.HasManyRelation,
        join: {
          from: "users.id",
          to: "page.editor_id",
        },
      },
    }
  }
}

const checkIfUserExists = async (userId) => {
  const user = await UserModel.query().findById(userId)

  if (user) {
    return user
  }

  throw new NotFoundError
}

const deleteUser = async (userId) => {
  const pages = await PageModel.query().where("editor_id", userId)


  for (const page of pages) {
    deletePage(page.id)
  }

  await UserModel.query().deleteById(userId)
}

export default UserModel
export { checkIfUserExists, deleteUser }