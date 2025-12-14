Vercel Deployment Notes

- Add the following Environment Variables in your Vercel project settings:
  - `DATABASE_URL` (example: `postgresql://user:pass@host:port/dbname`)
  - `JWT_SECRET`

- The `vercel-build` script runs `prisma generate` and compiles TypeScript before deployment.

- IMPORTANT: For production use, do not use SQLite (file-based DB). Use a managed DB (Postgres/MySQL) and set `DATABASE_URL` accordingly. If you keep SQLite, it will be ephemeral in serverless environments.

- To deploy:
  1. Create a new Vercel project pointing to this repository (select the `backend` folder as Root Path when creating the project).
  2. Set the environment variables above in Vercel.
  3. Vercel will run `npm run vercel-build` during build and create serverless functions from `src/server.ts`.

