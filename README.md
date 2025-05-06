A next.js application forked from the official NEXT.js tutorial. The app provides all the existing features, while providing some custom enhancements, including:

- Implement inline invoice creating and editing functions through intercepting routes mechanism.
- Integrate with the GitHub OAuth API to allow users to sign in with their GitHub accounts.
- Enable developers to choose which backend to use (either the Vercel Cloud or the local postgres database).

## Prerequisites

- Latest version of Docker/Docker Compose installed
- Bash 3.2 or higher

## Getting Started

1. Copy the `.env.vercel-cloud.example` file to `.env.vercel-cloud` and fill in the required environment variables. This file is used for the Vercel Cloud backend.

2. Copy the `.env.local-postgres.example` file to `.env.local-postgres` and fill in the required environment variables. This file is used for the local postgres backend.

3. Copy the `secret/postgres-password-example` file to `secret/postgres-password` and set up a postgres's superuser password.

4. Start the app with Vercel Cloud backend:

   ```bash
   ./run.sh start_vercel_cloud
   ```

5. Start the app in development mode with Vercel Cloud backend:

   ```bash
   ./run.sh start_vercel_cloud_dev
   ```

6. Start the app with local postgres backend:

   ```bash
   ./run.sh start_local_postgres
   ```

7. Start the app in development mode with local postgres backend:

   ```bash
   ./run.sh start_local_postgres_dev
   ```

8. stop the app:

   ```bash
   ./run.sh stop
   ```

9. Remove the app with local postgres backend, including the data:

   ```bash
   ./run.sh remove_local_postgres
   ```

## Deployment for Vercel Cloud

1. Follow the instructions in the [Vercel documentation](https://nextjs.org/learn/dashboard-app/setting-up-your-database) with extra adjustments:

   - Go to vercel.com -> Click on your project -> Settings -> Build and Deployment -> Root Directory -> Set it to `mainApp` -> Save.
   - Make sure all the necessary environment variables are set in Settings -> Environment Variables.

2. Live Demo
   - https://nextjs-dashboard-sigma-beige-51.vercel.app
