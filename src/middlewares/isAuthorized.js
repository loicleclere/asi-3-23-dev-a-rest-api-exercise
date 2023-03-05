import mw from "./mw.js"
import PermissionModel from "../db/models/PermissionsModel.js"
import { InvalidAccessError } from "../errors.js"

const isAuthorized = (action, ressource) => {
  return mw(async function (req, res, next) {
    const userRole = req.session.user.role
    const userId = req.session.user.id
    const ressourceId = req.params.userId

    const results = await PermissionModel.query().select("role_id").where("resource_type", ressource).andWhere(action, true).distinct("role_id")

    const allowedRoles = results.map(({ role_id }) => role_id)

    if (allowedRoles.includes(userRole) || userId === ressourceId) {
      return next()
    }

    throw new InvalidAccessError
  })
}

export default isAuthorized