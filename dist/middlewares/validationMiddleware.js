"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.loginValidationRules = exports.userValidationRules = void 0;
const express_validator_1 = require("express-validator");
function isCustomValidationError(error) {
    return (typeof error.param === "string" &&
        typeof error.msg === "string");
}
const userValidationRules = () => [
    (0, express_validator_1.body)("username", "Username is required").notEmpty(),
    (0, express_validator_1.body)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.body)("password", "Password must be at least 6 characters long").isLength({
        min: 6,
    }),
];
exports.userValidationRules = userValidationRules;
const loginValidationRules = () => [
    (0, express_validator_1.body)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.body)("password", "Password is required").notEmpty(),
];
exports.loginValidationRules = loginValidationRules;
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
exports.validate = validate;
