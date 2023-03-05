
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import {
  idValidator, orderValidator,
} from "../validators.js"
import auth from "../middlewares/auth.js"
import isAuthorized from "../middlewares/isAuthorized.js"
import NavigationMenuItemsModel from "../db/models/NavigationMenuItemsModel.js"
import { checkIfMenuExists } from "../db/models/NavigationMenuModel.js"
import { getMenuTree } from "../db/models/NavigationMenuItemsModel.js"
import { checkIfPageExists } from "../db/models/PageModel.js"

const makeRouteMenuNavigation = (app) => {
  app.get("/itemToMenu/:id",
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

  app.post("/itemToMenu",
    auth,
    isAuthorized("can_create", "menu"),
    validate({
      body: {
        navigation_menu_id: idValidator.required(),
        page_id: idValidator.required(),
        order: orderValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { navigation_menu_id, page_id, order },
        },
      } = req

      await checkIfMenuExists(navigation_menu_id)

      await checkIfPageExists(page_id)

      const item = await NavigationMenuItemsModel.query().insert({
        navigation_menu_id,
        page_id,
        order
      })

      return res.send({ item })
    })
  )

  app.patch("/itemToMenu/:idPage/:idMenu",
    auth,
    isAuthorized("can_update", "menu"),
    validate({
      params: {
        idPage: idValidator.required(),
        idMenu: idValidator.required(),
      },
      body: {
        navigation_menu_id: idValidator.required(),
        page_id: idValidator.required(),
        order: orderValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { idPage, idMenu },
          body: { navigation_menu_id, page_id, order },
        },
      } = req

      await checkIfMenuExists(idMenu)

      await checkIfPageExists(idPage)

      await checkIfMenuExists(navigation_menu_id)

      await checkIfPageExists(page_id)

      const item = await NavigationMenuItemsModel.query().where("page_id", idPage).andWhere("navigation_menu_id", idMenu).patch({
        navigation_menu_id,
        page_id,
        order
      })

      return res.send({ item })
    })
  )

  app.delete("/itemToMenu/:id",
    auth,
    isAuthorized("can_delete", "menu"),
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

      await NavigationMenuItemsModel.query().deleteById(id)

      return res.send({ result: "Navigation Menu Item deleted" })
    })
  )
}

export default makeRouteMenuNavigation