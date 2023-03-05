const extract = (keys) => {
  const subExtract = (obj) =>
    Array.isArray(obj)
      ? obj.map(subExtract)
      : keys.reduce((sanitized, key) => ({ ...sanitized, [key]: obj[key] }), {})

  return subExtract
}

export const sanitizeUser = extract([
  "id",
  "firstName",
  "lastName",
  "email",
  "role_id",
])

export const sanitizePage = extract([
  "id",
  "title",
  "content",
  "urlSlug",
  "status",
  "publishedDate",
  "editor_id",
  "created_at",
  "updated_at",
])
