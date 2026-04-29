import "dotenv/config"; // 👈 이 줄이 있어야 .env의 DATABASE_URL을 읽습니다!
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    // Next.js 환경이므로 prisma/seed.ts 파일을 tsx로 실행하는 게 가장 에러가 적습니다.
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});