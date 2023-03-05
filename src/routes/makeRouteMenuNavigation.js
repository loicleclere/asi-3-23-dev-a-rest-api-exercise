
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  nameValidator,
} from "../validators.js"
import auth from "../middlewares/auth.js"
import isAuthorized from "../middlewares/isAuthorized.js"
import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import { checkIfMenuExists, getMenuTree } from "../db/models/NavigationMenuModel.js"
import { deleteMenu } from "../db/models/NavigationMenuModel.js"

const makeRouteMenuNavigation = (app) => {
  app.get("/menu/:id",
    validate({
      params: {
        id: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { id },
        },
      } = req

      await checkIfMenuExists(id)

      const menuTree = await getMenuTree(id)
      res.send({ result: menuTree })
    })
  )

  app.post("/menu",
    auth,
    isAuthorized("can_create", "menu"),
    validate({
      body: {
        name: nameValidator.required(),
        parent_id: idValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { name, parent_id },
        },
      } = req

      if (parent_id) {
        await checkIfMenuExists(parent_id)
      }

      const menu = await NavigationMenuModel.query().insert({
        name,
        parent_id,

      })

      res.send({ result: menu })
    })
  )

  app.patch("/menu/:id",
    auth,
    isAuthorized("can_update", "page"),
    validate({
      params: {
        id: idValidator.required(),
      },
      body: {
        name: nameValidator.required(),
        parent_id: idValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { id },
          body: { name, parent_id },
        },
      } = req

      const menu = await checkIfMenuExists(id)

      if (parent_id) {
        await checkIfMenuExists(parent_id)
      }

      const updatedMenu = await NavigationMenuModel.query().patchAndFetchById(
        menu.id,
        {
          name,
          parent_id,
        }
      )
      res.send({ result: updatedMenu })
    })
  )

  app.delete("/menu/:id",
    auth,
    isAuthorized("can_delete", "page"),
    validate({
      params: {
        id: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { id },
        },
      } = req

      const menu = await checkIfMenuExists(id)

      await deleteMenu(menu.id)
      res.send({ result: "Menu deleted" })
    })
  )
}

export default makeRouteMenuNavigation