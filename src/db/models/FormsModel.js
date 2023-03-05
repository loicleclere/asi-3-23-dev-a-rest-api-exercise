import { NotFoundError } from "../../errors.js"
import BaseModel from "./BaseModel.js"
import FormsFieldsModel from "./FormsFieldsModel.js"

class FormsModel extends BaseModel {
  static tableName = "forms"

  static get relationMappings() {
    return {
      formfields: {
        modelClass: FormsFieldsModel,
        relation: BaseModel.HasManyRelation,
        join: {
          from: "forms.id",
          to: "forms_fields.form_id",
        },
      },
    }
  }
}

async function deleteForm(formId) {
  const formFields = await FormsFieldsModel.query().where("form_id", formId)

  for (const formField of formFields) {
    await FormsFieldsModel.query().deleteById(formField.id)
  }

  await FormsModel.query().deleteById(formId)

  return
}

async function checkIfFormExist(formId) {
  const form = await FormsModel.query().findById(formId)

  if (form) {
    return form
  }

  throw new NotFoundError
}

export default FormsModel
export { deleteForm, checkIfFormExist }
