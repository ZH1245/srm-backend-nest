declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      JWT_SECRET: string;
      // add from .env file
      hana_driver: string;
      hana_host: string;
      hana_dbname: string;
      hana_schema: string;
      hana_uid: string;
      hana_pwd: string;
      secrets: string;
      session_expiry: string;
      session_expiry_ms: string;
      development_frontend_link: string;
      production_frontend_link: string;
      nodemailer_email: string;
      nodemailer_password: string;
      nodemailer_service: string;
      hana_schema_production: string;
      hana_schema_development: string;
      database_development: string;
    }
  }
}
export {};
