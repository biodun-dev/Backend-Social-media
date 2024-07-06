import {
  body,
  validationResult,
  Result,
  ValidationError,
} from "express-validator";
import { Request, Response, NextFunction } from "express";

function isCustomValidationError(
  error: ValidationError
): error is ValidationError & { param: string; msg: string } {
  return (
    typeof (error as any).param === "string" &&
    typeof (error as any).msg === "string"
  );
}

export const userValidationRules = () => [
  body("username", "Username is required").notEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password must be at least 6 characters long").isLength({
    min: 6,
  }),
];

export const loginValidationRules = () => [
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").notEmpty(),
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors
    .array()
    .map((err) => {
      if (isCustomValidationError(err)) {
        return { [err.param]: err.msg };
      }
      return {};
    })
    .filter((err) => Object.keys(err).length > 0);
  return res.status(422).json({
    errors: extractedErrors,
  });
};
