import BaseModel from "./BaseModel.js"

class RoleModel extends BaseModel {
  static get tableName() {
    return "role"
  }
}

export default RoleModel