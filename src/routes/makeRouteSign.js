import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import RoleModel from "../db/models/RoleModel.js"
import UserModel from "../db/models/UserModel.js"
import { InvalidCredentialsError } from "../errors.js"
import hashPassword from "../hashPassword.js"
import auth from "../middlewares/auth.js"
import isAuthorized from "../middlewares/isAuthorized.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeUser } from "../sanitizers.js"
import {
  emailValidator,
  nameValidator,
  passwordValidator,
  roleValidator,
} from "../validators.js"

const makeRouteSign = ({ app, db }) => {
  app.post(
    "/sign-up",
    auth,
    isAuthorized("can_create", "users"),
    validate({
      body: {
        firstName: nameValidator.required(),
        lastName: nameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
        role: roleValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { firstName, lastName, email, password, role } = req.data.body
      const [passwordHash, passwordSalt] = hashPassword(password)
      const [user] = await db("users")
        .insert({
          firstName,
          lastName,
          email,
          passwordHash,
          passwordSalt,
          role_id: await RoleModel.query()
            .select("id")
            .where("name", role)
            .then(([{ id }]) => id),
        })
        .returning("*")

      res.send({ result: sanitizeUser(user) })
    })
  )

  app.post(
    "/sign-in",
    validate({
      body: {
        email: emailValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { email, password } = req.data.body
      const [user] = await UserModel.query().where("email", email)

      if (!user) {
        throw new InvalidCredentialsError()
      }

      const [passwordHash] = hashPassword(password, user.passwordSalt)

      if (user.passwordHash !== passwordHash) {
        throw new InvalidCredentialsError()
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
              fullName: `${user.firstName}${user.lastName}`,
              role: user.role_id,
            },
          },
        },
        config.security.session.jwt.secret,
        { expiresIn: config.security.session.jwt.expiresIn }
      )
      res.send({ result: jwt })
    })
  )
}

export default makeRouteSign