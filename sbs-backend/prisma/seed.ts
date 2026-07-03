import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@sbsgroups.co.in';
  const plainPassword = 'SbsAdmin@2026'; // CHANGE THIS, then re-run
  const hash = bcrypt.hashSync(plainPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'G K Jaiswal',
      email,
      password: hash,
      designation: 'ADMIN', // valid enum value
    },
  });
  console.log('✅ Admin user seeded:', email);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());