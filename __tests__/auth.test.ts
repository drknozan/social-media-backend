import { login, register, getCurrentUser, updateUser } from '../src/services/auth.service';
import prisma from '../src/config/db';
import * as bcrypt from 'bcryptjs';

beforeEach(async () => {
  return await prisma.user.createMany({
    data: [
      {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        password: await bcrypt.hash('testuser', 10),
      },
    ],
  });
});

afterEach(async () => {
  return await prisma.user.deleteMany({});
});

test('registers new user', async () => {
  const userToRegister = {
    username: 'NewUser',
    email: 'newuser@newuser.com',
    password: 'testuser',
  };

  await register(userToRegister.username, userToRegister.email, userToRegister.password);

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
  const email = 'test@test.com';
  const username = 'testuser';
  const password = 'testuser';

  const loginResponse = await login(email, password);

  expect(loginResponse.user.username).toBe(username);
});

test('fails to login when credentials are incorrect', async () => {
  try {
    await login('test@test.com', 'wrong');

    throw new Error();
  } catch (error) {
    expect(error.message.message).toBe('Password is wrong');
  }
});

test('gets current user info', async () => {
  const userId = '1';

  const user = await getCurrentUser(userId);

  expect(user).not.toBeNull();
});

test('updates user info', async () => {
  const userId = '1';
  const newEmail = 'new-email@test.com';
  const newPassword = 'newpassword123';
  const username = 'testuser';

  await updateUser({ email: newEmail, password: newPassword, profileVisibility: true }, userId);

  const updatedUser = await prisma.user.findFirst({
    where: {
      email: newEmail,
    },
  });

  const user = await login(newEmail, newPassword);

  expect(user.user.username).toEqual(username);
  expect(updatedUser?.email).toEqual(newEmail);
  expect(updatedUser?.profileVisibility).toEqual(true);
});
