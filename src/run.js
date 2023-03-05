import cors from "cors"
import express from "express"
import knex from "knex"
import morgan from "morgan"
import BaseModel from "./db/models/BaseModel.js"
import makeRouteSign from "./routes/makeRouteSign.js"
import makeRouteUsers from "./routes/makeRouteUsers.js"
import makeRoutePage from "./routes/makeRoutePage.js"
import makeRouteMenuNavigation from "./routes/makeRouteMenuNavigation.js"
import makeRouteMenuNavigationItem from "./routes/makeRouteMenuNavigationItem.js"
import makeRouteForms from "./routes/makeRouteForms.js"
import makeRouteFields from "./routes/makeRouteFields.js"
import cookieParser from "cookie-parser"

const run = async (config) => {
  const app = express()
  app.use(cookieParser())
  app.use(cors())
  app.use(express.json())
  app.use(morgan("dev"))

  const db = knex(config.db)
  BaseModel.knex(db)

  makeRouteSign({ app, db })
  makeRouteUsers(app)
  makeRoutePage(app)
  makeRouteMenuNavigation(app)
  makeRouteMenuNavigationItem(app)
  makeRouteForms(app)
  makeRouteFields(app)

  // handling 404: keep it always LAST!
  app.use((req, res) => {
    res.status(404).send({ error: [`cannot POST ${req.url}`] })
  })

  // eslint-disable-next-line no-console
  app.listen(config.port, () => console.log(`Listening on :${config.port}`))
}

export default run