declare namespace NodeJS {
 export interface ProcessEnv {
  API_TCG: string;
  API_YT: string;
  API_NOODLE: string;
  BUDS_SERVER: string;
  DATABASE_URL_PRODUCTION: string;
  DATABASE_URL_DEVELOPMENT: string;
  ERROR_TOKEN: string;
  ERROR_ID: string;
  LOGGER_TOKEN: string;
  LOGGER_ID: string;
  SUBMISSIONS_TOKEN: string;
  SUBMISSIONS_ID: string;
  TOKEN_PRODUCTION: string;
  TOKEN_DEVELOPMENT: string;
  NOODLE_SERVER: string;
  NOODLE_OWNER: string;
  NODE_ENV: "production" | "development";
 }
}
