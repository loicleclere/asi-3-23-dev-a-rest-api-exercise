import { NotFoundError } from "../../errors.js"
import BaseModel from "./BaseModel.js"
import FormsModel from "./FormsModel.js"

class FormsFieldsModel extends BaseModel {
  static tableName = "form_fields"

  static get relationMappings() {
    return {
      form: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: FormsModel,
        join: {
          from: "forms_fields.form_id",
          to: "forms.id",
        },
      },
    }
  }
}

async function getFormTree(parentId = null) {
  const fields = await FormsFieldsModel.query().where("form_id", parentId)

  const menuTree = []

  for (const field of fields) {
    const elField = {
      id: field.id,
      name: field.name,
      type: field.type,
      options: field.options,
      label: field.label,
      default_value: field.default_value,
      ordered_fields: field.ordered_fields,
    }

    menuTree.push(elField)
  }

  return menuTree
}

async function checkIfFieldsExist(fieldId) {
  const field = await FormsFieldsModel.query().findById(fieldId)

  if (field) {
    return field
  }

  throw new NotFoundError
}

export default FormsFieldsModel
export { getFormTree, checkIfFieldsExist }