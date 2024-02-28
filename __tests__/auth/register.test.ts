import setup from '../setup';
import teardown from '../tearDown';
import * as authService from '../../src/services/auth.service';
import prisma from '../../src/config/db';

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

it('registers new user', async () => {
  const userToRegister = {
    username: 'NewUser',
    email: 'newuser@newuser.com',
    password: 'newuser',
  };

  // Register user
  await authService.register(userToRegister.username, userToRegister.email, userToRegister.password);

  // Check if the user is created
  const newCustomer = await prisma.user.findUnique({
    where: {
      email: userToRegister.email,
    },
    select: {
      username: true,
      email: true,
    },
  });

  expect(newCustomer).toEqual({ username: userToRegister.username, email: userToRegister.email });
});
