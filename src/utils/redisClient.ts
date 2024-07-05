import client from '../config/redis';  // Adjust the path as necessary

export const getCache = async (key: string) => {
  try {
    return await client.get(key); // directly using await on client.get
  } catch (err) {
    console.error('Redis getCache error:', err);
    return null; // Handle the error appropriately
  }
};

export const setCache = async (key: string, value: string) => {
  try {
    // Setting with expiration (EX) set to 3600 seconds (1 hour)
    return await client.set(key, value, {
      EX: 3600
    });
  } catch (err) {
    console.error('Redis setCache error:', err);
    return null; // Handle the error appropriately
  }
};
