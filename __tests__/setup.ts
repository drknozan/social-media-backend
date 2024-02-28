import prisma from '../src/config/db';

async function setup() {
  await prisma.user.createMany({
    data: [{ username: 'testuser', email: 'test@test.com', password: 'testuser' }],
  });

  console.log('✨ 1 user successfully created.');
}

export default setup;
