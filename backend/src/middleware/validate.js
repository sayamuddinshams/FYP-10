import { errorResponse } from '../utils/apiResponse.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        return errorResponse(res, 'Validation error', 422, issues);
      }

      req.validated = parsed.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}
