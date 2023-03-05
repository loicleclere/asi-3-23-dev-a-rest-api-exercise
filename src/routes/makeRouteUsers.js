import UserModel, { deleteUser } from "../db/models/UserModel.js"
import mw from "../middlewares/mw.js"
import { sanitizeUser } from "../sanitizers.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  emailValidator,
  passwordValidator,
  roleValidator,
  queryLimitValidator,
  queryOffsetValidator,
  nameValidator,
} from "../validators.js"
import RoleModel from "../db/models/RoleModel.js"
import auth from "../middlewares/auth.js"
import isAuthorized from "../middlewares/isAuthorized.js"
import { InvalidAccessError } from "../errors.js"
import { checkIfUserExists } from "../db/models/UserModel.js"

const makeRouteUsers = (app) => {
  app.get("/users",
    auth,
    isAuthorized("can_read", "users"),
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          query: { limit, offset },
        },
      } = req

      if (req.session.user.role == await RoleModel.query().where("name", "admin").then(([{ id }]) => id)) {
        const user = await UserModel.query().withGraphFetched("role").limit(limit).offset(offset)
        res.send({ result: sanitizeUser(user) })
      }
      else {
        const user = await UserModel.query().findById(req.session.user.id)
        res.send({ result: sanitizeUser(user) })
      }
    })
  )
  app.get("/users/:userId",
    auth,
    isAuthorized("can_read", "users"),
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { userId },
        },
        session: { user: sessionUser },
      } = req

      const user = await checkIfUserExists(userId, res)

      if (sessionUser.role == await RoleModel.query().where("name", "admin").then(([{ id }]) => id)) {
        res.send({ result: sanitizeUser(user) })
      }
      else if (sessionUser.id == userId) {
        res.send({ result: sanitizeUser(user) })
      }
      else {
        throw new InvalidAccessError
      }
    })
  )

  app.patch(
    "/users/:userId",
    auth,
    isAuthorized("can_update", "users"),
    validate({
      params: {
        userId: idValidator.required(),
      },
      body: {
        firstName: nameValidator,
        lastName: nameValidator,
        email: emailValidator,
        password: passwordValidator,
        role: roleValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { firstName, lastName, email, role },
          params: { userId },
        },
        session: { user: sessionUser },
      } = req

      await checkIfUserExists(userId, res)


      if (sessionUser.role == await RoleModel.query()
        .select("id")
        .where("name", "admin")
        .then(([{ id }]) => id)) {
        if (role) {
          const updatedUser = await UserModel.query().updateAndFetchById(userId, {
            firstName,
            lastName,
            email,
            role_id: await RoleModel.query().select("id").where("name", role).then(([{ id }]) => id),
          })
          res.send({ result: sanitizeUser(updatedUser) })
        }
        else {
          const updatedUser = await UserModel.query().updateAndFetchById(userId, {
            firstName,
            lastName,
            email,
          })
          res.send({ result: sanitizeUser(updatedUser) })
        }
      }
      else if (sessionUser.id == userId) {
        const updatedUser = await UserModel.query().updateAndFetchById(userId, {
          firstName,
          lastName,
          email,
        })
        res.send({ result: sanitizeUser(updatedUser) })
      }
      else {
        throw new InvalidAccessError
      }
    })
  )

  app.delete("/users/:id",
    auth,
    isAuthorized("can_delete", "users"),
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

      await checkIfUserExists(id, res)

      await deleteUser(id)
      res.send({ result: "User deleted" })
    })
  )
}

export default makeRouteUsers