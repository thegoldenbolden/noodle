declare namespace NodeJS {
 export interface ProcessEnv {
  LOGGER_TOKEN: string;
  LOGGER_ID: string;
  TOKEN_PRODUCTION: string;
  TOKEN_DEVELOPMENT: string;
  PRIVATE_SERVER: string;
  OPENAI_API_KEY: string;
  NODE_ENV: "production" | "development";
 }
}
