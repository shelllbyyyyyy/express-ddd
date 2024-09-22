import dotenv from "dotenv";

dotenv.config();

export const {
  PORT,
  NODE_ENV,
  DB_USER,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  DB_REDIS_HOST,
  DB_REDIS_PORT,
} = process.env;
