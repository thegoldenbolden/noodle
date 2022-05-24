declare namespace NodeJS {
  export interface ProcessEnv {
    ERROR_ID: string;
    ERROR_TOKEN: string;
    LOGGER_TOKEN: string;
    LOGGER_ID: string;
    SUBMISSIONS_TOKEN: string;
    SUBMISSIONS_ID: string;
    BOT_TOKEN: string;
    DATABASE_URL: string;
    NOODLE_THE_FIRST: string;
    BUDS: string;
    PASTAFONIA: string;
    NODE_ENV: "production" | "development";
  }
}
