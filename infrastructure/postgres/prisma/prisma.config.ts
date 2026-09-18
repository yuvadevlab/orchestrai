/**
 * @file infrastructure/postgres/prisma/prisma.config.ts
 * @description Prisma configuration for migrations and connection management.
 */

export default {
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://orchestrai:orchestrai_secret@localhost:5432/orchestrai_dev?schema=public",
    },
  },
};
