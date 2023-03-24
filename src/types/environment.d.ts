declare namespace NodeJS {
 export interface ProcessEnv {
  ERROR_TOKEN: string;
  ERROR_ID: string;
  LOGGER_TOKEN: string;
  LOGGER_ID: string;
  TOKEN_PRODUCTION: string;
  TOKEN_DEVELOPMENT: string;
  PRIVATE_SERVER: string;
  OPENAI_API_KEY: string;
  YOUTUBE_API_KEY: string;
  NODE_ENV: "production" | "development";
 }
}
