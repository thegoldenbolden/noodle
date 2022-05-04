declare namespace NodeJS {
  export interface ProcessEnv {
    LOGGER_TOKEN: string;
    LOGGER_ID: string;
    ERROR_TOKEN: string;
    ERROR_ID: string;
    BOT_TOKEN: string;
    DATABASE_URL: string;
    GOLDY: string;
    BUDS: string;
    NODE_ENV: "production" | "development";
  }
}
