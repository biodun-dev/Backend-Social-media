"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = isError;
function isError(err) {
    return err instanceof Error;
}
