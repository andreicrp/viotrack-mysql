import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma needs a datasource URL while generating the client during builds,
    // even though generation does not connect to the database. Keep Vercel
    // builds working without exposing database credentials to the build step;
    // runtime code and seed scripts still require the real DATABASE_URL.
    url: process.env.DATABASE_URL || "mysql://build:build@127.0.0.1:3306/viotrack_build",
  },
});
