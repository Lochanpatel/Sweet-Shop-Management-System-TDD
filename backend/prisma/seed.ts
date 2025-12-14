// @ts-ignore
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@sweetshop.com' },
    update: {},
    create: {
      email: 'admin@sweetshop.com',
      name: 'Owner',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.sweet.createMany({
    data: [
      { name: 'Rainbow Lollipop', category: 'Hard Candy', price: 2.50, quantity: 50 },
      { name: 'Chocolate Frog', category: 'Chocolate', price: 4.00, quantity: 20 },
      { name: 'Sour Worms', category: 'Gummy', price: 1.50, quantity: 100 },
    ]
  });
  
  console.log("Seeding complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    (process as any).exit(1);
  });