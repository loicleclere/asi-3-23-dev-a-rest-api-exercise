import {
  idValidator,
  nameValidator,
  orderValidator,
  typeValidator,
  optionsValidator,
  default_valueValidator,
} from "../validators.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import isAuthorized from "../middlewares/isAuthorized.js"
import FormsFieldsModel from "../db/models/FormsFieldsModel.js"
import { checkIfFormExist } from "../db/models/FormsModel.js"
import { getFormTree, checkIfFieldsExist } from "../db/models/FormsFieldsModel.js"

const makeRouteFields = (app) => {
  app.get("/fields/:idForms",
    validate(
      {
        params: {
          idForms: idValidator.required(),
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          params: { idForms },
        },
      } = req

      await checkIfFormExist(idForms)

      const menuTree = await getFormTree(idForms)

      res.send({ field: menuTree })
    })
  )
  app.post("/fields",
    auth,
    isAuthorized("can_create", "forms"),
    validate(
      {
        body: {
          form_id: idValidator,
          name: nameValidator,
          type: typeValidator,
          options: optionsValidator,
          label: nameValidator,
          default_value: default_valueValidator,
          ordered_fields: orderValidator,
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          body: { form_id, name, type, options, label, default_value, ordered_fields },
        },
      } = req

      await checkIfFormExist(form_id)

      const newField = await FormsFieldsModel.query().insertAndFetch({
        form_id,
        name,
        type,
        options,
        label,
        default_value,
        ordered_fields,
      })

      res.send({ result: newField })
    })
  )

  app.patch("/fields/:fieldId",
    auth,
    isAuthorized("can_update", "forms"),
    validate(
      {
        params: {
          fieldId: idValidator.required(),
        },
        body: {
          form_id: idValidator,
          name: nameValidator,
          type: typeValidator,
          options: optionsValidator,
          label: nameValidator,
          default_value: nameValidator,
          ordered_fields: orderValidator,
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          params: { fieldId },
          body: { form_id, name, type, options, label, default_value, ordered_fields },
        },
      } = req

      await checkIfFormExist(form_id)

      checkIfFieldsExist(fieldId)

      const updatedField = await FormsFieldsModel.query().patchAndFetchById(fieldId, {
        form_id,
        name,
        type,
        options,
        label,
        default_value,
        ordered_fields,
      })

      res.send({ result: updatedField })
    })
  )

  app.delete("/fields/:fieldId",
    auth,
    isAuthorized("can_delete", "forms"),
    validate(
      {
        params: {
          fieldId: idValidator.required(),
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          params: { fieldId },
        },
      } = req

      const field = await checkIfFieldsExist(fieldId)

      if (field) {
        await FormsFieldsModel.query().deleteById(fieldId)
        res.send({ result: "Field deleted" })
      }
      else {
        throw new NotFoundError
      }
    })
  )
}

export default makeRouteFields