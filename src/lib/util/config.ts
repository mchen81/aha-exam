const SYSTEM_CONFIG = {
  runtimeEnv: process.env.RUNTIME_ENV || '',
  dbName: process.env.DB_NAME || '',
  dbHost: process.env.DB_HOST || '',
  dbUser: process.env.DB_USER || '',
  dbPassword: process.env.DB_PASSWORD || '',
  cloudSqlSocketPath: process.env.CLOUD_SQL_SOCKET_PATH || '',
  oauthGoogleClientId: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
  oauthGoogleClientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || '',
  oauthGoogleCallbackUrl: process.env.OAUTH_GOOGLE_CALLBACK_URL || '',
  sendgridAPIKey: process.env.SENDGRID_API_KEY || '',
  emailAuthSecret: process.env.EMAIL_AUTH_SECRET || '',
};

for (const [key, value] of Object.entries(SYSTEM_CONFIG)) {
  if (value === '') {
    console.error(`Environment variable ${key} is not set`);
  }
}

export default SYSTEM_CONFIG;
