import BaseModel from "./BaseModel.js"
import RoleModel from "./RoleModel.js"

class PermissionModel extends BaseModel {
  static tableName = "permissions"

  static get relationMappings() {
    return {
      role: {
        modelClass: RoleModel,
        relation: BaseModel.BelongsToOneRelation,
        join: {
          from: "role.id",
          to: "permissions.role_id",
        },
      },
    }
  }
}

export default PermissionModel