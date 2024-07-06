import NodeCache from "node-cache";
import logger from "./logger"; // Adjust the path to your logger

const stdTTL = 30;

const cache = new NodeCache({ stdTTL });

export const invalidateCacheKeys = (pattern: string) => {
  const keys = cache.keys();
  const relevantKeys = keys.filter((key) => key.startsWith(pattern));
  relevantKeys.forEach((key) => cache.del(key));
  logger.info(`Cache invalidated for pattern: ${pattern}`);
};

export default cache;
