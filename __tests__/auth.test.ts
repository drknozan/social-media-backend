import { login, register } from '../src/services/auth.service';
import prisma from '../src/config/db';

beforeAll(async () => {
  return await prisma.user.createMany({
    data: [
      {
        username: 'testuser',
        email: 'test@test.com',
        password: '$2a$10$i4hvrPqEHkQNJ9.QzLOnx.nWs0Z9v3oqXEF1np3Fzj7qMJZN0qXca', // hashed "testuser"
      },
    ],
  });
});

afterAll(async () => {
  return await prisma.user.deleteMany({});
});

test('registers new user', async () => {
  const userToRegister = {
    username: 'NewUser',
    email: 'newuser@newuser.com',
    password: 'newuser',
  };

  // Register user
  await register(userToRegister.username, userToRegister.email, userToRegister.password);

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

test('fails to register when username already taken', async () => {
  try {
    await register('testuser', 'test@testuser.com', 'testpassword');

    throw new Error();
  } catch (error) {
    expect(error.message.message).toBe('Username has already been taken');
  }
});

test('login user', async () => {
  const userToLogin = {
    email: 'test@test.com',
    password: 'testuser',
  };

  const loginResponse = await login('test@test.com', 'testuser');

  expect(loginResponse.user.email).toBe(userToLogin.email);
});

test('fails to login when credentials are incorrect', async () => {
  try {
    await login('test@test.com', 'wrong');

    throw new Error();
  } catch (error) {
    expect(error.message.message).toBe('Password is wrong');
  }
});
