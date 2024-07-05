import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";
import config from "./env";

const client = createClient({
  url: config.redis.url,
});

client.on("error", (err: Error) => console.error("Redis Client Error", err));

client.connect();

export default client;
