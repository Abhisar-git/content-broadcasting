const { ZodError } = require("zod");
const ApiError = require("../utils/apiError");

const validate = (schema, source = "body") => (req, _res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return next(
        new ApiError(
          400,
          "Validation failed",
          error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        )
      );
    }
    return next(error);
  }
};

module.exports = validate;
