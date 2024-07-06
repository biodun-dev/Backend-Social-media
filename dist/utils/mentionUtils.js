"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMentions = extractMentions;
/**
 * Extracts @mentions from given text and returns an array of usernames.
 * @param {string} text - The text to extract mentions from.
 * @return {string[]} - An array of usernames mentioned in the text.
 */
function extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]); // The username without '@'
    }
    return mentions;
}
