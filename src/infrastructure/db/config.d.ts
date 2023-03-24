type Config = {
  use_env_variable: string;
  database: string;
  username: string;
  password: string;
  port: number;
  dialect: string;
  logging: string;
};
export default {
  development: Config,
  test: Config,
  production: Config,
};
