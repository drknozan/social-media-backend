import prisma from '../src/config/db';

async function teardown() {
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deleteUsers]);

  await prisma.$disconnect();
}

export default teardown;
