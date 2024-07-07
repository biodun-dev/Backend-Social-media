import dotenv from "dotenv";
import Joi from "joi";

dotenv.config(); // Load environment variables from .env file

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required().description("MongoDB URI"),
  JWT_SECRET: Joi.string().required().description("JWT secret key"),
}).unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    uri: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
  },
  jwtSecret: envVars.JWT_SECRET,
};
