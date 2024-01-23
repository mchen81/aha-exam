## Introduction

This project is created for the fullstack engineer exam of Aha!  
It's built with NextJS and typescript, you can start the app by

```bash
npm run dev
```

The following environment variables are necessary:

```bash
RUNTIME_ENV=local         # to distinguish between local host and cloud run server
DB_NAME=aha               # database name (I am using MySQL)
DB_HOST=localhost         # db host
DB_USER=root              # db username
DB_PASSWORD=root          # db password
CLOUD_SQL_SOCKET_PATH     # This is required only for cloud_run server

# The OAUTH_GOOGLE variables are for google OAUTH
OAUTH_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_CLIENT_SECRET
OAUTH_GOOGLE_CALLBACK_URL

# Send Grid API key is for sending a email for user's email verification
SENDGRID_API_KEY

# The JWT secret to generate user email verification link
EMAIL_AUTH_SECRET

# To let the server know what's the host it's running
SERVER_HOST=http://localhost:3000
```

## Api Doc

Please visit the `/api-doc` to see the API documentation

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
