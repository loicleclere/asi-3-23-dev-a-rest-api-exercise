
import PageModel from "../db/models/PageModel.js"
import { deletePage } from "../db/models/PageModel.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import {
  queryLimitValidator,
  queryOffsetValidator,
  urlSlugValidator,
  titleValidator,
  contentValidator,
  statusValidator,
  idValidator,
} from "../validators.js"
import auth from "../middlewares/auth.js"
import isAuthorized from "../middlewares/isAuthorized.js"
import { sanitizePage } from "../sanitizers.js"
import PageHistoryModel from "../db/models/PageHistoryModel.js"
import UserModel from "../db/models/UserModel.js"
import {
  NotFoundError,
  AlreadyExistError
} from "../errors.js"
import { checkIfPageExistsBySlug, checkIfPageExists } from "../db/models/PageModel.js"

const makeRoutePage = (app) => {
  app.get("/page",
    auth,
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
        session: { user: sessionUser },
      } = req

      if (sessionUser.id == null) {
        const page = await PageModel.query().where("status", "published").limit(limit).offset(offset)
        res.send({ result: sanitizePage(page) })
      }
      else {
        const page = await PageModel.query().limit(limit).offset(offset)
        res.send({ result: sanitizePage(page) })
      }
    })
  )

  app.get("/page/:urlSlug",
    auth,
    validate({
      params: {
        urlSlug: urlSlugValidator.required(),
      },
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { urlSlug },
        },
        session: { user: sessionUser },
      } = req

      const page = await checkIfPageExistsBySlug(urlSlug)

      if (!page) {
        throw new NotFoundError
      }

      if (sessionUser.id == null) {
        if (page.status == "published") {
          const userWhoEdit = await PageHistoryModel.query()
            .select("updated_by")
            .where("page_id", page.id)
            .then(async (result) => {
              const users = await UserModel.query().select("firstName").whereIn("id", result.map(({ updated_by }) => updated_by))

              return users
            })

          res.send({ result: sanitizePage(page), editBy: userWhoEdit })
        }
        else {
          res.status(403).send({ error: "Unauthorized" })
        }
      }
      else {
        const userWhoEdit = await PageHistoryModel.query()
          .select("updated_by")
          .where("page_id", page.id)
          .then(async (result) => {
            const users = await UserModel.query().select("firstName").whereIn("id", result.map(({ updated_by }) => updated_by))

            return users
          })

        res.send({ result: sanitizePage(page), editBy: userWhoEdit })
      }
    })
  )

  app.post("/page",
    auth,
    isAuthorized("can_create", "page"),
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        urlSlug: urlSlugValidator.required(),
        status: statusValidator
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content, urlSlug, status },
        },
        session: { user: sessionUser },
      } = req

      if (await checkIfPageExistsBySlug(urlSlug)) {
        throw new AlreadyExistError
      }

      if (status === "published") {
        const page = await PageModel.query().insert({
          title,
          content,
          urlSlug,
          author_id: sessionUser.id,
          publishedDate: new Date(),
          status,
        })
        res.send({ result: page })
      } else {
        const page = await PageModel.query().insert({
          title,
          content,
          urlSlug,
          author_id: sessionUser.id,
          status,
        })
        res.send({ result: page })
      }
    })
  )

  app.patch("/page/:id",
    auth,
    isAuthorized("can_update", "page"),
    validate({
      params: {
        id: idValidator.required(),
      },
      body: {
        title: titleValidator,
        content: contentValidator,
        urlSlug: urlSlugValidator,
        status: statusValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          params: { id },
          body: { title, content, status, urlSlug },
        },
        session: { user: sessionUser },
      } = req

      const page = await checkIfPageExists(id)

      if (urlSlug) {
        const urlCheck = await checkIfPageExistsBySlug(urlSlug)

        if (urlCheck && urlCheck.id !== page.id) {
          throw new AlreadyExistError
        }
      }

      if (status === "published") {
        const updatedPage = await PageModel.query().updateAndFetchById(page.id, {
          title,
          content,
          urlSlug,
          editor_id: sessionUser.id,
          publishedDate: new Date(),
          status,
        })

        const pageHistory = await PageHistoryModel.query().where("page_id", id).andWhere("updated_by", sessionUser.id)

        if (!pageHistory) {
          await PageHistoryModel.query().insert({
            page_id: id,
            updated_by: sessionUser.id,
          })
        }

        res.send({ result: sanitizePage(updatedPage) })
      } else {
        const updatedPage = await PageModel.query().updateAndFetchById(page.id, {
          title,
          content,
          urlSlug,
          publishedDate: null,
          editor_id: sessionUser.id,
          status,
        })
        const pageHistory = await PageHistoryModel.query().where("page_id", id).andWhere("updated_by", sessionUser.id).first()

        if (!pageHistory) {
          await PageHistoryModel.query().insert({
            page_id: id,
            updated_by: sessionUser.id,
          })
        }

        res.send({ result: sanitizePage(updatedPage) })
      }
    })
  )

  app.delete("/page/:id",
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

      const page = await checkIfPageExists(id)

      deletePage(page.id)
      res.send({ result: "Page deleted" })
    })
  )
}

export default makeRoutePage