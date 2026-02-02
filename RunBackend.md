To run the backend, you need to spin up the infrastructure (Database), configure your environment variables, and then start the Node.js server. Since you are on WSL2, run these commands in your Linux terminal.

Here is the step-by-step procedure:

### 1. Start the Database (Docker)

Your `docker-compose.yml` defines a PostgreSQL container. You must start this first, or the backend will crash immediately upon connection.

Run this in the root directory (where `docker-compose.yml` is located):

```bash
docker compose up -d

```

* **What this does:** spins up the `skillbarter_db` container on port `5432` with the credentials defined in the file.

### 2. Configure Environment Variables

Navigate to the `backend` directory. You likely need a `.env` file for Prisma to connect to the database. If it doesn't exist, create it:

```bash
cd backend
touch .env

```

Add the following content to `.env`. This connection string matches the credentials found in your `docker-compose.yml`:

```env
# backend/.env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/skillbarter_dev?schema=public"
PORT=3000
JWT_SECRET=supersecretkey_change_this_in_production

```

### 3. Install Dependencies & Run Migrations

You need to install the Node modules and sync your Prisma schema with the running Postgres database.

```bash
# Install dependencies defined in package.json
npm install

# Generate the Prisma client and apply migrations to the DB
npx prisma migrate dev --name init

```

* *Note:* `npm install` pulls in `express`, `prisma`, `pg`, etc.. The migration command pushes your `schema.prisma` structure to the Docker container.

### 4. Start the Server

Now that the database is ready and dependencies are installed, start the development server.

```bash
npm run dev

```

* **Why `dev`?**: Your `package.json` scripts define `"dev": "nodemon"`. This will watch for file changes and restart the server automatically, which is what you want during development.

### Summary Checklist

1. `docker compose up -d` (Root folder)
2. Create/Check `backend/.env`
3. `cd backend`
4. `npm install`
5. `npx prisma migrate dev`
6. `npm run dev`