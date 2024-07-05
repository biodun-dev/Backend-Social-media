"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationEvent = void 0;
const notificationEvent = (type, data) => {
    return {
        type,
        message: `Your post was ${type}d by ${data.username}`,
        postId: data.postId,
        fromUser: data.userId
    };
};
exports.notificationEvent = notificationEvent;
