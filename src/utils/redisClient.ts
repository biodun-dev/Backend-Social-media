import client from "../config/redis"; // Adjust the path as necessary

export const getCache = async (key: string) => {
  try {
    return await client.get(key); // directly using await on client.get
  } catch (err) {
    console.error("Redis getCache error:", err);
    return null; // Handle the error appropriately
  }
};

export const setCache = async (key: string, value: string) => {
  try {
    return await client.set(key, value, {
      EX: 3600,
    });
  } catch (err) {
    console.error("Redis setCache error:", err);
    return null;
  }
};

export const invalidateCache = async (key: string) => {
  try {
    await client.del(key);
    console.log(`Cache invalidated for key: ${key}`);
  } catch (err) {
    console.error("Redis invalidateCache error:", err);
  }
};
