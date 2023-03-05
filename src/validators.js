import * as yup from "yup"
import config from "./config.js"

export const idValidator = yup
  .number()
  .integer()
  .min(1)
  .label("ID")
  .typeError("Invalid ID")

export const nameValidator = yup
  .string()
  .matches(/^[\p{L} -]+$/u, "Name is invalid")
  .label("Name")

export const emailValidator = yup
  .string()
  .email("Email is invalid")
  .label("Email")

export const passwordValidator = yup
  .string()
  .matches(
    /^(?=.*[^\p{L}0-9])(?=.*[0-9])(?=.*\p{Lu})(?=.*\p{Ll}).{8,}$/u,
    "Password must be at least 8 chars & contain at least one of each: lower case, upper case, digit, special char."
  )
  .label("Password")

export const roleValidator = yup
  .string()
  .oneOf(["editor", "admin", "manager"])
  .label("Role")

export const queryLimitValidator = yup
  .number()
  .integer()
  .min(config.pagination.limit.min)
  .default(config.pagination.limit.default)
  .label("Query Limit")

export const queryOffsetValidator = yup
  .number()
  .integer()
  .min(0)
  .label("Query Offset")
  .default(0)

export const titleValidator = yup
  .string()
  .label("Title")

export const contentValidator = yup
  .string()
  .label("Content")

export const urlSlugValidator = yup
  .string()
  .label("Url Slug")

export const statusValidator = yup
  .string()
  .oneOf(["draft", "published"])
  .label("Status")

export const orderValidator = yup
  .number()
  .label("Order")

export const typeValidator = yup
  .string()
  .oneOf(["single_line_text", "multi_line_text", "radio", "select", "checkbox"])
  .label("Type")

export const optionsValidator = yup
  .array()
  .of(
    yup.object().shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
  )

export const default_valueValidator = yup
  .string()
  .label("Default Value")




