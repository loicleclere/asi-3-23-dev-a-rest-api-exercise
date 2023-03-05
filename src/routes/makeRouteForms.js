import {
  idValidator,
  queryLimitValidator,
  queryOffsetValidator,
  nameValidator,
} from "../validators.js"
import mw from "../middlewares/mw.js"
import FormModel from "../db/models/FormsModel.js"
import { deleteForm } from "../db/models/FormsModel.js"
import validate from "../middlewares/validate.js"
import auth from "../middlewares/auth.js"
import isAuthorized from "../middlewares/isAuthorized.js"
import { checkIfFormExist } from "../db/models/FormsModel.js"

const makeRouteForms = (app) => {
  app.get("/forms",
    validate(
      {
        query: {
          limit: queryLimitValidator,
          offset: queryOffsetValidator,
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          query: { limit, offset },
        },
      } = req

      const forms = await FormModel.query().limit(limit).offset(offset)
      res.send({ result: forms })
    })

  )
  app.get("/forms/:id",
    validate(
      {
        params: {
          id: idValidator.required(),
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          params: { id },
        },
      } = req

      const form = await checkIfFormExist(id)

      res.send({ result: form })
    })
  )
  app.post("/forms",
    auth,
    isAuthorized("can_create", "forms"),
    validate({
      body: {
        name: nameValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { name },
        },
      } = req

      const form = await FormModel.query().insert({ name })
      res.send({ result: form })
    })
  )

  app.patch("/forms/:formId",
    auth,
    isAuthorized("can_update", "forms"),
    validate(
      {
        params: {
          formId: idValidator.required(),
        },
        body: {
          name: nameValidator,
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          params: { formId },
          body: { name },
        },
      } = req

      await checkIfFormExist(formId)

      const updateForm = await FormModel.query().patchAndFetchById(formId, { name })
      res.send({ result: updateForm })
    })
  )

  app.delete("/forms/:formId",
    auth,
    isAuthorized("can_delete", "forms"),
    validate(
      {
        params: {
          formId: idValidator.required(),
        },
      }
    ),
    mw(async (req, res) => {
      const {
        data: {
          params: { formId },
        },
      } = req

      await checkIfFormExist(formId)

      await deleteForm(formId)
      res.send({ result: "Form deleted" })
    })
  )
}

export default makeRouteForms