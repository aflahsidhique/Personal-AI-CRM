import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const url = process.env.DATABASE_URL ?? 'file:./file.db';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url,
  },
});
