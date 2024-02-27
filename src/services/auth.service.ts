import prisma from '../../src/config/db';
import { IUser } from '../interfaces/IUser';
import * as bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken';
import HttpError from '../utils/httpError';

const register = async (username: string, email: string, password: string): Promise<{ user: IUser; token: string }> => {
  const existingUserByUsername = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      username: true,
    },
  });

  const existingUserByEmail = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      username: true,
    },
  });

  if (existingUserByUsername) {
    throw new HttpError(422, { message: 'Username has already been taken' });
  }

  if (existingUserByEmail) {
    throw new HttpError(422, { message: 'Email has already been taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hashedPassword,
    },
  });

  const token = generateToken(createdUser.username);

  return {
    user: {
      username: createdUser.username,
      email: createdUser.email,
      profileVisibility: createdUser.profileVisibility,
      allowDm: createdUser.allowDm,
    },
    token,
  };
};

const login = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    const comparePassword = await bcrypt.compare(password, user.password);

    if (comparePassword) {
      const token = generateToken(user.id);

      return {
        user: {
          username: user.username,
          email: user.email,
          profileVisibility: user.profileVisibility,
          allowDm: user.allowDm,
        },
        token,
      };
    } else {
      throw new HttpError(400, { message: 'Password is wrong' });
    }
  } else {
    throw new HttpError(400, { message: 'No user found with given email' });
  }
};

export { register, login };
