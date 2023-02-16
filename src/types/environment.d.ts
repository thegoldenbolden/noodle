declare namespace NodeJS {
 export interface ProcessEnv {
  YOUTUBE_KEY: string;
  DEV_SERVER: string;
  ERROR_TOKEN: string;
  ERROR_ID: string;
  LOGGER_TOKEN: string;
  LOGGER_ID: string;
  SUBMISSIONS_TOKEN: string;
  SUBMISSIONS_ID: string;
  TOKEN_PRODUCTION: string;
  TOKEN_DEVELOPMENT: string;
  NODE_ENV: "production" | "development";
 }
}
