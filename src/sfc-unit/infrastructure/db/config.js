/* eslint-disable */
require('dotenv/config');

module.exports = {
  development: {
    database: process.env.PG_NAME,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: +(process.env.PG_PORT || 5432),
    dialect: 'postgres',
    logging: true,
  },
  test: {
    database: process.env.TEST_PG_NAME,
    username: process.env.TEST_PG_USER,
    password: process.env.TEST_PG_PASSWORD,
    port: +(process.env.TEST_PG_PORT || 5432),
    host: process.env.TEST_PG_HOST,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    database: process.env.PG_NAME,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: +(process.env.PG_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  },
  staging: {
    database: process.env.PG_NAME,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: +(process.env.PG_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  },
};
