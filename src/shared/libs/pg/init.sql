CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- Enable UUID generation

-- If Exists Table Drop
DROP TABLE IF EXISTS users cascade;
-- ================
--   TABLE [users]
-- ================
-- create users table
CREATE TABLE users(
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(32) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT(NOW() AT TIME ZONE 'utc'),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE
);